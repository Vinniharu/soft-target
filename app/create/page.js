"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Save,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";

export default function CreateDocument() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      caseId: "",
      date: new Date().toISOString().split("T")[0],
      target: {
        imei: "",
        imei2: "",
        phone: "",
        altPhone: "",
        location: "",
        coordinates: "",
      },
      softTargets: [{ phone: "", location: "", lat: "", lng: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "softTargets",
  });

  // Load draft from local storage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("soft-target-draft");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.caseId) setValue("caseId", data.caseId);
      if (data.date) setValue("date", data.date);
      if (data.target) setValue("target", data.target);
      if (data.softTargets && data.softTargets.length > 0) {
        setValue("softTargets", data.softTargets);
      }
    }
  }, [setValue]);

  const onSubmit = (data) => {
    localStorage.setItem("soft-target-draft", JSON.stringify(data));
    router.push("/preview");
  };

  const saveDraft = () => {
    const data = watch();
    localStorage.setItem("soft-target-draft", JSON.stringify(data));
    alert("Draft saved locally");
  };

  if (!mounted) return <div className="p-8">Loading system...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="mb-2 -ml-2 text-[var(--color-muted-foreground)]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Dashboard
          </Button>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-primary)]">
            NEW INVESTIGATION
          </h1>
          <p className="text-sm font-mono text-[var(--color-muted-foreground)] mt-2">
            SECURE ENTRY TERMINAL // AUTHORIZED PERSONNEL ONLY
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={saveDraft}>
            <Save className="mr-2 h-4 w-4" /> Save Work
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* CASE DETAILS */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 border-t-4 border-t-[var(--color-primary)]">
            <CardHeader>
              <CardTitle className="text-lg uppercase tracking-widest">
                Case File
              </CardTitle>
              <CardDescription>Identifier & Date</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Case ID"
                placeholder="INV-XXXX-XXX"
                {...register("caseId", { required: "Case ID is required" })}
                error={errors.caseId?.message}
                className="font-bold text-lg"
              />
              <Input
                label="Date"
                type="date"
                {...register("date", { required: "Date is required" })}
                error={errors.date?.message}
              />
            </CardContent>
          </Card>

          {/* TARGET DETAILS */}
          <Card className="md:col-span-2 border-t-4 border-t-[var(--color-primary)]">
            <CardHeader>
              <CardTitle className="text-lg uppercase tracking-widest">
                Target Subject
              </CardTitle>
              <CardDescription>Primary Device & Location Data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="IMEI 1"
                  placeholder="Primary Device ID"
                  {...register("target.imei")}
                />
                <Input
                  label="IMEI 2"
                  placeholder="Secondary Device ID"
                  {...register("target.imei2")}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  placeholder="+1 (XXX) XXX-XXXX"
                  {...register("target.phone")}
                />
                <Input
                  label="Alternate Number"
                  placeholder="+1 (XXX) XXX-XXXX"
                  {...register("target.altPhone")}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Primary Location / Address"
                  placeholder="Full residential or last known address"
                  {...register("target.location")}
                />
                <Input
                  label="Coordinates"
                  placeholder="Lat, Lng"
                  {...register("target.coordinates")}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SOFT TARGETS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[var(--color-primary)]" />
              Soft Target Associations
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ phone: "", location: "", lat: "", lng: "" })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Add Target
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="group transition-all duration-200">
                <div className="flex flex-col md:flex-row gap-3 items-stretch bg-[var(--color-secondary)]/30 p-0 rounded-md border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-colors overflow-hidden">
                  {/* Index Column */}
                  <div className="bg-[var(--color-secondary)] w-12 flex items-center justify-center border-r border-[var(--color-border)] text-[var(--color-muted-foreground)] font-mono font-bold text-lg">
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-3">
                      <Input
                        placeholder="Phone Number"
                        {...register(`softTargets.${index}.phone`)}
                        className="bg-white"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <Input
                        placeholder="Location / Address"
                        {...register(`softTargets.${index}.location`)}
                        className="bg-white"
                      />
                    </div>
                    <div className="md:col-span-4 grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Latitude"
                        {...register(`softTargets.${index}.lat`)}
                        className="bg-white"
                      />
                      <Input
                        placeholder="Longitude"
                        {...register(`softTargets.${index}.lng`)}
                        className="bg-white"
                      />
                    </div>
                    <div className="md:col-span-1 flex items-center justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-50 hover:text-red-700"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {fields.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-[var(--color-border)] rounded-lg bg-[var(--color-secondary)]/10">
              <p className="text-[var(--color-muted-foreground)] mb-4">
                No soft targets currently associated.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({ phone: "", location: "", lat: "", lng: "" })
                }
              >
                Initialize Soft Target List
              </Button>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] p-4 shadow-lg z-50">
          <div className="max-w-5xl mx-auto flex justify-end">
            <Button
              type="submit"
              size="lg"
              className="w-full md:w-auto font-bold text-base shadow-red-500/20 shadow-lg"
            >
              GENERATE REPORT <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
