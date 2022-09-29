<script setup>
import { useDocsData } from '../data/useDocsData'
import DocsListItem from './DocListItem.vue'

const { data } = useDocsData()
</script>

<template>
    <div class="doc-list-wrapper">
        <div class="doc-list">
            <DocsListItem
                v-for="(item, index) in data"
                :key="index"
                :title="item.title"
            />
        </div>
    </div>
</template>

<style scoped>
.doc-list-wrapper {
    display: flex;
    align-items: flex-start;
    margin: 20px auto 0;
    padding: 0 20px;
    max-width: 1126px;
}
</style>