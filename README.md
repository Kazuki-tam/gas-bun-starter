# gas-bun-starter

gas-bun-starter is a starter kit that uses Bun for Google Apps Script.

## Status

[![Release (latest by date)](https://img.shields.io/github/v/release/Kazuki-tam/gas-bun-starter)](https://github.com/Kazuki-tam/gas-bun-starter/releases/tag/v0.0.1)
[![Issues](https://img.shields.io/github/issues/Kazuki-tam/gas-bun-starter)](https://github.com/Kazuki-tam/gas-bun-starter/issues)
![Maintenance](https://img.shields.io/maintenance/yes/2025)
![Release date](https://img.shields.io/github/release-date/Kazuki-tam/gas-bun-starter)

## Features
- Just deploy this project code without development
- Develop, test, and bundle TypeScript with Bun
- Format and lint with Biome
- Support Cursor, Windsurf, and Copilot

## Main dependencies

- [Google Apps Script](https://workspace.google.co.jp/intl/ja/products/apps-script/)
- [Clasp](https://github.com/google/clasp)
- [Biome](https://biomejs.dev/)

## Prerequisites

Bun is required to run this project. You can install it from [Bun's official website](https://bun.sh/docs/installation).

## How to use

Clone this repository and install dependencies.

```bash
bun install
```

### Login google account

```shell
bun run clasp:login
```

### Connect to your existing project

Create a `.clasp.json` at the root, and then Add these settings.
Open the App script from your spreadsheet and check out a script ID on the settings page.

```json
{
  "scriptId": "<SCRIPT_ID>",
  "rootDir": "./dist"
}
```

```bash
cp .clasp.example.json .clasp.json
```

Deploy your code to the existing project.

```shell
bun run deploy
```

## Available Commands

Build your project.

```shell
bun run build
```

Build your local project files and deploy them to the remote project.

```shell
bun run deploy
```

Open the current directory's clasp project on script.google.com.

```shell
bun run clasp:open
```

Format and lint your project files.

```shell
bun run check
```

## License
MIT