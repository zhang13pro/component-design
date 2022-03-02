import * as acorn from "acorn";

/**
 * 解析雅图公式
 */
class CAD {
  static CASE(...args: number[]): number {
    if (args.length % 2 !== 1) {
      throw new Error("args length is illegal.");
    }
    const count = Math.floor(args.length / 2);
    for (let i = 0; i < count; i++) {
      if (args[i * 2 + 1]) {
        return args[i * 2];
      }
    }
    return args[args.length - 1];
  }

  static ROUNDDOWN(value: number, delta: number): number {
    const scale = 1000;
    value *= scale;
    delta *= scale;
    if (value % delta === 0) {
      return value / scale;
    } else {
      return (Math.floor(value / delta) * delta) / scale;
    }
  }

  static ROUNDUP(value: number, delta: number): number {
    const scale = 1000;
    value *= scale;
    delta *= scale;
    if (value % delta === 0) {
      return value / scale;
    } else {
      return (Math.ceil(value / delta) * delta) / scale;
    }
  }

  /**
   * 四舍五入
   * ROUND(3.5) = 4
   * ROUND(3.88, 0.1) = 3.9
   * ROUND(3.47, 0.5) = 3.5
   * @param value
   * @param delta
   * @constructor
   */
  static ROUND(value: number, delta = 1): number {
    const scale = 1000;
    value *= scale;
    delta *= scale;

    const remainder = value % delta; // 余数
    if (remainder === 0) {
      return value / scale;
    } else {
      const times = Math.floor(value / delta) + Number(remainder >= delta / 2);
      return (times * delta) / scale;
    }
  }

  static MIN(...params: number[]) {
    return Math.min(...params);
  }

  static MAX(...params: number[]) {
    return Math.max(...params);
  }

  static SQRT(param: number) {
    return Math.sqrt(param);
  }

  static ARCTAN(param: number) {
    return (Math.atan(param) * 180) / Math.PI;
  }

  static TAN(param: number) {
    return Math.tan((param / 180) * Math.PI);
  }

  static ARCSIN(param: number) {
    return (Math.asin(param) * 180) / Math.PI;
  }

  static SIN(param: number) {
    return Math.sin((param / 180) * Math.PI);
  }

  static ARCCOS(param: number) {
    return (Math.atan(param) * 180) / Math.PI;
  }

  static COS(param: number) {
    return Math.cos((param / 180) * Math.PI);
  }

  /**
   * 第一个参数是当前值，第二个是最小值，第三个是最大值，这个当前的值只能在min -> max 这个区间内
   * @param current
   * @param min
   * @param max
   * @constructor
   */
  static MINMAX(current: number, min: number, max: number) {
    if (max < min && max >= 0) {
      min = Math.min(min, max);
    }
    return Math.max(Math.min(current, max), min);
  }

  static STEP(detectVar: number, ...list: number[]): number {
    let index = 0;
    for (; index < list.length - 1; index += 2) {
      if (detectVar < list[index + 1]) {
        return list[index];
      }
    }
    return list[index];
  }

  static STEPUP(detectVar: number, ...list: number[]): number {
    let index = 0;
    for (; index < list.length - 1; index += 2) {
      if (detectVar <= list[index + 1]) {
        return list[index];
      }
    }
    return list[index];
  }
}

export interface CheckResItem {
  current: number;
  min: number;
  max: number;
  varName: string; // 变量中文名字
}

export interface AdditionParams {
  MINMAXCheckVarName: string;
  MINMAXCheckRes: any[];
}

type FormulaFunc = (
  params: Record<string, any>,
  additionParams?: AdditionParams
) => number;

/**
 * 最外层的MINMAX会额外处理
 * 雅图的公式例子：CASE(0,K=1,MINMAX(ROUND(W/(2*K+1),1)+SW,SW,ROUND(4*W/5-SW,1)),K=2,ROUND(W/(2*K+1),1)+SW)
 * 在线预览：https://astexplorer.net
 */
export class FormulaParser {
  static getJsFunc(rawFormula: string): FormulaFunc {
    rawFormula = rawFormula.replace(/\bAND\b/g, "&&").replace(/\bOR\b/g, "||");
    const res: any = acorn.parse(rawFormula, { ecmaVersion: 2020 });
    const rootElement = res.body[0];
    if (rootElement.type !== "ExpressionStatement") {
      throw new Error("Formula is illegal.");
    }
    return this.recursiveExec(rootElement.expression, rawFormula);
  }

  static getJsFuncNew(rawFormula: string): FormulaFunc {
    const result = this.getNormalFormula(rawFormula);
    return function (params, addition): number {
      const args = result.paramOrder.join(","); // 参数列表
      const body = result.normalFormula;
      const realParams: string[] = result.paramOrder.map(
        (item) => params[item]
      );
      return new Function(args, `return ${body}`).apply(CAD, realParams);
    };
  }

  /**
   * ROUND(2+CCAL,0.05)) 变成 this.ROUND(2+CCAL,0.05))
   * 变量顺序需要注意
   * @param rawFormula
   * @private
   */
  private static getNormalFormula(rawFormula: string): {
    normalFormula: string;
    paramOrder: string[];
  } {
    rawFormula = rawFormula.replace(/\bAND\b/g, "&&").replace(/\bOR\b/g, "||");
    const tokenList = acorn.tokenizer(rawFormula, { ecmaVersion: 2020 });
    const methodSet = new Set(Object.getOwnPropertyNames(CAD));
    methodSet.delete("name");
    methodSet.delete("prototype");
    let normalFormula = "";
    const paramOrder: string[] = [];
    // acorn.tokTypes.relational 关系运算符
    let reserveSymbolList = [
      acorn.tokTypes.comma,
      acorn.tokTypes.parenL,
      acorn.tokTypes.parenR,
      acorn.tokTypes.logicalAND,
      acorn.tokTypes.logicalOR,
      acorn.tokTypes.plusMin,
      acorn.tokTypes.star,
      acorn.tokTypes.slash,
      acorn.tokTypes.relational,
    ];
    for (let token of tokenList) {
      if (token.type === acorn.tokTypes.eof) {
        break;
      } else if (token.type === acorn.tokTypes.name) {
        if (methodSet.has(token.value)) {
          // 方法
          normalFormula += `this.${token.value.toString()}`;
        } else {
          // 变量
          const tokenName = token.value.toString();
          if (!paramOrder.includes(tokenName)) {
            paramOrder.push(tokenName);
          }
          normalFormula += token.value.toString();
        }
      } else if (token.type === acorn.tokTypes.num) {
        normalFormula += token.value.toString();
      } else if (token.type === acorn.tokTypes.eq) {
        normalFormula += "==";
      } else if (reserveSymbolList.includes(token.type)) {
        normalFormula += token.value
          ? token.value.toString()
          : token.type.label;
      } else {
        throw new Error("not support token" + token.type.label);
      }
    }
    return {
      normalFormula: normalFormula,
      paramOrder: paramOrder,
    };
  }

  private static recursiveExec(ele: any, rawFormula: string): FormulaFunc {
    if (ele.type === "CallExpression") {
      // 调用
      const funcName = ele.callee.name as string;
      let funcParams: FormulaFunc[] = [];
      for (const arg of ele.arguments) {
        funcParams.push(FormulaParser.recursiveExec(arg, rawFormula));
      }
      return function (params, addition): number {
        let realParams: any[] = [];
        for (const funcItem of funcParams) {
          realParams.push(funcItem(params, addition));
        }
        if (
          funcName === "MINMAX" &&
          ele.callee.start === rawFormula.indexOf("MINMAX")
        ) {
          // 最外层MINMAX判断
          if (
            realParams.length === 3 &&
            addition &&
            Array.isArray(addition.MINMAXCheckRes)
          ) {
            const item: CheckResItem = {
              current: realParams[0],
              min: realParams[1],
              max: realParams[2],
              varName: addition.MINMAXCheckVarName,
            };
            addition.MINMAXCheckRes.push(item);
          }
        }
        return CAD[funcName].apply(null, realParams);
      };
    } else if (ele.type === "Identifier") {
      // 变量
      const varName = ele.name;
      return function (params): number {
        if (isNaN(params[varName])) {
          throw new Error(`${varName} value is not found.`);
        }
        return params[varName];
      };
    } else if (ele.type === "Literal") {
      // 常量
      const value = ele.value;
      return function (params): number {
        return value;
      };
    } else if (
      ele.type === "BinaryExpression" ||
      ele.type === "AssignmentExpression" ||
      ele.type === "LogicalExpression"
    ) {
      // 二元运算符
      // 把赋值运算直接当成==
      let operator = ele.operator;
      if (operator === "=") {
        operator = "==";
      }
      const left = ele.left;
      const right = ele.right;
      return function (params, addition): number {
        const leftVal = FormulaParser.recursiveExec(left, rawFormula)(
          params,
          addition
        );
        const rightVal = FormulaParser.recursiveExec(right, rawFormula)(
          params,
          addition
        );
        switch (operator) {
          case "+":
            return leftVal + rightVal;
          case "-":
            return leftVal - rightVal;
          case "*":
            return leftVal * rightVal;
          case "/":
            return leftVal / rightVal;
          case "==":
            return Number(leftVal === rightVal);
          case "<=":
            return Number(leftVal <= rightVal);
          case ">=":
            return Number(leftVal >= rightVal);
          case ">":
            return Number(leftVal > rightVal);
          case "<":
            return Number(leftVal < rightVal);
          case "&&":
            return Number(leftVal && rightVal);
          case "||":
            return Number(leftVal || rightVal);
        }
        return 0;
      };
    }
    throw new Error(`${ele.type} is not supported.`);
  }
}
