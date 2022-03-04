<!-- 整个表单组件的容器，负责管理每一个 el-form-item 组件的校验方法，提供检查所有输入项的 validate 方法 -->
<template>
  <div class="el-form">
    <slot />
  </div>
</template>

<script lang="ts">
export default {
  name: "ElForm",
}
</script>

<script setup lang="ts">
import { PropType, provide } from "vue"
import { Rules } from "async-validator"
import { ref } from "vue"
import { emitter } from "../../emitter"
import { FormItem, key } from "./type"

const props = defineProps({
  model: { type: Object, required: true },
  rules: { type: Object as PropType<Rules> },
})

provide(key, {
  model: props.model,
  rules: props.rules,
})

const items = ref<FormItem[]>([])

emitter.on("addFormItem", (item) => {
  items.value.push(item)
})

function validate(cb: (isValid: boolean) => void) {
  const tasks = items.value.map((item) => item.validate())
  Promise.all(tasks)
    .then(() => {
      cb(true)
    })
    .catch(() => {
      cb(false)
    })
}

defineExpose({
  validate,
})
</script>

<style lang="scss">
@import "../styles/mixin";

@include b(form) {
  margin-top: 20px;
  box-sizing: border-box;
  flex-shrink: 0;
  width: 300px;
}
</style>
