// Type definitions for Deno APIs used in Edge Functions
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  
  export const env: Env;
  
  export function serve(handler: (req: Request) => Promise<Response> | Response): void;
}

// Type definitions for Deno modules
declare module "https://deno.land/std@0.190.0/http/server.ts" {
  export function serve(handler: (req: Request) => Promise<Response> | Response): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2.39.7" {
  export * from "@supabase/supabase-js";
}

declare module "https://esm.sh/@supabase/supabase-js@2.43.1" {
  export * from "@supabase/supabase-js";
} 