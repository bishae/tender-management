"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "~/components/ui/button";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "~/components/ui/sidebar";
import { authClient } from "~/server/better-auth/client";

export function SignOutButton({
	variant = "default",
}: {
	variant?: "default" | "sidebar";
}) {
	const router = useRouter();

	const signOut = async () => {
		await authClient.signOut();
		router.push("/login");
		router.refresh();
	};

	if (variant === "sidebar") {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						className="text-[var(--zg-mist)]/80 hover:text-white"
						onClick={signOut}
						tooltip="Sign out"
					>
						<LogOut />
						<span>Sign out</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	return (
		<Button
			className="h-9 border-white/15 bg-transparent text-[var(--zg-mist)]/80 text-sm hover:bg-white/5 hover:text-white"
			onClick={signOut}
			type="button"
			variant="outline"
		>
			Sign out
		</Button>
	);
}
