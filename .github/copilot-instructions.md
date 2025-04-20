You are an AI assistant with advanced problem-solving capabilities. Please follow these instructions to execute tasks efficiently and accurately.
First, confirm the instructions you have received from the user:
<instructions>
{{instructions}}
</instructions>
Based on these instructions, please proceed with the following process:

---

## 1. Task Analysis and Planning
<Task Analysis>
- Briefly summarize the main task.
- Review the specified technology stack and consider implementation methods within these constraints.
- Note: Do not change versions listed in the technology stack without approval.
- Identify key requirements and constraints.
- List potential challenges.
- Detail specific steps for task execution.
- Determine the optimal execution order for these steps.

### Preventing Duplicate Implementation
- Before implementation, verify:
- Existence of similar functionality
- Functions or components with identical or similar names
- Duplicate API endpoints
- Processes that could be standardized

Take sufficient time to conduct a thorough and comprehensive analysis, as this section will guide the entire subsequent process.
</Task Analysis>


## 2. Task Execution
- Execute each identified step one by one.
- Briefly report progress after completing each step.
- During implementation, pay attention to:
  - Adherence to appropriate directory structure
  - Consistency in naming conventions
  - Proper placement of common processes

## 3. Quality Control and Problem Resolution
- Quickly verify the results of each task.
- If errors or inconsistencies occur, address them using the following process:
  a. Isolate and identify the cause (analyze logs, check debug information)
  b. Develop and implement countermeasures
  c. Verify functionality after fixes
  d. Review and analyze debug logs
- Record verification results in the following format:
  a. Verification items and expected results
  b. Actual results and discrepancies
  c. Required countermeasures (if applicable)

## 4. Final Verification
- Evaluate the entire deliverable once all tasks are complete.
- Check consistency with the original instructions and make adjustments as needed.
- Perform a final check to ensure no duplicate implementations exist.

## 5. Results Report
Please report the final results in the following format:

```markdown
   # Execution Results Report

   ## Overview
   [Brief summary of the overall work]

   ## Execution Steps
   1. [Description and results of Step 1]
   2. [Description and results of Step 2]
   ...

   ## Final Deliverables
   [Details of deliverables or links if applicable]

   ## Issue Resolution (if applicable)
   - Problems encountered and how they were addressed
   - Points to note for future reference

   ## Notes and Improvement Suggestions
   - [Any observations or suggestions for improvement]
```

## Important Notes
- If anything is unclear, confirm before beginning work.
- Report and seek approval for any significant decisions.
- Immediately report unexpected problems and propose solutions.
- Do not make changes that haven't been explicitly requested. If you believe changes are necessary, first report them as suggestions and obtain approval before implementation.
- UI/UX design changes (layout, colors, fonts, spacing, etc.) are prohibited unless you first provide justification and receive approval.
- Do not change versions of technology stack components (APIs, frameworks, libraries, etc.) without permission. If changes are necessary, clearly explain why and do not proceed until approval is received.

---

# GAS-RULE Rules

# AI-Driven Development Rules for GAS, Bun, Clasp & TypeScript Projects

This document outlines the rules and best practices for developing Google Apps Script (GAS) projects using Bun, Clasp, and TypeScript, with a focus on maintainability and leveraging AI assistance effectively.

## 1. Project Setup

*   **Initialization:** Use `bun init` to set up the `package.json`.
*   **Clasp:**
    *   Log in using `clasp login`.
    *   Create or clone a project using `clasp create --type standalone --rootDir ./dist` or `clasp clone <scriptId> --rootDir ./dist`. Ensure `rootDir` points to the compiled output directory (`dist`).
    *   Configure `.clasp.json` appropriately.
*   **Dependencies:** Use `bun add -d` for development dependencies (e.g., `@types/google-apps-script`, `typescript`, `clasp`). Avoid runtime dependencies unless absolutely necessary and properly bundled.

## 2. Folder Structure

Adhere to the following structure for consistency and maintainability:

```
.
├── .clasp.json         # Clasp project configuration
├── appsscript.json     # GAS manifest file (permissions, etc.)
├── bun.lockb           # Bun lockfile
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── README.md           # Project documentation
├── src/                  # Main source code (TypeScript)
│   ├── index.ts          # Main entry point for globally exposed GAS functions
│   ├── api/              # Handlers for web apps (doGet, doPost) or APIs
│   │   └── *.ts
│   ├── services/         # Business logic, interactions with Google Services (Sheets, Docs, etc.)
│   │   └── *.ts
│   ├── utils/            # Reusable utility functions
│   │   └── *.ts
│   ├── types/            # Custom TypeScript type definitions and interfaces
│   │   └── *.ts
│   └── tests/            # Unit and integration tests (using Bun test)
│       └── *.test.ts
├── dist/                 # Compiled JavaScript code (Target for Clasp)
└── _llm-rules/           # Rules for AI interaction
```

*   Place the `appsscript.json` file in the root directory. Clasp will copy it to `dist` during push.
*   Keep all TypeScript source code within the `src` directory.
*   Organize code logically within `api`, `services`, `utils`, and `types`.

## 3. Coding Standards

*   **TypeScript:** Write all code in TypeScript. Leverage strong typing for better maintainability and error detection.
*   **Global Functions:** Expose necessary functions globally. `src/index.ts` serves as the primary entry point for common global functions. As the project expands, additional entry point files (e.g., `src/library.ts`, `src/admin.ts`) might be created to organize distinct sets of globally exposed functions. However, be mindful that GAS uses a single global namespace. All other logic should be encapsulated in modules or helper functions within `services`, `utils`, etc.
    *   **Example `src/index.ts` (or other entry point):**
        ```typescript
        import { processSheet } from './services/sheetProcessor';
        import { handleGet } from './api/webApp';

        // Make functions available to the GAS environment
        global.doGet = handleGet;
        global.runSheetProcessing = processSheet;

        // Keep internal functions non-global
        function internalHelper() {
          // ... implementation details
        }
        ```
*   **Modularity:** Break down complex logic into smaller, reusable functions. Prefer functional programming approaches; avoid using `class` syntax.
*   **Error Handling:** Implement robust error handling using `try...catch` blocks and descriptive error messages. Log errors using `Logger.log` or `console.error`.
*   **Naming Conventions:** Use camelCase for variables and functions, PascalCase for types/interfaces.
*   **Comments:** Write clear comments for complex logic or public-facing functions. Use TSDoc for documenting functions and interfaces.
*   **GAS Services:** Access GAS services (e.g., `SpreadsheetApp`, `DocumentApp`) within `services` modules, not directly in `api` handlers or `utils` where possible. This promotes separation of concerns.

## 4. Dependency Management & Build

*   **Bun:** Use `bun` for installing dependencies (`bun add`), running scripts (`bun run`), and testing (`bun test`).
*   **Build Script:** Define a build script in `package.json` to compile TypeScript to JavaScript:
```json
"scripts": {
  "clean": "rimraf dist",
  "build": "bun run _tasks/build.ts",
  "postBuild": "bun run _tasks/build.ts",
  "copy": "bun run _tasks/copy.ts",
  "rules": "npm-run-all rules:*",
  "rules:cursor": "bun run _tasks/copy-rules.ts cursor",
  "rules:windsurf": "bun run _tasks/copy-rules.ts windsurf",
  "rules:copilot": "bun run _tasks/copy-rules.ts copilot",
  "deploy": "npm-run-all copy postBuild clasp:push",
  "release": "npm-run-all copy postBuild clasp:push",
  "clasp:push": "clasp push -f",
  "clasp:open": "clasp open",
  "clasp:login": "clasp login",
  "clasp:clone": "clasp clone",
  "format": "npm-run-all format:*",
  "format:src": "bunx @biomejs/biome format --write src",
  "format:task": "bunx @biomejs/biome format --write _tasks",
  "lint": "npm-run-all lint:*",
  "lint:src": "bunx @biomejs/biome lint --write src",
  "lint:task": "bunx @biomejs/biome lint --write _tasks",
  "check": "bunx tsc --noEmit && npm-run-all lint:*",
  "check:src": "bunx @biomejs/biome check --write src",
  "check:task": "bunx @biomejs/biome check --write _tasks"
}
```

## 5. Testing

*   **Bun Test:** Use `bun test` for running unit tests.
*   **Location:** Place test files alongside the code they test or within the `src/tests` directory, using the `.test.ts` extension.
*   **Mocking:** Mock GAS global objects and services for isolated unit testing. Libraries like `jest-mock` (compatible with Bun test) can be helpful.
*   **Focus:** Prioritize testing business logic in `services` and complex logic in `utils`.

## 6. Deployment

*   **Build:** Use `bun run build` to compile TypeScript to JavaScript.
*   **Clasp Deploy:** Use `clasp deploy` to create immutable deployments for versioning (e.g., for Add-ons or Web Apps). Define deployment descriptions clearly.
*   **Check:** Use `bun run check` to run type checking and linting.
*   **Manifest:** Manage permissions and configurations in `appsscript.json`. Keep it version-controlled.