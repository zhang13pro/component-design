module.exports = {
  transform: {
    "^.+\\.vue$": "vue-jest", // vue-jest 处理.vue
    "^.+\\.jsx?$": "babel-jest", // babel-jest处理js or jsx
    "^.+\\.tsx?$": "ts-jest", // ts-jest 处理.ts .tsx
  },
  testMatch: ["**/?(*.)+(spec).[jt]s?(x)"], // Jest 只会执行.spec.js 结尾的文件
  collectCoverage: true,
  coverageReporters: ["json", "html"],
}
