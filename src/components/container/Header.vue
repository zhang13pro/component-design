<template>
  <header class="el-header" :style="{ height }">
    <slot />
  </header>
</template>

<script lang="ts">
export default {
  name: "ElHeader",
};
</script>
<script setup lang="ts">
import { withDefaults } from "vue";

interface Props {
  height?: string;
}
withDefaults(defineProps<Props>(), {
  height: "60px",
});
</script>

<style lang="scss">
@import "@/styles/mixin";

@include b(header) {
  box-sizing: border-box;
  /* padding: $--header-padding; */
  flex-shrink: 0;
}
</style>
