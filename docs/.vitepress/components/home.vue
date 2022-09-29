<script setup>
import { useData } from 'vitepress'
const data = useData()
</script>

<template>
<div class="home">
    <h1>继续往天飞</h1>
    <h1 style="margin-top: 50px;">再去遁地</h1>
</div>
</template>

<style lang="less" scoped>
.home {
    height: 100vh;
    background: url('/bg.svg') center center / cover no-repeat;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: var(--vp-nav-height-negative-desktop);
}
h1 {
    font-size: 40px;
    line-height: 40px;
}
</style>