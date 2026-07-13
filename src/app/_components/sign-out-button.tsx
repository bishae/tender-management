"use client";

import { useRouter } from "next/navigation";

import { Button } from "~/components/ui/button";
import { authClient } from "~/server/better-auth/client";

export function SignOutButton() {
	const router = useRouter();

	return (
		<Button
			className="h-9 border-white/15 bg-transparent text-[var(--zg-mist)]/80 text-sm hover:bg-white/5 hover:text-white"
			onClick={async () => {
				await authClient.signOut();
				router.push("/login");
				router.refresh();
			}}
			type="button"
			variant="outline"
		>
			Sign out
		</Button>
	);
}
