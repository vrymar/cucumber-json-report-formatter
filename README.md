# Cucumber JSON Report Formatter

Convert `cucumber-messages.ndjson` output (for example from `@badeball/cypress-cucumber-preprocessor`) into a classic Cucumber JSON report structure.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API](#api)
- [Development](#development)
- [License](#license)

## Overview

`cucumber-json-report-formatter` reads an NDJSON stream of Cucumber messages and produces a JSON report array that follows the traditional Cucumber report shape (`features -> scenarios -> steps`).

## Features

- Converts message envelopes (`gherkinDocument`, `pickle`, `testCase`, `testStepFinished`, `attachment`, `stepDefinition`) into report-ready JSON.
- Supports standard scenarios, scenario outlines, backgrounds, and rule-scoped scenarios.
- Resolves scenario outline placeholders from examples.
- Maps step execution status and duration into classic Cucumber step result fields.
- Includes step attachments and matched step-definition locations.

## Requirements

- Node.js `>=24.0.0`

## Installation

```bash
npm i cucumber-json-report-formatter
```

## Quick Start

```js
import { Formatter } from "cucumber-json-report-formatter";

const formatter = new Formatter();
const sourceFile = "./cucumber-messages.ndjson";
const outputFile = "./reports/cucumber-report.json";

await formatter.parseCucumberJson(sourceFile, outputFile);
```

CommonJS:

```js
const { Formatter } = require("cucumber-json-report-formatter");
```

## API

### `new Formatter()`

Creates a formatter instance.

### `await formatter.parseCucumberJson(sourceFile, outputFile)`

Reads NDJSON input from `sourceFile`, builds formatted Cucumber JSON, and writes the result to `outputFile`.

- `sourceFile` (`string`): path to a messages NDJSON file.
- `outputFile` (`string`): path where formatted JSON report is written.
- Returns: `Promise<void>`


## Development

Install dependencies:

```bash
npm install
```

Build:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Lint:

```bash
npm run eslint
```


## License

MIT
