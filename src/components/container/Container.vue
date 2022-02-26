<template>
  <section class="el-container" :class="{ 'is-vertical': isVertical }">
    <slot />
  </section>
</template>

<script lang="ts">
export default {
  name: "ElContainer",
};
</script>
<script setup lang="ts">
import { useSlots, computed, VNode, Component } from "vue";

type Props = {
  direction?: string;
};

const props = defineProps<Props>();
const slots = useSlots();
// 存在Header或Footer组件显示垂直居中，否则水平居中
const isVertical = computed(() => {
  if (slots && slots.default) {
    return slots.default().some((vn: VNode) => {
      // as 类型断言
      const tag = (vn.type as Component).name;
      return tag === "ElHeader" || tag === "ElFooter";
    });
  } else {
    return props.direction === "vertical";
  }
});
</script>

<style lang="scss">
@import "../styles/mixin.scss";

@include b(container) {
  display: flex;
  flex-direction: row;
  flex: 1;
  flex-basis: auto;
  box-sizing: border-box;
  min-width: 0;

  @include when(vertical) {
    flex-direction: column;
  }
}
</style>
