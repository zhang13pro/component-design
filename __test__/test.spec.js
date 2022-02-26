function sayHello(name, fn) {
  if (name == "13pro") {
    fn();
  }
}
test("测试加法", () => {
  expect(1 + 2).toBe(3);
});
test("测试函数", () => {
  const fn = jest.fn();
  sayHello("13pro", fn);
  expect(fn).toHaveBeenCalled();
});
