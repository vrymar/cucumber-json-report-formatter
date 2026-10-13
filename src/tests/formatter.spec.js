const assert = require('node:assert/strict');
const fs = require('node:fs');
const {after, before, test} = require('node:test');

const {Formatter} = require('../../lib');

const formatter = new Formatter();
const TEST_DIR = './src/tests/';
const SOURCE_FILE = `${TEST_DIR}reports/cucumber-messages.ndjson`;
const OUTPUT_FILE = `${TEST_DIR}reports/cucumber-report-test.json`;
let jsonResult;

before(async () => {
  await formatter.parseCucumberJson(SOURCE_FILE, OUTPUT_FILE);
  jsonResult = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
});

after(() => {
  fs.rmSync(OUTPUT_FILE, {force: true});
});

test('formatter interprets Cucumber rule keywords', () => {
  assert.deepEqual(
    jsonResult[0].elements.map(({id}) => id),
    [
      'Weather App vital tests;TownSelection - Douala',
      'Weather App vital tests;Rule 1 example;Homepage',
      'Weather App vital tests;Rule 1 example;Weather - "Nothing to display" must be displayed',
      'Weather App vital tests;Rule 2 example;Weather - Town List must be ok',
    ],
  );
});

test('formatter produces the expected feature and scenario structure', () => {
  assert.ok(Array.isArray(jsonResult));
  assert.ok(jsonResult.length > 0);

  const feature = jsonResult[0];
  assert.equal(typeof feature.id, 'string');
  assert.equal(typeof feature.keyword, 'string');
  assert.equal(typeof feature.name, 'string');
  assert.equal(typeof feature.uri, 'string');
  assert.ok(Array.isArray(feature.elements));
  assert.ok(feature.elements.length > 0);

  feature.elements.forEach((scenario) => {
    assert.equal(typeof scenario.id, 'string');
    assert.equal(typeof scenario.keyword, 'string');
    assert.equal(typeof scenario.name, 'string');
    assert.equal(typeof scenario.type, 'string');
    assert.ok(Array.isArray(scenario.steps));
    assert.ok(scenario.steps.length > 0);
  });
});

test('formatter normalizes step results and prepends background steps', () => {
  const scenarios = jsonResult[0].elements.filter(({type}) => type === 'scenario');
  const allSteps = scenarios.flatMap(({steps}) => steps);

  assert.ok(allSteps.length > 0);
  allSteps.forEach(({result}) => {
    assert.equal(typeof result.status, 'string');
    assert.equal(typeof result.duration, 'number');
    assert.equal(result.status, result.status.toLowerCase());
  });

  scenarios.forEach(({steps}) => {
    assert.equal(steps[0].keyword, 'Given ');
    assert.equal(steps[0].name, 'I visit path "https://e2e-test-quest.github.io/weather-app/"');
  });
});
