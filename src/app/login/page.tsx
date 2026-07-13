import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "~/app/_components/auth-form";
import { resolveDashboardPath } from "~/server/auth/membership";
import { getSession } from "~/server/better-auth/server";

function oauthErrorMessage(code: string): string {
	if (code === "invalid_code") {
		return "Microsoft sign-in failed. Check that BETTER_AUTH_URL and the Entra redirect URI match this app URL exactly.";
	}
	return `Sign-in failed (${code}). Please try again.`;
}

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const session = await getSession();

	if (session?.user) {
		redirect(await resolveDashboardPath(session.user.id));
	}

	const { error } = await searchParams;
	const oauthError = error ? oauthErrorMessage(error) : null;

	return (
		<main className="zg-surface zg-orbit relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
			<div
				aria-hidden
				className="zg-grid pointer-events-none absolute inset-0"
			/>

			<div className="relative z-10 w-full max-w-sm">
				<Link
					className="mb-10 inline-block text-[var(--zg-mist)]/60 text-xs uppercase tracking-[0.2em] transition hover:text-[var(--zg-mist)]"
					href="/"
				>
					← Back
				</Link>

				<div className="zg-fade-in">
					<p className="font-display text-3xl text-white tracking-tight sm:text-4xl">
						Zero Gravity
					</p>
					<h1 className="mt-2 font-display text-[var(--zg-mist)]/80 text-lg">
						Smart Tender Management
					</h1>
					<p className="mt-3 text-[var(--zg-mist)]/50 text-sm">
						Sign in with your organization email to access the portal.
					</p>
				</div>

				{oauthError && (
					<p
						className="zg-fade-in mt-6 text-center text-red-300 text-sm"
						role="alert"
					>
						{oauthError}
					</p>
				)}

				<div className="zg-fade-up mt-10">
					<AuthForm />
				</div>
			</div>
		</main>
	);
}
