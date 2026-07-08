import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export default function VerifyEmailPage() {
  return (
    <AuthShell
      title="Подтверждение email"
      subtitle="Введите шестизначный код, который сервис отправил после регистрации."
      footer="После подтверждения откроется главная страница."
    >
      <VerifyEmailForm />
    </AuthShell>
  );
}
