import { AuthCard } from "@/components/auth/auth-card";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to continue the conversation, pick up your profile, and move into the main app."
    >
      <AuthForm mode="login" />
    </AuthCard>
  );
}

