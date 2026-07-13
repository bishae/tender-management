import Link from "next/link";
import type { ReactNode } from "react";

import { SignOutButton } from "~/app/_components/sign-out-button";

type NavItem = {
	href: string;
	label: string;
};

export function PortalShell({
	title,
	subtitle,
	nav,
	children,
}: {
	title: string;
	subtitle: string;
	nav: NavItem[];
	children: ReactNode;
}) {
	return (
		<main className="zg-surface zg-orbit relative min-h-screen overflow-x-hidden">
			<div
				aria-hidden
				className="zg-grid pointer-events-none absolute inset-0"
			/>

			<header className="relative z-10 border-white/10 border-b">
				<div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
					<div>
						<Link
							className="font-display text-[var(--zg-mist)]/70 text-xs uppercase tracking-[0.2em] transition hover:text-white"
							href="/"
						>
							Zero Gravity
						</Link>
						<p className="mt-1 font-display text-white text-xl tracking-tight">
							{title}
						</p>
						<p className="mt-0.5 text-[var(--zg-mist)]/50 text-sm">{subtitle}</p>
					</div>
					<div className="flex flex-wrap items-center gap-4">
						<nav className="flex flex-wrap items-center gap-4">
							{nav.map((item) => (
								<Link
									className="text-[var(--zg-mist)]/80 text-sm underline-offset-4 transition hover:text-white hover:underline"
									href={item.href}
									key={item.href}
								>
									{item.label}
								</Link>
							))}
						</nav>
						<SignOutButton />
					</div>
				</div>
			</header>

			<section className="relative z-10 mx-auto w-full max-w-6xl px-6 py-10">
				{children}
			</section>
		</main>
	);
}
