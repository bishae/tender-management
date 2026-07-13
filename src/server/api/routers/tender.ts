import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, ilike, inArray } from "drizzle-orm";
import { z } from "zod";

import {
	buyerProcedure,
	createTRPCRouter,
	protectedProcedure,
	vendorProcedure,
} from "~/server/api/trpc";
import {
	getUserGroupIds,
	getUserMembership,
	isBuyerMembership,
	isVendorMembership,
} from "~/server/auth/membership";
import {
	organizationGroups,
	tenderApprovalSteps,
	tenders,
} from "~/server/db/schema";

const tenderInputSchema = z.object({
	title: z.string().min(1).max(256),
	description: z.string().max(10000).default(""),
	category: z.string().max(128).default(""),
	expertise: z.string().max(128).default(""),
	requirements: z.string().max(20000).default(""),
	evaluationRules: z.string().max(20000).default(""),
	submissionDeadline: z.coerce.date().nullable().optional(),
	clarificationDeadline: z.coerce.date().nullable().optional(),
	approvalGroupIds: z.array(z.number().int().positive()).default([]),
});

function assertPublishable(tender: {
	title: string;
	description: string;
	category: string;
	requirements: string;
	evaluationRules: string;
	submissionDeadline: Date | null;
}) {
	const missing: string[] = [];
	if (!tender.title.trim()) missing.push("title");
	if (!tender.description.trim()) missing.push("description");
	if (!tender.category.trim()) missing.push("category");
	if (!tender.requirements.trim()) missing.push("requirements");
	if (!tender.evaluationRules.trim()) missing.push("evaluation rules");
	if (!tender.submissionDeadline) missing.push("submission deadline");
	return missing;
}

function notFound(): never {
	throw new TRPCError({ code: "NOT_FOUND", message: "Tender not found" });
}

async function assertGroupsBelongToOrg(
	db: typeof import("~/server/db").db,
	organizationId: number,
	groupIds: number[],
) {
	if (groupIds.length === 0) return;
	const groups = await db.query.organizationGroups.findMany({
		where: and(
			eq(organizationGroups.organizationId, organizationId),
			inArray(organizationGroups.id, groupIds),
		),
	});
	if (groups.length !== new Set(groupIds).size) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "All approval groups must belong to your organization",
		});
	}
}

async function replaceApprovalSteps(
	db: typeof import("~/server/db").db,
	tenderId: number,
	groupIds: number[],
) {
	await db
		.delete(tenderApprovalSteps)
		.where(eq(tenderApprovalSteps.tenderId, tenderId));

	if (groupIds.length === 0) return;

	await db.insert(tenderApprovalSteps).values(
		groupIds.map((groupId, index) => ({
			tenderId,
			groupId,
			stepOrder: index + 1,
			status: "pending" as const,
		})),
	);
}

export const tenderRouter = createTRPCRouter({
	create: buyerProcedure
		.input(tenderInputSchema)
		.mutation(async ({ ctx, input }) => {
			await assertGroupsBelongToOrg(
				ctx.db,
				ctx.membership.organizationId,
				input.approvalGroupIds,
			);

			const [created] = await ctx.db
				.insert(tenders)
				.values({
					title: input.title,
					description: input.description,
					category: input.category,
					expertise: input.expertise,
					requirements: input.requirements,
					evaluationRules: input.evaluationRules,
					submissionDeadline: input.submissionDeadline ?? null,
					clarificationDeadline: input.clarificationDeadline ?? null,
					status: "draft",
					organizationId: ctx.membership.organizationId,
					createdById: ctx.session.user.id,
				})
				.returning();

			await replaceApprovalSteps(ctx.db, created!.id, input.approvalGroupIds);
			return created!;
		}),

	update: buyerProcedure
		.input(
			tenderInputSchema.extend({
				id: z.number().int().positive(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.tenders.findFirst({
				where: eq(tenders.id, input.id),
			});

			if (
				!existing ||
				existing.organizationId !== ctx.membership.organizationId
			) {
				notFound();
			}
			if (existing.status !== "draft" && existing.status !== "rejected") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Only draft or rejected tenders can be edited",
				});
			}

			await assertGroupsBelongToOrg(
				ctx.db,
				ctx.membership.organizationId,
				input.approvalGroupIds,
			);

			const [updated] = await ctx.db
				.update(tenders)
				.set({
					title: input.title,
					description: input.description,
					category: input.category,
					expertise: input.expertise,
					requirements: input.requirements,
					evaluationRules: input.evaluationRules,
					submissionDeadline: input.submissionDeadline ?? null,
					clarificationDeadline: input.clarificationDeadline ?? null,
					status: "draft",
				})
				.where(eq(tenders.id, input.id))
				.returning();

			await replaceApprovalSteps(ctx.db, input.id, input.approvalGroupIds);
			return updated!;
		}),

	listMine: buyerProcedure.query(async ({ ctx }) => {
		return ctx.db.query.tenders.findMany({
			where: eq(tenders.organizationId, ctx.membership.organizationId),
			orderBy: [desc(tenders.createdAt)],
		});
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.number().int().positive() }))
		.query(async ({ ctx, input }) => {
			const tender = await ctx.db.query.tenders.findFirst({
				where: eq(tenders.id, input.id),
				with: {
					approvalSteps: {
						orderBy: [asc(tenderApprovalSteps.stepOrder)],
						with: {
							group: true,
							actedBy: {
								columns: { id: true, name: true, email: true },
							},
						},
					},
				},
			});

			if (!tender) return null;

			const membership = await getUserMembership(ctx.session.user.id);

			if (
				isBuyerMembership(membership) &&
				membership !== null &&
				tender.organizationId === membership.organizationId
			) {
				return tender;
			}

			if (isVendorMembership(membership) && tender.status === "published") {
				return tender;
			}

			return null;
		}),

	submitForApproval: buyerProcedure
		.input(z.object({ id: z.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.tenders.findFirst({
				where: eq(tenders.id, input.id),
				with: { approvalSteps: true },
			});

			if (
				!existing ||
				existing.organizationId !== ctx.membership.organizationId
			) {
				notFound();
			}
			if (existing.status !== "draft" && existing.status !== "rejected") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Only draft or rejected tenders can be submitted",
				});
			}

			const missing = assertPublishable(existing);
			if (missing.length > 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Cannot submit — missing: ${missing.join(", ")}`,
				});
			}

			if (existing.approvalSteps.length === 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message:
						"Add at least one approval group, or use Publish for no-approval tenders",
				});
			}

			await ctx.db
				.update(tenderApprovalSteps)
				.set({
					status: "pending",
					actedById: null,
					actedAt: null,
					note: null,
				})
				.where(eq(tenderApprovalSteps.tenderId, input.id));

			const [updated] = await ctx.db
				.update(tenders)
				.set({ status: "pending_approval" })
				.where(eq(tenders.id, input.id))
				.returning();

			return updated!;
		}),

	publish: buyerProcedure
		.input(z.object({ id: z.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.tenders.findFirst({
				where: eq(tenders.id, input.id),
				with: { approvalSteps: true },
			});

			if (
				!existing ||
				existing.organizationId !== ctx.membership.organizationId
			) {
				notFound();
			}

			const missing = assertPublishable(existing);
			if (missing.length > 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Cannot publish — missing: ${missing.join(", ")}`,
				});
			}

			const hasSteps = existing.approvalSteps.length > 0;
			const allApproved =
				hasSteps &&
				existing.approvalSteps.every((s) => s.status === "approved");

			if (existing.status === "draft" || existing.status === "rejected") {
				if (hasSteps) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message:
							"This tender has an approval chain — submit for approval first",
					});
				}
			} else if (existing.status === "pending_approval") {
				if (!allApproved) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Approval chain is not complete",
					});
				}
			} else {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Tender cannot be published from its current status",
				});
			}

			const [updated] = await ctx.db
				.update(tenders)
				.set({ status: "published" })
				.where(eq(tenders.id, input.id))
				.returning();

			return updated!;
		}),

	approve: buyerProcedure
		.input(
			z.object({
				id: z.number().int().positive(),
				note: z.string().max(2000).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.tenders.findFirst({
				where: eq(tenders.id, input.id),
				with: {
					approvalSteps: {
						orderBy: [asc(tenderApprovalSteps.stepOrder)],
					},
				},
			});

			if (
				!existing ||
				existing.organizationId !== ctx.membership.organizationId
			) {
				notFound();
			}
			if (existing.status !== "pending_approval") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Tender is not awaiting approval",
				});
			}

			const current = existing.approvalSteps.find((s) => s.status === "pending");
			if (!current) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "No pending approval step",
				});
			}

			const userGroupIds = await getUserGroupIds(ctx.session.user.id);
			if (!userGroupIds.includes(current.groupId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not a member of the current approval group",
				});
			}

			await ctx.db
				.update(tenderApprovalSteps)
				.set({
					status: "approved",
					actedById: ctx.session.user.id,
					actedAt: new Date(),
					note: input.note ?? null,
				})
				.where(eq(tenderApprovalSteps.id, current.id));

			const remaining = existing.approvalSteps.filter(
				(s) => s.id !== current.id && s.status === "pending",
			);

			if (remaining.length === 0) {
				const [updated] = await ctx.db
					.update(tenders)
					.set({ status: "published" })
					.where(eq(tenders.id, input.id))
					.returning();
				return updated!;
			}

			return existing;
		}),

	reject: buyerProcedure
		.input(
			z.object({
				id: z.number().int().positive(),
				note: z.string().max(2000).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.tenders.findFirst({
				where: eq(tenders.id, input.id),
				with: {
					approvalSteps: {
						orderBy: [asc(tenderApprovalSteps.stepOrder)],
					},
				},
			});

			if (
				!existing ||
				existing.organizationId !== ctx.membership.organizationId
			) {
				notFound();
			}
			if (existing.status !== "pending_approval") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Tender is not awaiting approval",
				});
			}

			const current = existing.approvalSteps.find((s) => s.status === "pending");
			if (!current) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "No pending approval step",
				});
			}

			const userGroupIds = await getUserGroupIds(ctx.session.user.id);
			if (!userGroupIds.includes(current.groupId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not a member of the current approval group",
				});
			}

			await ctx.db
				.update(tenderApprovalSteps)
				.set({
					status: "rejected",
					actedById: ctx.session.user.id,
					actedAt: new Date(),
					note: input.note ?? null,
				})
				.where(eq(tenderApprovalSteps.id, current.id));

			const [updated] = await ctx.db
				.update(tenders)
				.set({ status: "draft" })
				.where(eq(tenders.id, input.id))
				.returning();

			return updated!;
		}),

	listPendingApprovals: buyerProcedure.query(async ({ ctx }) => {
		const userGroupIds = await getUserGroupIds(ctx.session.user.id);
		if (userGroupIds.length === 0) return [];

		const pendingSteps = await ctx.db.query.tenderApprovalSteps.findMany({
			where: and(
				eq(tenderApprovalSteps.status, "pending"),
				inArray(tenderApprovalSteps.groupId, userGroupIds),
			),
			with: {
				tender: true,
				group: true,
			},
			orderBy: [asc(tenderApprovalSteps.stepOrder)],
		});

		const results = [];
		for (const step of pendingSteps) {
			if (step.tender.status !== "pending_approval") continue;
			if (step.tender.organizationId !== ctx.membership.organizationId) {
				continue;
			}

			const earlierPending = await ctx.db.query.tenderApprovalSteps.findFirst({
				where: and(
					eq(tenderApprovalSteps.tenderId, step.tenderId),
					eq(tenderApprovalSteps.status, "pending"),
				),
				orderBy: [asc(tenderApprovalSteps.stepOrder)],
			});

			if (earlierPending?.id === step.id) {
				results.push(step);
			}
		}

		return results;
	}),

	close: buyerProcedure
		.input(z.object({ id: z.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.tenders.findFirst({
				where: eq(tenders.id, input.id),
			});

			if (
				!existing ||
				existing.organizationId !== ctx.membership.organizationId
			) {
				notFound();
			}
			if (existing.status !== "published") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Only published tenders can be closed",
				});
			}

			const [updated] = await ctx.db
				.update(tenders)
				.set({ status: "closed" })
				.where(eq(tenders.id, input.id))
				.returning();

			return updated!;
		}),

	discover: vendorProcedure
		.input(
			z
				.object({
					category: z.string().optional(),
					expertise: z.string().optional(),
					search: z.string().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const filters = [eq(tenders.status, "published")];

			if (input?.category?.trim()) {
				filters.push(ilike(tenders.category, input.category.trim()));
			}
			if (input?.expertise?.trim()) {
				filters.push(ilike(tenders.expertise, input.expertise.trim()));
			}
			if (input?.search?.trim()) {
				filters.push(ilike(tenders.title, `%${input.search.trim()}%`));
			}

			return ctx.db.query.tenders.findMany({
				where: and(...filters),
				orderBy: [desc(tenders.createdAt)],
			});
		}),

	filterOptions: vendorProcedure.query(async ({ ctx }) => {
		const rows = await ctx.db
			.select({
				category: tenders.category,
				expertise: tenders.expertise,
			})
			.from(tenders)
			.where(eq(tenders.status, "published"));

		const categories = [
			...new Set(
				rows.map((r) => r.category).filter((c) => c.trim().length > 0),
			),
		].sort();
		const expertise = [
			...new Set(
				rows.map((r) => r.expertise).filter((e) => e.trim().length > 0),
			),
		].sort();

		return { categories, expertise };
	}),
});
