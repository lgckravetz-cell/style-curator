import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Check, ChevronRight, Image, User, X } from "lucide-react";
import lookFlatlay from "@/assets/look-flatlay.jpg";
import paywallLifestyle from "@/assets/paywall-lifestyle.jpg";

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

const TOTAL_STEPS = STEPS.length + 1; // +1 = etapa da selfie

const SELFIE_BENEFITS = [
  "📷 Usamos sua selfie para criar seu avatar de prova",
  "🖼️ É assim também que achamos seus looks na sua galeria",
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

  const isSelfieStep = step === STEPS.length;
  const isProcessingStep = step === STEPS.length + 1;
  const isRevealStep = step === STEPS.length + 2;
  const isPaywallStep = step === STEPS.length + 3;
  const isHomeStep = step === STEPS.length + 4;
  const showTopBar = step <= STEPS.length;
  const current =
    isSelfieStep ||
    isProcessingStep ||
    isRevealStep ||
    isPaywallStep ||
    isHomeStep
      ? null
      : STEPS[step]!;
  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  function choose(option: string) {
    if (!current) return;
    setAnswers({ ...answers, [current.key]: option });
    setStep(step + 1);
  }

  function finishSelfie(value: string) {
    // Salva o resultado da selfie e avança para a etapa de processamento.
    setAnswers((prev) => ({ ...prev, selfie: value }));
    setStep((s) => s + 1);
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <main className="flex min-h-screen flex-col bg-background px-6 pb-10 pt-6">
      {showTopBar && (
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
      )}

      {isProcessingStep ? (
        <ProcessingStep onDone={() => setStep((s) => s + 1)} />
      ) : isRevealStep ? (
        <RevealStep onContinue={() => setStep((s) => s + 1)} />
      ) : isPaywallStep ? (
        <PaywallStep onClose={() => setStep((s) => s + 1)} />
      ) : isHomeStep ? (
        <HomePlaceholder />
      ) : isSelfieStep ? (
        <SelfieStep onDone={finishSelfie} />
      ) : (
        <>
          {/* Pergunta */}
          <div className="mt-12 flex-1">
            <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-foreground">
              {current!.question}
            </h1>

            <div className="mt-8 flex flex-col gap-3">
              {current!.options.map((option) => {
                const selected = answers[current!.key] === option;
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
            {step + 1} de {TOTAL_STEPS}
          </p>
        </>
      )}
    </main>
  );
}

function SelfieStep({ onDone }: { onDone: (value: string) => void }) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="mt-10 flex flex-1 flex-col">
      {/* Título + Pular */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-foreground">
          Tire uma selfie
        </h1>
        <button
          type="button"
          onClick={() => setShowSkipModal(true)}
          className="mt-1 shrink-0 text-sm font-medium text-muted-foreground underline underline-offset-4"
        >
          Pular
        </button>
      </div>

      {/* Benefícios */}
      <div className="mt-5 flex flex-col gap-2">
        {SELFIE_BENEFITS.map((line) => (
          <p key={line} className="text-sm leading-relaxed text-muted-foreground">
            {line}
          </p>
        ))}
      </div>

      {/* Área de preview */}
      <div className="mt-8 flex justify-center">
        <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-3xl bg-muted">
          {photo ? (
            <img
              src={photo}
              alt="Sua selfie"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User size={96} className="text-muted-foreground/50" strokeWidth={1.25} />
            </div>
          )}
          {/* Cantos estilo mira de câmera */}
          <span className="absolute left-3 top-3 h-8 w-8 rounded-tl-lg border-l-4 border-t-4 border-primary" />
          <span className="absolute right-3 top-3 h-8 w-8 rounded-tr-lg border-r-4 border-t-4 border-primary" />
          <span className="absolute bottom-3 left-3 h-8 w-8 rounded-bl-lg border-b-4 border-l-4 border-primary" />
          <span className="absolute bottom-3 right-3 h-8 w-8 rounded-br-lg border-b-4 border-r-4 border-primary" />
        </div>
      </div>

      {/* Botão Selecionar / Concluir */}
      <div className="mt-auto flex flex-col gap-3 pt-10">
        {photo ? (
          <>
            <button
              type="button"
              onClick={() => onDone(photo)}
              className="flex min-h-[52px] w-full items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground"
            >
              Concluir
            </button>
            <button
              type="button"
              onClick={() => setShowSourceModal(true)}
              className="flex min-h-[52px] w-full items-center justify-center rounded-full border border-border bg-card text-base font-semibold text-foreground"
            >
              Trocar foto
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShowSourceModal(true)}
            className="flex min-h-[52px] w-full items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground"
          >
            Selecionar
          </button>
        )}
      </div>

      {/* Inputs de arquivo escondidos */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {/* Modal: escolher origem da foto */}
      {showSourceModal && (
        <BottomSheet onClose={() => setShowSourceModal(false)}>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setShowSourceModal(false);
                cameraInputRef.current?.click();
              }}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-foreground"
            >
              <Camera size={20} />
              Câmera
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSourceModal(false);
                galleryInputRef.current?.click();
              }}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border border-border bg-card text-base font-semibold text-foreground"
            >
              <Image size={20} />
              Fotos
            </button>
            <button
              type="button"
              onClick={() => setShowSourceModal(false)}
              className="mt-1 text-sm font-medium text-muted-foreground"
            >
              Cancelar
            </button>
          </div>
        </BottomSheet>
      )}

      {/* Modal: confirmar pulo */}
      {showSkipModal && (
        <BottomSheet onClose={() => setShowSkipModal(false)}>
          <div className="flex flex-col">
            <h2 className="font-display text-xl font-extrabold text-foreground">
              Antes de pular…
            </h2>
            <div className="mt-4 flex flex-col gap-2">
              {SELFIE_BENEFITS.map((line) => (
                <p key={line} className="text-sm leading-relaxed text-muted-foreground">
                  {line}
                </p>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setShowSkipModal(false);
                setShowSourceModal(true);
              }}
              className="mt-6 flex min-h-[52px] w-full items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground"
            >
              Tirar uma selfie
            </button>
            <button
              type="button"
              onClick={() => onDone("pulada")}
              className="mt-4 text-sm font-medium text-muted-foreground underline underline-offset-4"
            >
              Pular mesmo assim
            </button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

function BottomSheet({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md rounded-t-3xl bg-background px-6 pb-10 pt-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-muted" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-5 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground"
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}

function ProcessingStep({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(10);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const duration = 3000; // 3s (entre 2 e 4s)
    const startPct = 10;
    const endPct = 100;
    const startTime = performance.now();
    let raf = 0;

    function tick(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out
      const pct = Math.round(startPct + (endPct - startPct) * eased);
      setProgress(pct);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(onDone, 500);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const task1Done = true; // concluído desde o início
  const task2Done = progress >= 50; // marca na metade
  const task3Done = progress >= 100; // marca no final

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      {/* Anel de progresso (donut) */}
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="10"
            className="text-muted"
            stroke="currentColor"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            className="text-primary"
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.12s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-2xl font-extrabold text-foreground">
            {progress}%
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">Só um momento...</p>

      <h1 className="mt-6 font-display text-2xl font-extrabold leading-tight tracking-tight text-foreground">
        Estamos montando os melhores looks para você
      </h1>

      <div className="mt-8 flex w-full max-w-sm flex-col gap-3 text-left">
        <TaskItem done={task1Done} label="Encontrando seu estilo" />
        <TaskItem done={task2Done} label="Explorando as tendências" />
        <TaskItem done={task3Done} label="Montando seus looks perfeitos" />
      </div>
    </div>
  );
}

function TaskItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
          done ? "bg-success text-white" : "border border-border bg-card text-transparent"
        }`}
      >
        <Check size={14} strokeWidth={3} />
      </span>
      <span className={`text-base ${done ? "text-foreground" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}

function RevealStep({ onContinue }: { onContinue: () => void }) {
  const items = [
    { emoji: "👜", label: "Bolsa" },
    { emoji: "👕", label: "Blusa" },
    { emoji: "👖", label: "Calça" },
    { emoji: "🧢", label: "Boné" },
  ];
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="mt-8 text-center font-display text-2xl font-extrabold leading-tight tracking-tight text-foreground">
        Nossos usuários criam mais de 1.000 looks com o que já têm
      </h1>

      {/* Carrossel horizontal de miniaturas */}
      <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
        {items.map((it) => (
          <div key={it.label} className="flex w-20 shrink-0 flex-col items-center gap-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-card text-3xl">
              {it.emoji}
            </div>
            <span className="text-xs text-muted-foreground">{it.label}</span>
          </div>
        ))}
      </div>

      {/* Card maior: combinação de look montada */}
      <div className="mt-6 min-h-[220px] flex-1 overflow-hidden rounded-3xl">
        <img
          src={lookFlatlay}
          alt="Look montado com seu guarda-roupa"
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="mt-6 flex min-h-[52px] w-full items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground"
      >
        Continuar
      </button>
    </div>
  );
}

function PaywallStep({ onClose }: { onClose: () => void }) {
  const [plan, setPlan] = useState<"semanal" | "mensal" | "anual">("anual");
  const plans = [
    { id: "semanal" as const, label: "Semanal", price: "R$ 39,90", period: "/semana", badge: null as string | null },
    { id: "mensal" as const, label: "Mensal", price: "R$ 79,90", period: "/mês", badge: "Economize 6%" },
    { id: "anual" as const, label: "Anual", price: "R$ 199,90", period: "/ano", badge: "Economize 58%" },
  ];
  const benefits = [
    "Veja qualquer look no seu avatar",
    "Encontre roupas a partir de qualquer foto",
    "Crie looks com o seu guarda-roupa",
    "Organize seu guarda-roupa",
    "Descubra suas melhores cores",
    "Transforme fotos de roupas em fotos de estúdio",
  ];
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        {/* Imagem de fundo lifestyle + X */}
        <div className="relative h-56 w-full overflow-hidden">
          <img
            src={paywallLifestyle}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/40 text-white backdrop-blur"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-6">
          <h1 className="mt-6 font-display text-2xl font-extrabold leading-tight tracking-tight text-foreground">
            Desbloquear o Pro
          </h1>

          {/* Lista de benefícios */}
          <div className="mt-5 flex flex-col gap-3">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success text-white">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span className="text-base text-foreground">{b}</span>
              </div>
            ))}
          </div>

          {/* Cards de plano */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {plans.map((pl) => {
              const selected = plan === pl.id;
              return (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => setPlan(pl.id)}
                  className={`relative flex flex-col items-center rounded-2xl border p-3 text-center transition-colors ${
                    selected ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  {pl.badge && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      {pl.badge}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-foreground">{pl.label}</span>
                  <span className="mt-1 text-base font-extrabold text-foreground">{pl.price}</span>
                  <span className="text-xs text-muted-foreground">{pl.period}</span>
                </button>
              );
            })}
          </div>

          {/* Termos de renovação automática */}
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            A assinatura renova automaticamente até ser cancelada. Cancele a qualquer momento nas configurações da conta.
          </p>
        </div>
      </div>

      {/* Rodapé: botão + links */}
      <div className="border-t border-border bg-background px-6 pb-8 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-[52px] w-full items-center justify-center rounded-full bg-foreground text-base font-semibold text-background"
        >
          Continuar
        </button>
        <div className="mt-3 flex justify-center gap-6">
          <button type="button" className="text-xs text-muted-foreground underline underline-offset-4">
            Restaurar compras
          </button>
          <button type="button" className="text-xs text-muted-foreground underline underline-offset-4">
            Resgatar código
          </button>
        </div>
      </div>
    </div>
  );
}

function HomePlaceholder() {
  // Placeholder simples para a Home do app (a ser construída no próximo passo).
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <h1 className="font-display text-2xl font-extrabold text-foreground">Home</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        A home do app (Guarda-roupa, Estilista etc.) será construída no próximo passo.
      </p>
    </div>
  );
}
