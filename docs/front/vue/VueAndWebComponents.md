---
title: Vue 与 Web Components
date: 2022-06-22
sidebar: 'auto'
tags:
 - Vue
categories:
 - 前端
---

::: tip
Web Components 是一组 web 原生 API 的总称，允许开发者创建可重用的定制元素
:::

默认情况下，Vue 会倾向于解析一个非原生的 HTML 标签为一个注册过的 Vue 组件，而将“渲染一个自定义元素”作为后备选项。这会在开发时导致 Vue 抛出一个“解析组件失败”的警告。要让 Vue 知晓特定元素应该被视为自定义元素并跳过组件解析，我们可以指定 compilerOptions.isCustomElement 这个选项。

如果在开发 Vue 应用时进行了构建配置，则应该在构建配置中传递该选项，因为它是一个编译时选项。

## Vite 示例配置

```javascript
// vite.config.js
import vue from '@vitejs/plugin-vue'

export default {
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 将所有带短横线的标签名都视为自定义元素
          isCustomElement: (tag) => tag.includes('-')
        }
      }
    })
  ]
}
```

## Vue CLI 示例配置

```javascript
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => ({
        ...options,
        compilerOptions: {
          // 将所有带 ion- 的标签名都视为自定义元素
          isCustomElement: tag => tag.startsWith('ion-')
        }
      }))
  }
}
```

## 使用 Vue 构建自定义元素

Vue 提供了一个和定义一般 Vue 组件几乎完全一致的 defineCustomElment 方法来支持创建自定义元素。这个方法接收的参数和 defineComponent 完全相同。但它会返回一个继承自 HTMLElement 的自定义元素构造器：

```vue
<my-vue-element></my-vue-element>
```

```javascript
import { defineCustomElement } from 'vue'

const MyVueElement = defineCustomElement({
  // 这里是同平常一样的 Vue 组件选项
  props: {},
  emits: {},
  template: `...`,

  // defineCustomElement 特有的：注入进 shadow root 的 CSS
  styles: [`/* inlined css */`]
})

// 注册自定义元素
// 注册之后，所有此页面中的 `<my-vue-element>` 标签
// 都会被升级
customElements.define('my-vue-element', MyVueElement)

// 你也可以编程式地实例化元素：
// （必须在注册之后）
document.body.appendChild(
  new MyVueElement({
    // 初始化 props（可选）
  })
)
```

## Web Components vs. Vue 组件

一些开发者认为应该避免使用框架专有的组件模型，并且认为使用自定义元素可以使应用“永不过时”。在这里，我们将解释为什么我们认为这样的想法过于简单。

自定义元素和 Vue 组件之间确实存在一定程度的功能重叠：它们都允许我们定义具有数据传递、事件发射和生命周期管理的可重用组件。然而，Web Components 的 API 相对来说是更底层的和更基础的。要构建一个实际的应用程序，我们需要相当多平台没有涵盖的附加功能：

- 一个声明式的、高效的模板系统；
- 一个响应式状态管理系统，促进跨组件逻辑提取和重用；
- 一种在服务器上呈现组件并在客户端“激活” (hydrate) 组件的高性能方法 (SSR)，这对 SEO 和 [LCP 这样的 Web 关键指标](https://web.dev/vitals/) 非常重要。原生自定义元素 SSR 通常需要在 Node.js 中模拟 DOM，然后序列化更改后的 DOM，而 Vue SSR 则尽可能地将其编译为拼接起来的字符串，这会高效得多。

Vue 的组件模型在设计时考虑到这些需求，将其作为一个更聚合的系统。

当团队中有足够的技术水平时，你可能可以在原生自定义元素的基础上构建等效的组件。但这也意味着你将承担长期维护内部框架的负担，同时失去了像 Vue 这样成熟的框架生态社区所带来的收益。

也有一些别的框架使用自定义元素作为其组件模型的基础，但它们都不可避免地要引入自己的专有解决方案来解决上面列出的问题。使用这些框架通常需要购买他们关于如何解决这些问题的技术决策。不管其广告上怎么宣传，也无法保证之后不会陷入潜在的问题之中。

我们还发现自定义元素在某些领域会受到限制：

- 贪婪的插槽计算会阻碍组件之间的组合。Vue 的 [作用域插槽](https://staging-cn.vuejs.org/guide/components/slots.html#scoped-slots) 是一套强有力的组件组合机制，而由于原生插槽的贪婪性质，自定义元素无法支持这些。贪婪插槽也意味着接收组件时不能控制何时或是否呈现插槽内容。
- 在当下要想使用 shadow DOM 局部范围的 CSS，必须将样式嵌入到 JavaScript 中才可以在运行时将其注入到 shadow root 上。这也导致了 SSR 场景下标记中的样式重复。虽然有一些平台功能在尝试解决这一领域的问题，但是直到现在还没有达到通用支持状态，而且仍有生产性能/ SSR 方面的问题需要解决。可与此同时，Vue 的 SFC 本身就提供了 [CSS 局域化机制](https://staging-cn.vuejs.org/api/sfc-css-features.html) ，并支持抽取样式到纯 CSS 文件中。

Vue 将始终紧跟 Web 平台的最新标准，如果这个平台能让我们的工作变得更简单，我们将乐于利用它的原生功能。但是，我们的目标是提供“当下能办到且办得好”的解决方案。这意味着我们必须以一种批判性的心态来整合新的平台功能，包括补足标准不完善的地方，这是一个不争的事实。

### 