"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthApiError } from "@/lib/auth/api";
import { useAuth } from "@/lib/auth/context";
import { FormField } from "./form-field";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.replace(searchParams.get("next") ?? "/");
    } catch (caught) {
      if (caught instanceof AuthApiError && caught.status === 403) {
        setError("Email не подтвержден. Зарегистрируйтесь повторно или запросите новый код.");
      } else {
        setError(caught instanceof Error ? caught.message : "Не удалось войти");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {error ? <FormMessage type="error">{error}</FormMessage> : null}
      <FormField
        id="login-email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <FormField
        id="login-password"
        label="Пароль"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <SubmitButton disabled={isSubmitting} type="submit">
        {isSubmitting ? "Вход..." : "Войти"}
      </SubmitButton>
      <p className="text-center text-sm text-slate-600">
        Нет аккаунта?{" "}
        <Link
          className="font-medium text-slate-950 underline-offset-4 hover:underline"
          href="/register"
        >
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
}
