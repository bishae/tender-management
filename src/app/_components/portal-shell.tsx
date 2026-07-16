"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
	ArrowLeft,
	BadgeCheck,
	Building2,
	ClipboardList,
	Compass,
	FilePlus,
	Settings,
	Users,
} from "lucide-react";

import { SignOutButton } from "~/app/_components/sign-out-button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
} from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";

type NavItem = {
	href: string;
	label: string;
};

const NAV_ICONS: Record<string, LucideIcon> = {
	"/creator": ClipboardList,
	"/creator/new": FilePlus,
	"/creator/approvals": BadgeCheck,
	"/bidder": Compass,
	"/settings": Settings,
	"/admin": Building2,
	"/admin/users": Users,
};

function resolveNavIcon(href: string, label: string): LucideIcon {
	if (NAV_ICONS[href]) {
		return NAV_ICONS[href];
	}
	if (label.toLowerCase().includes("back")) {
		return ArrowLeft;
	}
	return ClipboardList;
}

function isNavActive(pathname: string, href: string) {
	return pathname === href;
}

const sidebarTokenStyle = {
	"--sidebar": "#141e2e",
	"--sidebar-foreground": "#c5d4e3",
	"--sidebar-primary": "#3d7ea6",
	"--sidebar-primary-foreground": "#ffffff",
	"--sidebar-accent": "rgb(255 255 255 / 0.1)",
	"--sidebar-accent-foreground": "#ffffff",
	"--sidebar-border": "rgb(255 255 255 / 0.1)",
	"--sidebar-ring": "#3d7ea6",
} as CSSProperties;

export function PortalShell({
	title,
	subtitle,
	nav,
	children,
}: {
	title: string;
	subtitle: string;
	nav: NavItem[];
	children: ReactNode;
}) {
	const pathname = usePathname();

	return (
		<SidebarProvider
			className="zg-surface zg-orbit relative min-h-svh overflow-x-hidden"
			style={sidebarTokenStyle}
		>
			<div
				aria-hidden
				className="zg-grid pointer-events-none absolute inset-0"
			/>

			<Sidebar className="border-white/10" collapsible="icon">
				<SidebarHeader className="gap-1.5 border-white/10 border-b px-3 py-4">
					<Link
						className="font-display text-[var(--zg-mist)]/70 text-xs uppercase tracking-[0.2em] transition hover:text-white group-data-[collapsible=icon]:tracking-[0.12em]"
						href="/"
					>
						<span className="group-data-[collapsible=icon]:hidden">
							Zero Gravity
						</span>
						<span className="hidden group-data-[collapsible=icon]:inline">
							ZG
						</span>
					</Link>
					<p className="font-display text-lg text-white tracking-tight group-data-[collapsible=icon]:hidden">
						{title}
					</p>
				</SidebarHeader>

				<SidebarContent>
					<SidebarGroup className="px-2 py-2">
						<SidebarGroupContent>
							<SidebarMenu className="gap-1">
								{nav.map((item) => {
									const Icon = resolveNavIcon(item.href, item.label);
									return (
										<SidebarMenuItem key={item.href}>
											<SidebarMenuButton
												className="text-[var(--zg-mist)]/85 hover:text-white data-active:bg-white/12 data-active:text-white"
												isActive={isNavActive(pathname, item.href)}
												render={<Link href={item.href} />}
												tooltip={item.label}
											>
												<Icon />
												<span>{item.label}</span>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>

				<SidebarFooter className="gap-3 border-white/10 border-t p-3">
					<p className="px-1 text-[var(--zg-mist)]/50 text-xs group-data-[collapsible=icon]:hidden">
						{subtitle}
					</p>
					<SignOutButton variant="sidebar" />
				</SidebarFooter>
				<SidebarRail />
			</Sidebar>

			<SidebarInset className="relative z-10 bg-transparent">
				<header className="flex h-14 shrink-0 items-center gap-3 border-white/10 border-b px-4 md:px-6">
					<SidebarTrigger className="text-[var(--zg-mist)]/80 hover:bg-white/5 hover:text-white" />
					<Separator
						className="mr-1 data-vertical:h-4"
						orientation="vertical"
					/>
					<p className="font-display text-sm text-white tracking-tight md:hidden">
						{title}
					</p>
					<p className="hidden text-[var(--zg-mist)]/50 text-sm md:block">
						{subtitle}
					</p>
				</header>

				<section className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
					{children}
				</section>
			</SidebarInset>
		</SidebarProvider>
	);
}
