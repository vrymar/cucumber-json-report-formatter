import { Formatter } from "../formatter";
import * as fs from "node:fs";

const formatter = new Formatter();
const TEST_DIR = "./src/tests/";
const SOURCE_FILE = TEST_DIR + "reports/cucumber-messages.ndjson";
const OUTPUT_FILE = TEST_DIR + "reports/cucumber-report-test.json";
let JSONResult;

beforeAll(async () => {
  await formatter.parseCucumberJson(SOURCE_FILE, OUTPUT_FILE);
  const result = fs.readFileSync(OUTPUT_FILE, "utf8");
  JSONResult = JSON.parse(result);
});

afterAll(async () => {
  fs.unlink(OUTPUT_FILE, () => {
    return;
  });
});

test("formatter - interpretation of cucumber rule keyword", async () => {
  expect(JSONResult[0].elements[0].id).toEqual(
    "Weather App vital tests;TownSelection - Douala"
  );
  expect(JSONResult[0].elements[1].id).toEqual(
    "Weather App vital tests;Rule 1 example;Homepage"
  );
  expect(JSONResult[0].elements[2].id).toEqual(
    'Weather App vital tests;Rule 1 example;Weather - "Nothing to display" must be displayed'
  );
  expect(JSONResult[0].elements[3].id).toEqual(
    "Weather App vital tests;Rule 2 example;Weather - Town List must be ok"
  );
});

test("formatter - produces expected top-level feature structure", async () => {
  expect(Array.isArray(JSONResult)).toBe(true);
  expect(JSONResult.length).toBeGreaterThan(0);

  const feature = JSONResult[0];
  expect(feature).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      keyword: expect.any(String),
      name: expect.any(String),
      uri: expect.any(String),
      elements: expect.any(Array),
    })
  );
  expect(feature.elements.length).toBeGreaterThan(0);
});

test("formatter - produces scenarios with step arrays and required fields", async () => {
  const scenarios = JSONResult[0].elements;

  scenarios.forEach((scenario) => {
    expect(scenario).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        keyword: expect.any(String),
        name: expect.any(String),
        type: expect.any(String),
        steps: expect.any(Array),
      })
    );
    expect(scenario.steps.length).toBeGreaterThan(0);
  });
});

test("formatter - normalizes step result status to lowercase", async () => {
  const allSteps = JSONResult[0].elements.flatMap((scenario) => scenario.steps);

  expect(allSteps.length).toBeGreaterThan(0);
  allSteps.forEach((step) => {
    expect(step.result).toEqual(
      expect.objectContaining({
        status: expect.any(String),
        duration: expect.any(Number),
      })
    );
    expect(step.result.status).toBe(step.result.status.toLowerCase());
  });
});
