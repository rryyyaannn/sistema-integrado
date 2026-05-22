/**
 * GERADO AUTOMATICAMENTE A PARTIR DO SCHEMA DO SUPABASE — NAO EDITAR A MAO.
 *
 * Regenerar com:  pnpm gen:types
 *
 * Este e um PLACEHOLDER. Sera substituido pelos tipos reais assim que a
 * primeira migration for aplicada ao banco (Sprint 1, dia 5).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: {
      [key: string]: { Row: Record<string, unknown> };
    };
    Functions: {
      [key: string]: unknown;
    };
    Enums: {
      [key: string]: string;
    };
    CompositeTypes: {
      [key: string]: unknown;
    };
  };
};
