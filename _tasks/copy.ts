import { mkdir } from "node:fs/promises";
import path from "node:path";

const defaultManifestSource = "src/appsscript.json";
const defaultOutdir = "dist";

export type CopyManifestOptions = {
	manifestSource?: string;
	outdir?: string;
};

/**
 * Copies the Apps Script manifest into the build output.
 * Clasp pushes `rootDir` (`dist`) and does not read `src/appsscript.json`.
 */
export async function copyManifest(
	options: CopyManifestOptions = {},
): Promise<void> {
	const manifestSource = options.manifestSource ?? defaultManifestSource;
	const outdir = options.outdir ?? defaultOutdir;
	const source = Bun.file(manifestSource);

	if (!(await source.exists())) {
		throw new Error(`Manifest not found: ${manifestSource}`);
	}

	await mkdir(outdir, { recursive: true });
	await Bun.write(path.join(outdir, "appsscript.json"), source);
}

if (import.meta.main) {
	try {
		await copyManifest();
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	}
}
