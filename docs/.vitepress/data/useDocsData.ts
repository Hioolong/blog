import data from './docs.json'

interface DocsItem {
    title: string;
    author: string;
    date: string;
    categories: string [];
    tags: string [];
    link: string
}

type DocsDataRes = {
    data: Array<DocsItem>;
    categories: Record<string, object>;
    tags: Set<string | unknown>;
    docsNum: number;
    tagsNum: number;
}

export function useDocsData(): DocsDataRes {
    data.sort((a, b) => +new Date(b.date) - +new Date(a.date))

    const categories = {}
    const tags = new Set()
    const docsNum = data.length
    let tagsNum = 0

    data.forEach((item) => {
        item.categories && item.categories.forEach((cItem) => {
            if (!categories[cItem]) {
                categories[cItem] = 0
            }
            categories[cItem]++
        })
        item.tags && item.tags.map((t) => {
            tags.add(t)
        })
    })

    tagsNum = tags.size

    return {
        data,
        categories,
        tags,
        docsNum,
        tagsNum
    }
}