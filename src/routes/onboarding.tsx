import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding — Veste" },
      {
        name: "description",
        content:
          "Conte um pouco sobre você para personalizarmos sua experiência de estilo na Veste.",
      },
      { property: "og:title", content: "Onboarding — Veste" },
      {
        property: "og:description",
        content:
          "Conte um pouco sobre você para personalizarmos sua experiência de estilo na Veste.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OnboardingFlow,
});

const STORAGE_KEY = "veste_onboarding_answers";

interface Step {
  key: string;
  question: string;
  options: string[];
}

const STEPS: Step[] = [
  {
    key: "guarda_roupa",
    question: "Qual guarda-roupa combina mais com você?",
    options: ["Masculino", "Feminino"],
  },
  {
    key: "idade",
    question: "Qual é a sua idade?",
    options: ["Menos de 18", "18-24", "25-34", "35-49", "50+"],
  },
  {
    key: "origem",
    question: "Como você conheceu a gente?",
    options: [
      "Indicação de estilista",
      "Instagram",
      "TikTok",
      "X",
      "De um amigo",
      "Outro",
    ],
  },
  {
    key: "compras",
    question: "Onde você costuma comprar roupas?",
    options: ["Marcas populares", "Premium e grifes", "Vintage e brechó"],
  },
];

function loadAnswers(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(loadAnswers);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  const current = STEPS[step]!;
  const progress = ((step + 1) / STEPS.length) * 100;

  function choose(option: string) {
    const next = { ...answers, [current.key]: option };
    setAnswers(next);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // Fim do questionário. A próxima etapa do onboarding será construída
      // depois; por ora as respostas ficam salvas localmente.
    }
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <main className="flex min-h-screen flex-col bg-background px-6 pb-10 pt-6">
      {/* Topo: voltar + progresso */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          aria-label="Voltar"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-opacity disabled:opacity-30"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Pergunta */}
      <div className="mt-12 flex-1">
        <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-foreground">
          {current.question}
        </h1>

        <div className="mt-8 flex flex-col gap-3">
          {current.options.map((option) => {
            const selected = answers[current.key] === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => choose(option)}
                className={`flex min-h-[52px] w-full items-center justify-between rounded-full border px-6 text-left text-base font-medium transition-colors ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground"
                }`}
              >
                {option}
                <ChevronRight
                  size={18}
                  className={selected ? "text-primary-foreground" : "text-muted-foreground"}
                />
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {step + 1} de {STEPS.length}
      </p>
    </main>
  );
}
