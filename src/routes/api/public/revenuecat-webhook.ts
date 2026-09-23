import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "node:crypto";
import { PRO_ENTITLEMENT } from "@/lib/plan-limits";
import { newRequestId } from "@/lib/request-id";

// Webhook do RevenueCat: única origem de verdade para o plano Pro.
// Autenticação: o cabeçalho Authorization precisa ser exatamente igual ao
// segredo REVENUECAT_WEBHOOK_AUTH (comparado em tempo constante).

const ACTIVE_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "NON_RENEWING_PURCHASE",
  "RENEWAL",
  "PRODUCT_CHANGE",
  "UNCANCELLATION",
  "SUBSCRIPTION_EXTENDED",
]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

type RevenueCatEvent = {
  type?: string;
  app_user_id?: string;
  original_app_user_id?: string;
  entitlement_id?: string | null;
  entitlement_ids?: string[] | null;
  expiration_at_ms?: number | null;
};

export const Route = createFileRoute("/api/public/revenuecat-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const requestId = newRequestId();
        const expected = process.env["REVENUECAT_WEBHOOK_AUTH"];
        if (!expected) {
          console.error(`[revenuecat-webhook][${requestId}] REVENUECAT_WEBHOOK_AUTH ausente`);
          return new Response("Unauthorized", { status: 401 });
        }
        if (!secretMatches(request.headers.get("authorization"), expected)) {
          return new Response("Unauthorized", { status: 401 });
        }

        let event: RevenueCatEvent;
        try {
          const body = (await request.json()) as { event?: RevenueCatEvent };
          event = body?.event ?? {};
        } catch {
          return new Response("Bad Request", { status: 400 });
        }

        const userId = event.app_user_id ?? "";
        if (!UUID_RE.test(userId)) {
          return new Response("ignored", { status: 200 });
        }

        const entitlements = [
          ...(event.entitlement_ids ?? []),
          ...(event.entitlement_id ? [event.entitlement_id] : []),
        ];
        if (!entitlements.includes(PRO_ENTITLEMENT)) {
          return new Response("ignored", { status: 200 });
        }

        const type = event.type ?? "";
        const status =
          ACTIVE_EVENTS.has(type) ? "active"
          : type === "EXPIRATION" ? "expired"
          : type === "CANCELLATION" ? "canceled"
          : null;
        if (!status) return new Response("ignored", { status: 200 });

        const { upsertSubscription, userExists } = await import("@/lib/subscription.server");

        if (!(await userExists(userId))) {
          return new Response("ignored", { status: 200 });
        }

        const expiresAt = event.expiration_at_ms
          ? new Date(event.expiration_at_ms).toISOString()
          : null;

        try {
          await upsertSubscription({
            userId,
            status,
            entitlement: PRO_ENTITLEMENT,
            expiresAt,
          });
        } catch (error) {
          console.error(`[revenuecat-webhook][${requestId}] falha ao gravar assinatura`, error);
          return new Response("Internal Error", { status: 500 });
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
