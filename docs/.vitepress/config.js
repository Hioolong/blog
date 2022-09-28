import { defineConfig } from "vitepress"
export default defineConfig({
    title: "Ronney's Blog",
    description: '小浪同学的博客',
    author: 'Ronney Wong',
    base: '/',
    markdown: {
        lineNumbers: true
    },
    lastUpdated: true,
    themeConfig: {
        logo: '/public/logo.svg',
        footer: {
            message: 'Copyright © 2022-present Ronney Wong',
            copyright: `<a href='https://beian.miit.gov.cn/#/Integrated/index'>粤ICP备2021161765号</a>`
        }
    }
})