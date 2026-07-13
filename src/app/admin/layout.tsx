import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { PortalShell } from "~/app/_components/portal-shell";
import {
	getUserMembership,
	isPlatformAdminUser,
	resolveDashboardPath,
} from "~/server/auth/membership";
import { getSession } from "~/server/better-auth/server";

export default async function AdminLayout({
	children,
}: {
	children: ReactNode;
}) {
	const session = await getSession();
	if (!session?.user) {
		redirect("/login");
	}

	const isAdmin = await isPlatformAdminUser(session.user.id);
	if (!isAdmin) {
		redirect(await resolveDashboardPath(session.user.id));
	}

	const membership = await getUserMembership(session.user.id);
	const nav = [
		{ href: "/admin", label: "Organizations" },
		{ href: "/admin/users", label: "Users" },
		{ href: "/settings", label: "Settings" },
	];
	if (membership?.organizationType === "buyer") {
		nav.push({ href: "/creator", label: "Creator portal" });
	}
	if (membership?.organizationType === "vendor") {
		nav.push({ href: "/bidder", label: "Bidder portal" });
	}

	return (
		<PortalShell
			nav={nav}
			subtitle={`Platform admin · ${session.user.name}`}
			title="Admin"
		>
			{children}
		</PortalShell>
	);
}
