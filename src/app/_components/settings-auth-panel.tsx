"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { authClient } from "~/server/better-auth/client";

type AccountRow = {
	id: string;
	providerId: string;
	accountId: string;
};

export function SettingsAuthPanel() {
	const [accounts, setAccounts] = useState<AccountRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [pending, setPending] = useState<"link" | "unlink" | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const refreshAccounts = useCallback(async () => {
		setError(null);
		const { data, error: listError } = await authClient.listAccounts();
		if (listError) {
			setError(listError.message ?? "Failed to load linked accounts");
			setAccounts([]);
			return;
		}
		setAccounts((data ?? []) as AccountRow[]);
	}, []);

	useEffect(() => {
		void (async () => {
			setLoading(true);
			await refreshAccounts();
			setLoading(false);
		})();
	}, [refreshAccounts]);

	const hasCredential = accounts.some((a) => a.providerId === "credential");
	const hasMicrosoft = accounts.some((a) => a.providerId === "microsoft");
	const canUnlinkMicrosoft = hasMicrosoft && accounts.length > 1;

	async function handleLinkMicrosoft() {
		setError(null);
		setSuccess(null);
		setPending("link");
		try {
			const { error: linkError } = await authClient.linkSocial({
				provider: "microsoft",
				callbackURL: "/settings",
			});
			if (linkError) {
				setError(linkError.message ?? "Failed to start Microsoft linking");
				setPending(null);
			}
		} catch {
			setError("Failed to start Microsoft linking");
			setPending(null);
		}
	}

	async function handleUnlinkMicrosoft() {
		setError(null);
		setSuccess(null);
		setPending("unlink");
		try {
			const { error: unlinkError } = await authClient.unlinkAccount({
				providerId: "microsoft",
			});
			if (unlinkError) {
				setError(unlinkError.message ?? "Failed to unlink Microsoft");
				return;
			}
			setSuccess("Microsoft account unlinked.");
			await refreshAccounts();
		} catch {
			setError("Failed to unlink Microsoft");
		} finally {
			setPending(null);
		}
	}

	if (loading) {
		return <p className="text-[var(--zg-mist)]/50 text-sm">Loading…</p>;
	}

	return (
		<div>
			<ul className="divide-y divide-white/10 border-white/10 border-t border-b">
				<li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-white">Email &amp; password</p>
						<p className="text-[var(--zg-mist)]/50 text-sm">
							{hasCredential ? "Linked" : "Not set up for this account"}
						</p>
					</div>
					<span className="text-[var(--zg-mist)]/40 text-xs uppercase tracking-[0.12em]">
						{hasCredential ? "Active" : "Unavailable"}
					</span>
				</li>

				<li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-white">Microsoft</p>
						<p className="text-[var(--zg-mist)]/50 text-sm">
							{hasMicrosoft
								? "Linked — sign in with Microsoft Entra ID"
								: "Not linked"}
						</p>
					</div>
					{hasMicrosoft ? (
						<Button
							className="h-9 border-white/15 bg-white/5 text-white hover:bg-white/10"
							disabled={pending !== null || !canUnlinkMicrosoft}
							onClick={handleUnlinkMicrosoft}
							title={
								canUnlinkMicrosoft
									? undefined
									: "Keep at least one sign-in method"
							}
							type="button"
							variant="outline"
						>
							{pending === "unlink" ? "Unlinking…" : "Unlink"}
						</Button>
					) : (
						<Button
							className="h-9 border-white/15 bg-white/5 text-white hover:bg-white/10"
							disabled={pending !== null}
							onClick={handleLinkMicrosoft}
							type="button"
							variant="outline"
						>
							{pending === "link" ? "Redirecting…" : "Link Microsoft"}
						</Button>
					)}
				</li>
			</ul>

			{error && (
				<p className="mt-4 text-red-300 text-sm" role="alert">
					{error}
				</p>
			)}
			{success && (
				<p className="mt-4 text-[var(--zg-mist)]/80 text-sm" role="status">
					{success}
				</p>
			)}
		</div>
	);
}
