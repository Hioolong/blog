---
title: Webpack 核心流程及原理
author: Ronney
date: '2023-04-27'
categories: 
- 构建
tags:
- webpack
---

# Webpack 核心流程及原理

webpack 是一个现在 Javascript  应用程序的静态模块打包器。当 webpack 处理应用程序时，它会递归的构建一个依赖关系图，其中包含应用程序需要的每一个模块，然后将所有这些模块打包成一个或者多个 bundle。

**核心流程**

webpack 的运行流程是一个**串行**的过程，从启动到结束会依次执行以下流程：

1. 初始化参数：从配置文件和 shell 语句中读取并合并参数，得出最终的参数。
2. 开始编译：用上一步获取的参数初始化 `Compiler` 对象，加载所有配置的插件，执行对象的 `run` 方法开始执行编译。
3. 确定入口：根据配置中的 entry 找出所有的入口文件。
4. 编译模块：从入口文件出发，调用所有配置的 Loader 对模块进行翻译，再找出该模块依赖的模块，递归本步骤直到所有入口依赖的文件都经过了本步骤的处理。
5. 完成模块编译：得到每个模块被翻译后的最终内容以及它们之间的依赖关系。
6. 输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表，这一步是最后可以修改输出内容的机会。
7. 输出完成：确定好输出内容后，根据配置的路径和文件名，把文件内容写入到文件系统。

在以上过程中，Webpack 会在特定的时间节点广播出特定的事件，插件在监听到事件后会执行特定的逻辑，并且插件可以调用 webpack 提供的 api 改变运行结果。

## entry（入口）

入口就是 webpack 通过该起点找到本项目所直接或者间接依赖的资源（模块、库）等，并且对它进行处理，最后输出到 `bundle` 中。入口文件由用户自定义，可以是一个或者多个，最后生成对应的 `bundle`。

常见场景：分离 app（应用程序）和 vendor（第三方库）入口
```javascript
module.exports = {
  entry: {
    main: './src/app.js',
    vendor: './src/vendor.js'
  }
}
```

## output（出口）

可以通过配置 `output` 选项，告诉 webpack 如何向硬盘写入编译文件。注意：即使存在多个 `entry` 起点，也只能指定一个 `output` 配置。

> 如果配置中创建出多于一个 `chunk`（例如：使用多个入口起点或者使用 `CommonsChunkPlugin` 来提取公共 `chunk`），则应该使用占位符来确保每一个文件具有唯一的名称。

```javascript
module.exports = {
  entry: {
    app: './src/app.js',
    search: './src/search.js'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist'
  }
}

// 最终输出： ./dist/app.js, ./dist/search.js
```

## loader（加载器）

默认情况下，webpack 只能处理 js 文件，所以对于图片、css、ts、vue 等等其他类型的静态资源则需要通过 loader 来处理，它能将其他资源转化为 js 进行处理。

有了 loader，我们能实现很多功能，如：

* 将不同的语言（Typescript、Vue）转换为 Javascript
* 将图像转换为 data URL（base64）
* 在 Javascript 模块中 `import` CSS 文件
* 使用 CSS 预处理器 Sass、Less 等

常用 Loaders

* url-loader
* babel-loader
* ts-loader
* less-loader
* css-loader
* style-loader
* vue-loader

一个 loader 实际上是一个在 node.js 下运行的模块，一个简单的 loader 源码如下所示：

```javascript
module.exports = function(source) {
  // source 为 compiler 传递给 loader 的文件的原内容
  // 处理内容
  const formatSource = format(source)
  // 需要返回处理后的内容，供下一个 loader 使用
  return formatSource;
}
```


## plugin（插件）

webpack 通过 plugin 机制使其更加灵活，以应对各种应用场景。在 webpack 的生命周期中会广播出好多事件，plugin 可以监听这些事件，在合适的时机调用 webpack 提供的 api 改变输出结果。

一个基础的 plugin 代码如下：

```javascript
class BasicPlugin {
  constructor(options) {
    // options 获取用户传给本插件的配置
  }

  // webpack 会调用 BasicPlugin 实例的 apply 方法给插件实例传入 compiler 对象
  apply(compiler) {
    // 可以通过 compiler 对象注册监听各个生命周期广播出来的事件
    compiler.plugin('compilation', function(compilation) {
      // 可以在此调用 webpack 提供的 api 改变输出结果
    })
  }
}

module.exports = BasicPlugin;
```

使用此插件时，相关的配置代码如下：

```javascript
const BasicPlugin = require('./BasicPlugin.js');
module.export = {
  plugins: [
    new BasicPlugin(options)
  ]
}
```

编写 plugin 期间，最常用的两个对象就是 `compiler` 和 `compilation`，它们是 plugin 和 webpack 之间的桥梁。他们的含义如下

* compiler 对象包含了 webpack 环境所有的配置信息，包含 options、loaders、plugins 这些信息，这个对象在 webpack 启动的时候被实例化，是全局唯一的，可以简单把它理解成 webpack 的实例。
* compilation 对象包含了当前的模块资源、编译生成资源、变化的文件等。当 webpack 以开发模式运行的时候，每检测到文件变化，一次新的 compilation 将被创建。 compilation 对象也提供了好多事件回调供插件做扩展。通过 compilation 对象也能读取到 compiler 对象。

**如何广播事件？**

Webpack 通过 [Tapable](https://github.com/webpack/tapable) 来进行事件的广播，compiler 和 compilation 都继承自 `tapable`，所以可以在它们身上进行事件的广播和监听，实际上这里应用到了观察者模式，如下：

```javascript
/**
 * 广播出事件
 * event-name: 事件名称
 * params: 附带参数
 */
compiler.apply('event-name', params);

/**
 * 监听名为 event-name 的事件，当事件发生时，执行回调函数
 * params 参数为广播事件时附带的参数
 */
compiler.plugin('event-name', function(params) {
  
})
```

**常用API**



## ModuleFederation（模块联邦）