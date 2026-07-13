import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { PortalShell } from "~/app/_components/portal-shell";
import { isVendorMembership } from "~/lib/org";
import {
	getUserMembership,
	isPlatformAdminUser,
	resolveDashboardPath,
} from "~/server/auth/membership";
import { getSession } from "~/server/better-auth/server";

export default async function BidderLayout({
	children,
}: {
	children: ReactNode;
}) {
	const session = await getSession();
	if (!session?.user) {
		redirect("/login");
	}

	const membership = await getUserMembership(session.user.id);
	if (!isVendorMembership(membership)) {
		redirect(await resolveDashboardPath(session.user.id));
	}

	const isAdmin = await isPlatformAdminUser(session.user.id);
	const nav = [
		{ href: "/bidder", label: "Discover" },
		{ href: "/settings", label: "Settings" },
	];
	if (isAdmin) {
		nav.push({ href: "/admin", label: "Admin" });
	}

	return (
		<PortalShell
			nav={nav}
			subtitle={`${membership!.organizationName} · ${session.user.name}`}
			title="Bidder Portal"
		>
			{children}
		</PortalShell>
	);
}
