---
description: Google Apps Script coding rule
globs: 
alwaysApply: true
---

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