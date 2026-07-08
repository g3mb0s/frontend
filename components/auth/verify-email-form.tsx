"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { FormField } from "./form-field";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

export function VerifyEmailForm() {
  const router = useRouter();
  const { status, user, verifyEmail, resendCode, logout } = useAuth();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (status === "anonymous") {
      router.replace("/register");
      return;
    }

    if (user?.emailVerified) {
      router.replace("/");
    }
  }, [router, status, user]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      await verifyEmail(code);
      router.replace("/");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось подтвердить email");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onResend() {
    setError("");
    setMessage("");
    setIsResending(true);

    try {
      await resendCode();
      setMessage("Код отправлен повторно.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось отправить код");
    } finally {
      setIsResending(false);
    }
  }

  if (status === "loading" || status === "anonymous" || user?.emailVerified) {
    return <p className="text-sm text-slate-600">Загрузка...</p>;
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {message ? <FormMessage type="success">{message}</FormMessage> : null}
      {error ? <FormMessage type="error">{error}</FormMessage> : null}
      <p className="text-sm leading-6 text-slate-600">
        Код отправлен на <span className="font-medium text-slate-950">{user?.email}</span>.
      </p>
      <FormField
        id="verification-code"
        label="Код подтверждения"
        inputMode="numeric"
        maxLength={6}
        minLength={6}
        pattern="[0-9]{6}"
        value={code}
        onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
        required
      />
      <SubmitButton disabled={isSubmitting} type="submit">
        {isSubmitting ? "Проверка..." : "Подтвердить"}
      </SubmitButton>
      <button
        className="h-10 w-full rounded-md text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:text-slate-400"
        disabled={isResending}
        type="button"
        onClick={onResend}
      >
        {isResending ? "Отправка..." : "Отправить код еще раз"}
      </button>
      <button
        className="h-10 w-full rounded-md text-sm font-medium text-slate-500 transition hover:bg-slate-100"
        type="button"
        onClick={logout}
      >
        Выйти
      </button>
    </form>
  );
}
