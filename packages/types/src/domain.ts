/**
 * Helpers de tipo para consumir o schema gerado de forma ergonomica.
 *
 * Em vez de escrever `Database['public']['Tables']['posts']['Row']` por todo
 * o codigo, os apps importam `Tables<'posts'>`.
 */

import type { Database } from './database';

type PublicSchema = Database['public'];

/** Linha de uma tabela (resultado de SELECT). */
export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T] extends {
  Row: infer R;
}
  ? R
  : never;

/** Payload de INSERT de uma tabela. */
export type InsertDto<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T] extends {
  Insert: infer I;
}
  ? I
  : never;

/** Payload de UPDATE de uma tabela. */
export type UpdateDto<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T] extends {
  Update: infer U;
}
  ? U
  : never;

/** Valor de um tipo enum do Postgres. */
export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];
