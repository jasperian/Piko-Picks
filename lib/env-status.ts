export type EnvStatus = {
  name: string;
  configured: boolean;
  requiredFor: string;
};

const envChecks: Omit<EnvStatus, "configured">[] = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    requiredFor: "Supabase auth, database, and storage"
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    requiredFor: "Supabase browser and server clients"
  },
  {
    name: "NEXT_PUBLIC_SITE_URL",
    requiredFor: "Auth callback links"
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    requiredFor: "Privileged dashboard writes and server-side maintenance tasks"
  },
  {
    name: "RESEND_API_KEY",
    requiredFor: "Future email notifications"
  },
  {
    name: "EMAIL_FROM",
    requiredFor: "Verified sender address for email notifications"
  }
];

export function getEnvStatus() {
  return envChecks.map((check) => ({
    ...check,
    configured: Boolean(process.env[check.name])
  }));
}

export function getMissingProductionEnv() {
  return getEnvStatus().filter((check) => !check.configured);
}
