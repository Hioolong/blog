const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const allArticles = [];
const frontmatterRegexp = /---(.*?)---/gs;

function parseAllMdFile(filePath) {
	const files = fs.readdirSync(filePath);
	files.map((item) => {
		const itemPath = path.join(filePath, item);
		const type = fs.statSync(itemPath);
		if (type.isDirectory()) {
			parseAllMdFile(itemPath);
		} else {
			const fileContent = fs.readFileSync(itemPath, "utf8");
			const fileInfo = frontmatterRegexp.exec(fileContent);
			frontmatterRegexp.lastIndex = 0;
			if (fileInfo) {
				const fileInfoObj = yaml.load(fileInfo[1]);
				fileInfoObj.link = `/blog${itemPath.slice(4, -3)}`;
				allArticles.push(fileInfoObj);
			}
		}
	});
}

parseAllMdFile("./docs/articles");

const filePath = "docs/.vitepress/data/docs.json";
fs.writeFileSync(filePath, JSON.stringify(allArticles), { encoding: "utf8" });
