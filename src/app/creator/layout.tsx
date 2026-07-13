import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { PortalShell } from "~/app/_components/portal-shell";
import {
	getUserMembership,
	isPlatformAdminUser,
	resolveDashboardPath,
} from "~/server/auth/membership";
import { isBuyerMembership } from "~/lib/org";
import { getSession } from "~/server/better-auth/server";

export default async function CreatorLayout({
	children,
}: {
	children: ReactNode;
}) {
	const session = await getSession();
	if (!session?.user) {
		redirect("/login");
	}

	const membership = await getUserMembership(session.user.id);
	if (!isBuyerMembership(membership)) {
		redirect(await resolveDashboardPath(session.user.id));
	}

	const isAdmin = await isPlatformAdminUser(session.user.id);
	const nav = [
		{ href: "/creator", label: "My tenders" },
		{ href: "/creator/new", label: "New tender" },
		{ href: "/creator/approvals", label: "Approvals" },
	];
	if (isAdmin) {
		nav.push({ href: "/admin", label: "Admin" });
	}

	return (
		<PortalShell
			nav={nav}
			subtitle={`${membership!.organizationName} · ${session.user.name}`}
			title="Tender Creator"
		>
			{children}
		</PortalShell>
	);
}
