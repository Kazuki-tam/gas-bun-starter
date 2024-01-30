// gas-entry-generator.d.ts
declare module "gas-entry-generator" {
  export function generate(code: string): { entryPointFunctions: string };
}
