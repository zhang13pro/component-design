import { FormulaParser } from "./formula";
import { hrtime } from "process";

describe("formula test suite", () => {
  let example1 =
    "CASE(0,K=1,MINMAX(ROUND(W/(2*K+1),1)+SW,SW,ROUND(4*W/5-SW,1)),K=2,ROUND(W/(2*K+1),1)+SW)";
  test(`cal: ${example1}`, () => {
    const startTime = hrtime.bigint();
    const jsFunc = FormulaParser.getJsFunc(example1);
    expect(
      jsFunc({
        W: 20.5,
        K: 1,
        SW: 8,
      })
    ).toBe(0);

    expect(
      jsFunc({
        W: 119.9,
        K: 1,
        SW: 48,
      })
    ).toBe(0);

    expect(
      jsFunc({
        W: 120,
        K: 2,
        SW: 24,
      })
    ).toBe(48);

    expect(
      jsFunc({
        W: 800,
        K: 3,
        SW: 114,
      })
    ).toBe(228);

    const testTime = hrtime.bigint() - startTime;
    console.log(`one test time ${testTime}ns`);
  });
  let example2 =
    "MINMAX(ROUND(CASE(1.5*CCAL,CCAL<=0.5,CCAL),0.05),0,ROUND(1.5*CCAL,0.05))";
  test(`cal: ${example2}`, () => {
    const startTime = hrtime.bigint();
    expect(
      FormulaParser.getJsFunc(example2)({
        CCAL: 0.5,
      })
    ).toBe(0.75);
    const testTime = hrtime.bigint() - startTime;
    console.log(`one test time ${testTime}ns`);
  });

  let example3 = "MINMAX(CASE(2,(W>8 AND W<=30),3),0,ROUND(W/5,1))";
  test(`cal: ${example3}`, () => {
    expect(
      FormulaParser.getJsFunc(example3)({
        W: 30,
      })
    ).toBe(2);

    expect(
      FormulaParser.getJsFunc(example3)({
        W: 15,
      })
    ).toBe(2);

    expect(
      FormulaParser.getJsFunc(example3)({
        W: 60,
      })
    ).toBe(3);
  });

  let example4 =
    "MINMAX(CASE(ROUND(3+CCAL,0.05),W>=30,ROUND(2+CCAL,0.05)),0,ROUND(MIN(W/3,5+CCAL),0.5))";
  test(`cal: ${example4}`, () => {
    const startTime = hrtime.bigint();
    expect(
      FormulaParser.getJsFunc(example4)({
        CCAL: 0.5,
        W: 60,
      })
    ).toBe(3.5);
    const testTime = hrtime.bigint() - startTime;
    console.log(`one test time ${testTime}ns`);
  });

  let example5 = "STEP(L,ROUND(L/8,1),30,6,65,8,150,11)";
  test(`cal: ${example5}`, () => {
    const startTime = hrtime.bigint();
    const jsFunc = FormulaParser.getJsFunc(example5);

    expect(
      jsFunc({
        L: 15,
      })
    ).toBe(2);

    expect(
      jsFunc({
        L: 30,
      })
    ).toBe(6);

    expect(
      jsFunc({
        L: 40,
      })
    ).toBe(6);

    expect(
      jsFunc({
        L: 120,
      })
    ).toBe(8);

    expect(
      jsFunc({
        L: 160,
      })
    ).toBe(11);

    const testTime = hrtime.bigint() - startTime;
    console.log(`one test time ${testTime}ns`);
  });

  let example6 =
    "MINMAX(CASE(MIN(E/2,Y1/4),L>30,CASE(R,A<=2,Y2,A<=4,G)),STEP(CCAL,L/8,4,6,9,10,12,14),MAX(MIN(L/2,W/2),0))";
  test(`cal: ${example6}`, () => {
    const startTime = hrtime.bigint();
    const jsFunc = FormulaParser.getJsFunc(example6);

    expect(
      jsFunc({
        E: 8,
        Y1: 0.75,
        L: 120,
        R: 0.65,
        A: 38,
        Y2: 0.5,
        G: 16,
        CCAL: 0.5,
        W: 60,
      })
    ).toBe(15);

    const testTime = hrtime.bigint() - startTime;
    console.log(`one test time ${testTime}ns`);
  });
});
