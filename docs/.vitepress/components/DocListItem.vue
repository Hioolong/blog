<script lang="ts" setup>
    import { useRouter } from 'vitepress'
    const router = useRouter()
    const props = defineProps({
        title: String,
        author: String,
        date: String,
        tags: {
            type: Array,
            default: () => []
        },
        link: String
    })
    const onItemClick = () => {
        router.go(props.link)
    }
</script>

<template>
    <div class="doc-list-item" @click="onItemClick">
        <div class="title">{{ title }}</div>
        <div class="bar">
            <div>💁‍♂️ {{ author }}</div>
            <div>📅 {{ date }}</div>
            <div class="tags">
                🏷 <span v-for="tag in tags">{{tag}}</span>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
    .doc-list-item {
        width: 100%;
        overflow: hidden;
        border-radius: 6px;
        box-shadow: var(--box-shadow);
        box-sizing: border-box;
        background-color: var(--vp-c-bg);
        margin: 0 auto 20px;
        padding: 16px 20px;
        cursor: pointer;
        .title {
            position: relative;
            font-size: 20px;
            font-weight: 500;
            line-height: 46px;
            margin-bottom: 10px;
            width: fit-content;
            &:hover {
                color: var(--vp-c-green);
                &:after {
                    visibility: visible;
                    transform: scaleX(1);
                }
            }
        }
        .title::after {
            content: "";
            position: absolute;
            width: 100%;
            height: 2px;
            bottom: 0;
            left: 0;
            background-color: var(--vp-c-green);
            visibility: hidden;
            transform: scaleX(0);
            transition: .3s ease-in-out;
        }
        &:hover {
            box-shadow: var(--box-shadow-hover);
        }
        .bar {
            display: flex;
            align-items: center;
            & > div:not(:first-child) {
                margin-left: 20px;
            }
            .tags > span {
                margin-left: 6px;
            }
        }
    }

</style>