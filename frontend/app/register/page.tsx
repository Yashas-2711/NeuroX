"use client";

import Link from "next/link";
import { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { useAuth } from "@/hooks/use-auth";
import type { PublicUserRole } from "@/types/auth";

function rolePath(role: string) {
  return `/${role.toLowerCase()}`;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<PublicUserRole>("CITIZEN");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("Enter your full name.");
    if (!email || !password) return setError("Complete all required fields.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const user = await register({ name, email, password, role });
      router.replace(rolePath(user.role));
    } catch (requestError) {
      const message = requestError instanceof AxiosError ? requestError.response?.data?.message : undefined;
      const backendUnavailable = requestError instanceof AxiosError && !requestError.response;
      setError(message || (backendUnavailable ? "Unable to reach the NeuroX backend. Start the backend service on port 5000 and try again." : "Unable to create your account. Try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="CREATE ACCOUNT" intro="Choose your role in the NeuroX network. Admin accounts are provisioned separately." footer={<p className="body-copy">Already registered? <Link href="/login" className="font-bold text-foreground underline underline-offset-4">Sign in</Link></p>}>
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <label className="block"><span className="eyebrow">Name</span><input className="auth-input mt-2" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>
        <label className="block"><span className="eyebrow">Email</span><input className="auth-input mt-2" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block"><span className="eyebrow">Password</span><span className="relative mt-2 block"><input className="auth-input pr-12" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /><button type="button" className="password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
          <label className="block"><span className="eyebrow">Confirm password</span><input className="auth-input mt-2" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat your password" /></label>
        </div>
        <label className="block"><span className="eyebrow">I am joining as</span><select className="auth-input mt-2" value={role} onChange={(event) => setRole(event.target.value as PublicUserRole)}><option value="CITIZEN">Citizen</option><option value="UNIVERSITY">University</option><option value="INDUSTRY">Industry</option></select></label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button type="submit" className="button-primary w-full" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
      </form>
    </AuthShell>
  );
}
