"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";

export type TenderFormValues = {
	title: string;
	description: string;
	category: string;
	expertise: string;
	requirements: string;
	evaluationRules: string;
	submissionDeadline: string;
	clarificationDeadline: string;
};

const fieldClass =
	"border-white/15 bg-white/5 text-white placeholder:text-[var(--zg-mist)]/40 focus-visible:border-[var(--zg-accent)] focus-visible:ring-[var(--zg-accent)]/30 dark:bg-white/5";

function toDateOrNull(value: string): Date | null {
	if (!value) return null;
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? null : d;
}

function toLocalInputValue(date: Date | string | null | undefined): string {
	if (!date) return "";
	const d = typeof date === "string" ? new Date(date) : date;
	if (Number.isNaN(d.getTime())) return "";
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Props = {
	mode: "create" | "edit";
	tenderId?: number;
	initial?: {
		title?: string;
		description?: string;
		category?: string;
		expertise?: string;
		requirements?: string;
		evaluationRules?: string;
		submissionDeadline?: Date | string | null;
		clarificationDeadline?: Date | string | null;
		approvalGroupIds?: number[];
	};
};

export function TenderForm({ mode, tenderId, initial }: Props) {
	const router = useRouter();
	const utils = api.useUtils();
	const { data: groups } = api.org.listGroups.useQuery();
	const [error, setError] = useState<string | null>(null);
	const [approvalGroupIds, setApprovalGroupIds] = useState<number[]>(
		initial?.approvalGroupIds ?? [],
	);
	const [values, setValues] = useState<TenderFormValues>({
		title: initial?.title ?? "",
		description: initial?.description ?? "",
		category: initial?.category ?? "",
		expertise: initial?.expertise ?? "",
		requirements: initial?.requirements ?? "",
		evaluationRules: initial?.evaluationRules ?? "",
		submissionDeadline: toLocalInputValue(initial?.submissionDeadline),
		clarificationDeadline: toLocalInputValue(initial?.clarificationDeadline),
	});

	const createMutation = api.tender.create.useMutation({
		onSuccess: async (tender) => {
			await utils.tender.listMine.invalidate();
			router.push(`/creator/${tender.id}`);
			router.refresh();
		},
		onError: (err) => setError(err.message),
	});

	const updateMutation = api.tender.update.useMutation({
		onSuccess: async (tender) => {
			await utils.tender.listMine.invalidate();
			await utils.tender.getById.invalidate({ id: tender.id });
			router.push(`/creator/${tender.id}`);
			router.refresh();
		},
		onError: (err) => setError(err.message),
	});

	const pending = createMutation.isPending || updateMutation.isPending;

	function setField<K extends keyof TenderFormValues>(
		key: K,
		value: TenderFormValues[K],
	) {
		setValues((prev) => ({ ...prev, [key]: value }));
	}

	function toggleGroup(id: number) {
		setApprovalGroupIds((prev) =>
			prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
		);
	}

	function moveGroup(id: number, direction: -1 | 1) {
		setApprovalGroupIds((prev) => {
			const index = prev.indexOf(id);
			if (index < 0) return prev;
			const next = index + direction;
			if (next < 0 || next >= prev.length) return prev;
			const copy = [...prev];
			[copy[index], copy[next]] = [copy[next]!, copy[index]!];
			return copy;
		});
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		const payload = {
			title: values.title.trim(),
			description: values.description,
			category: values.category.trim(),
			expertise: values.expertise.trim(),
			requirements: values.requirements,
			evaluationRules: values.evaluationRules,
			submissionDeadline: toDateOrNull(values.submissionDeadline),
			clarificationDeadline: toDateOrNull(values.clarificationDeadline),
			approvalGroupIds,
		};

		if (mode === "create") {
			createMutation.mutate(payload);
			return;
		}

		if (!tenderId) {
			setError("Missing tender id");
			return;
		}
		updateMutation.mutate({ id: tenderId, ...payload });
	}

	const groupName = (id: number) =>
		groups?.find((g) => g.id === id)?.name ?? `Group #${id}`;

	return (
		<form className="flex max-w-2xl flex-col gap-5" onSubmit={handleSubmit}>
			<div className="flex flex-col gap-1.5">
				<span className="text-[var(--zg-mist)]/55 text-xs uppercase tracking-[0.14em]">
					Title
				</span>
				<Input
					className={`h-10 ${fieldClass}`}
					onChange={(e) => setField("title", e.target.value)}
					required
					value={values.title}
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<span className="text-[var(--zg-mist)]/55 text-xs uppercase tracking-[0.14em]">
					Description
				</span>
				<Textarea
					className={`min-h-24 ${fieldClass}`}
					onChange={(e) => setField("description", e.target.value)}
					value={values.description}
				/>
			</div>

			<div className="grid gap-5 sm:grid-cols-2">
				<div className="flex flex-col gap-1.5">
					<span className="text-[var(--zg-mist)]/55 text-xs uppercase tracking-[0.14em]">
						Category
					</span>
					<Input
						className={`h-10 ${fieldClass}`}
						onChange={(e) => setField("category", e.target.value)}
						placeholder="e.g. IT Infrastructure"
						value={values.category}
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<span className="text-[var(--zg-mist)]/55 text-xs uppercase tracking-[0.14em]">
						Expertise
					</span>
					<Input
						className={`h-10 ${fieldClass}`}
						onChange={(e) => setField("expertise", e.target.value)}
						placeholder="e.g. Cloud, Security"
						value={values.expertise}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-1.5">
				<span className="text-[var(--zg-mist)]/55 text-xs uppercase tracking-[0.14em]">
					Requirements
				</span>
				<Textarea
					className={`min-h-32 ${fieldClass}`}
					onChange={(e) => setField("requirements", e.target.value)}
					placeholder="Technical and commercial requirements"
					value={values.requirements}
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<span className="text-[var(--zg-mist)]/55 text-xs uppercase tracking-[0.14em]">
					Evaluation rules
				</span>
				<Textarea
					className={`min-h-28 ${fieldClass}`}
					onChange={(e) => setField("evaluationRules", e.target.value)}
					placeholder="Scoring criteria and weighting"
					value={values.evaluationRules}
				/>
			</div>

			<div className="grid gap-5 sm:grid-cols-2">
				<div className="flex flex-col gap-1.5">
					<span className="text-[var(--zg-mist)]/55 text-xs uppercase tracking-[0.14em]">
						Submission deadline
					</span>
					<Input
						className={`h-10 ${fieldClass}`}
						onChange={(e) => setField("submissionDeadline", e.target.value)}
						type="datetime-local"
						value={values.submissionDeadline}
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<span className="text-[var(--zg-mist)]/55 text-xs uppercase tracking-[0.14em]">
						Clarification deadline
					</span>
					<Input
						className={`h-10 ${fieldClass}`}
						onChange={(e) => setField("clarificationDeadline", e.target.value)}
						type="datetime-local"
						value={values.clarificationDeadline}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-3 border-white/10 border-t pt-5">
				<div>
					<span className="text-[var(--zg-mist)]/55 text-xs uppercase tracking-[0.14em]">
						Approval chain
					</span>
					<p className="mt-1 text-[var(--zg-mist)]/45 text-sm">
						Select groups in order. Leave empty to publish without approval.
					</p>
				</div>
				{!groups?.length ? (
					<p className="text-[var(--zg-mist)]/50 text-sm">
						No groups yet. Ask a platform admin to create approval groups.
					</p>
				) : (
					<ul className="space-y-2">
						{groups.map((group) => {
							const selected = approvalGroupIds.includes(group.id);
							const order = approvalGroupIds.indexOf(group.id);
							return (
								<li
									className="flex flex-wrap items-center gap-3 text-sm"
									key={group.id}
								>
									<label className="flex items-center gap-2 text-[var(--zg-mist)]/80">
										<input
											checked={selected}
											className="accent-[var(--zg-accent)]"
											onChange={() => toggleGroup(group.id)}
											type="checkbox"
										/>
										{group.name}
									</label>
									{selected && (
										<span className="flex items-center gap-2 text-[var(--zg-mist)]/45 text-xs">
											Step {order + 1}
											<button
												className="hover:text-white"
												onClick={() => moveGroup(group.id, -1)}
												type="button"
											>
												↑
											</button>
											<button
												className="hover:text-white"
												onClick={() => moveGroup(group.id, 1)}
												type="button"
											>
												↓
											</button>
										</span>
									)}
								</li>
							);
						})}
					</ul>
				)}
				{approvalGroupIds.length > 0 && (
					<p className="text-[var(--zg-mist)]/50 text-xs">
						Order:{" "}
						{approvalGroupIds.map((id, i) => `${i + 1}. ${groupName(id)}`).join(" → ")}
					</p>
				)}
			</div>

			{error && (
				<p className="text-red-300 text-sm" role="alert">
					{error}
				</p>
			)}

			<div className="flex flex-wrap gap-3 pt-2">
				<Button
					className="h-10 bg-[var(--zg-accent)] px-6 text-white hover:bg-[var(--zg-steel)]"
					disabled={pending}
					type="submit"
				>
					{pending
						? "Saving..."
						: mode === "create"
							? "Create draft"
							: "Save changes"}
				</Button>
				<Button
					className="h-10 border-white/15 bg-transparent text-[var(--zg-mist)] hover:bg-white/5 hover:text-white"
					disabled={pending}
					onClick={() => router.back()}
					type="button"
					variant="outline"
				>
					Cancel
				</Button>
			</div>
		</form>
	);
}
