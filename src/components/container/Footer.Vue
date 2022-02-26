<template>
  <footer class="el-footer" :style="{ height, width }">
    <slot />
  </footer>
</template>

<script lang="ts">
export default {
  name: "ElFooter",
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

@include b(footer) {
  padding: $--footer-padding;
  box-sizing: border-box;
  flex-shrink: 0;
}
</style>
