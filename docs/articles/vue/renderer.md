---
title: Vue 渲染器
author: Ronney
date: '2023-04-14'
categories: 
- 源码
tags:
- vue 原理
---

# 渲染器

## 职责

渲染器（renderer）是用来执行渲染任务的，在 `Vue` 里是将 `虚拟DOM` 渲染成特定平台的真实元素，在浏览器会被渲染成真实的 `DOM` 元素。

## 自定义渲染器

vue 的渲染器是被设计成跨平台渲染的，即可以实现渲染到任意目标平台上。通过工厂函数 `createRedenerer` 来进行抽象的，通过传入对应的创建元素（createElement）、设置元素文本节点（setElementText）、给元素插入子元素（insert）等真实操作DOM的方法，即可实现一层抽象，达到跨平台的目的。

## 渲染器与响应系统结合

我们先实现一个简易的渲染器

```javascript
function renderer(domString, container) {
  container.innerHTML = domString;
}
```

使用方式如下

```javascript
renderer('<h1>Hello World!</h1>', document.getElementById('app'))
```

那么，如何跟响应系统结合呢？回忆一下响应式原理🤔

> 当响应式数据发生变化时，会重新执行副作用函数

那么我们在副作用函数里调用渲染器进行更新，不就可以结合起来了嘛！！！如👇

```javascript
const count = ref(1)

effect(() => {
  renderer(`<h1>${count.value}</h1>`, document.getElementById('app'))
})

count.value++
```


## 挂载与更新

挂载👇
> 挂载，也叫 `mount` ，指将虚拟 DOM 渲染成真正 DOM 的过程，挂载完成后会触发 `mounted` 钩子函数。

更新👇
> 当多次在同一个 container 上调用 renderer.render 函数进行渲染时，渲染器除了要执行挂载动作之外，还要执行更新动作

```javascript
function createRenderer() {
  function render(vnode, container) {
    if (vnode) {
      // 有新 vnode，需要进行 patch 操作
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        // 有旧 vnode，没新 vnode，则需要进行卸载（unmount）操作
        container.innerHtml = ''
      }
    }
    container._vnode = vnode
  }

  return {
    render
  }
}
```

那么 `patch` 函数会做些什么工作呢？其实它里面主要包含了两步，挂载和更新

```javascript
/**
 * n1: 旧 vnode
 * n2: 新 vnode
 * container: 需要挂载的节点
 */
function patch(n1, n2, container) {
  // 对比n1和n2类型，如不同，则直接将旧的卸载
  if (n1 && n1.type !== n2.type) {
    unmount(n1)
    n1 = null
  }
  const { type } = n2
  // 如果类型是字符串，则是普通的标签元素
  if (typeof type === 'string') {
    if (!n1) {
      mountElement(n2, container)
    } else {
      // 更新
      patchElement(n1, n2)
    }
  } else if (typeof type === 'object') {
    // 类型是对象，则代表是一个组件
  } else if (typeof type === 'xxx') {
    // 其他类型 vnode 如 Fragment
  }
}
```

其中最为关键的就是 `patchElement` 函数，该函数会对元素的事件、属性、子节点等进行更新，尤为关键的是对子节点的更新，如下

```javascript
function patchChildren(n1, n2, container) {
  if (typeof n2.children === 'string') {
    // 新子节点的类型为文本节点
    // 此时将旧元素卸载，将新的文本节点内容设置给容器即可
    if (Array.isArray(n1.children)) {
      n1.children.forEach((c) => unmount(c))
    }
    setElementText(container, n2.children)
  } else if (Array.isArray(n2.children)) {
    // 新的子节点是一组子节点（大部分情况如此）
    if (Array.isArray(n1.children)) {
      // 🌟走到这里，说明新旧子节点都是一组子节点，这里就设计到使用核心 Diff 算法找出需要更新的节点
      
    } else {
      // 此时：旧子节点要么是文本子节点，要么不存在
      // 我们只需将容器晴空，然后挂载新的一组子节点即可
      setElementText(container, '')
      n2.children.forEach((c) => patch(null, c, container))
    }
  }
}
```

## Diff 算法

## 简单 Diff算法

### 对比的主流程

* 对比新旧子节点列表长度，遍历长度较短的那一组，这样能尽可能多的调用 `patch` 函数进行更新
* 如果新的子节点更长，则说明有新子节点需要挂载
* 如果新的子节点更短，则说明有旧子节点需要卸载

相关代码👇

```javascript
function patchChildren(n1, n2, container) {
  if (Array.isArray(n2.children)) {
    if (Array.isArray(n1.children)) {
      const oldChildren = n1.children
      const newChildren = n2.children
      // 子节点长度
      const oldLen = oldChildren.length
      const newLen = newChildren.length
      // 两组子节点的公共长度，取两者中较短的一组
      const commonLength = Math.min(oldLen, newLen)
      // 复用一部分DOM，直接更新内容
      for(let i = 0; i < commonLength; i++) {
        patch(oldChildren[i], newChildren[i], container)
      }
      if (newLen > oldLen) {
        // 说明有新的子节点需要挂载
        for(let i = commonLength; i < newLen; i++) {
          patch(null, newChildren[i], container)
        }
      } else if (oldLen > newLen) {
        // 说明有旧子节点需要卸载
        for(let i = commonLength; i < newLen; i++) {
          unmount(newChildren[i])
        }        
      }
    }
  }
}
```

### key 的作用

假如新旧子节点列表只有顺序不一致，我们可以通过移动元素来完成更新，此时就需要确定节点的对应关系，这就需要一个节点的唯一标识，此时 key 的作用就显现出来了。

有了 key 之后，我们可以通过遍历旧子节点列表来寻找是否有可复用的节点

```javascript
function patchChildren(n1, n2, container) {
  if (Array.isArray(n2.children)) {
    if (Array.isArray(n1.children)) {
      const oldChildren = n1.children
      const newChildren = n2.children
      for(let i = 0; i < newChildren.length; i++) {
        const newVnode = newChildren[i]
        for(let j = 0; j < oldChildren.length; k++) {
          if (newVnode.key === oldVnode.key) {
            // 说明通过key找到可复用的节点
            patch(oldVnode, newVnode, container)
            break;
          }
        }
      }
    }
  }
}
```

### 找到需要移动的元素

移动元素有一个前提，就是在旧子节点列表中找到 key 是一样的节点。找到之后，则记录该节点的位置索引，后续更新过程中，如果一个节点的索引值小于最大索引，说明对应的真实DOM元素需要移动

示例👇

```javascript
function patchChildren(n1, n2, container) {
  if (Array.isArray(n2.children)) {
    if (Array.isArray(n1.children)) {
      const oldChildren = n1.children
      const newChildren = n2.children

      // 存储寻找过程中遇到的最大索引值，用于判断元素是否需要移动
      let lastIndex = 0
      for(let i = 0; i < newChildren.length; i++) {
        const newVnode = newChildren[i]
        for(let j = 0; j < oldChildren.length; k++) {
          if (newVnode.key === oldVnode.key) {
            patch(oldVnode, newVnode, container)
            if (j < lastIndex) {
              // 说明当前节点在旧 children 中的索引小于最大索引值，即在旧 children 中，该节点在 lastIndex 节点之前，而新 children中，该节点在 lastIndex 节点之后，所以需要进行移动

                // 移动的核心是找到上一节点对应真实 DOM 的下一个兄弟节点，然后以此为锚点 insertBefore。
              const preVNode = newChildren[i - 1]
              if (preVNode) {
                const anchor = prevVNode.el.nextSibling
                insert(newVNode.el, container, anchor)
              }
            } else {
              lastIndex = j
            }
            break;
          }
        }
      }
    }
  }
}
```

### 添加&删除元素

* 当在旧子节点列表里找不到当前节点的 key 时，则认为此节点是新增节点，需要挂载
* 当更新完成后，遍历旧的子节点列表，查找节点是否存在新节点列表里，如不存在，则说明需要删除该节点

### 🌟总结（面试要用！）

核心逻辑

> 简单 Diff 算法的核心逻辑是，拿新的一组子节点中的节点去旧的一组子节点中寻找可复用的节点，如果找到了，则调用 patch 函数进行更新，然后记录该节点的位置索引，后续更新过程中，如果一个节点的索引值小于最大索引，即说明该节点对应的真实 DOM 元素需要移动。

缺点

> 在某些情况下，移动节点的方式并不是最优解，性能不是最优。

## 双端 Diff 算法

> 双端 Diff 算法是一种同时对新旧两个子节点的两个端点进行比较的算法

比较的方式，每一轮的比较都分为四个步骤

1. 比较旧的子节点列表中的第一个子节点 `oldStartVnode` 和新的子节点列表中的第一个子节点 `newStartVnode`。如果相等，元素不需要移动，打补丁即可，然后更新索引，新旧各前进一步，然后更新 `oldStartVnode` 和 `newStartVnode`。
    ```javascript
    oldStartVnode = oldChildren[++oldStartIndex]
    newStartVnode = newChildren[++newStartIndex]
    ```
2. 比较旧的子节点列表中的最后一个子节点 `oldEndVnode` 和新的子节点列表中的最后一个子节点 `newEndVnode`。如果相等，元素不需要移动，打补丁即可，然后更新索引，新旧各退后一步，然后更新 `oldEndVnode` 和 `newEndVnode`。
    ```javascript
    oldEndVnode = oldChildren[--oldEndIndex]
    newEndVnode = newChildren[--newEndIndex]
    ```
3. 比较旧的子节点列表中的第一个子节点 `oldStartVnode` 和新的子节点列表中的最后一个子节点 `newEndVnode`。如果相等，将旧的子节点列表的头部节点对应的真实 DOM 节点 `oldStartVnode.el` 移动到旧的一组子节点的尾部节点对应的真实 DOM 节点后面，然后更新索引和 `oldStartVnode`、`newEndVnode`
    ```javascript
    insert(oldStartVnode.el, container, oldEndVnode.el.nextSibling)
    oldStartVnode = oldChildren[++oldStartIndex]
    newEndVnode = newChildren[--newEndIndex]
    ```
4. 比较旧的子节点列表中的最后一个子节点 `oldEndVnode` 和新的子节点列表中的第一个子节点 `newStartVnode`。如果相等，将旧的子节点列表的最后一个节点对应的真实 DOM 节点 `oldEndVnode.el` 移动到旧的子节点列表的头部节点对应的真实 DOM 节点前面，然后更新索引和 `oldEndVnode`、`newStartVnode`。
    ```javascript
    insert(oldEndVnode.el, container, oldStartVnode.el)
    oldEndVnode = oldChildren[--oldEndIndex]
    newStartVnode = newChildren[++newStartIndex]
    ```

然而事实上，还会存在上面四种比较方式比较完之后，都没找到可复用的元素的情况，此时我们就需要查找非头部、非尾部的节点能否复用，具体做法是拿新的一组子节点中的头部节点去旧的子节点中寻找，代码如下👇

```javascript
while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
  if (oldStartVnode.key === newStartVnode.key) {
    // 上述步骤1对比
  } else if (oldEndVnode.key === newEndVnode.key) {
    // 上述步骤2对比
  } else if (oldStartVnode.key === newEndVnode.key) {
    // 上述步骤3对比
  } else if (oldEndVnode.key === newStartVnode.key) {
    // 上述步骤4对比
  } else {
    // 四轮对比都找不到的情况
    // 遍历旧子节点列表，查找是否有可复用的节点
    const indexInOld = oldChildren.findIndex((node) => node.key === newStartVnode.key)
    // 如果 indexInOld > 0 说明找到可复用的节点
    if (indexInOld > 0) {
      const vnodeToMove = oldChildren[indexInOld]
      patch(vnodeToMove, newStartVNode, container)
      // 将 vnodeToMove 的真实 DOM 移动到头部节点
      insert(vnodeToMove.el, container, oldStartVNode.el)
      oldChildren[indexInOld] = undefined
    } else {
      // 没找到，说明当前节点是新增的节点
      patch(null, newStartVnode, container, oldStartVNode.el)
    }
    newStartVnode = newChildren[++newStartIndex]
  }
}
if (oldStartIndex > oldEndIndex && newStartIndex <= newEndIndex) {
  // 旧子节点列表已遍历完成，而新子节点列表还剩余节点未处理，则剩下的需要进行挂载
  for(let i = newStartIndex; i <= newEndIndex; i++) {
    patch(null, newChildren[i], container, oldStartVnode.el)
  }
} else if (newEndIndex < newStartIndex && oldStartIndex <= oldEndIndex) {
  // 新子节点列表遍历完成，但旧子节点列表还剩余节点未处理，则剩下的需要进行卸载操作
  for(let i = oldStartIndex; i <= oldEndIndex; i++) {
    unmount(oldChildren[i])
  }
}
```

## 快速 Diff 算法