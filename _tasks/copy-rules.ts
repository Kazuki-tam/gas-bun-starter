import { mkdir } from "node:fs/promises";
import path from "node:path";

const editors = ["cursor", "windsurf", "copilot"] as const;

export type EditorTarget = (typeof editors)[number];

export type CopyRulesOptions = {
	rulesDir?: string;
	cursorDir?: string;
	windsurfPath?: string;
	copilotPath?: string;
};

const defaultOptions: Required<CopyRulesOptions> = {
	rulesDir: "_llm-rules",
	cursorDir: ".cursor/rules",
	windsurfPath: ".windsurfrules",
	copilotPath: ".github/copilot-instructions.md",
};

export function isEditorTarget(value: string): value is EditorTarget {
	return editors.includes(value as EditorTarget);
}

/**
 * Removes a leading YAML frontmatter block delimited by `---`.
 */
export function removeFrontmatter(content: string): string {
	if (!content.startsWith("---")) {
		return content;
	}

	const secondDashIndex = content.indexOf("---", 3);
	if (secondDashIndex === -1) {
		return content;
	}

	return content.slice(secondDashIndex + 3).trim();
}

function listRuleFiles(rulesDir: string): string[] {
	const glob = new Bun.Glob("*.md");
	return [...glob.scanSync({ cwd: rulesDir })]
		.map((file) => path.join(rulesDir, file))
		.sort();
}

export async function readAndProcessRules(rulesDir: string): Promise<{
	coreRuleContent: string;
	otherRulesContent: string;
}> {
	let coreRuleContent = "";
	let otherRulesContent = "";

	for (const file of listRuleFiles(rulesDir)) {
		const fileName = path.basename(file, ".md");
		const contentWithoutFrontmatter = removeFrontmatter(
			await Bun.file(file).text(),
		);

		if (!contentWithoutFrontmatter.trim()) {
			console.log(`Skipping ${file} as it has no content besides frontmatter`);
			continue;
		}

		if (fileName === "core-rule") {
			coreRuleContent = contentWithoutFrontmatter;
			continue;
		}

		otherRulesContent += `\n\n# ${fileName.toUpperCase()} Rules\n\n${contentWithoutFrontmatter}`;
	}

	return { coreRuleContent, otherRulesContent };
}

async function mergedRuleContent(rulesDir: string): Promise<string> {
	const { coreRuleContent, otherRulesContent } =
		await readAndProcessRules(rulesDir);
	const mergedContent = `${coreRuleContent}${otherRulesContent}`.trim();

	if (!mergedContent) {
		throw new Error(`No rule content found in ${rulesDir}`);
	}

	return `${mergedContent}\n`;
}

async function processCursorRules(
	editor: EditorTarget,
	options: Required<CopyRulesOptions>,
): Promise<void> {
	await mkdir(options.cursorDir, { recursive: true });

	for (const file of listRuleFiles(options.rulesDir)) {
		const fileName = path.basename(file, ".md");
		const targetPath = path.join(
			options.cursorDir,
			`${editor}-${fileName}.mdc`,
		);
		await Bun.write(targetPath, await Bun.file(file).text());
		console.log(`Copied ${file} to ${targetPath}`);
	}
}

async function processWindsurfRules(
	options: Required<CopyRulesOptions>,
): Promise<void> {
	await Bun.write(
		options.windsurfPath,
		await mergedRuleContent(options.rulesDir),
	);
	console.log(`Merged rule files and saved to ${options.windsurfPath}`);
}

async function processCopilotRules(
	options: Required<CopyRulesOptions>,
): Promise<void> {
	await mkdir(path.dirname(options.copilotPath), { recursive: true });
	await Bun.write(
		options.copilotPath,
		await mergedRuleContent(options.rulesDir),
	);
	console.log(`Merged rule files and saved to ${options.copilotPath}`);
}

export async function copyRules(
	editor: EditorTarget,
	options: CopyRulesOptions = {},
): Promise<void> {
	const resolvedOptions = { ...defaultOptions, ...options };

	if (editor === "cursor") {
		await processCursorRules(editor, resolvedOptions);
		return;
	}

	if (editor === "windsurf") {
		await processWindsurfRules(resolvedOptions);
		return;
	}

	await processCopilotRules(resolvedOptions);
}

if (import.meta.main) {
	const editorArg = process.argv[2] ?? "cursor";

	if (!isEditorTarget(editorArg)) {
		console.error(`Unsupported editor: ${editorArg}`);
		process.exit(1);
	}

	try {
		await copyRules(editorArg);
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	}
}
