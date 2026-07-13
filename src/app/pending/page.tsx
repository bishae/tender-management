import { redirect } from "next/navigation";

import { SignOutButton } from "~/app/_components/sign-out-button";
import {
	getUserMembership,
	isPlatformAdminUser,
	resolveDashboardPath,
} from "~/server/auth/membership";
import { getSession } from "~/server/better-auth/server";

export default async function PendingPage() {
	const session = await getSession();
	if (!session?.user) {
		redirect("/login");
	}

	const membership = await getUserMembership(session.user.id);
	const isAdmin = await isPlatformAdminUser(session.user.id);

	if (membership || isAdmin) {
		redirect(await resolveDashboardPath(session.user.id));
	}

	return (
		<main className="zg-surface zg-orbit relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
			<div
				aria-hidden
				className="zg-grid pointer-events-none absolute inset-0"
			/>
			<div className="relative z-10 w-full max-w-md text-center">
				<p className="font-display text-[var(--zg-mist)]/70 text-xs uppercase tracking-[0.2em]">
					Zero Gravity
				</p>
				<h1 className="mt-4 font-display text-3xl text-white tracking-tight">
					Awaiting organization access
				</h1>
				<p className="mt-4 text-[var(--zg-mist)]/60 leading-relaxed">
					Signed in as{" "}
					<span className="text-white">{session.user.email}</span>. Your email
					domain is not registered to an organization yet. A platform admin must
					attach your account before you can open the Buyer or Vendor portal.
				</p>
				<div className="mt-10 flex justify-center">
					<SignOutButton />
				</div>
			</div>
		</main>
	);
}
