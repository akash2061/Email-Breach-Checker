export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
}

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

export default config
