"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "~/server/better-auth/client";

type Mode = "signin" | "signup";

export function AuthForm() {
	const router = useRouter();
	const [mode, setMode] = useState<Mode>("signin");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

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
					callbackURL: "/",
				});
				if (signUpError) {
					setError(signUpError.message ?? "Sign up failed");
					return;
				}
			} else {
				const { error: signInError } = await authClient.signIn.email({
					email,
					password,
					callbackURL: "/",
				});
				if (signInError) {
					setError(signInError.message ?? "Sign in failed");
					return;
				}
			}
			router.refresh();
		} finally {
			setPending(false);
		}
	}

	return (
		<div className="w-full max-w-xs">
			<form className="flex flex-col gap-3" onSubmit={handleSubmit}>
				{mode === "signup" && (
					<input
						className="w-full rounded-full bg-white/10 px-4 py-2 text-white placeholder:text-white/50"
						onChange={(e) => setName(e.target.value)}
						placeholder="Name"
						required
						type="text"
						value={name}
					/>
				)}
				<input
					autoComplete="email"
					className="w-full rounded-full bg-white/10 px-4 py-2 text-white placeholder:text-white/50"
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Email"
					required
					type="email"
					value={email}
				/>
				<input
					autoComplete={mode === "signup" ? "new-password" : "current-password"}
					className="w-full rounded-full bg-white/10 px-4 py-2 text-white placeholder:text-white/50"
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
				<button
					className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20 disabled:opacity-50"
					disabled={pending}
					type="submit"
				>
					{pending
						? "Please wait..."
						: mode === "signin"
							? "Sign in"
							: "Sign up"}
				</button>
			</form>
			<p className="mt-4 text-center text-sm text-white/70">
				{mode === "signin" ? (
					<>
						Don&apos;t have an account?{" "}
						<button
							className="underline transition hover:text-white"
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
							className="underline transition hover:text-white"
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
