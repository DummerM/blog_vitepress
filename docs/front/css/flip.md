---
title: （转）FLIP 翻转动画 让所有动画都能达到流畅的60帧
date: 2022-08-02
sidebar: 'auto'
tags:
 - CSS
categories:
 - 前端
---

## **前置总结**

FLIP技术可以让我们的动画更加流畅，同时也能降低复杂动画的开发难度，更重要的是，当我们跟别人聊前端的时候呢，可以抛给他一个专业名词，让他瞬间感觉前端也很高大上，可以成为我们对后端同学的一项技术壁垒。

当然了，网上介绍的有很多，今天呢我在简单讲解完原理后，会和大家一起手撸一个FLIP的简单例子。

**名词解释，FLIP是几个英文单词的缩写，简单介绍一下：**

**F：Fist**—— 一个元素的起始位置

**L：Last** —— 另一个元素的终止位置，注意另一个这个词，后面会有具体代码的体现

**I：Invert** —— 计算"F"与"L"的差异，包括位置，大小等，并将差异用transform属性，添加到终止元素上，让它回到起始位置，也是此项技术的核心

**P：Play** —— 添加transtion 过渡效果，清除Invert阶段添加进来transform，播放动画

## **实现过程及原理**

1、使用getBoundingClientRect()方法获得，元素在渲染后在浏览器中所处的位置，这个方法会返回当前元素的一个矩阵，如图2-1

![img](https://pic4.zhimg.com/80/v2-9dc6283eb45e1226ecb41563ba40d283_720w.jpg)2-1 getBoundingClientRect的返回值

具体意思我就不解释啦，就是字面的意思，比较常用的是x,y对应的就是left和top，是以浏览器左上角为0 0 进行计算的。

2、使用cloneNode()方法，克隆要放大的dom节点，然后给这个克隆出来的dom节点添加，放大和全局居中的样式，使用getBoundingClientRect()获得节点位置信息

3、“1”中的初始节点位置信息，与“2”中的渲染结束节点的位置信息，进行计算，将计算结果用transform属性赋值给克隆节点，让克隆节点与初始节点在空间上重合。

4、添加“transtion”过度效果，删除“3”阶段赋值transform 动画就会自动执行了，这里要注意一下，需要使用setTimeout卡一个宏队列。

**原理看起来有点麻烦，但实际写起来还是很方便的，我们上代码**。

## **代码实现**

说明：全量代码在文章的最后，有兴趣的同学可以直接复制后本地执行

**准备工作**

首先呢，要构建一下页面，把基本的dom都写出来，当然了，正常情况下我们会用list遍历渲染，这里我就直接写死了，html代码 与 css代码放在文章最后。

我们着重看一下picture-zoom-in这个样式的代码，由于我们在构建页面时，dom的宽高都不一样，所以呢，用了一个不定宽高div垂直居中的技巧，其中要特别注意的是transform: translate(-50% ,-50%) scale(2) ;这一行，在后面做动画的时候会涉及到它。

## **开始写代码**

**1、处理一下蒙层的逻辑**

我们先把外部简单逻辑处理一下，根据效果，有一个点击蒙层关闭的操作，代码如下：

```javascript
let mask_dom = document.getElementsByClassName("mask")[0]
let pic_dom = document.getElementById('pic')
mask_dom.addEventListener("click", (e) => {
  mask_dom.style.display = 'none'
  pic_dom.innerHTML = ''
})

```

需要注意的是，关闭的同时我们还要清理承载放大图的div

**2、dom比较多使用事件代理**

```javascript
let container_dom = document.getElementsByClassName("container")[0]
container_dom.addEventListener("click", (e) => {
  //获得点击位置的dom节点
let boxDom = e.target
//判断点击的是不是模拟图片的dom
if(boxDom.className.indexOf('box') === -1){
  return
}
// 打开蒙层
  mask_dom.style.display = 'block'
//克隆被点击的节点
  let cloneDom = boxDom.cloneNode(true)
})
```

**3、Fist获得起始位置dom的位置信息**

```javascript
  //第一步、获得初始位置信息
let firstInfo =  boxDom.getBoundingClientRect()
```

**4、Last获取结束时的位置信息**

```javascript
 //第二步、获取结束时的位置信息——添加全局居中样式
  cloneDom.className = cloneDom.className + " picture-zoom-in"
//第二步、获取结束时的位置信息——放到容器中
  pic_dom.appendChild(cloneDom)
//第二步、获取结束时的位置信息
let lastInfo = cloneDom.getBoundingClientRect()
```

**5、Invert计算差异**

```javascript
//第三步、计算变化的数据数据 
let invertInfo = {
  x: firstInfo.x - lastInfo.x,
  y: firstInfo.y - lastInfo.y,
}
// 第三步、计算变化的数据数据 - 将克隆节点赋值变化的数据 回到初始位置 
//特别说明 由于有scale，会导致transformOrigin发生变化，在修改scale时需要将transformOrigin归零
cloneDom.style.transformOrigin = "0 0"
cloneDom.style.transform = `scale(1) translate(calc(-100% + ${invertInfo.x}px),calc(-100% +  ${invertInfo.y}px))`
```

**6、play播放动画**

```javascript
//第四步、设定过度动画，删除第三步的transform
setTimeout(() => {
  cloneDom.style.transition = "all .5s"
  cloneDom.style.transformOrigin = ''
  cloneDom.style.transform = ``
})
```

## 最后

总结一下，这个代码量算上注释和空行也就50来行代码，但整个FLIP的技术细节都实现了，除了前置总结提到的一些优点，这里我引用一位专业的软件设计师“Nick Babich”的一句话：**动画将用户界面带入生活。**

以前我们在做页面的时候，总觉得动画很难搞，于是就会传递出这样的信息，**动画是锦上添花，没有必要，复杂，难以实现**。

这样的借口，影响着我们前端程序员的发展，作为一个前端，动画开发，可以成为我们对后端程序员的一项技术壁垒，抓紧时间学起来把。

## **附：全部代码**

可以直接复制到html文件中执行，看效果哦~

```
<!DOCTYPE html>
<html lang="en">
 
<head>
 <meta charset="UTF-8">
 <meta http-equiv="X-UA-Compatible" content="IE=edge">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>FLIP-demo</title>
 <style>
 .container {
 display: flex;
 flex-wrap: wrap;
 text-align: center;
        }
 
 .box {
 
 border:1px solid #ccc;
 margin-left: 10px;
 margin-top: 10px;
        }
 .box_0{
 width: 200px;
 height: 250px;
 background-color: #ffa39e;
 color: #000000;
 line-height:250px;
        }
 
 .box_1 {
 width: 160px;
 height: 210px;
 background-color:#ffd8bf;
 line-height: 210px;
 
        }
 .box_2 {
 width: 190px;
 height: 270px;
 background-color:#ffd591;
 line-height:270px;
        }
 .box_3 {
 width: 210px;
 height: 300px;
 background-color:#ffe58f;
 line-height:300px;
        }
 .box_4 {
 height: 160px;
 width: 210px;
 background-color:#780650;
 color:#ffffff;
 line-height:160px;
        }
 .box_5 {
 height: 190px;
 width: 270px;
 background-color:#22075e;
 color:#ffffff;
 line-height:190px;
        }
 .box_6 {
 height: 210px;
 width: 300px;
 background-color:#061178;
 color:#ffffff;
 line-height:210px;
        }
 .mask{
 position: fixed;
 width: 100%;
 height: 100%;
 background: #000000;
 opacity: 0.7;
 z-index: 1;
 display: none;
 text-align: center;
        }
 .picture-zoom-in{
 position: fixed;
 z-index: 2;
 left: 50%;
 top: 50%;
 transform: translate(-50% ,-50%) scale(2) ;
 text-align: center;
        }
 </style>
</head>
 
<body>
 <!-- 蒙层 -->
 <div class="mask">
 
 </div>
 <!-- 放大图片的容器 -->
 <div id="pic">
 
 </div>
 <!-- 图片容器及列表 -->
 <div class="container">
 <div class="box box_0">200px*250px</div>
 <div class="box box_0">200px*250px</div>
 <div class="box box_0">200px*250px</div>
 <div class="box box_0">200px*250px</div>
 <div class="box box_1">160px*210px</div>
 <div class="box box_2">190px*270px</div>
 <div class="box box_3">210px*300px</div>
 <div class="box box_4">210px*160px</div>
 <div class="box box_5">270px*190px</div>
 <div class="box box_6">300px*210px</div>
 </div>
 
 <script>
 let container_dom = document.getElementsByClassName("container")[0]
 let mask_dom = document.getElementsByClassName("mask")[0]
 let pic_dom = document.getElementById('pic')
 
 mask_dom.addEventListener("click", (e) => {
 mask_dom.style.display = 'none'
 pic_dom.innerHTML = ''
        })
 
 //dom 比较多采用事件代理
 container_dom.addEventListener("click", (e) => {
 //获得点击位置的dom节点
 let boxDom = e.target
 //判断点击的是不是模拟图片的dom
 if(boxDom.className.indexOf('box') === -1){
 return
            }
 // 打开蒙层
 mask_dom.style.display = 'block'
 
 //克隆被点击的节点
 let cloneDom = boxDom.cloneNode(true)
 
 //第一步、获得初始位置信息
 let firstInfo =  boxDom.getBoundingClientRect()
 
 //第二步、获取结束时的位置信息——添加全局居中样式
 cloneDom.className = cloneDom.className + " picture-zoom-in"
 //第二步、获取结束时的位置信息——放到容器中
 pic_dom.appendChild(cloneDom)
 //第二步、获取结束时的位置信息
 let lastInfo = cloneDom.getBoundingClientRect()
 
 //第三步、计算变化的数据数据 
 let invertInfo = {
 x: firstInfo.x - lastInfo.x,
 y: firstInfo.y - lastInfo.y,
            }
 // 第三步、计算变化的数据数据 - 将克隆节点赋值变化的数据 回到初始位置 
 //特别说明 由于有scale，会导致transformOrigin发生变化，在修改scale时需要将transformOrigin归零
 cloneDom.style.transformOrigin = "0 0"
 cloneDom.style.transform = `scale(1) translate(calc(-100% + ${invertInfo.x}px),calc(-100% + ${invertInfo.y}px))`
 //第四步、设定过度动画，删除第三步的transform
 setTimeout(() => {
 cloneDom.style.transition = "all .5s"
 cloneDom.style.transformOrigin = ''
 cloneDom.style.transform = ``
            })
 
        })
 
 </script>
</body>
 
</html>
```

:::tip

文章来源：https://zhuanlan.zhihu.com/p/525671258

:::