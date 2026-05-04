"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProjectRecord } from "@/components/projects/project-types";

type FormValues = {
  businessName: string;
  website: string;
  googleBusinessProfileName: string;
  address: string;
  city: string;
  state: string;
  latitude: string;
  longitude: string;
};

type FormErrors = Partial<Record<keyof FormValues | "form", string>>;

const blankValues: FormValues = {
  businessName: "",
  website: "",
  googleBusinessProfileName: "",
  address: "",
  city: "",
  state: "",
  latitude: "",
  longitude: "",
};

export function ProjectForm({ project }: { project?: ProjectRecord }) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(() =>
    project
      ? {
          businessName: project.businessName,
          website: project.website ?? "",
          googleBusinessProfileName: project.googleBusinessProfileName ?? "",
          address: project.address ?? "",
          city: project.city ?? "",
          state: project.state ?? "",
          latitude: String(project.latitude),
          longitude: String(project.longitude),
        }
      : blankValues,
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(project);

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    const response = await fetch(isEditing ? `/api/projects/${project!.id}` : "/api/projects", {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName: values.businessName,
        website: values.website,
        googleBusinessProfileName: values.googleBusinessProfileName,
        address: values.address,
        city: values.city,
        state: values.state,
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setErrors({ form: data.error ?? "Unable to save project." });
      setIsSubmitting(false);
      return;
    }

    router.push(`/projects/${data.project.id}`);
    router.refresh();
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="glass-card glass-hover h-fit p-6"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Building2 className="h-5 w-5" />
        </div>
        <h1 className="mt-6 text-4xl md:text-5xl">
          {isEditing ? "Edit Project" : "Create Project"}
        </h1>
        <p className="mt-4">
          Save the business profile details used for local rank tracking and heatmap scans.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-white/10 bg-white/[0.03]">
            <CardTitle>Business Profile</CardTitle>
            <CardDescription>
              Stored in Postgres through the Projects API.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-5 md:grid-cols-2">
                <Field id="businessName" label="Business Name" value={values.businessName} error={errors.businessName} onChange={updateField} placeholder="Northstar Dental Studio" />
                <Field id="website" label="Website" value={values.website} error={errors.website} onChange={updateField} placeholder="https://example.com" />
                <Field id="googleBusinessProfileName" label="Google Business Profile Name" value={values.googleBusinessProfileName} onChange={updateField} placeholder="Northstar Dental Studio Las Vegas" />
                <Field id="address" label="Address" value={values.address} onChange={updateField} placeholder="3200 Las Vegas Blvd S" />
                <Field id="city" label="City" value={values.city} onChange={updateField} placeholder="Las Vegas" />
                <Field id="state" label="State" value={values.state} onChange={updateField} placeholder="NV" maxLength={2} />
                <Field id="latitude" label="Latitude" value={values.latitude} error={errors.latitude} onChange={updateField} placeholder="36.1699" />
                <Field id="longitude" label="Longitude" value={values.longitude} error={errors.longitude} onChange={updateField} placeholder="-115.1398" />
              </div>

              {errors.form ? <p className="text-sm text-red-300">{errors.form}</p> : null}

              <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Latitude and longitude anchor scans to a real map center.
                </p>
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isEditing ? <Save className="mr-2 h-4 w-4" /> : null}
                  {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Project"}
                  {!isEditing ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  error,
  onChange,
  placeholder,
  maxLength,
}: {
  id: keyof FormValues;
  label: string;
  value: string;
  error?: string;
  onChange: (field: keyof FormValues, value: string) => void;
  placeholder: string;
  maxLength?: number;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(id, event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={error ? "border-destructive focus-visible:ring-destructive" : ""}
      />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}

function validate(values: FormValues) {
  const errors: FormErrors = {};
  const latitude = Number(values.latitude);
  const longitude = Number(values.longitude);

  if (!values.businessName.trim()) {
    errors.businessName = "Business name is required.";
  }

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    errors.latitude = "Latitude must be between -90 and 90.";
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    errors.longitude = "Longitude must be between -180 and 180.";
  }

  return errors;
}
