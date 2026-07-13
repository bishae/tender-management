import { cn } from "~/lib/utils";
import type { TenderStatus } from "~/lib/org";

const STATUS_STYLES: Record<TenderStatus, string> = {
	draft: "border-white/20 bg-white/5 text-[var(--zg-mist)]/80",
	pending_approval:
		"border-amber-400/30 bg-amber-400/10 text-amber-100/90",
	published:
		"border-[var(--zg-steel)]/40 bg-[var(--zg-steel)]/15 text-[var(--zg-mist)]",
	closed: "border-white/10 bg-white/[0.03] text-[var(--zg-mist)]/45",
	rejected: "border-red-400/30 bg-red-400/10 text-red-200/90",
};

export function TenderStatusBadge({ status }: { status: string }) {
	const key =
		(status as TenderStatus) in STATUS_STYLES
			? (status as TenderStatus)
			: "draft";

	return (
		<span
			className={cn(
				"inline-flex items-center rounded border px-2 py-0.5 text-xs uppercase tracking-[0.12em]",
				STATUS_STYLES[key],
			)}
		>
			{status.replaceAll("_", " ")}
		</span>
	);
}
