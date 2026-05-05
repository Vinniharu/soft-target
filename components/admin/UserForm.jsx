"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatApiError } from "@/lib/utils/format";
import { useToast } from "@/lib/toast/ToastContext";

export function UserForm({
  initialValues,
  mode = "create",
  onSubmit,
  submitLabel,
  showRole = true,
  roleOptions,
}) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues:
      initialValues || { email: "", name: "", password: "", role: "user" },
  });

  const handleFormSubmit = async (form) => {
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!showRole) delete payload.role;
      await onSubmit(payload);
    } catch (err) {
      toast.error(
        mode === "edit" ? "Update failed" : "Creation failed",
        formatApiError(err),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const options = roleOptions || [
    { value: "user", label: "Operator (user)" },
    { value: "admin", label: "Administrator (admin)" },
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Full name"
        placeholder="Alice Investigator"
        {...register("name", {
          required: mode === "create" ? "Name is required" : false,
          maxLength: { value: 100, message: "Max 100 characters" },
        })}
        error={errors.name?.message}
      />
      <Input
        label="Email"
        type="email"
        placeholder="operator@agency.gov"
        {...register("email", {
          required: mode === "create" ? "Email is required" : false,
          pattern: {
            value: /.+@.+\..+/,
            message: "Enter a valid email",
          },
        })}
        error={errors.email?.message}
      />
      <Input
        label={mode === "edit" ? "New password" : "Password"}
        type="password"
        placeholder={mode === "edit" ? "Leave blank to keep current" : "Min. 12 characters"}
        hint={mode === "edit" ? "Changing the password will sign the user out everywhere." : "12–128 characters"}
        {...register("password", {
          required: mode === "create" ? "Password is required" : false,
          minLength: { value: 12, message: "At least 12 characters" },
          maxLength: { value: 128, message: "Max 128 characters" },
        })}
        error={errors.password?.message}
      />
      {showRole && (
        <Select
          label="Role"
          {...register("role", { required: showRole ? "Role is required" : false })}
          error={errors.role?.message}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full"
          isLoading={submitting}
        >
          {submitLabel || (mode === "edit" ? "Save changes" : "Create user")}
        </Button>
      </div>
    </form>
  );
}
