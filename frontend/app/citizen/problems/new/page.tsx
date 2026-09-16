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
  const [coordinates, setCoordinates] = React.useState<[number, number] | undefined>();
  const [locationMessage, setLocationMessage] = React.useState("");
  const [locating, setLocating] = React.useState(false);
  const {
    register,
    setValue,
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
        location: {
          city: v.city,
          state: v.state,
          country: v.country,
          ...(coordinates ? { type: "Point" as const, coordinates } : {}),
        },
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
  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("This browser does not support device location.");
      return;
    }
    setLocating(true);
    setLocationMessage("Requesting your device location…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextCoordinates: [number, number] = [coords.longitude, coords.latitude];
        setCoordinates(nextCoordinates);
        setLocationMessage("Location captured. Finding your city, state, and country…");
        void fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${coords.latitude}&lon=${coords.longitude}`,
          { headers: { Accept: "application/json" } },
        )
          .then(async (response) => {
            if (!response.ok) throw new Error("Geocoding failed");
            return (await response.json()) as { address?: { city?: string; town?: string; village?: string; municipality?: string; state?: string; country?: string } };
          })
          .then((result) => {
            const address = result.address;
            const city = address?.city ?? address?.town ?? address?.village ?? address?.municipality;
            if (city) setValue("city", city, { shouldValidate: true });
            if (address?.state) setValue("state", address.state, { shouldValidate: true });
            if (address?.country) setValue("country", address.country, { shouldValidate: true });
            setLocationMessage(city && address?.state && address?.country ? "Location filled from your device. Please review it before submitting." : "Location captured. Please complete any missing location fields.");
          })
          .catch(() => setLocationMessage("Location captured, but the address could not be resolved. Please enter the city, state, and country manually."))
          .finally(() => setLocating(false));
      },
      () => {
        setLocationMessage("Location permission was unavailable. Enter the location manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
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
        <div className="md:col-span-2 border border-white/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="form-label">Device location</p>
              <p className="mt-2 text-sm text-white/50">
                Use permission-based GPS to attach coordinates to this
                submission.
              </p>
            </div>
            <button
              type="button"
              className="button-secondary"
              onClick={useCurrentLocation}
              disabled={locating}
            >
              {locating
                ? "Locating…"
                : coordinates
                  ? "Refresh location"
                  : "Use current location"}
            </button>
          </div>
          {locationMessage && (
            <p className="mt-3 text-xs text-white/60" role="status">
              {locationMessage}
            </p>
          )}
        </div>
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
