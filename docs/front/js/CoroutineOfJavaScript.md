---
title: JavaScript 协程的发展
date: 2022-06-22
sidebar: 'auto'
tags:
 - JavaScript
categories:
 - 前端
---

## JavaScript 协程的发展

- 同步代码
- 异步JavaScript: callback hell（回调地狱）
- ES6引入 Promise/a+, 生成器Generators(语法 *function foo(){}**  可以赋予函数执行暂停/保存上下文/恢复执行状态的功能), 新关键词yield使生成器函数暂停.
- ES7引入 async函数/await语法糖,async可以声明一个异步函数(将Generator函数和自动执行器，包装在一个函数里)，此函数需要返回一个 Promise 对象。await 可以等待一个 Promise 对象 resolve，并拿到结果,

Promise中也利用了回调函数。在then和catch方法中都传入了一个回调函数，分别在Promise被满足和被拒绝时执行, 这样就就能让它能够被链接起来完成一系列任务。总之就是把层层嵌套的 callback 变成 .then().then()...，从而使代码编写和阅读更直观

生成器Generator的底层实现机制是协程Coroutine。

```javascript
function* foo() {
    console.log("foo start")
    a = yield 1;
    console.log("foo a", a)
    yield 2;
    yield 3;
    console.log("foo end")
}

const gen = foo();
console.log(gen.next().value); // 1
// gen.send("a") // http://www.voidcn.com/article/p-syzbwqht-bvv.html SpiderMonkey引擎支持 send 语法
console.log(gen.next().value); // 2
console.log(gen.next().value); // 3
console.log(foo().next().value); // 1
console.log(foo().next().value); // 1

/*
foo start
1
foo a undefined
2
3
foo start
1
foo start
1
*/

```

## JavaScript 协程成熟体

**Promise继续使用**

Promise 本质是一个状态机，用于表示一个异步操作的最终完成 (或失败), 及其结果值。它有三个状态：

- pending: 初始状态，既不是成功，也不是失败状态。
- fulfilled: 意味着操作成功完成。
- rejected: 意味着操作失败。

最终 Promise 会有两种状态，一种成功，一种失败，当 pending 变化的时候，Promise 对象会根据最终的状态调用不同的处理函数。

**async、await语法糖**

async、await 是对 Generator 和 Promise 组合的封装, 使原先的异步代码在形式上更接近同步代码的写法,并且对错误处理/条件分支/异常堆栈/调试等操作更友好。Async、Await 实现了 Generator 的自动迭代，正因为 Async、Await 是对 Generator 和 Promise 组合的封装，**所以 Async 和 Await 基本上就只能用来实现异步和并发了，而不具有协程的其他作用。**

- JavaScript 异步执行的运行机制

  1. 所有任务都在主线程上执行，形成一个执行栈。
  2. 主线程之外，还存在一个"任务队列"（task queue）。只要异步任务有了运行结果，就在"任务队列"之中放置一个事件。
  3. 一旦"执行栈"中的所有同步任务执行完毕，系统就会读取"任务队列"。那些对应的异步任务，结束等待状态，进入执行栈并开始执行。

  遇到同步任务直接执行,遇到异步任务分类为宏任务(macro-task)和微任务(micro-task)。
  当前执行栈执行完毕时会立刻先处理所有微任务队列中的事件，然后再去宏任务队列中取出一个事件。同一次事件循环中，微任务永远在宏任务之前执行。

::: tip
由于我们可以在用户态调度协程任务，所以，我们可以把一组互相依赖的任务设计成协程。这样，当一个协程任务完成之后，可以手动进行任务调度，把自己挂起(yield)，切换到另外一个协程执行。这样，由于我们可以控制程序主动让出资源，很多情况下将不需要对资源加锁。
:::

### 