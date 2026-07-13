import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { PortalShell } from "~/app/_components/portal-shell";
import { resolveDashboardPath } from "~/server/auth/membership";
import { getSession } from "~/server/better-auth/server";

export default async function SettingsLayout({
	children,
}: {
	children: ReactNode;
}) {
	const session = await getSession();
	if (!session?.user) {
		redirect("/login");
	}

	const dashboardPath = await resolveDashboardPath(session.user.id);
	const nav = [
		{ href: dashboardPath, label: "Back to portal" },
		{ href: "/settings", label: "Settings" },
	];

	return (
		<PortalShell
			nav={nav}
			subtitle={`${session.user.name} · ${session.user.email}`}
			title="Settings"
		>
			{children}
		</PortalShell>
	);
}
