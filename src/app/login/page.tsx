import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "~/app/_components/auth-form";
import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";

export default async function LoginPage() {
	const session = await getSession();

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
						Sign in to access the procurement portal.
					</p>
				</div>

				<div className="zg-fade-up mt-10">
					{session ? (
						<div className="flex flex-col gap-4">
							<p className="text-[var(--zg-mist)]/80">
								Signed in as{" "}
								<span className="text-white">{session.user?.name}</span>
							</p>
							<form>
								<button
									className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-white/15 bg-white/5 px-4 font-medium text-sm text-white transition hover:bg-white/10"
									formAction={async () => {
										"use server";
										await auth.api.signOut({
											headers: await headers(),
										});
										redirect("/login");
									}}
									type="submit"
								>
									Sign out
								</button>
							</form>
						</div>
					) : (
						<AuthForm />
					)}
				</div>
			</div>
		</main>
	);
}
