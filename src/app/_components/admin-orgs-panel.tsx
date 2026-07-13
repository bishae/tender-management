"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ORG_TYPE_LABELS, type OrgType } from "~/lib/org";
import { api } from "~/trpc/react";

const fieldClass =
	"h-10 border-white/15 bg-white/5 text-white placeholder:text-[var(--zg-mist)]/40 focus-visible:border-[var(--zg-accent)] focus-visible:ring-[var(--zg-accent)]/30 dark:bg-white/5";

export function AdminOrgsPanel() {
	const utils = api.useUtils();
	const { data: orgs, isLoading } = api.admin.listOrganizations.useQuery();
	const [name, setName] = useState("");
	const [type, setType] = useState<OrgType>("buyer");
	const [error, setError] = useState<string | null>(null);

	const createOrg = api.admin.createOrganization.useMutation({
		onSuccess: async () => {
			setName("");
			setError(null);
			await utils.admin.listOrganizations.invalidate();
		},
		onError: (err) => setError(err.message),
	});

	return (
		<div>
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-display text-3xl text-white tracking-tight">
						Organizations
					</h1>
					<p className="mt-2 text-[var(--zg-mist)]/55 text-sm">
						Buyers create tenders; Vendors discover and bid. Domains auto-join
						users on signup.
					</p>
				</div>
			</div>

			<form
				className="mt-8 flex flex-wrap items-end gap-3 border-white/10 border-b pb-8"
				onSubmit={(e) => {
					e.preventDefault();
					createOrg.mutate({ name: name.trim(), type });
				}}
			>
				<div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
					<span className="text-[var(--zg-mist)]/55 text-xs uppercase tracking-[0.14em]">
						Name
					</span>
					<Input
						className={fieldClass}
						onChange={(e) => setName(e.target.value)}
						required
						value={name}
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<span className="text-[var(--zg-mist)]/55 text-xs uppercase tracking-[0.14em]">
						Type
					</span>
					<select
						className={`${fieldClass} rounded-lg px-3 outline-none`}
						onChange={(e) => setType(e.target.value as OrgType)}
						value={type}
					>
						<option className="bg-[var(--zg-void)]" value="buyer">
							Buyer
						</option>
						<option className="bg-[var(--zg-void)]" value="vendor">
							Vendor
						</option>
					</select>
				</div>
				<Button
					className="h-10 bg-[var(--zg-accent)] text-white hover:bg-[var(--zg-steel)]"
					disabled={createOrg.isPending}
					type="submit"
				>
					Create
				</Button>
			</form>
			{error && (
				<p className="mt-3 text-red-300 text-sm" role="alert">
					{error}
				</p>
			)}

			{isLoading ? (
				<p className="mt-10 text-[var(--zg-mist)]/50 text-sm">Loading…</p>
			) : !orgs?.length ? (
				<p className="mt-10 text-[var(--zg-mist)]/60">No organizations yet.</p>
			) : (
				<ul className="mt-8 divide-y divide-white/10">
					{orgs.map((org) => (
						<li key={org.id}>
							<Link
								className="flex flex-col gap-1 py-5 transition hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between"
								href={`/admin/orgs/${org.id}`}
							>
								<div>
									<p className="font-display text-lg text-white">{org.name}</p>
									<p className="text-[var(--zg-mist)]/50 text-sm">
										{ORG_TYPE_LABELS[org.type as OrgType]} ·{" "}
										{org.domains.length} domain
										{org.domains.length === 1 ? "" : "s"} · {org.groups.length}{" "}
										group{org.groups.length === 1 ? "" : "s"}
									</p>
								</div>
								<span className="text-[var(--zg-mist)]/45 text-xs">
									Manage →
								</span>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
