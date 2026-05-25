/**
 * @si/core — logica de dominio agnostica de plataforma.
 *
 * Tudo aqui deve rodar igual em web (Next.js), mobile (Expo) e nas Edge
 * Functions (Deno). Nada de imports de React, Next ou React Native.
 * Modulos de dominio (identity, catalog, operations, checklists) serao
 * adicionados a partir do Sprint 2.
 */

export * from './shared';
export * from './auth';
export * from './checkin';
