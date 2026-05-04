"use client";

import { type FormEvent, type HTMLAttributes, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Building2, MapPinned } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjectStore } from "@/hooks/use-project-store";

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

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  businessName: "",
  website: "",
  googleBusinessProfileName: "",
  address: "",
  city: "",
  state: "",
  latitude: "",
  longitude: "",
};

export function CreateProjectForm() {
  const router = useRouter();
  const addProject = useProjectStore((state) => state.addProject);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasCoordinates = useMemo(
    () => values.latitude.trim() !== "" && values.longitude.trim() !== "",
    [values.latitude, values.longitude],
  );

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateProject(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const project = addProject({
      businessName: values.businessName.trim(),
      website: normalizeWebsite(values.website),
      googleBusinessProfileName: values.googleBusinessProfileName.trim(),
      address: values.address.trim(),
      city: values.city.trim(),
      state: values.state.trim().toUpperCase(),
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
    });

    router.push(`/projects/${project.id}`);
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.38, ease: "easeOut" }}
        className="glass-card glass-hover h-fit p-6"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Building2 className="h-5 w-5" />
        </div>
        <h1 className="mt-6 text-4xl md:text-5xl">Create Project</h1>
        <p className="mt-4">
          Add the core business details needed to start rank tracking and heatmap scans.
        </p>
        <div className="mt-8 rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MapPinned className="h-4 w-4 text-primary" />
            Location precision
          </div>
          <p className="mt-2 text-sm">
            Latitude and longitude are validated before the project is saved locally.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.38, delay: 0.05, ease: "easeOut" }}
      >
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-white/10 bg-white/[0.03]">
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>
            Keep this simple for now. You can connect live GBP data later.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                id="businessName"
                label="Business Name"
                value={values.businessName}
                error={errors.businessName}
                onChange={(value) => updateField("businessName", value)}
                placeholder="Northstar Dental Studio"
              />
              <FormField
                id="website"
                label="Website"
                value={values.website}
                error={errors.website}
                onChange={(value) => updateField("website", value)}
                placeholder="https://example.com"
                inputMode="url"
              />
              <FormField
                id="googleBusinessProfileName"
                label="Google Business Profile Name"
                value={values.googleBusinessProfileName}
                error={errors.googleBusinessProfileName}
                onChange={(value) => updateField("googleBusinessProfileName", value)}
                placeholder="Northstar Dental Studio Austin"
              />
              <FormField
                id="address"
                label="Address"
                value={values.address}
                error={errors.address}
                onChange={(value) => updateField("address", value)}
                placeholder="1200 Market Street"
              />
              <FormField
                id="city"
                label="City"
                value={values.city}
                error={errors.city}
                onChange={(value) => updateField("city", value)}
                placeholder="Austin"
              />
              <FormField
                id="state"
                label="State"
                value={values.state}
                error={errors.state}
                onChange={(value) => updateField("state", value)}
                placeholder="TX"
                maxLength={2}
              />
              <FormField
                id="latitude"
                label="Latitude"
                value={values.latitude}
                error={errors.latitude}
                onChange={(value) => updateField("latitude", value)}
                placeholder="30.2672"
                inputMode="decimal"
              />
              <FormField
                id="longitude"
                label="Longitude"
                value={values.longitude}
                error={errors.longitude}
                onChange={(value) => updateField("longitude", value)}
                placeholder="-97.7431"
                inputMode="decimal"
              />
            </div>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {hasCoordinates
                  ? "Coordinates ready for heatmap setup."
                  : "Enter coordinates to anchor the project location."}
              </p>
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </motion.div>
    </section>
  );
}

function FormField({
  id,
  label,
  value,
  error,
  onChange,
  placeholder,
  inputMode,
  maxLength,
}: {
  id: keyof FormValues;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={error ? "border-destructive focus-visible:ring-destructive" : ""}
      />
      {error ? (
        <motion.p
          id={`${id}-error`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-300"
        >
          {error}
        </motion.p>
      ) : null}
    </div>
  );
}

function validateProject(values: FormValues) {
  const errors: FormErrors = {};
  const latitude = Number(values.latitude);
  const longitude = Number(values.longitude);

  if (!values.businessName.trim()) {
    errors.businessName = "Business name is required.";
  }

  if (!values.website.trim()) {
    errors.website = "Website is required.";
  } else if (!isValidWebsite(values.website)) {
    errors.website = "Enter a valid website URL.";
  }

  if (!values.googleBusinessProfileName.trim()) {
    errors.googleBusinessProfileName = "Google Business Profile name is required.";
  }

  if (!values.address.trim()) {
    errors.address = "Address is required.";
  }

  if (!values.city.trim()) {
    errors.city = "City is required.";
  }

  if (!/^[A-Za-z]{2}$/.test(values.state.trim())) {
    errors.state = "Use a 2-letter state code.";
  }

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    errors.latitude = "Latitude must be between -90 and 90.";
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    errors.longitude = "Longitude must be between -180 and 180.";
  }

  return errors;
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function isValidWebsite(value: string) {
  try {
    const url = new URL(normalizeWebsite(value));

    return Boolean(url.hostname.includes("."));
  } catch {
    return false;
  }
}
