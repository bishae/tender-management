"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ORG_TYPE_LABELS, type OrgType } from "~/lib/org";
import { api } from "~/trpc/react";

const fieldClass =
	"h-10 border-white/15 bg-white/5 text-white placeholder:text-[var(--zg-mist)]/40 focus-visible:border-[var(--zg-accent)] focus-visible:ring-[var(--zg-accent)]/30 dark:bg-white/5";

export function AdminOrgDetail() {
	const params = useParams<{ id: string }>();
	const orgId = Number(params.id);
	const utils = api.useUtils();
	const { data: org, isLoading } = api.admin.getOrganization.useQuery(
		{ id: orgId },
		{ enabled: Number.isFinite(orgId) },
	);
	const { data: unassigned } = api.admin.listUsers.useQuery({
		unassignedOnly: true,
	});

	const [domain, setDomain] = useState("");
	const [groupName, setGroupName] = useState("");
	const [attachUserId, setAttachUserId] = useState("");
	const [error, setError] = useState<string | null>(null);

	const invalidate = async () => {
		await utils.admin.getOrganization.invalidate({ id: orgId });
		await utils.admin.listOrganizations.invalidate();
		await utils.admin.listUsers.invalidate();
	};

	const addDomain = api.admin.addDomain.useMutation({
		onSuccess: async () => {
			setDomain("");
			await invalidate();
		},
		onError: (e) => setError(e.message),
	});
	const removeDomain = api.admin.removeDomain.useMutation({
		onSuccess: invalidate,
		onError: (e) => setError(e.message),
	});
	const createGroup = api.admin.createGroup.useMutation({
		onSuccess: async () => {
			setGroupName("");
			await invalidate();
		},
		onError: (e) => setError(e.message),
	});
	const deleteGroup = api.admin.deleteGroup.useMutation({
		onSuccess: invalidate,
		onError: (e) => setError(e.message),
	});
	const attachUser = api.admin.attachUser.useMutation({
		onSuccess: async () => {
			setAttachUserId("");
			await invalidate();
		},
		onError: (e) => setError(e.message),
	});
	const detachUser = api.admin.detachUser.useMutation({
		onSuccess: invalidate,
		onError: (e) => setError(e.message),
	});
	const addGroupMember = api.admin.addGroupMember.useMutation({
		onSuccess: invalidate,
		onError: (e) => setError(e.message),
	});
	const removeGroupMember = api.admin.removeGroupMember.useMutation({
		onSuccess: invalidate,
		onError: (e) => setError(e.message),
	});

	if (!Number.isFinite(orgId)) {
		return <p className="text-red-300">Invalid organization</p>;
	}
	if (isLoading) {
		return <p className="text-[var(--zg-mist)]/50 text-sm">Loading…</p>;
	}
	if (!org) {
		return <p className="text-[var(--zg-mist)]/60">Organization not found.</p>;
	}

	return (
		<div className="space-y-12">
			<div>
				<p className="text-[var(--zg-steel)] text-xs uppercase tracking-[0.14em]">
					{ORG_TYPE_LABELS[org.type as OrgType]}
				</p>
				<h1 className="mt-2 font-display text-3xl text-white tracking-tight">
					{org.name}
				</h1>
			</div>

			{error && (
				<p className="text-red-300 text-sm" role="alert">
					{error}
				</p>
			)}

			<section>
				<h2 className="font-display text-xl text-white">Domains</h2>
				<p className="mt-1 text-[var(--zg-mist)]/50 text-sm">
					Signup emails matching these domains auto-join this organization.
				</p>
				<form
					className="mt-4 flex flex-wrap gap-3"
					onSubmit={(e) => {
						e.preventDefault();
						setError(null);
						addDomain.mutate({ organizationId: orgId, domain });
					}}
				>
					<Input
						className={`max-w-xs ${fieldClass}`}
						onChange={(e) => setDomain(e.target.value)}
						placeholder="company.com"
						required
						value={domain}
					/>
					<Button
						className="h-10 bg-[var(--zg-accent)] text-white hover:bg-[var(--zg-steel)]"
						disabled={addDomain.isPending}
						type="submit"
					>
						Add domain
					</Button>
				</form>
				<ul className="mt-4 divide-y divide-white/10 border-white/10 border-t">
					{org.domains.map((d) => (
						<li
							className="flex items-center justify-between gap-3 py-3"
							key={d.id}
						>
							<span className="text-[var(--zg-mist)]/80">{d.domain}</span>
							<button
								className="text-red-300/80 text-sm hover:text-red-200"
								onClick={() => {
									setError(null);
									removeDomain.mutate({ id: d.id });
								}}
								type="button"
							>
								Remove
							</button>
						</li>
					))}
				</ul>
			</section>

			<section>
				<h2 className="font-display text-xl text-white">Groups</h2>
				<p className="mt-1 text-[var(--zg-mist)]/50 text-sm">
					Approval units used in ordered tender approval chains.
				</p>
				<form
					className="mt-4 flex flex-wrap gap-3"
					onSubmit={(e) => {
						e.preventDefault();
						setError(null);
						createGroup.mutate({ organizationId: orgId, name: groupName });
					}}
				>
					<Input
						className={`max-w-xs ${fieldClass}`}
						onChange={(e) => setGroupName(e.target.value)}
						placeholder="Finance"
						required
						value={groupName}
					/>
					<Button
						className="h-10 bg-[var(--zg-accent)] text-white hover:bg-[var(--zg-steel)]"
						disabled={createGroup.isPending}
						type="submit"
					>
						Add group
					</Button>
				</form>
				<ul className="mt-6 space-y-6">
					{org.groups.map((group) => (
						<li className="border-white/10 border-t pt-4" key={group.id}>
							<div className="flex items-center justify-between gap-3">
								<p className="font-display text-white">{group.name}</p>
								<button
									className="text-red-300/80 text-sm hover:text-red-200"
									onClick={() => {
										setError(null);
										deleteGroup.mutate({ id: group.id });
									}}
									type="button"
								>
									Delete
								</button>
							</div>
							<ul className="mt-3 space-y-2">
								{group.members.map((m) => (
									<li
										className="flex items-center justify-between text-sm"
										key={m.userId}
									>
										<span className="text-[var(--zg-mist)]/75">
											{m.user.name} · {m.user.email}
										</span>
										<button
											className="text-[var(--zg-mist)]/50 hover:text-white"
											onClick={() =>
												removeGroupMember.mutate({
													groupId: group.id,
													userId: m.userId,
												})
											}
											type="button"
										>
											Remove
										</button>
									</li>
								))}
							</ul>
							{org.members.length > 0 && (
								<select
									className={`mt-3 ${fieldClass} rounded-lg px-3 outline-none`}
									defaultValue=""
									onChange={(e) => {
										const userId = e.target.value;
										if (!userId) return;
										setError(null);
										addGroupMember.mutate({ groupId: group.id, userId });
										e.target.value = "";
									}}
								>
									<option className="bg-[var(--zg-void)]" value="">
										Add member to group…
									</option>
									{org.members.map((m) => (
										<option
											className="bg-[var(--zg-void)]"
											key={m.userId}
											value={m.userId}
										>
											{m.user.name} ({m.user.email})
										</option>
									))}
								</select>
							)}
						</li>
					))}
				</ul>
			</section>

			<section>
				<h2 className="font-display text-xl text-white">Members</h2>
				<form
					className="mt-4 flex flex-wrap gap-3"
					onSubmit={(e) => {
						e.preventDefault();
						if (!attachUserId) return;
						setError(null);
						attachUser.mutate({
							organizationId: orgId,
							userId: attachUserId,
						});
					}}
				>
					<select
						className={`${fieldClass} min-w-[240px] rounded-lg px-3 outline-none`}
						onChange={(e) => setAttachUserId(e.target.value)}
						value={attachUserId}
					>
						<option className="bg-[var(--zg-void)]" value="">
							Attach unassigned user…
						</option>
						{(unassigned ?? []).map((u) => (
							<option className="bg-[var(--zg-void)]" key={u.id} value={u.id}>
								{u.name} ({u.email})
							</option>
						))}
					</select>
					<Button
						className="h-10 bg-[var(--zg-accent)] text-white hover:bg-[var(--zg-steel)]"
						disabled={!attachUserId || attachUser.isPending}
						type="submit"
					>
						Attach
					</Button>
				</form>
				<ul className="mt-4 divide-y divide-white/10 border-white/10 border-t">
					{org.members.map((m) => (
						<li
							className="flex items-center justify-between gap-3 py-3"
							key={m.userId}
						>
							<div>
								<p className="text-white text-sm">{m.user.name}</p>
								<p className="text-[var(--zg-mist)]/50 text-xs">
									{m.user.email} · {m.orgRole}
								</p>
							</div>
							<button
								className="text-red-300/80 text-sm hover:text-red-200"
								onClick={() => {
									setError(null);
									detachUser.mutate({
										organizationId: orgId,
										userId: m.userId,
									});
								}}
								type="button"
							>
								Detach
							</button>
						</li>
					))}
				</ul>
			</section>
		</div>
	);
}
