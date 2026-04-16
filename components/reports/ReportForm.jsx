"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent } from "@/components/ui/Card";
import { SoftTargetFields } from "./SoftTargetFields";
import { emptyForm, formToApi } from "@/lib/utils/mapReport";
import { formatApiError } from "@/lib/utils/format";
import { useToast } from "@/lib/toast/ToastContext";

export function ReportForm({
  initialValues,
  mode = "create",
  onSubmit,
  submitLabel,
  backHref,
}) {
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const defaults = initialValues || emptyForm();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: defaults });

  const handleFormSubmit = async (form) => {
    setSubmitting(true);
    try {
      const apiPayload = formToApi(form);
      await onSubmit(apiPayload, form);
    } catch (err) {
      toast.error(
        mode === "edit" ? "Update failed" : "Creation failed",
        formatApiError(err),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 pb-24">
      {backHref && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push(backHref)}
          className="-ml-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      )}

      <Card>
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-foreground)]">
            Case details
          </h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
            The identifier and filing date for this investigation.
          </p>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Case ID"
              placeholder="CASE-2026-0001"
              {...register("caseId", {
                required: "Case ID is required",
                maxLength: { value: 64, message: "Max 64 characters" },
              })}
              error={errors.caseId?.message}
            />
            <Input
              label="Date"
              type="date"
              {...register("date")}
              error={errors.date?.message}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-foreground)]">
            Primary target
          </h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
            Subject, devices, and known location.
          </p>
        </div>
        <CardContent className="p-6 space-y-4">
          <Input
            label="Subject name"
            placeholder="Identifier or code name"
            {...register("target.name")}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="IMEI 1"
              placeholder="Primary device"
              {...register("target.imei")}
            />
            <Input
              label="IMEI 2"
              placeholder="Secondary device"
              {...register("target.imei2")}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone"
              placeholder="+1 555 000 0000"
              {...register("target.phone")}
            />
            <Input
              label="Alternate phone"
              placeholder="+1 555 000 0000"
              {...register("target.altPhone")}
            />
          </div>
          <Input
            label="Location"
            placeholder="Last known address"
            {...register("target.location")}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="text"
              inputMode="decimal"
              placeholder="-90 to 90"
              hint="Example: 51.5074"
              {...register("target.lat", {
                validate: (v) => {
                  if (v === "" || v == null) return true;
                  const n = Number(v);
                  if (!Number.isFinite(n)) return "Must be a number";
                  if (n < -90 || n > 90) return "Latitude must be between -90 and 90";
                  return true;
                },
              })}
              error={errors.target?.lat?.message}
            />
            <Input
              label="Longitude"
              type="text"
              inputMode="decimal"
              placeholder="-180 to 180"
              hint="Example: -0.1278"
              {...register("target.lng", {
                validate: (v) => {
                  if (v === "" || v == null) return true;
                  const n = Number(v);
                  if (!Number.isFinite(n)) return "Must be a number";
                  if (n < -180 || n > 180) return "Longitude must be between -180 and 180";
                  return true;
                },
              })}
              error={errors.target?.lng?.message}
            />
          </div>
          <Textarea
            label="Notes"
            placeholder="Context, observations, prior interactions..."
            maxLength={8192}
            rows={4}
            {...register("target.notes")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <SoftTargetFields control={control} register={register} />
        </CardContent>
      </Card>

      <Card>
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-foreground)]">
            Summary
          </h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
            Narrative, preliminary findings, and next steps.
          </p>
        </div>
        <CardContent className="p-6">
          <Textarea
            placeholder="Summary of the investigation..."
            rows={6}
            maxLength={16384}
            {...register("summary")}
          />
        </CardContent>
      </Card>

      {/* Sticky submit */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-card)]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-6 md:px-10 py-3">
          <div className="hidden md:block text-sm text-[var(--color-muted-foreground)]">
            {mode === "edit"
              ? "Saving will create a new version. The previous state is kept in history."
              : "Submit to create the report and generate the PDF."}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {backHref && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push(backHref)}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" isLoading={submitting}>
              <Save className="h-4 w-4" />
              {submitLabel || (mode === "edit" ? "Save changes" : "Create report")}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
