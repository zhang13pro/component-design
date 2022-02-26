function add(x, y) {
  if (Number(x) == x && Number(y) == y) {
    return Number(x) + Number(y);
  } else if (typeof x == "object" && typeof y == "object") {
    return Object.assign({}, x, y);
  }
  return x + y;
}

function expect(ret) {
  return {
    toBe(arg) {
      if (ret !== arg) {
        throw Error(`预计和实际不符,预期是${arg}，实际是${ret}`);
      }
    },
    toEqual(arg) {
      const argString = JSON.stringify(arg);
      const retString = JSON.stringify(ret);
      if (retString !== argString) {
        throw Error(`预计和实际不符,预期仕${argString}，实际是${retString}`);
      }
    },
  };
}
function test(title, fn) {
  try {
    fn();
    console.log(title, "测试通过");
  } catch (e) {
    console.log(e);
    console.error(title, "测试失败");
  }
}
test("测试数字相加", () => {
  expect(add(1, 2)).toBe(3);
});

test("测试数字和字符串数字想加", () => {
  expect(add(1, "2")).toBe(3);
});

test("测试字符串加", () => {
  expect(add("1", "2")).toBe(3);
});

test("对象的想加", () => {
  expect(add({ name: "vue" }, { age: 8 })).toEqual({ name: "vue", age: 8 });
});
