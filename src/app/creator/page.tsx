import Link from "next/link";

import { TenderStatusBadge } from "~/app/_components/tender-status-badge";
import { api } from "~/trpc/server";

function formatDate(value: Date | null | undefined) {
	if (!value) return "—";
	return new Intl.DateTimeFormat("en-GB", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(value);
}

export default async function CreatorHomePage() {
	const tenders = await api.tender.listMine();

	return (
		<div>
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-display text-3xl text-white tracking-tight">
						My tenders
					</h1>
					<p className="mt-2 text-[var(--zg-mist)]/55 text-sm">
						Draft, configure, and publish opportunities to the bidder portal.
					</p>
				</div>
				<Link
					className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--zg-accent)] px-5 font-medium text-sm text-white transition hover:bg-[var(--zg-steel)]"
					href="/creator/new"
				>
					New tender
				</Link>
			</div>

			{tenders.length === 0 ? (
				<div className="mt-16 border-white/10 border-t pt-10">
					<p className="text-[var(--zg-mist)]/60">
						No tenders yet. Create a draft to get started.
					</p>
				</div>
			) : (
				<ul className="mt-10 divide-y divide-white/10 border-white/10 border-t">
					{tenders.map((tender) => (
						<li key={tender.id}>
							<Link
								className="flex flex-col gap-3 py-5 transition hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between"
								href={`/creator/${tender.id}`}
							>
								<div className="min-w-0">
									<div className="flex flex-wrap items-center gap-3">
										<p className="font-display text-lg text-white">
											{tender.title}
										</p>
										<TenderStatusBadge status={tender.status} />
									</div>
									<p className="mt-1 truncate text-[var(--zg-mist)]/50 text-sm">
										{tender.category || "Uncategorized"}
										{tender.expertise ? ` · ${tender.expertise}` : ""}
									</p>
								</div>
								<p className="shrink-0 text-[var(--zg-mist)]/45 text-xs">
									Deadline {formatDate(tender.submissionDeadline)}
								</p>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
