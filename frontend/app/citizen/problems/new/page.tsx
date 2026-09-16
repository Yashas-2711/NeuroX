"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { createProblem } from "@/services/problem.service";
import { PROBLEM_CATEGORIES, PROBLEM_PRIORITIES } from "@/types/problem";
const schema = z.object({
  title: z.string().trim().min(5).max(200),
  description: z.string().trim().min(20).max(10000),
  category: z.enum(PROBLEM_CATEGORIES),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  country: z.string().trim().min(2),
  evidenceDescription: z.string().max(2000),
  evidenceReference: z
    .string()
    .refine((x) => !x || x.startsWith("http"), "Use an http(s) URL"),
  priority: z.enum(PROBLEM_PRIORITIES),
});
type Form = z.infer<typeof schema>;
function Content() {
  const router = useRouter();
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "Education",
      priority: "MEDIUM",
      evidenceDescription: "",
      evidenceReference: "",
    },
  });
  async function submit(v: Form) {
    try {
      setError("");
      await createProblem({
        title: v.title,
        description: v.description,
        category: v.category,
        location: { city: v.city, state: v.state, country: v.country },
        priority: v.priority,
        ...(v.evidenceDescription || v.evidenceReference
          ? {
              evidence: {
                description: v.evidenceDescription || undefined,
                reference: v.evidenceReference || undefined,
              },
            }
          : {}),
      });
      setSuccess(true);
      setTimeout(() => router.replace("/citizen/problems"), 600);
    } catch (e) {
      setError(
        axios.isAxiosError(e)
          ? (e.response?.data?.message ?? "Unable to submit this problem.")
          : "Unable to submit this problem.",
      );
    }
  }
  return (
    <main className="mx-auto max-w-5xl px-5 py-16">
      <Link href="/citizen" className="text-link">
        ← Citizen space
      </Link>
      <p className="eyebrow mt-10">Citizen contribution / 01</p>
      <h1 className="display-md mt-3">Submit a problem</h1>
      <p className="body-lead mt-5">
        Describe a real challenge in your community.
      </p>
      {success && (
        <p className="mt-8 text-emerald-200" role="status">
          Problem submitted successfully. Opening your list…
        </p>
      )}
      {error && (
        <p className="auth-error mt-8" role="alert">
          {error}
        </p>
      )}
      <form
        onSubmit={handleSubmit(submit)}
        className="mt-10 grid gap-6 md:grid-cols-2"
      >
        <Field
          label="Problem title"
          name="title"
          register={register}
          error={errors.title?.message}
          placeholder="What challenge needs attention?"
        />
        <div className="md:col-span-2">
          <label className="form-label">Description</label>
          <textarea
            {...register("description")}
            className="auth-input mt-2 min-h-36"
          />
          <p className="text-xs text-red-300">{errors.description?.message}</p>
        </div>
        <Field
          label="City / locality"
          name="city"
          register={register}
          error={errors.city?.message}
        />
        <Field
          label="State"
          name="state"
          register={register}
          error={errors.state?.message}
        />
        <Field
          label="Country"
          name="country"
          register={register}
          error={errors.country?.message}
        />
        <Select
          label="Category"
          name="category"
          values={PROBLEM_CATEGORIES}
          register={register}
        />
        <Select
          label="Priority"
          name="priority"
          values={PROBLEM_PRIORITIES}
          register={register}
        />
        <div>
          <label className="form-label">Evidence description (optional)</label>
          <textarea
            {...register("evidenceDescription")}
            className="auth-input mt-2 min-h-24"
          />
        </div>
        <Field
          label="Reference link (optional)"
          name="evidenceReference"
          register={register}
          error={errors.evidenceReference?.message}
        />
        <button
          className="button-primary md:col-span-2"
          disabled={isSubmitting || success}
        >
          {isSubmitting ? "Submitting…" : "Submit problem"}
        </button>
      </form>
    </main>
  );
}
function Field({
  label,
  name,
  register,
  error,
  placeholder,
}: {
  label: string;
  name: FieldPath<Form>;
  register: UseFormRegister<Form>;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input
        {...register(name)}
        placeholder={placeholder}
        className="auth-input mt-2"
      />
      <p className="text-xs text-red-300">{error}</p>
    </div>
  );
}
function Select({
  label,
  name,
  values,
  register,
}: {
  label: string;
  name: FieldPath<Form>;
  values: readonly string[];
  register: UseFormRegister<Form>;
}) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <select {...register(name)} className="auth-input mt-2">
        {values.map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
    </div>
  );
}
import type { FieldPath, UseFormRegister } from "react-hook-form";
import * as React from "react";
import axios from "axios";
export default function Page() {
  return (
    <ProtectedRoute allowedRole="CITIZEN">
      <Content />
    </ProtectedRoute>
  );
}
