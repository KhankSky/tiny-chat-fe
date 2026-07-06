import { AuthCard } from "@/components/auth/auth-card";
import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Set up a Tiny Chat account first. We keep the profile onboarding separate so the auth flow stays fast and clean."
    >
      <AuthForm mode="register" />
    </AuthCard>
  );
}

