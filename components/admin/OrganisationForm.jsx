"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatApiError } from "@/lib/utils/format";
import { useToast } from "@/lib/toast/ToastContext";

export function OrganisationForm({
  initialValues,
  mode = "create",
  onSubmit,
  submitLabel,
}) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues:
      initialValues || {
        name: "",
        owner: { name: "", email: "", password: "" },
      },
  });

  const handleFormSubmit = async (form) => {
    setSubmitting(true);
    try {
      if (mode === "create") {
        await onSubmit({
          name: form.name,
          owner: {
            name: form.owner.name,
            email: form.owner.email,
            password: form.owner.password,
          },
        });
      } else {
        await onSubmit({ name: form.name });
      }
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Organisation name"
        placeholder="Acme Investigations Ltd."
        {...register("name", {
          required: "Name is required",
          maxLength: { value: 120, message: "Max 120 characters" },
        })}
        error={errors.name?.message}
      />

      {mode === "create" && (
        <fieldset className="space-y-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
          <legend className="px-2 text-xs font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Organisation owner
          </legend>
          <Input
            label="Owner full name"
            placeholder="Alice Owner"
            {...register("owner.name", {
              required: "Owner name is required",
              maxLength: { value: 100, message: "Max 100 characters" },
            })}
            error={errors.owner?.name?.message}
          />
          <Input
            label="Owner email"
            type="email"
            placeholder="owner@acme.example"
            {...register("owner.email", {
              required: "Owner email is required",
              pattern: {
                value: /.+@.+\..+/,
                message: "Enter a valid email",
              },
            })}
            error={errors.owner?.email?.message}
          />
          <Input
            label="Owner password"
            type="password"
            placeholder="Min. 12 characters"
            hint="The owner can sign in immediately with these credentials."
            {...register("owner.password", {
              required: "Owner password is required",
              minLength: { value: 12, message: "At least 12 characters" },
              maxLength: { value: 128, message: "Max 128 characters" },
            })}
            error={errors.owner?.password?.message}
          />
        </fieldset>
      )}

      <div className="pt-2">
        <Button type="submit" className="w-full" isLoading={submitting}>
          {submitLabel ||
            (mode === "edit" ? "Save changes" : "Create organisation")}
        </Button>
      </div>
    </form>
  );
}
