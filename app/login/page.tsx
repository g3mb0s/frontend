import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      title="Вход"
      subtitle="Войдите в подтвержденный аккаунт, чтобы продолжить."
      footer="Доступ открыт только для пользователей с подтвержденным email."
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
