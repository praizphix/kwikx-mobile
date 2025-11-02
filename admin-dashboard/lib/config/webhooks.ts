export const WEBHOOK_CONFIG = {
  getBaseUrl: () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return import.meta.env.VITE_APP_URL || 'http://localhost:5173';
  },

  fedapay: {
    webhook: () => `${WEBHOOK_CONFIG.getBaseUrl()}/api/webhooks/fedapay`,
    success: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/success`,
    cancel: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/cancelled`,
  },

  paystack: {
    webhook: () => `${WEBHOOK_CONFIG.getBaseUrl()}/api/webhooks/paystack`,
    success: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/success`,
    cancel: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/cancelled`,
  },

  kkiapay: {
    webhook: () => `${WEBHOOK_CONFIG.getBaseUrl()}/api/webhooks/kkiapay`,
    success: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/success`,
    cancel: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/cancelled`,
  },

  payonus: {
    webhook: () => `${WEBHOOK_CONFIG.getBaseUrl()}/api/webhooks/payonus`,
    success: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/success`,
    cancel: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/cancelled`,
  },

  squadco: {
    webhook: () => `${WEBHOOK_CONFIG.getBaseUrl()}/api/webhooks/squadco`,
    success: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/success`,
    cancel: () => `${WEBHOOK_CONFIG.getBaseUrl()}/payment/cancelled`,
  },
};
