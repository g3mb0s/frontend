"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { FormField } from "./form-field";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(email, password);
      router.replace("/verify-email");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось зарегистрироваться");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {error ? <FormMessage type="error">{error}</FormMessage> : null}
      <FormField
        id="register-email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <FormField
        id="register-password"
        label="Пароль"
        type="password"
        autoComplete="new-password"
        minLength={8}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <SubmitButton disabled={isSubmitting} type="submit">
        {isSubmitting ? "Создание..." : "Создать аккаунт"}
      </SubmitButton>
      <p className="text-center text-sm text-slate-600">
        Уже есть аккаунт?{" "}
        <Link
          className="font-medium text-slate-950 underline-offset-4 hover:underline"
          href="/login"
        >
          Войти
        </Link>
      </p>
    </form>
  );
}
