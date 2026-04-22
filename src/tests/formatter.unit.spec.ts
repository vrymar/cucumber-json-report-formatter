import { Formatter } from "../formatter";
import { Helper } from "../helper";

describe("Formatter utility methods", () => {
  const formatter = new Formatter();

  test("createScenarioJson replaces outline placeholders with example values", () => {
    const feature = { name: "Weather App" };
    const scenario = {
      name: "Search for <city> in <country>",
      description: "outline scenario",
      keyword: "Scenario Outline",
      location: { line: 10 },
      tags: [{ name: "@smoke" }],
      examples: [
        {
          tableHeader: { cells: [{ value: "city" }, { value: "country" }] },
          tableBody: [{ cells: [{ value: "Kyiv" }, { value: "Ukraine" }] }],
        },
      ],
    };

    const scenarioJson = formatter.createScenarioJson(
      feature,
      scenario,
      [],
      "scenario",
      0
    );

    expect(scenarioJson.name).toBe("Search for Kyiv in Ukraine");
    expect(scenarioJson.id).toBe("Weather App;Search for Kyiv in Ukraine");
    expect(scenarioJson.tags).toEqual([{ name: "@smoke" }]);
  });

  test("convertTotalRunDurationToNanos returns summed nanoseconds", () => {
    const result = formatter.convertTotalRunDurationToNanos({
      seconds: 2,
      nanos: 123,
    });

    expect(result).toBe(2000000123);
  });

  test("getTestStepFinishedResult lowercases status and keeps message", () => {
    const testStepFinishedJson = [
      JSON.stringify({
        testStepFinished: {
          testStepResult: {
            duration: { seconds: 1, nanos: 5 },
            status: "FAILED",
            message: "Assertion error",
          },
          testStepId: "target-step",
        },
      }),
    ];

    const result = formatter.getTestStepFinishedResult(
      testStepFinishedJson,
      "target-step"
    );

    expect(result).toEqual({
      status: "failed",
      duration: 1000000005,
      error_message: "Assertion error",
    });
  });

  test("getStepResult resolves status when testStepId differs from pickleStepId", () => {
    const report = [
      JSON.stringify({
        pickle: {
          id: "pickle-case-1",
          steps: [{ id: "pickle-step-1", astNodeIds: ["ast-step-1"] }],
        },
      }),
      JSON.stringify({
        testCase: {
          id: "case-1",
          pickleId: "pickle-case-1",
          testSteps: [{ id: "test-step-1", pickleStepId: "pickle-step-1" }],
        },
      }),
      JSON.stringify({
        testStepFinished: {
          testStepId: "test-step-1",
          testStepResult: {
            duration: { seconds: 0, nanos: 1500 },
            status: "PASSED",
          },
        },
      }),
    ];

    const result = formatter.getStepResult("ast-step-1", report, 0);

    expect(result).toEqual({
      status: "passed",
      duration: 1500,
      error_message: undefined,
    });
  });

  test("getComments returns mapped comments with line and value", () => {
    const comments = formatter.getComments([
      { location: { line: 7 }, text: "first comment" },
      { location: { line: 9 }, text: "second comment" },
    ]);

    expect(comments).toEqual([
      { line: 7, value: "first comment" },
      { line: 9, value: "second comment" },
    ]);
  });
});

describe("Helper utility methods", () => {
  const helper = new Helper();

  test("parseJson keeps plain text line content", async () => {
    const result = await helper.parseJson('{"pickle":{"id":"p1"}}');
    expect(result).toBe('{"pickle":{"id":"p1"}}');
  });

  test("getJsonFromArray returns only entries matching requested envelope", () => {
    const result = helper.getJsonFromArray(
      [
        '{"pickle":{"id":"p1"}}',
        '{"testStepFinished":{"id":"t1"}}',
        '{"pickle":{"id":"p2"}}',
      ],
      "pickle"
    );

    expect(result).toEqual([
      '{"pickle":{"id":"p1"}}',
      '{"pickle":{"id":"p2"}}',
    ]);
  });
});
