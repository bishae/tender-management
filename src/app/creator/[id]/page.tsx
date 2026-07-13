import Link from "next/link";
import { notFound } from "next/navigation";

import { TenderActions } from "~/app/_components/tender-actions";
import { TenderStatusBadge } from "~/app/_components/tender-status-badge";
import { getUserGroupIds } from "~/server/auth/membership";
import { getSession } from "~/server/better-auth/server";
import { api } from "~/trpc/server";

function formatDate(value: Date | null | undefined) {
	if (!value) return "—";
	return new Intl.DateTimeFormat("en-GB", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(value);
}

export default async function CreatorTenderDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const tenderId = Number(id);
	if (!Number.isFinite(tenderId)) {
		notFound();
	}

	const session = await getSession();
	const tender = await api.tender.getById({ id: tenderId });
	if (!tender) {
		notFound();
	}

	const steps = tender.approvalSteps ?? [];
	const currentPending = steps.find((s) => s.status === "pending");
	const userGroupIds = session?.user
		? await getUserGroupIds(session.user.id)
		: [];
	const canActOnCurrentStep = Boolean(
		currentPending && userGroupIds.includes(currentPending.groupId),
	);

	return (
		<div className="max-w-3xl">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
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
				</div>
				{(tender.status === "draft" || tender.status === "rejected") && (
					<Link
						className="inline-flex h-10 items-center justify-center rounded-lg border border-white/15 px-4 text-[var(--zg-mist)] text-sm transition hover:bg-white/5 hover:text-white"
						href={`/creator/${tender.id}/edit`}
					>
						Edit
					</Link>
				)}
			</div>

			<div className="mt-8">
				<TenderActions
					canActOnCurrentStep={canActOnCurrentStep}
					hasApprovalSteps={steps.length > 0}
					status={tender.status}
					tenderId={tender.id}
				/>
			</div>

			{steps.length > 0 && (
				<section className="mt-10 border-white/10 border-t pt-8">
					<h2 className="font-display text-xl text-white">Approval progress</h2>
					<ol className="mt-4 space-y-3">
						{steps.map((step) => (
							<li
								className="flex flex-wrap items-baseline justify-between gap-2 text-sm"
								key={step.id}
							>
								<span className="text-[var(--zg-mist)]/80">
									{step.stepOrder}. {step.group.name}
								</span>
								<span className="text-[var(--zg-mist)]/45 uppercase tracking-[0.12em] text-xs">
									{step.status}
									{step.actedBy ? ` · ${step.actedBy.name}` : ""}
								</span>
							</li>
						))}
					</ol>
				</section>
			)}

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
						Requirements
					</dt>
					<dd className="mt-2 whitespace-pre-wrap text-[var(--zg-mist)]/80 leading-relaxed">
						{tender.requirements || "—"}
					</dd>
				</div>
				<div>
					<dt className="text-[var(--zg-mist)]/45 text-xs uppercase tracking-[0.14em]">
						Evaluation rules
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
