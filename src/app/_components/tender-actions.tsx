"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export function TenderActions({
	tenderId,
	status,
	hasApprovalSteps,
	canActOnCurrentStep,
}: {
	tenderId: number;
	status: string;
	hasApprovalSteps: boolean;
	canActOnCurrentStep?: boolean;
}) {
	const router = useRouter();
	const utils = api.useUtils();
	const [error, setError] = useState<string | null>(null);
	const [note, setNote] = useState("");

	const invalidate = async () => {
		await utils.tender.getById.invalidate({ id: tenderId });
		await utils.tender.listMine.invalidate();
		await utils.tender.listPendingApprovals.invalidate();
		router.refresh();
	};

	const publishMutation = api.tender.publish.useMutation({
		onSuccess: invalidate,
		onError: (err) => setError(err.message),
	});
	const submitMutation = api.tender.submitForApproval.useMutation({
		onSuccess: invalidate,
		onError: (err) => setError(err.message),
	});
	const approveMutation = api.tender.approve.useMutation({
		onSuccess: invalidate,
		onError: (err) => setError(err.message),
	});
	const rejectMutation = api.tender.reject.useMutation({
		onSuccess: invalidate,
		onError: (err) => setError(err.message),
	});
	const closeMutation = api.tender.close.useMutation({
		onSuccess: invalidate,
		onError: (err) => setError(err.message),
	});

	const busy =
		publishMutation.isPending ||
		submitMutation.isPending ||
		approveMutation.isPending ||
		rejectMutation.isPending ||
		closeMutation.isPending;

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap gap-3">
				{(status === "draft" || status === "rejected") && hasApprovalSteps && (
					<Button
						className="h-10 bg-[var(--zg-accent)] px-5 text-white hover:bg-[var(--zg-steel)]"
						disabled={busy}
						onClick={() => {
							setError(null);
							submitMutation.mutate({ id: tenderId });
						}}
						type="button"
					>
						{submitMutation.isPending
							? "Submitting..."
							: "Submit for approval"}
					</Button>
				)}
				{(status === "draft" || status === "rejected") && !hasApprovalSteps && (
					<Button
						className="h-10 bg-[var(--zg-accent)] px-5 text-white hover:bg-[var(--zg-steel)]"
						disabled={busy}
						onClick={() => {
							setError(null);
							publishMutation.mutate({ id: tenderId });
						}}
						type="button"
					>
						{publishMutation.isPending ? "Publishing..." : "Publish"}
					</Button>
				)}
				{status === "pending_approval" && canActOnCurrentStep && (
					<>
						<Button
							className="h-10 bg-[var(--zg-accent)] px-5 text-white hover:bg-[var(--zg-steel)]"
							disabled={busy}
							onClick={() => {
								setError(null);
								approveMutation.mutate({
									id: tenderId,
									note: note || undefined,
								});
							}}
							type="button"
						>
							{approveMutation.isPending ? "Approving..." : "Approve"}
						</Button>
						<Button
							className="h-10 border-white/15 bg-transparent text-[var(--zg-mist)] hover:bg-white/5 hover:text-white"
							disabled={busy}
							onClick={() => {
								setError(null);
								rejectMutation.mutate({
									id: tenderId,
									note: note || undefined,
								});
							}}
							type="button"
							variant="outline"
						>
							{rejectMutation.isPending ? "Rejecting..." : "Reject"}
						</Button>
					</>
				)}
				{status === "published" && (
					<Button
						className="h-10 border-white/15 bg-transparent text-[var(--zg-mist)] hover:bg-white/5 hover:text-white"
						disabled={busy}
						onClick={() => {
							setError(null);
							closeMutation.mutate({ id: tenderId });
						}}
						type="button"
						variant="outline"
					>
						{closeMutation.isPending ? "Closing..." : "Close tender"}
					</Button>
				)}
			</div>
			{status === "pending_approval" && canActOnCurrentStep && (
				<input
					className="h-10 max-w-md rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-[var(--zg-mist)]/40 outline-none"
					onChange={(e) => setNote(e.target.value)}
					placeholder="Optional note"
					value={note}
				/>
			)}
			{error && (
				<p className="text-red-300 text-sm" role="alert">
					{error}
				</p>
			)}
		</div>
	);
}
