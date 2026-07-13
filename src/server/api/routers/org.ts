import { eq } from "drizzle-orm";

import {
	createTRPCRouter,
	protectedProcedure,
} from "~/server/api/trpc";
import {
	getUserMembership,
	isPlatformAdminUser,
	resolveDashboardPath,
} from "~/server/auth/membership";
import { organizationGroups } from "~/server/db/schema";

export const orgRouter = createTRPCRouter({
	myMembership: protectedProcedure.query(async ({ ctx }) => {
		const membership = await getUserMembership(ctx.session.user.id);
		const isPlatformAdmin = await isPlatformAdminUser(ctx.session.user.id);
		return {
			membership,
			isPlatformAdmin,
		};
	}),

	dashboardPath: protectedProcedure.query(async ({ ctx }) => {
		return resolveDashboardPath(ctx.session.user.id);
	}),

	listGroups: protectedProcedure.query(async ({ ctx }) => {
		const membership = await getUserMembership(ctx.session.user.id);
		if (!membership) return [];

		return ctx.db.query.organizationGroups.findMany({
			where: eq(organizationGroups.organizationId, membership.organizationId),
			orderBy: (g, { asc }) => [asc(g.name)],
		});
	}),
});
