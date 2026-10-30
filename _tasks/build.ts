import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { generate } from "gas-entry-generator";
import { copyManifest } from "./copy.ts";

const globalIdentifierName = "global";

const protectedDirectories = ["src", "_tasks", ".git", "node_modules"];

function assertSafeOutdir(outdir: string): void {
	const resolved = path.resolve(outdir);
	const projectRoot = path.resolve(".");
	const filesystemRoot = path.parse(resolved).root;

	if (resolved === projectRoot || resolved === filesystemRoot) {
		throw new Error(`Refusing to replace unsafe output directory: ${outdir}`);
	}

	for (const directory of protectedDirectories) {
		const protectedPath = path.resolve(directory);
		if (
			resolved === protectedPath ||
			resolved.startsWith(`${protectedPath}${path.sep}`)
		) {
			throw new Error(`Refusing to replace unsafe output directory: ${outdir}`);
		}
	}
}

export type BuildForGasOptions = {
	entrypoint?: string;
	outdir?: string;
	manifestSource?: string;
};

/**
 * Bundles TypeScript for the Apps Script V8 runtime and copies the manifest.
 * Entry points are top-level functions generated from `global.*` assignments.
 */
export async function buildForGas(
	options: BuildForGasOptions = {},
): Promise<void> {
	const entrypoint = options.entrypoint ?? "src/index.ts";
	const outdir = options.outdir ?? "dist";

	assertSafeOutdir(outdir);
	await rm(outdir, { recursive: true, force: true });
	await mkdir(outdir, { recursive: true });

	const result = await Bun.build({
		entrypoints: [entrypoint],
		outdir,
		target: "browser",
		format: "esm",
		minify: false,
		naming: "[name].[ext]",
	});

	if (!result.success) {
		for (const log of result.logs) {
			console.error(log);
		}
		throw new Error("Failed to bundle the Apps Script entrypoint.");
	}

	for (const artifact of result.outputs) {
		const code = await Bun.file(artifact.path).text();
		const output = generate(code, { globalIdentifierName });

		if (!output.entryPointFunctions.trim()) {
			throw new Error(
				`No Apps Script entry points found in ${artifact.path}. Assign functions to \`${globalIdentifierName}\`.`,
			);
		}

		const wrapped = [
			`var ${globalIdentifierName}=this;`,
			output.entryPointFunctions,
			"(() => {",
			code,
			"})();",
			"",
		].join("\n");

		await Bun.write(artifact.path, wrapped);
	}

	await copyManifest({
		manifestSource: options.manifestSource,
		outdir,
	});
}

if (import.meta.main) {
	try {
		await buildForGas();
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	}
}
