<script setup lang="ts">
import { useDocsData } from '../data/useDocsData'
import DocsListItem from './DocListItem.vue'

const { data } = useDocsData()
</script>

<template>
    <div class="doc-list-wrapper">
        <div class="left">
            <DocsListItem
                v-for="(item, index) in data"
                :key="index"
                :title="item.title"
                :author="item.author"
                :date="item.date"
                :tags="item.tags"
                :link="item.link"
            />
        </div>
        <div class="right">
            
        </div>
    </div>
</template>

<style lang="less" scoped>
.doc-list-wrapper {
    display: flex;
    align-items: flex-start;
    margin: 20px auto 0;
    padding: 0 20px;
    max-width: 1126px;
}
@media (max-width: 719px) {
    .doc-list-wrapper {
        display: block !important;
    }
}
.left {
    flex: 1;
}
.right {
    flex: 0 0 300px;
    height: 300px;
    background-color: var(--vp-c-bg);
    margin-left: 16px;
    border-radius: 6px;
}
</style>