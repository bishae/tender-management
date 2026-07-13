import "~/styles/globals.css";

import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import { TooltipProvider } from "~/components/ui/tooltip";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
	title: "Smart Tender Management | Zero Gravity",
	description:
		"AI-powered dual-scenario procurement for Zero Gravity — create tenders, bid securely, and evaluate with intelligent automation.",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const outfit = Outfit({
	subsets: ["latin"],
	variable: "--font-outfit",
});

const syne = Syne({
	subsets: ["latin"],
	variable: "--font-syne",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html className={`${outfit.variable} ${syne.variable}`} lang="en">
			<body>
				<TooltipProvider>
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</TooltipProvider>
			</body>
		</html>
	);
}
