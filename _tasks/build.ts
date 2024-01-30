import { generate } from "gas-entry-generator";

async function buildForGAS() {
  const result = await Bun.build({
    entrypoints: ["src/index.ts"],
    outdir: "dist",
  });

  const artifact = result.outputs[0];
  const code = await Bun.file(artifact.path).text();

  const output = generate(code);

  await Bun.write(
    artifact.path,
    `const global=this;\n${output.entryPointFunctions}\n(() => {\n${code}\n})();`
  );
}

buildForGAS();
