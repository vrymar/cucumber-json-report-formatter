import { Formatter } from "../formatter";
import * as fs from 'fs';

const formatter = new Formatter()
const TEST_DIR = "./src/tests/";
const SOURCE_FILE = TEST_DIR + "reports/cucumber-messages.ndjson"
const OUTPUT_FILE = TEST_DIR + "reports/cucumber-report-test.json"
let JSONResult;

beforeAll(async () => {
  {
    await formatter.parseCucumberJson(SOURCE_FILE, OUTPUT_FILE)
    const result = fs.readFileSync(OUTPUT_FILE,"utf8");
    JSONResult = JSON.parse(result);
  }
})
afterAll(async () => {
  fs.unlink(OUTPUT_FILE, () => {return})
})
test("formatter - interpretation of cucumber rule keyword", async () => {
  expect(JSONResult[0].elements[0].id).toEqual("Weather App vital tests;TownSelection - Douala");
  expect(JSONResult[0].elements[1].id).toEqual("Weather App vital tests;Rule 1 example;Homepage");
  expect(JSONResult[0].elements[2].id).toEqual("Weather App vital tests;Rule 1 example;Weather - \"Nothing to display\" must be displayed");
  expect(JSONResult[0].elements[3].id).toEqual("Weather App vital tests;Rule 2 example;Weather - Town List must be ok");
});
