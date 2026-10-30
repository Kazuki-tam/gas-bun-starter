import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { runInNewContext } from "node:vm";
import { buildForGas } from "../../_tasks/build.ts";

type GasSandbox = {
	console: {
		log: (...args: unknown[]) => void;
	};
	main?: () => void;
};

const outputs: string[] = [];

afterEach(async () => {
	await Promise.all(
		outputs.splice(0).map((dir) => rm(dir, { recursive: true })),
	);
});

describe("buildForGas", () => {
	test("writes a callable entry point and the manifest", async () => {
		const outdir = await mkdtemp(path.join(tmpdir(), "gas-bun-build-"));
		outputs.push(outdir);

		await buildForGas({ outdir });

		const bundle = await Bun.file(path.join(outdir, "index.js")).text();
		const manifest = await Bun.file(
			path.join(outdir, "appsscript.json"),
		).json();

		expect(bundle).toContain("var global=this;");
		expect(bundle).toContain("global.main");
		expect(bundle).not.toContain("bun:");
		expect(manifest.runtimeVersion).toBe("V8");

		const logs: string[] = [];
		const sandbox: GasSandbox = {
			console: {
				log: (...args: unknown[]) => {
					logs.push(args.map(String).join(" "));
				},
			},
		};
		runInNewContext(bundle, sandbox);
		sandbox.main?.();
		expect(logs).toEqual(["Main function!!"]);
	});

	test("refuses to replace a source directory", async () => {
		await expect(buildForGas({ outdir: "src" })).rejects.toThrow(
			"Refusing to replace unsafe output directory: src",
		);
		expect(await Bun.file("src/index.ts").exists()).toBe(true);
	});

	test("fails when the bundle does not assign a global entry point", async () => {
		const root = await mkdtemp(path.join(tmpdir(), "gas-bun-build-"));
		outputs.push(root);
		const entrypoint = path.join(root, "entry.ts");
		const outdir = path.join(root, "out");
		await Bun.write(entrypoint, "console.log('no entry');\n");

		await expect(
			buildForGas({
				entrypoint,
				outdir,
				manifestSource: "src/appsscript.json",
			}),
		).rejects.toThrow("No Apps Script entry points");
	});
});
