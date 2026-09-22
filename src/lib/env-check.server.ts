// Checagem das variáveis de ambiente obrigatórias.
// process.env só é preenchido no momento da requisição no runtime do Worker,
// por isso a verificação roda uma única vez na primeira requisição recebida.

type RequiredVar = { label: string; names: string[] };

const REQUIRED: RequiredVar[] = [
  { label: "SUPABASE_URL", names: ["SUPABASE_URL"] },
  { label: "SUPABASE_SERVICE_ROLE_KEY", names: ["SUPABASE_SERVICE_ROLE_KEY"] },
  { label: "FAL_API_KEY ou APIFALAI", names: ["FAL_API_KEY", "APIFALAI"] },
  { label: "ANTHROPIC_API_KEY", names: ["ANTHROPIC_API_KEY"] },
];

let checked = false;

export function checkRequiredEnv(): string[] {
  const missing = REQUIRED.filter(
    (entry) => !entry.names.some((name) => (process.env[name] ?? "").length > 0),
  ).map((entry) => entry.label);

  if (missing.length > 0) {
    console.error(
      `[env-check] Variáveis de ambiente obrigatórias ausentes (${missing.length}): ${missing.join(
        ", ",
      )}. As funções que dependem delas vão falhar até que sejam configuradas.`,
    );
  } else {
    console.log("[env-check] Todas as variáveis de ambiente obrigatórias estão presentes.");
  }

  return missing;
}

export function checkRequiredEnvOnce(): void {
  if (checked) return;
  checked = true;
  checkRequiredEnv();
}
