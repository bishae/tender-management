import Link from "next/link";

import { resolveDashboardPath } from "~/server/auth/membership";
import { getSession } from "~/server/better-auth/server";

export default async function Home() {
	const session = await getSession();
	const portalHref = session?.user
		? await resolveDashboardPath(session.user.id)
		: "/login";

	return (
		<main className="zg-surface zg-orbit relative min-h-screen overflow-x-hidden">
			<div
				aria-hidden
				className="zg-grid pointer-events-none absolute inset-0"
			/>

			<header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
				<span className="font-display text-[var(--zg-mist)]/80 text-sm uppercase tracking-[0.2em]">
					Zero Gravity
				</span>
				<Link
					className="text-[var(--zg-mist)]/90 text-sm underline-offset-4 transition hover:text-white hover:underline"
					href={portalHref}
				>
					{session ? "Open portal" : "Sign in"}
				</Link>
			</header>

			{/* Hero — first viewport */}
			<section className="relative z-10 flex min-h-[calc(100vh-5rem)] flex-col justify-center px-6 pb-24">
				<div className="mx-auto w-full max-w-6xl">
					<p className="zg-fade-in font-display text-4xl text-white tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
						Zero Gravity
					</p>
					<h1 className="zg-fade-up mt-4 max-w-3xl font-display text-2xl text-[var(--zg-mist)] leading-snug sm:text-3xl md:text-4xl">
						Smart Tender Management
					</h1>
					<p className="zg-fade-up-delay mt-6 max-w-xl text-[var(--zg-mist)]/70 text-base leading-relaxed sm:text-lg">
						A unified procurement ecosystem that bridges tender creators and
						bidders with intelligent automation and real-time synchronization.
					</p>
					<div className="zg-fade-up-delay-2 mt-10 flex flex-wrap items-center gap-4">
						<Link
							className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--zg-accent)] px-6 font-medium text-sm text-white transition hover:bg-[var(--zg-steel)]"
							href={portalHref}
						>
							{session ? "Open portal" : "Sign in"}
						</Link>
						<a
							className="inline-flex h-11 items-center justify-center px-2 text-[var(--zg-mist)]/80 text-sm underline-offset-4 transition hover:text-white hover:underline"
							href="#scenarios"
						>
							Explore scenarios
						</a>
					</div>
				</div>
			</section>

			{/* Dual scenarios */}
			<section
				className="relative z-10 border-white/10 border-t px-6 py-24"
				id="scenarios"
			>
				<div className="mx-auto max-w-6xl">
					<h2 className="font-display text-3xl text-white tracking-tight sm:text-4xl">
						Two scenarios. One platform.
					</h2>
					<p className="mt-4 max-w-2xl text-[var(--zg-mist)]/65">
						Dual-scenario architecture for internal procurement officers and
						external partners across the Zero Gravity network.
					</p>

					<div className="mt-16 grid gap-16 md:grid-cols-2 md:gap-20">
						<div>
							<p className="text-[var(--zg-steel)] text-xs uppercase tracking-[0.18em]">
								Scenario 1 — Internal
							</p>
							<h3 className="mt-3 font-display text-2xl text-white">
								Tender Creator
							</h3>
							<p className="mt-4 text-[var(--zg-mist)]/65 leading-relaxed">
								Initiate, manage, and track complex tender requests with
								automated compliance checks, multi-level approvals, and
								controlled publication to the bidder portal.
							</p>
						</div>
						<div>
							<p className="text-[var(--zg-steel)] text-xs uppercase tracking-[0.18em]">
								Scenario 2 — External
							</p>
							<h3 className="mt-3 font-display text-2xl text-white">
								ZG Bidder
							</h3>
							<p className="mt-4 text-[var(--zg-mist)]/65 leading-relaxed">
								Discover opportunities, prepare AI-assisted proposals, submit
								bids securely, and track status with real-time notifications.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* AI features */}
			<section className="relative z-10 border-white/10 border-t px-6 py-24">
				<div className="mx-auto max-w-6xl">
					<h2 className="font-display text-3xl text-white tracking-tight sm:text-4xl">
						AI-powered procurement
					</h2>
					<p className="mt-4 max-w-2xl text-[var(--zg-mist)]/65">
						Large language models automate evaluation, drafting, and compliance
						so decisions stay objective and timelines stay short.
					</p>

					<ul className="mt-16 grid gap-12 sm:grid-cols-2">
						<li>
							<h3 className="font-display text-white text-xl">
								Intelligent bid evaluation
							</h3>
							<p className="mt-3 text-[var(--zg-mist)]/65">
								Automated scoring and ranking against technical specifications
								and historical performance.
							</p>
						</li>
						<li>
							<h3 className="font-display text-white text-xl">
								Proposal drafting
							</h3>
							<p className="mt-3 text-[var(--zg-mist)]/65">
								Templates and content suggestions that help partners build
								high-quality, compliant responses.
							</p>
						</li>
						<li>
							<h3 className="font-display text-white text-xl">
								Compliance verification
							</h3>
							<p className="mt-3 text-[var(--zg-mist)]/65">
								Real-time document analysis against mandatory tender
								requirements before submission or approval.
							</p>
						</li>
						<li>
							<h3 className="font-display text-white text-xl">
								Risk &amp; sentiment analysis
							</h3>
							<p className="mt-3 text-[var(--zg-mist)]/65">
								NLP that flags inconsistencies, red flags, and risk signals
								inside bid packages.
							</p>
						</li>
					</ul>

					<p className="mt-16 max-w-xl text-[var(--zg-mist)]/50 text-sm">
						Designed to cut procurement processing time by up to 40% through
						automation and transparent workflows.
					</p>
				</div>
			</section>

			<footer className="relative z-10 border-white/10 border-t px-6 py-10">
				<div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="font-display text-sm text-white">Zero Gravity</p>
						<p className="mt-1 text-[var(--zg-mist)]/45 text-xs">
							Suite 901, C2 Bateen Tower, Al Bateen, Abu Dhabi, U.A.E.
						</p>
					</div>
					<Link
						className="text-[var(--zg-steel)] text-sm transition hover:text-white"
						href={portalHref}
					>
						{session ? "Open portal" : "Sign in to the portal"}
					</Link>
				</div>
			</footer>
		</main>
	);
}
