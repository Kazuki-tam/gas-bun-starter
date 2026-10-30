import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
	copyRules,
	isEditorTarget,
	removeFrontmatter,
} from "../../_tasks/copy-rules.ts";

const outputs: string[] = [];

afterEach(async () => {
	await Promise.all(
		outputs.splice(0).map((dir) => rm(dir, { recursive: true })),
	);
});

describe("removeFrontmatter", () => {
	test("strips a leading frontmatter block", () => {
		expect(removeFrontmatter("---\nfoo: 1\n---\n\nbody")).toBe("body");
	});

	test("leaves content without frontmatter unchanged", () => {
		expect(removeFrontmatter("body")).toBe("body");
	});

	test("leaves an unclosed frontmatter marker unchanged", () => {
		expect(removeFrontmatter("---\nunclosed")).toBe("---\nunclosed");
	});
});

describe("isEditorTarget", () => {
	test("accepts supported editors", () => {
		expect(isEditorTarget("cursor")).toBe(true);
		expect(isEditorTarget("windsurf")).toBe(true);
		expect(isEditorTarget("copilot")).toBe(true);
	});

	test("rejects unknown editors", () => {
		expect(isEditorTarget("vim")).toBe(false);
	});
});

describe("copyRules", () => {
	test("writes one Cursor rule file per source rule", async () => {
		const cursorDir = await mkdtemp(path.join(tmpdir(), "gas-bun-rules-"));
		outputs.push(cursorDir);

		await copyRules("cursor", { cursorDir });

		const coreRule = await Bun.file(
			path.join(cursorDir, "cursor-core-rule.mdc"),
		).text();
		const gasRule = await Bun.file(
			path.join(cursorDir, "cursor-gas-rule.mdc"),
		).text();

		expect(coreRule).toContain("Task Analysis");
		expect(gasRule).toContain("Google Apps Script");
	});

	test("merges rules for Copilot without frontmatter", async () => {
		const root = await mkdtemp(path.join(tmpdir(), "gas-bun-copilot-"));
		outputs.push(root);
		const copilotPath = path.join(root, "copilot-instructions.md");

		await copyRules("copilot", { copilotPath });

		const merged = await Bun.file(copilotPath).text();
		expect(merged.startsWith("---")).toBe(false);
		expect(merged).toContain("GAS-RULE Rules");
		expect(merged).toContain("Google Apps Script");
	});
});
