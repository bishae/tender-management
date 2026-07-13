"use client";

import Link from "next/link";

import { api } from "~/trpc/react";

export function AdminUsersPanel() {
	const { data: users, isLoading } = api.admin.listUsers.useQuery();
	const { data: orgs } = api.admin.listOrganizations.useQuery();

	return (
		<div>
			<h1 className="font-display text-3xl text-white tracking-tight">Users</h1>
			<p className="mt-2 text-[var(--zg-mist)]/55 text-sm">
				Unassigned users wait on /pending until attached to an organization.
			</p>

			{isLoading ? (
				<p className="mt-10 text-[var(--zg-mist)]/50 text-sm">Loading…</p>
			) : (
				<ul className="mt-10 divide-y divide-white/10 border-white/10 border-t">
					{(users ?? []).map((u) => {
						const memberships =
							"memberships" in u
								? (
										u as {
											memberships?: {
												organization: { id: number; name: string; type: string };
											}[];
										}
									).memberships
								: undefined;
						const org = memberships?.[0]?.organization;
						return (
							<li
								className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
								key={u.id}
							>
								<div>
									<p className="text-white">{u.name}</p>
									<p className="text-[var(--zg-mist)]/50 text-sm">{u.email}</p>
								</div>
								<div className="text-sm">
									{org ? (
										<Link
											className="text-[var(--zg-mist)]/80 underline-offset-4 hover:underline"
											href={`/admin/orgs/${org.id}`}
										>
											{org.name} ({org.type})
										</Link>
									) : (
										<span className="text-amber-200/80">Unassigned</span>
									)}
									{u.isPlatformAdmin && (
										<span className="ml-3 text-[var(--zg-steel)] text-xs uppercase tracking-[0.12em]">
											Admin
										</span>
									)}
								</div>
							</li>
						);
					})}
				</ul>
			)}

			{orgs && orgs.length === 0 && (
				<p className="mt-6 text-[var(--zg-mist)]/50 text-sm">
					Create an organization first, then attach users from the org detail
					page.
				</p>
			)}
		</div>
	);
}
