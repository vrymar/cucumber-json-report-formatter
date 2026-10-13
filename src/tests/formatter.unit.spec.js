const assert = require('node:assert/strict');
const {describe, test} = require('node:test');

const {Formatter} = require('../../lib/formatter.js');
const {Helper} = require('../../lib/helper.js');

describe('Formatter utility methods', () => {
  const formatter = new Formatter();

  test('createScenarioJson replaces outline placeholders with example values', () => {
    const scenarioJson = formatter.createScenarioJson(
      {name: 'Weather App'},
      {
        name: 'Search for <city> in <country>',
        description: 'outline scenario',
        keyword: 'Scenario Outline',
        location: {line: 10},
        tags: [{name: '@smoke'}],
        examples: [{
          tableHeader: {cells: [{value: 'city'}, {value: 'country'}]},
          tableBody: [{cells: [{value: 'Kyiv'}, {value: 'Ukraine'}]}],
        }],
      },
      [],
      'scenario',
      0,
    );

    assert.equal(scenarioJson.name, 'Search for Kyiv in Ukraine');
    assert.equal(scenarioJson.id, 'Weather App;Search for Kyiv in Ukraine');
    assert.deepEqual(scenarioJson.tags, [{name: '@smoke'}]);
  });

  test('convertTotalRunDurationToNanos returns summed nanoseconds', () => {
    assert.equal(formatter.convertTotalRunDurationToNanos({seconds: 2, nanos: 123}), 2000000123);
  });

  test('getTestStepFinishedResult normalizes status and retains the message', () => {
    const result = formatter.getTestStepFinishedResult([
      JSON.stringify({
        testStepFinished: {
          testStepResult: {
            duration: {seconds: 1, nanos: 5},
            status: 'FAILED',
            message: 'Assertion error',
          },
          testStepId: 'target-step',
        },
      }),
    ], 'target-step');

    assert.deepEqual(result, {
      status: 'failed',
      duration: 1000000005,
      error_message: 'Assertion error',
    });
  });

  test('getStepResult resolves a test step ID that differs from its pickle step ID', () => {
    const report = [
      JSON.stringify({
        pickle: {
          id: 'pickle-case-1',
          steps: [{id: 'pickle-step-1', astNodeIds: ['ast-step-1']}],
        },
      }),
      JSON.stringify({
        testCase: {
          id: 'case-1',
          pickleId: 'pickle-case-1',
          testSteps: [{id: 'test-step-1', pickleStepId: 'pickle-step-1'}],
        },
      }),
      JSON.stringify({
        testStepFinished: {
          testStepId: 'test-step-1',
          testStepResult: {
            duration: {seconds: 0, nanos: 1500},
            status: 'PASSED',
          },
        },
      }),
    ];

    assert.deepEqual(formatter.getStepResult('ast-step-1', report, 0), {
      status: 'passed',
      duration: 1500,
      error_message: undefined,
    });
  });

  test('maps comments and attachments', () => {
    assert.deepEqual(formatter.getComments([
      {location: {line: 7}, text: 'first comment'},
      {location: {line: 9}, text: 'second comment'},
    ]), [
      {line: 7, value: 'first comment'},
      {line: 9, value: 'second comment'},
    ]);

    const attachment = JSON.stringify({
      attachment: {
        body: 'encoded-data',
        contentEncoding: 'BASE64',
        mediaType: 'image/png',
        testStepId: 'target-step',
      },
    });
    assert.deepEqual(formatter.getAttachments([attachment], 'target-step'), [{
      data: 'encoded-data',
      mime_type: 'image/png',
      contentEncoding: 'BASE64',
    }]);
  });

  test('safely ignores step lookups without a source report', () => {
    const originalConsoleError = console.error;
    const errors = [];
    console.error = (...args) => errors.push(args);

    try {
      assert.equal(formatter.getStepText('step', undefined, 0), undefined);
      assert.equal(formatter.getStepResult('step', undefined, 0), undefined);
      assert.equal(formatter.matchStepDefinitions('step', undefined, 0), undefined);
      assert.equal(formatter.getStepAttachments('step', undefined, 0), undefined);
    } finally {
      console.error = originalConsoleError;
    }

    assert.equal(errors.length, 4);
  });
});

describe('Helper utility methods', () => {
  const helper = new Helper();

  test('parseJson keeps plain text line content', async () => {
    assert.equal(await helper.parseJson('{"pickle":{"id":"p1"}}'), '{"pickle":{"id":"p1"}}');
  });

  test('getJsonFromArray returns only matching envelopes', () => {
    assert.deepEqual(helper.getJsonFromArray([
      '{"pickle":{"id":"p1"}}',
      '{"testStepFinished":{"id":"t1"}}',
      '{"pickle":{"id":"p2"}}',
    ], 'pickle'), [
      '{"pickle":{"id":"p1"}}',
      '{"pickle":{"id":"p2"}}',
    ]);
  });
});
