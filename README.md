# gas-bun-starter

gas-bun-starter is a starter kit that uses Bun for Google Apps Script.

## Status

[![Release (latest by date)](https://img.shields.io/github/v/release/Kazuki-tam/gas-bun-starter)](https://github.com/Kazuki-tam/gas-bun-starter/releases/tag/v0.0.1)
[![Issues](https://img.shields.io/github/issues/Kazuki-tam/gas-bun-starter)](https://github.com/Kazuki-tam/gas-bun-starter/issues)
![Maintenance](https://img.shields.io/maintenance/yes/2024)
![Release date](https://img.shields.io/github/release-date/Kazuki-tam/gas-bun-starter)

## Features
- Just deploy this project code without development
- Develop, test, run, and bundle JavaScript & TypeScript with Bun

## Main dependencies

- [Google Apps Script](https://workspace.google.co.jp/intl/ja/products/apps-script/)
- [Clasp](https://github.com/google/clasp)

## Prerequisites

- [Bun](https://bun.sh/)

## How to use

Clone this repository and install dependencies.

```bash
bun install
```

### Login google account

```shell
bun clasp:login
```

### Connect to your exiting project

Create a `.clasp.json` at the root, and then Add these settings.
Open App script from your spreadsheet and check out a script Id at the setting page.

```json
{
  "scriptId": "<SCRIPT_ID>",
  "rootDir": "./dist"
}
```

Deploy your code to the existing project.

```shell
bun release
```

## Available Commands

Build your project.

```shell
bun postBuild
```

Build your project files and force writes all local files to script.google.com.

```shell
bun release
```

Open the current directory's clasp project on script.google.com.

```shell
bun clasp:open
```

## License
MIT