<template>
  <header class="el-header" :style="{ height, width }">
    <slot />
  </header>
</template>

<script lang="ts">
export default {
  name: "ElHeader",
};
</script>
<script setup lang="ts">
type Props = {
  height?: string;
  width?: string;
};

withDefaults(defineProps<Props>(), {
  height: "60px",
});
</script>

<style lang="scss">
@import "../styles/mixin.scss";

@include b(header) {
  box-sizing: border-box;
  padding: $--header-padding;
  flex-shrink: 0;
  background-color: $--color-primary;
}
</style>
