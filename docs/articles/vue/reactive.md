---
title: Vue 响应式原理
author: Ronney
date: '2022-09-28'
categories: 
- 源码
tags:
- vue 原理
---

# Vue 响应式实现原理

## 前言

截止到目前，使用 vue 也有三四年的时间了，一直以来觉得自己对 vue 的实现响应式实现原理理解的还是不够透彻，加上最近在阅读《Vue.js设计与实现》这本书，感觉对 vue 的响应式原理有了进一步的理解，因此记录下此时的理解，算是对学习这本书响应式章节的总结吧。

## 副作用函数

理解响应式原理前，我们先搞清楚什么是副作用函数，先来看看定义

> 函数在正常工作任务之外对外部环境产生了影响，称之为副作用函数

例如

```js
function changeDocTitle () {
    window.document.title = 'Ronney'
}
changeDocTitle()               
```

函数 `changeDocTitle` 改变了全局变量 `window.document` 的 `title` 属性，该变量属于一个外部变量，凡是函数内改变了外部的变量，我们都可以认为是一个副作用函数

## 响应式数据


## 收集依赖


## 触发依赖