import { defineConfig } from "vitepress";

export default defineConfig({
	title: "Ronney's Blog",
	description: "小浪同学的博客",
	base: "/blog",
	markdown: {
		lineNumbers: true,
	},
	head: [["link", { rel: "icon", href: "/favicon.ico" }]],
	lastUpdated: true,
	themeConfig: {
		logo: "/logo.svg",
		socialLinks: [
			{
				icon: "github",
				link: "https://github.com/Hioolong/blog",
			},
		],
		footer: {
			message: "Copyright © 2022-present Ronney Wong",
			copyright: `<a href='https://beian.miit.gov.cn/#/Integrated/index'>粤ICP备2021161765号</a>`,
		},
	},
});
