import { SettingsAuthPanel } from "~/app/_components/settings-auth-panel";

export default function SettingsPage() {
	return (
		<div>
			<h1 className="font-display text-3xl text-white tracking-tight">
				Settings
			</h1>
			<p className="mt-2 text-[var(--zg-mist)]/55 text-sm">
				Manage how you sign in to the portal.
			</p>

			<section className="mt-10">
				<h2 className="font-display text-xl text-white tracking-tight">
					Authentication
				</h2>
				<p className="mt-1 text-[var(--zg-mist)]/50 text-sm">
					Link Microsoft Entra ID to your account or review existing sign-in
					methods.
				</p>
				<div className="mt-6">
					<SettingsAuthPanel />
				</div>
			</section>
		</div>
	);
}
