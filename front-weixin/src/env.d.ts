/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_ASSET_BASE_URL?: string
  readonly VITE_ENABLE_CART?: string
  readonly VITE_ENABLE_AI?: string
  readonly VITE_ENABLE_MOCK_FALLBACK?: string
  readonly VITE_ENABLE_MOCK_AUTH?: string
  readonly VITE_ENABLE_MOCK_PAYMENT?: string
  readonly VITE_MOCK_LATENCY?: string
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_VERSION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
