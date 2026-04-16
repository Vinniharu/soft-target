"use client";

import React from "react";
import { useFieldArray } from "react-hook-form";
import { Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

const EMPTY_SOFT_TARGET = {
  phone: "",
  location: "",
  lat: "",
  lng: "",
  notes: "",
};

export function SoftTargetFields({ control, register }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "softTargets",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-foreground)]">
            Soft target associations
          </h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
            Known associates, additional phones, or secondary locations.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ ...EMPTY_SOFT_TARGET })}
        >
          <Plus className="h-3.5 w-3.5" /> Add target
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-foreground)]">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-[var(--color-primary-subtle)] text-[var(--color-primary)] text-[11px] font-semibold">
                  {index + 1}
                </span>
                Target {index + 1}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)]"
                onClick={() => remove(index)}
                aria-label={`Remove target ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Phone"
                placeholder="+1 555 000 0000"
                {...register(`softTargets.${index}.phone`)}
              />
              <Input
                label="Location"
                placeholder="Address or description"
                {...register(`softTargets.${index}.location`)}
              />
              <Input
                label="Latitude"
                placeholder="-90 to 90"
                {...register(`softTargets.${index}.lat`)}
              />
              <Input
                label="Longitude"
                placeholder="-180 to 180"
                {...register(`softTargets.${index}.lng`)}
              />
              <div className="md:col-span-2">
                <Textarea
                  label="Notes"
                  rows={2}
                  placeholder="Context for this target (optional)"
                  maxLength={2048}
                  {...register(`softTargets.${index}.notes`)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {fields.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface-2)] py-10 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)]">
            <Users className="h-4 w-4" />
          </div>
          <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
            No soft targets added yet.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => append({ ...EMPTY_SOFT_TARGET })}
          >
            <Plus className="h-3.5 w-3.5" /> Add first target
          </Button>
        </div>
      )}
    </div>
  );
}
