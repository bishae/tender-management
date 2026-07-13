import { notFound } from "next/navigation";

import { TenderStatusBadge } from "~/app/_components/tender-status-badge";
import { api } from "~/trpc/server";

function formatDate(value: Date | null | undefined) {
	if (!value) return "—";
	return new Intl.DateTimeFormat("en-GB", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(value);
}

export default async function BidderTenderDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const tenderId = Number(id);
	if (!Number.isFinite(tenderId)) {
		notFound();
	}

	const tender = await api.tender.getById({ id: tenderId });
	if (!tender || tender.status !== "published") {
		notFound();
	}

	return (
		<div className="max-w-3xl">
			<div className="flex flex-wrap items-center gap-3">
				<h1 className="font-display text-3xl text-white tracking-tight">
					{tender.title}
				</h1>
				<TenderStatusBadge status={tender.status} />
			</div>
			<p className="mt-2 text-[var(--zg-mist)]/50 text-sm">
				{tender.category || "Uncategorized"}
				{tender.expertise ? ` · ${tender.expertise}` : ""}
			</p>

			<dl className="mt-12 space-y-8 border-white/10 border-t pt-10">
				<div>
					<dt className="text-[var(--zg-mist)]/45 text-xs uppercase tracking-[0.14em]">
						Description
					</dt>
					<dd className="mt-2 whitespace-pre-wrap text-[var(--zg-mist)]/80 leading-relaxed">
						{tender.description || "—"}
					</dd>
				</div>
				<div>
					<dt className="text-[var(--zg-mist)]/45 text-xs uppercase tracking-[0.14em]">
						Requirements &amp; specs
					</dt>
					<dd className="mt-2 whitespace-pre-wrap text-[var(--zg-mist)]/80 leading-relaxed">
						{tender.requirements || "—"}
					</dd>
				</div>
				<div>
					<dt className="text-[var(--zg-mist)]/45 text-xs uppercase tracking-[0.14em]">
						Evaluation criteria
					</dt>
					<dd className="mt-2 whitespace-pre-wrap text-[var(--zg-mist)]/80 leading-relaxed">
						{tender.evaluationRules || "—"}
					</dd>
				</div>
				<div className="grid gap-6 sm:grid-cols-2">
					<div>
						<dt className="text-[var(--zg-mist)]/45 text-xs uppercase tracking-[0.14em]">
							Submission deadline
						</dt>
						<dd className="mt-2 text-[var(--zg-mist)]/80">
							{formatDate(tender.submissionDeadline)}
						</dd>
					</div>
					<div>
						<dt className="text-[var(--zg-mist)]/45 text-xs uppercase tracking-[0.14em]">
							Clarification deadline
						</dt>
						<dd className="mt-2 text-[var(--zg-mist)]/80">
							{formatDate(tender.clarificationDeadline)}
						</dd>
					</div>
				</div>
			</dl>
		</div>
	);
}
