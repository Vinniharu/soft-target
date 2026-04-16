"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/lib/toast/ToastContext";
import { formatApiError } from "@/lib/utils/format";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, hydrated } = useAuth();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: "", password: "" } });

  useEffect(() => {
    if (hydrated && isAuthenticated) router.replace("/dashboard");
  }, [hydrated, isAuthenticated, router]);

  const onSubmit = async ({ email, password }) => {
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      toast.error("Sign in failed", formatApiError(err, "Invalid credentials"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold shadow-sm">
              ST
            </div>
            <div>
              <div className="text-base font-semibold text-[var(--color-foreground)]">
                Soft Target
              </div>
              <div className="text-xs text-[var(--color-muted-foreground)]">
                Operations console
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Sign in
            </h1>
            <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)]">
              Enter your credentials to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@agency.gov"
              autoComplete="username"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /.+@.+\..+/,
                  message: "Enter a valid email",
                },
              })}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              {...register("password", { required: "Password is required" })}
              error={errors.password?.message}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={submitting}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[var(--color-muted-foreground)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Authorized access only
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-[var(--color-muted-foreground)]">
        © Soft Target
      </footer>
    </div>
  );
}
