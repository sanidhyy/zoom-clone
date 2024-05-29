// This file is needed to support autocomplete for process.env
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // stream api keys
      NEXT_PUBLIC_STREAM_API_KEY: string;
      STREAM_SECRET_KEY: string;

      // app base url
      NEXT_PUBLIC_BASE_URL: string;
    }
  }
}
