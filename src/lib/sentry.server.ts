import * as Sentry from "@sentry/cloudflare";
import type { CloudflareOptions } from "@sentry/cloudflare";

type SafeErrorContext = {
  requestId: string;
  area: "try-on" | "stylist-chat" | "server";
  userId?: string;
  operation?: string;
};

export function sentryServerOptions(): CloudflareOptions {
  return {
    dsn: process.env["SENTRY_DSN"],
    environment: process.env["NODE_ENV"] === "development" ? "development" : "production",
    enableLogs: true,
    sendDefaultPii: false,
    beforeSend(event) {
      delete event.request;
      delete event.extra;
      delete event.contexts;
      event.tags = { ...event.tags, request_id: event.tags?.["request_id"] ?? "untracked" };
      return event;
    },
    beforeSendLog(log) {
      log.attributes = {
        ...log.attributes,
        request_id:
          typeof log.attributes?.["request_id"] === "string"
            ? log.attributes["request_id"]
            : "untracked",
      };
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