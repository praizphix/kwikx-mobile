/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY?: string
  readonly VITE_FEDAPAY_PUBLIC_KEY?: string
  readonly VITE_FEDAPAY_SECRET_KEY?: string
  readonly VITE_FEDAPAY_ENVIRONMENT?: string
  readonly VITE_PAYSTACK_PUBLIC_KEY?: string
  readonly VITE_PAYSTACK_SECRET_KEY?: string
  readonly VITE_PAYONUS_API_KEY?: string
  readonly VITE_PAYONUS_SECRET_KEY?: string
  readonly VITE_PAYONUS_CLIENT_ID?: string
  readonly VITE_KKIAPAY_PUBLIC_KEY?: string
  readonly VITE_KKIAPAY_PRIVATE_KEY?: string
  readonly VITE_KKIAPAY_ENVIRONMENT?: string
  readonly VITE_SQUADCO_PUBLIC_KEY?: string
  readonly VITE_SQUADCO_SECRET_KEY?: string
  readonly VITE_SQUADCO_ENVIRONMENT?: string
  readonly VITE_TATUM_API_KEY?: string
  readonly VITE_TATUM_ENVIRONMENT?: string
  readonly DEV: boolean
  readonly MODE: string
  readonly PROD: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
