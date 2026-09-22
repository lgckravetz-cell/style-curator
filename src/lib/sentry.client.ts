import * as Sentry from "@sentry/react";
import { supabase } from "@/integrations/supabase/client";

const SENTRY_DSN =
  "https://2a6f4566350c2aa9a0864b723b1ea2340e4512131807051776.ingest.de.sentry.io/4512131813867600";

let initialized = false;

function sanitizeEvent<T extends { request?: unknown; extra?: unknown; contexts?: unknown }>(event: T): T {
  delete event.request;
  delete event.extra;
  delete event.contexts;
  return event;
}

export function initClientSentry(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.DEV ? "development" : "production",
    enabled: import.meta.env.PROD,
    enableLogs: true,
    sendDefaultPii: false,
    beforeSend: sanitizeEvent,
    beforeSendLog: sanitizeEvent,
  });

  void supabase.auth.getSession().then(({ data }) => {
    Sentry.setUser(data.session?.user.id ? { id: data.session.user.id } : null);
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    Sentry.setUser(session?.user.id ? { id: session.user.id } : null);
  });
}

export function captureDevelopmentTestError(): void {
  const requestId = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const error = new Error("Teste manual do Sentry");
  Sentry.withScope((scope) => {
    scope.setTag("request_id", requestId);
    scope.setTag("area", "settings-test");
    Sentry.captureException(error);
    Sentry.logger.error("Teste manual do Sentry", {
      request_id: requestId,
      area: "settings-test",
    });
  });
}