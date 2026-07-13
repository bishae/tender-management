import { notFound } from "next/navigation";

import { TenderForm } from "~/app/_components/tender-form";
import { api } from "~/trpc/server";

export default async function EditTenderPage({
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
	if (
		!tender ||
		(tender.status !== "draft" && tender.status !== "rejected")
	) {
		notFound();
	}

	const approvalGroupIds = [...(tender.approvalSteps ?? [])]
		.sort((a, b) => a.stepOrder - b.stepOrder)
		.map((s) => s.groupId);

	return (
		<div>
			<h1 className="font-display text-3xl text-white tracking-tight">
				Edit tender
			</h1>
			<p className="mt-2 mb-10 text-[var(--zg-mist)]/55 text-sm">
				Update draft configuration and approval chain before submitting.
			</p>
			<TenderForm
				initial={{
					title: tender.title,
					description: tender.description,
					category: tender.category,
					expertise: tender.expertise,
					requirements: tender.requirements,
					evaluationRules: tender.evaluationRules,
					submissionDeadline: tender.submissionDeadline,
					clarificationDeadline: tender.clarificationDeadline,
					approvalGroupIds,
				}}
				mode="edit"
				tenderId={tender.id}
			/>
		</div>
	);
}
