import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Регистрация"
      subtitle="Создайте аккаунт и подтвердите email кодом из письма."
      footer="Пароль должен содержать минимум 8 символов."
    >
      <RegisterForm />
    </AuthShell>
  );
}
