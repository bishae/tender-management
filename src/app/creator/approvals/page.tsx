import Link from "next/link";

import { TenderStatusBadge } from "~/app/_components/tender-status-badge";
import { api } from "~/trpc/server";

export default async function CreatorApprovalsPage() {
	const pending = await api.tender.listPendingApprovals();

	return (
		<div>
			<h1 className="font-display text-3xl text-white tracking-tight">
				Approvals
			</h1>
			<p className="mt-2 text-[var(--zg-mist)]/55 text-sm">
				Tenders waiting on a group you belong to.
			</p>

			{pending.length === 0 ? (
				<p className="mt-12 border-white/10 border-t pt-10 text-[var(--zg-mist)]/60">
					No pending approvals for your groups.
				</p>
			) : (
				<ul className="mt-10 divide-y divide-white/10 border-white/10 border-t">
					{pending.map((step) => (
						<li key={step.id}>
							<Link
								className="flex flex-col gap-2 py-5 transition hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between"
								href={`/creator/${step.tender.id}`}
							>
								<div>
									<div className="flex flex-wrap items-center gap-3">
										<p className="font-display text-lg text-white">
											{step.tender.title}
										</p>
										<TenderStatusBadge status={step.tender.status} />
									</div>
									<p className="mt-1 text-[var(--zg-mist)]/50 text-sm">
										Awaiting {step.group.name} (step {step.stepOrder})
									</p>
								</div>
								<span className="text-[var(--zg-mist)]/45 text-xs">
									Review →
								</span>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
