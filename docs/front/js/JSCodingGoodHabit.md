---
title: Js编码中的好习惯
date: 2022-07-25
sidebar: 'auto'
tags:
 - JavaScript
categories:
 - 前端
---

## 1.console.log({name})取代console.log('name', name)

当我们有一个变量名需要在控制台打印的时候，很多人都习惯于这样写：

```javascript
console.log('name', name)
```

这种写法本身没有问题，但是会有一些小问题：

1. 代码长度较长，字符串无法自动补全需要复制粘贴，变量名较长的情况更为明显。
2. 表现不直观，如果 `name` 是一个对象，展开的时候占位太高我们会经常找不到开头的name在哪。

有了**ES6**，我们其实完全可以这样写：

```
console.log({name})
```

这种写法在结果上，可以和上面的写法达到一样的目的。但是不管是代码 `简洁程度` 、还是 `可读性` 上，都可以得到更友好的提升。**尤其是name是一个对象的时候，效果更为明显。**

虽然是很简单的一行代码，但是效果还是比较实用的。

## 2.巧用JS隐式类型转换

JS是一门弱类型语言，不同type的变量可以相互转化。我们可以巧妙的利用这一特性，让我们的代码在做类型转换的时候，变得**更简洁**，**更优雅**。直接上代码：

- 快速转换Number类型：

```javascript
// 字符串转数字代码对比 

const price = parseInt('32'); //传统方式
const price = Number('32'); //传统方式

const price = +'32'; //新方式

// 日期转换为时间戳代码对比 

const timeStamp = new Date().getTime(); //传统方式
const timeStamp = +new Date(); //新方式

//布尔转数字新方式
 console.log(+true); // Return: 1
 console.log(+false); // Return: 0
```

- 快速转换Boolean类型：

```javascript
// 各种类型转布尔代码对比 

const isTrue = Boolean('') //传统方式
const isTrue = !!'' //新方式

const isTrue = Boolean(0) //传统方式
const isTrue = !!0 //新方式

const isTrue = Boolean(null) //传统方式
const isTrue = !!null //新方式

const isTrue = Boolean(undefined) //传统方式
const isTrue = !!undefined //新方式
```

::: tip

!!运算符还可以用于变量的非空判断

:::

- 快速转换String类型：

```javascript
// 数字转string代码对比
const num = 1;

const str = num.toString(); //传统方式
const str = num + ''; //新方式
```