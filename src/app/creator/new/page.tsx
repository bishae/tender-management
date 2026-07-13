import { TenderForm } from "~/app/_components/tender-form";

export default function NewTenderPage() {
	return (
		<div>
			<h1 className="font-display text-3xl text-white tracking-tight">
				New tender
			</h1>
			<p className="mt-2 mb-10 text-[var(--zg-mist)]/55 text-sm">
				Configure requirements, timelines, and evaluation rules as a draft.
			</p>
			<TenderForm mode="create" />
		</div>
	);
}
