import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { globSync } from "glob";

// Get editor from command line arguments
const editor = process.argv[2] || "cursor"; // Default is cursor

async function copyRules() {
  if (editor === "cursor") {
    await processCursorRules();
  } else if (editor === "windsurf") {
    await processWindsurfRules();
  } else if (editor === "copilot") {
    await processCopilotRules();
  } else {
    console.error(`Unsupported editor: ${editor}`);
    process.exit(1);
  }
}

async function processCursorRules() {
  const targetDir = ".cursor/rules";
  const fileExtension = ".mdc";

  // Create target directory if it doesn't exist
  if (!existsSync(targetDir)) {
    await mkdir(targetDir, { recursive: true });
    console.log(`Created directory ${targetDir}`);
  }

  // Get md files from _llm-rules directory
  const ruleFiles = globSync("_llm-rules/*.md");

  // Copy each file to target directory and change extension
  for (const file of ruleFiles) {
    const fileName = path.basename(file, ".md");

    // For core-rule.md rename to cursor-core-rule
    // For gas-rule.md rename to cursor-gas-rule
    let newFileName = fileName;
    if (fileName === "core-rule") {
      newFileName = `${editor}-core-rule`;
    } else if (fileName === "gas-rule") {
      newFileName = `${editor}-gas-rule`;
    }

    const sourceFile = Bun.file(file);
    const content = await sourceFile.text();

    const targetPath = `${targetDir}/${newFileName}${fileExtension}`;
    await Bun.write(targetPath, content);
    console.log(`Copied ${file} to ${targetPath}`);
  }
}

async function processWindsurfRules() {
  // Get md files from _llm-rules directory
  const ruleFiles = globSync("_llm-rules/*.md");
  let coreRuleContent = "";
  let otherRulesContent = "";

  // Separate core-rule and other rules
  for (const file of ruleFiles) {
    const fileName = path.basename(file, ".md");
    const sourceFile = Bun.file(file);
    const content = await sourceFile.text();

    // Remove frontmatter (part surrounded by ---)
    const contentWithoutFrontmatter = removeFrontmatter(content);

    // Skip if content is empty
    if (!contentWithoutFrontmatter.trim()) {
      console.log(`Skipping ${file} as it has no content besides frontmatter`);
      continue;
    }

    if (fileName === "core-rule") {
      coreRuleContent = contentWithoutFrontmatter;
    } else {
      // For other rule files, append content
      otherRulesContent += `\n\n# ${fileName.toUpperCase()} Rules\n\n${contentWithoutFrontmatter}`;
    }
  }

  // Place core-rule at the beginning, followed by other rules
  const mergedContent = coreRuleContent + otherRulesContent;

  // Create .windsurfrules file in project root
  const targetPath = ".windsurfrules";

  await Bun.write(targetPath, mergedContent);
  console.log(`Merged rule files and saved to ${targetPath}`);
}

async function processCopilotRules() {
  // Get md files from _llm-rules directory
  const ruleFiles = globSync("_llm-rules/*.md");
  let coreRuleContent = "";
  let otherRulesContent = "";

  // Separate core-rule and other rules
  for (const file of ruleFiles) {
    const fileName = path.basename(file, ".md");
    const sourceFile = Bun.file(file);
    const content = await sourceFile.text();

    // Remove frontmatter (part surrounded by ---)
    const contentWithoutFrontmatter = removeFrontmatter(content);

    // Skip if content is empty
    if (!contentWithoutFrontmatter.trim()) {
      console.log(`Skipping ${file} as it has no content besides frontmatter`);
      continue;
    }

    if (fileName === "core-rule") {
      coreRuleContent = contentWithoutFrontmatter;
    } else {
      // For other rule files, append content
      otherRulesContent += `\n\n# ${fileName.toUpperCase()} Rules\n\n${contentWithoutFrontmatter}`;
    }
  }

  // Place core-rule at the beginning, followed by other rules
  const mergedContent = coreRuleContent + otherRulesContent;

  // Create target directory if it doesn't exist
  const targetDir = ".github";
  if (!existsSync(targetDir)) {
    await mkdir(targetDir, { recursive: true });
    console.log(`Created directory ${targetDir}`);
  }

  // Create copilot-instructions.md file in .github directory
  const targetPath = `${targetDir}/copilot-instructions.md`;

  await Bun.write(targetPath, mergedContent);
  console.log(`Merged rule files and saved to ${targetPath}`);
}

// Function to remove frontmatter (part surrounded by ---)
function removeFrontmatter(content: string): string {
  // Remove frontmatter if it exists
  if (content.startsWith("---")) {
    const secondDashIndex = content.indexOf("---", 3);
    if (secondDashIndex !== -1) {
      return content.substring(secondDashIndex + 3).trim();
    }
  }
  return content;
}

copyRules();
