// Webhook and redirect URL configuration
export const WEBHOOK_CONFIG = {
  domain: "getkwikx.com",

  // Base URLs for different environments
  baseUrls: {
    production: "https://getkwikx.com",
    staging: "https://staging.getkwikx.com",
    development: "http://localhost:5173",
  },

  // Get current environment base URL
  getBaseUrl: () => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return WEBHOOK_CONFIG.baseUrls.development
      }
      if (hostname.includes("staging")) {
        return WEBHOOK_CONFIG.baseUrls.staging
      }
    }
    return WEBHOOK_CONFIG.baseUrls.production
  },

  // KkiaPay URLs (replacing FedaPay)
  kkiapay: {
    webhook: () => `${WEBHOOK_CONFIG.getBaseUrl()}/functions/v1/webhook-kkiapay`,
    success: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/success`,
    cancel: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/cancel`,
    error: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/error`,
  },

  // FedaPay URLs (keeping for backward compatibility during migration)
  fedapay: {
    webhook: () => `${WEBHOOK_CONFIG.getBaseUrl()}/functions/v1/webhook-fedapay`,
    success: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/success`,
    cancel: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/cancel`,
    error: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/error`,
  },

  // SquadCo URLs
  squadco: {
    webhook: () => `${WEBHOOK_CONFIG.getBaseUrl()}/functions/v1/payment-webhooks/squadco`,
    success: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/success`,
    cancel: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/cancel`,
    error: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/error`,
  },

  // Paystack URLs
  paystack: {
    webhook: () => `${WEBHOOK_CONFIG.getBaseUrl()}/functions/v1/webhook-paystack`,
    success: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/success`,
    cancel: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/cancel`,
    error: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/error`,
  },

  // Tatum URLs
  tatum: {
    webhook: () => `${WEBHOOK_CONFIG.getBaseUrl()}/functions/v1/payment-webhooks/tatum`,
    monitor: () => `${WEBHOOK_CONFIG.getBaseUrl()}/functions/v1/usdt-monitor`,
    notifications: () => `${WEBHOOK_CONFIG.getBaseUrl()}/functions/v1/payment-webhooks/tatum/transactions`,
  },

  // Common redirect URLs
  redirects: {
    success: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/success`,
    cancel: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/cancel`,
    error: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/error`,
  },
}

// Export individual webhook URLs for easy access
export const WEBHOOK_URLS = {
  KKIAPAY_WEBHOOK: WEBHOOK_CONFIG.kkiapay.webhook(),
  FEDAPAY_WEBHOOK: WEBHOOK_CONFIG.fedapay.webhook(),
  SQUADCO_WEBHOOK: WEBHOOK_CONFIG.squadco.webhook(),
  PAYSTACK_WEBHOOK: WEBHOOK_CONFIG.paystack.webhook(),
  TATUM_WEBHOOK: WEBHOOK_CONFIG.tatum.webhook(),
  USDT_MONITOR: WEBHOOK_CONFIG.tatum.monitor(),

  SUCCESS_URL: WEBHOOK_CONFIG.redirects.success(),
  CANCEL_URL: WEBHOOK_CONFIG.redirects.cancel(),
  ERROR_URL: WEBHOOK_CONFIG.redirects.error(),
}

// Webhook configuration for each provider
export const PROVIDER_WEBHOOKS = {
  kkiapay: {
    url: WEBHOOK_CONFIG.kkiapay.webhook(),
    events: ["SUCCESS", "FAILED", "CANCELLED", "PENDING"],
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "KwikX-Webhook/1.0",
    },
  },

  fedapay: {
    url: WEBHOOK_CONFIG.fedapay.webhook(),
    events: ["transaction.approved", "transaction.declined", "transaction.canceled"],
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "KwikX-Webhook/1.0",
    },
  },

  squadco: {
    url: WEBHOOK_CONFIG.squadco.webhook(),
    events: ["charge_successful", "charge_failed", "transfer_successful", "transfer_failed"],
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "KwikX-Webhook/1.0",
    },
  },

  paystack: {
    url: WEBHOOK_CONFIG.paystack.webhook(),
    events: [
      "charge.success",
      "transfer.success",
      "transfer.failed",
      "customeridentification.success",
      "customeridentification.failed",
    ],
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "KwikX-Webhook/1.0",
    },
  },

  tatum: {
    url: WEBHOOK_CONFIG.tatum.webhook(),
    monitor: WEBHOOK_CONFIG.tatum.monitor(),
    events: ["ADDRESS_TRANSACTION", "TRANSACTION_CONFIRMATION"],
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "KwikX-Webhook/1.0",
    },
  },
}
