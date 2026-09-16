"use client";

import Link from "next/link";
import { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { useAuth } from "@/hooks/use-auth";

function rolePath(role: string) {
  return `/${role.toLowerCase()}`;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      router.replace(rolePath(user.role));
    } catch (requestError) {
      const message = requestError instanceof AxiosError ? requestError.response?.data?.message : undefined;
      const backendUnavailable = requestError instanceof AxiosError && !requestError.response;
      setError(message || (backendUnavailable ? "Unable to reach the NeuroX backend. Start the backend service on port 5000 and try again." : "Unable to sign in. Check your details and try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="SIGN IN" intro="Access your NeuroX workspace and continue building what matters." footer={<p className="body-copy">New to NeuroX? <Link href="/register" className="font-bold text-foreground underline underline-offset-4">Create an account</Link></p>}>
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <label className="block"><span className="eyebrow">Email</span><input className="auth-input mt-2" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
        <label className="block"><span className="eyebrow">Password</span><span className="relative mt-2 block"><input className="auth-input pr-12" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /><button type="button" className="password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button type="submit" className="button-primary w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
      </form>
    </AuthShell>
  );
}
