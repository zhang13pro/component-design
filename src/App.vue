<template>
  <el-container>
    <el-header>Header</el-header>
    <el-main>Main</el-main>
    <el-footer>Footer</el-footer>
  </el-container>
  <hr />

  <el-container>
    <el-header>Header</el-header>
    <el-container>
      <el-aside width="200px">Aside</el-aside>
      <el-main>Main</el-main>
    </el-container>
  </el-container>
  <hr />

  <el-container>
    <el-aside width="200px">
      <el-button size="large">Aside</el-button>
    </el-aside>
    <el-container>
      <el-header>Header</el-header>
      <el-main>Main</el-main>
      <el-footer>Footer</el-footer>
    </el-container>
  </el-container>

  <el-form>
    <el-form-item>
      <el-input></el-input>
      <el-input></el-input>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts"></script>

<style>
body {
  width: 1000px;
  margin: 10px auto;
}
</style>
