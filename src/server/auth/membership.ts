import { eq } from "drizzle-orm";

import {
	dashboardPathForMembership,
	type OrgRole,
	type OrgType,
	type UserMembership,
} from "~/lib/org";
import { db } from "~/server/db";
import { groupMembers, organizationMembers } from "~/server/db/schema";

export async function getUserMembership(
	userId: string,
): Promise<UserMembership | null> {
	const row = await db.query.organizationMembers.findFirst({
		where: eq(organizationMembers.userId, userId),
		with: {
			organization: true,
		},
	});

	if (!row?.organization) return null;

	const userRow = await db.query.user.findFirst({
		where: (u, { eq: e }) => e(u.id, userId),
		columns: { isPlatformAdmin: true },
	});

	return {
		organizationId: row.organizationId,
		organizationName: row.organization.name,
		organizationType: row.organization.type as OrgType,
		orgRole: row.orgRole as OrgRole,
		isPlatformAdmin: userRow?.isPlatformAdmin ?? false,
	};
}

export async function getUserGroupIds(userId: string): Promise<number[]> {
	const rows = await db.query.groupMembers.findMany({
		where: eq(groupMembers.userId, userId),
		columns: { groupId: true },
	});
	return rows.map((r) => r.groupId);
}

export async function isPlatformAdminUser(userId: string): Promise<boolean> {
	const userRow = await db.query.user.findFirst({
		where: (u, { eq: e }) => e(u.id, userId),
		columns: { isPlatformAdmin: true },
	});
	return userRow?.isPlatformAdmin ?? false;
}

export async function resolveDashboardPath(userId: string): Promise<string> {
	const admin = await isPlatformAdminUser(userId);
	const membership = await getUserMembership(userId);
	return dashboardPathForMembership(membership, admin);
}

export {
	dashboardPathForMembership,
	isBuyerMembership,
	isVendorMembership,
} from "~/lib/org";
