// Limites de uso por plano — fonte única para servidor e telas.
// O código PAYWALL_REQUIRED é devolvido pelo servidor quando a cota do plano
// gratuito termina; as telas abrem o paywall ao recebê-lo.
export const PAYWALL_REQUIRED_CODE = "PAYWALL_REQUIRED";

export const PRO_ENTITLEMENT = "cabidy_pro";

// Plano gratuito: cota total da conta (não renova).
export const FREE_TRYON_TOTAL = 3;
export const FREE_STYLIST_TOTAL = 3;

// Pro: limites diários + teto mensal.
export const PRO_TRYON_DAILY = 5;
export const PRO_TRYON_MONTHLY = 60;
export const PRO_STYLIST_DAILY = 30;
export const PRO_STYLIST_MONTHLY = 600;
