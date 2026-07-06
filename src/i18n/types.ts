export type Locale = "en" | "vi";

export type Dictionary = {
  appName: string;
  appTagline: string;
  header: {
    nav: Array<{ label: string; href: string }>;
    login: string;
    register: string;
    switchLabel: string;
  };
  landing: {
    badge: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    previewTitle: string;
    bubbles: Array<{ label: string; text: string }>;
    features: Array<{ title: string; description: string }>;
    foundationLabel: string;
    foundationTitle: string;
    foundationDescription: string;
  };
  auth: {
    loginTitle: string;
    registerTitle: string;
    loginDescription: string;
    registerDescription: string;
    emailLabel: string;
    passwordLabel: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    loading: string;
    loginButton: string;
    registerButton: string;
    backToLanding: string;
    errorFallback: string;
  };
};

