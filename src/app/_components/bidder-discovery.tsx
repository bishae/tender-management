"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { TenderStatusBadge } from "~/app/_components/tender-status-badge";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

const fieldClass =
	"h-10 border-white/15 bg-white/5 text-white placeholder:text-[var(--zg-mist)]/40 focus-visible:border-[var(--zg-accent)] focus-visible:ring-[var(--zg-accent)]/30 dark:bg-white/5";

function formatDate(value: Date | string | null | undefined) {
	if (!value) return "—";
	const d = typeof value === "string" ? new Date(value) : value;
	return new Intl.DateTimeFormat("en-GB", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(d);
}

export function BidderDiscovery() {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("");
	const [expertise, setExpertise] = useState("");

	const filters = useMemo(
		() => ({
			search: search.trim() || undefined,
			category: category || undefined,
			expertise: expertise || undefined,
		}),
		[search, category, expertise],
	);

	const { data: options } = api.tender.filterOptions.useQuery();
	const { data: tenders, isLoading } = api.tender.discover.useQuery(filters);

	return (
		<div>
			<div>
				<h1 className="font-display text-3xl text-white tracking-tight">
					Discover tenders
				</h1>
				<p className="mt-2 text-[var(--zg-mist)]/55 text-sm">
					Browse published opportunities filtered by category and expertise.
				</p>
			</div>

			<div className="mt-8 grid gap-3 sm:grid-cols-3">
				<Input
					className={fieldClass}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search title"
					value={search}
				/>
				<select
					className={`${fieldClass} rounded-lg px-3 outline-none`}
					onChange={(e) => setCategory(e.target.value)}
					value={category}
				>
					<option className="bg-[var(--zg-void)]" value="">
						All categories
					</option>
					{(options?.categories ?? []).map((c) => (
						<option className="bg-[var(--zg-void)]" key={c} value={c}>
							{c}
						</option>
					))}
				</select>
				<select
					className={`${fieldClass} rounded-lg px-3 outline-none`}
					onChange={(e) => setExpertise(e.target.value)}
					value={expertise}
				>
					<option className="bg-[var(--zg-void)]" value="">
						All expertise
					</option>
					{(options?.expertise ?? []).map((e) => (
						<option className="bg-[var(--zg-void)]" key={e} value={e}>
							{e}
						</option>
					))}
				</select>
			</div>

			{isLoading ? (
				<p className="mt-12 text-[var(--zg-mist)]/50 text-sm">Loading…</p>
			) : !tenders?.length ? (
				<p className="mt-12 border-white/10 border-t pt-10 text-[var(--zg-mist)]/60">
					No published tenders match your filters.
				</p>
			) : (
				<ul className="mt-10 divide-y divide-white/10 border-white/10 border-t">
					{tenders.map((tender) => (
						<li key={tender.id}>
							<Link
								className="flex flex-col gap-3 py-5 transition hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between"
								href={`/bidder/${tender.id}`}
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
