import * as Sentry from "@sentry/cloudflare";

type SafeErrorContext = {
  requestId: string;
  area: "try-on" | "stylist-chat" | "server";
  userId?: string;
  operation?: string;
};

export function sentryServerOptions() {
  return {
    dsn: process.env["SENTRY_DSN"],
    environment: process.env["NODE_ENV"] === "development" ? "development" : "production",
    enabled: process.env["NODE_ENV"] !== "development",
    enableLogs: true,
    sendDefaultPii: false,
    beforeSend(event: Sentry.Event) {
      delete event.request;
      delete event.extra;
      delete event.contexts;
      return event;
    },
    beforeSendLog(log: Sentry.Log) {
      return log;
    },
  };
}

export function captureServerError(error: unknown, context: SafeErrorContext): void {
  const attributes = {
    request_id: context.requestId,
    area: context.area,
    operation: context.operation ?? "request",
    ...(context.userId ? { user_id: context.userId } : {}),
  };

  Sentry.withScope((scope) => {
    scope.setTag("request_id", context.requestId);
    scope.setTag("area", context.area);
    if (context.userId) scope.setUser({ id: context.userId });
    Sentry.captureException(error instanceof Error ? error : new Error("Erro interno"));
    Sentry.logger.error(`Falha em ${context.area}`, attributes);
  });
}