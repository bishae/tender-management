"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { authClient } from "~/server/better-auth/client";
import { api } from "~/trpc/react";

type Mode = "signin" | "signup";

const fieldClass =
	"h-10 border-white/15 bg-white/5 text-white placeholder:text-[var(--zg-mist)]/40 focus-visible:border-[var(--zg-accent)] focus-visible:ring-[var(--zg-accent)]/30 dark:bg-white/5";

export function AuthForm() {
	const router = useRouter();
	const utils = api.useUtils();
	const [mode, setMode] = useState<Mode>("signin");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);
	const [microsoftPending, setMicrosoftPending] = useState(false);

	async function routeAfterAuth() {
		const path = await utils.org.dashboardPath.fetch();
		router.push(path);
		router.refresh();
	}

	async function handleMicrosoftSignIn() {
		setError(null);
		setMicrosoftPending(true);
		try {
			const { error: microsoftError } = await authClient.signIn.social({
				provider: "microsoft",
				callbackURL: "/login",
				errorCallbackURL: "/login",
			});
			if (microsoftError) {
				setError(microsoftError.message ?? "Microsoft sign in failed");
				setMicrosoftPending(false);
			}
		} catch {
			setError("Microsoft sign in failed");
			setMicrosoftPending(false);
		}
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setPending(true);

		try {
			if (mode === "signup") {
				const { error: signUpError } = await authClient.signUp.email({
					name,
					email,
					password,
				});
				if (signUpError) {
					setError(signUpError.message ?? "Sign up failed");
					return;
				}
				await routeAfterAuth();
				return;
			}

			const { error: signInError } = await authClient.signIn.email({
				email,
				password,
			});
			if (signInError) {
				setError(signInError.message ?? "Sign in failed");
				return;
			}
			await routeAfterAuth();
		} finally {
			setPending(false);
		}
	}

	const busy = pending || microsoftPending;

	return (
		<div className="w-full">
			<Button
				className="h-10 w-full border-white/15 bg-white/5 text-white hover:bg-white/10"
				disabled={busy}
				onClick={handleMicrosoftSignIn}
				type="button"
				variant="outline"
			>
				{microsoftPending ? "Redirecting..." : "Sign in with Microsoft"}
			</Button>

			<div className="my-5 flex items-center gap-3">
				<div className="h-px flex-1 bg-white/10" />
				<span className="text-[var(--zg-mist)]/40 text-xs uppercase tracking-wider">
					or
				</span>
				<div className="h-px flex-1 bg-white/10" />
			</div>

			<form className="flex flex-col gap-3" onSubmit={handleSubmit}>
				{mode === "signup" && (
					<Input
						className={fieldClass}
						onChange={(e) => setName(e.target.value)}
						placeholder="Name"
						required
						type="text"
						value={name}
					/>
				)}
				<Input
					autoComplete="email"
					className={fieldClass}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Email"
					required
					type="email"
					value={email}
				/>
				<Input
					autoComplete={mode === "signup" ? "new-password" : "current-password"}
					className={fieldClass}
					minLength={8}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Password"
					required
					type="password"
					value={password}
				/>
				{error && (
					<p className="text-center text-red-300 text-sm" role="alert">
						{error}
					</p>
				)}
				<Button
					className="mt-1 h-10 w-full bg-[var(--zg-accent)] text-white hover:bg-[var(--zg-steel)]"
					disabled={busy}
					type="submit"
				>
					{pending
						? "Please wait..."
						: mode === "signin"
							? "Sign in"
							: "Sign up"}
				</Button>
			</form>
			<p className="mt-4 text-center text-[var(--zg-mist)]/60 text-sm">
				{mode === "signin" ? (
					<>
						Don&apos;t have an account?{" "}
						<button
							className="text-white underline-offset-4 transition hover:underline"
							onClick={() => {
								setMode("signup");
								setError(null);
							}}
							type="button"
						>
							Sign up
						</button>
					</>
				) : (
					<>
						Already have an account?{" "}
						<button
							className="text-white underline-offset-4 transition hover:underline"
							onClick={() => {
								setMode("signin");
								setError(null);
							}}
							type="button"
						>
							Sign in
						</button>
					</>
				)}
			</p>
		</div>
	);
}
