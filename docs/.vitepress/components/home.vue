<script setup>
import { useData } from 'vitepress'
const data = useData()
console.log(123, data);
</script>

<template>
<div class="home">首页</div>
</template>

<style lang="less" scoped>
.home {
    // color: red;
}
</style>