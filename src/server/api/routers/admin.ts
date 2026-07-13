import { and, eq, inArray, notInArray } from "drizzle-orm";
import { z } from "zod";

import { normalizeDomain, orgTypeSchema } from "~/lib/org";
import { createTRPCRouter, platformAdminProcedure } from "~/server/api/trpc";
import {
	groupMembers,
	organizationDomains,
	organizationGroups,
	organizationMembers,
	organizations,
	user,
} from "~/server/db/schema";

export const adminRouter = createTRPCRouter({
	listOrganizations: platformAdminProcedure.query(async ({ ctx }) => {
		return ctx.db.query.organizations.findMany({
			orderBy: (o, { asc }) => [asc(o.name)],
			with: {
				domains: true,
				groups: true,
			},
		});
	}),

	getOrganization: platformAdminProcedure
		.input(z.object({ id: z.number().int().positive() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.query.organizations.findFirst({
				where: eq(organizations.id, input.id),
				with: {
					domains: true,
					groups: {
						with: {
							members: {
								with: {
									user: {
										columns: { id: true, name: true, email: true },
									},
								},
							},
						},
					},
					members: {
						with: {
							user: {
								columns: {
									id: true,
									name: true,
									email: true,
									isPlatformAdmin: true,
								},
							},
						},
					},
				},
			});
		}),

	createOrganization: platformAdminProcedure
		.input(
			z.object({
				name: z.string().min(1).max(256),
				type: orgTypeSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [created] = await ctx.db
				.insert(organizations)
				.values({
					name: input.name.trim(),
					type: input.type,
				})
				.returning();
			return created!;
		}),

	updateOrganization: platformAdminProcedure
		.input(
			z.object({
				id: z.number().int().positive(),
				name: z.string().min(1).max(256),
				type: orgTypeSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [updated] = await ctx.db
				.update(organizations)
				.set({
					name: input.name.trim(),
					type: input.type,
				})
				.where(eq(organizations.id, input.id))
				.returning();
			return updated!;
		}),

	addDomain: platformAdminProcedure
		.input(
			z.object({
				organizationId: z.number().int().positive(),
				domain: z.string().min(1).max(255),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const domain = normalizeDomain(input.domain);
			if (!domain.includes(".")) {
				throw new Error("Enter a valid domain (e.g. company.com)");
			}
			const [created] = await ctx.db
				.insert(organizationDomains)
				.values({
					organizationId: input.organizationId,
					domain,
				})
				.returning();
			return created!;
		}),

	removeDomain: platformAdminProcedure
		.input(z.object({ id: z.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(organizationDomains)
				.where(eq(organizationDomains.id, input.id));
			return { ok: true };
		}),

	createGroup: platformAdminProcedure
		.input(
			z.object({
				organizationId: z.number().int().positive(),
				name: z.string().min(1).max(256),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [created] = await ctx.db
				.insert(organizationGroups)
				.values({
					organizationId: input.organizationId,
					name: input.name.trim(),
				})
				.returning();
			return created!;
		}),

	renameGroup: platformAdminProcedure
		.input(
			z.object({
				id: z.number().int().positive(),
				name: z.string().min(1).max(256),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [updated] = await ctx.db
				.update(organizationGroups)
				.set({ name: input.name.trim() })
				.where(eq(organizationGroups.id, input.id))
				.returning();
			return updated!;
		}),

	deleteGroup: platformAdminProcedure
		.input(z.object({ id: z.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(organizationGroups)
				.where(eq(organizationGroups.id, input.id));
			return { ok: true };
		}),

	listUsers: platformAdminProcedure
		.input(
			z
				.object({
					unassignedOnly: z.boolean().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			if (input?.unassignedOnly) {
				const assigned = await ctx.db
					.select({ userId: organizationMembers.userId })
					.from(organizationMembers);
				const assignedIds = assigned.map((a) => a.userId);
				if (assignedIds.length === 0) {
					return ctx.db.query.user.findMany({
						orderBy: (u, { asc }) => [asc(u.email)],
						columns: {
							id: true,
							name: true,
							email: true,
							isPlatformAdmin: true,
							createdAt: true,
						},
					});
				}
				return ctx.db.query.user.findMany({
					where: notInArray(user.id, assignedIds),
					orderBy: (u, { asc }) => [asc(u.email)],
					columns: {
						id: true,
						name: true,
						email: true,
						isPlatformAdmin: true,
						createdAt: true,
					},
				});
			}

			return ctx.db.query.user.findMany({
				orderBy: (u, { asc }) => [asc(u.email)],
				columns: {
					id: true,
					name: true,
					email: true,
					isPlatformAdmin: true,
					createdAt: true,
				},
				with: {
					memberships: {
						with: {
							organization: {
								columns: { id: true, name: true, type: true },
							},
						},
					},
				},
			});
		}),

	attachUser: platformAdminProcedure
		.input(
			z.object({
				userId: z.string().min(1),
				organizationId: z.number().int().positive(),
				orgRole: z.enum(["member", "org_admin"]).default("member"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(organizationMembers)
				.where(eq(organizationMembers.userId, input.userId));

			await ctx.db.insert(organizationMembers).values({
				organizationId: input.organizationId,
				userId: input.userId,
				orgRole: input.orgRole,
			});

			return { ok: true };
		}),

	detachUser: platformAdminProcedure
		.input(
			z.object({
				userId: z.string().min(1),
				organizationId: z.number().int().positive(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const orgGroups = await ctx.db.query.organizationGroups.findMany({
				where: eq(organizationGroups.organizationId, input.organizationId),
				columns: { id: true },
			});
			const groupIds = orgGroups.map((g) => g.id);
			if (groupIds.length > 0) {
				await ctx.db
					.delete(groupMembers)
					.where(
						and(
							eq(groupMembers.userId, input.userId),
							inArray(groupMembers.groupId, groupIds),
						),
					);
			}

			await ctx.db
				.delete(organizationMembers)
				.where(
					and(
						eq(organizationMembers.userId, input.userId),
						eq(organizationMembers.organizationId, input.organizationId),
					),
				);

			return { ok: true };
		}),

	addGroupMember: platformAdminProcedure
		.input(
			z.object({
				groupId: z.number().int().positive(),
				userId: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const group = await ctx.db.query.organizationGroups.findFirst({
				where: eq(organizationGroups.id, input.groupId),
			});
			if (!group) throw new Error("Group not found");

			const membership = await ctx.db.query.organizationMembers.findFirst({
				where: and(
					eq(organizationMembers.userId, input.userId),
					eq(organizationMembers.organizationId, group.organizationId),
				),
			});
			if (!membership) {
				throw new Error("User must be an organization member first");
			}

			await ctx.db
				.insert(groupMembers)
				.values({
					groupId: input.groupId,
					userId: input.userId,
				})
				.onConflictDoNothing();

			return { ok: true };
		}),

	removeGroupMember: platformAdminProcedure
		.input(
			z.object({
				groupId: z.number().int().positive(),
				userId: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(groupMembers)
				.where(
					and(
						eq(groupMembers.groupId, input.groupId),
						eq(groupMembers.userId, input.userId),
					),
				);
			return { ok: true };
		}),
});
