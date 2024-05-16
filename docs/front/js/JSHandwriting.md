---
title: Js手写合集
date: 2022-08-02
sidebar: 'auto'
tags:
 - JavaScript
categories:
 - 前端
---

## 深拷贝

### 通过JSON

```javascript
// JSON.parse(JSON.stringify(obj))我们一般用来深拷贝
// 其过程说白了 就是利用JSON.stringify 将js对象序列化（JSON字符串）
// 再使用JSON.parse来反序列化(还原)js对象

function deepClone(obj) {
    if(typeof obj != 'object') return obj;
    return JSON.parse(JSON.stringify(obj))
}
```

:::warning

**但是在使用时应该注意一下几点**

:::

1. 如果obj里面有时间对象

   ```javascript
   // JSON.stringify后再JSON.parse的结果，时间将只是字符串的形式。而不是时间对象
   var test = {
       name: 'a',
       date: [new Date(1536627600000), new Date(1540047600000)],
     };

     let b;
     b = JSON.parse(JSON.stringify(test))
     
     // b = {"name":"a","date":["2018-09-11T01:00:00.000Z","2018-10-20T15:00:00.000Z"]}
   ```

2. 如果obj里有RegExp、Error对象

   ```javascript
   // 序列化的结果将只得到空对象
   const test = {
           name: 'a',
           date: new RegExp('\\w+'),
   };
   // debugger
   const copyed = JSON.parse(JSON.stringify(test));
   test.name = 'test'
   console.error('ddd', test, copyed) //输出:ddd,{"name":"test","date":{}},{"name":"a","date":{}}
   ```

3. 如果obj里有函数，undefined，则序列化的结果会把函数或 undefined丢失

   ```javascript
   const test = {
   	name: 'a',
   	date: function hehe() {
   	console.log('fff')
   	},
   };
   // debugger
   const copyed = JSON.parse(JSON.stringify(test));
   test.name = 'test'
   console.error('ddd', test, copyed)  //输出： ddd,{"name":"test"},{"name":"a"}
   ```

4. 如果obj里有NaN、Infinity和-Infinity，则序列化的结果会变成null

   ```javascript
   const test = {
   name: NaN,
   date: function hehe() {
   console.log('fff')
   },
   };
   // debugger
   const copyed = JSON.parse(JSON.stringify(test));
   console.log( test, copyed)  //输出：{"name":null},{"name":null}
   ```

5. JSON.stringify()只能序列化对象的可枚举的自有属性

   ```javascript
   // 如果obj中的对象是有构造函数生成的， 则使用JSON.parse(JSON.stringify(obj))深拷贝后，会丢弃对象的constructor

   function Person(name) {
   this.name = name;
   console.log(name)
   }

   const liai = new Person('liai'); // 输出：lihai

   const test = {
   name: 'a',
   date: liai,
   };
   // debugger
   const copyed = JSON.parse(JSON.stringify(test));
   test.name = 'test'
   console.error('ddd', test, copyed) // 输出：ddd,{"name":"test","date":{"name":"liai"}},{"name":"a","date":{"name":"liai"}}

   ```

### 通过递归

1. 一个基本的递归循环实现

   ```javascript
   // 定义一个深拷贝方法
   function deepClone(obj = {}){
   	// 判断传入的数据是否是引用类型(一般为对象或者数组)
   	if(typeOf obj !== 'object' || obj == null){
   		// 如果不是，那么返回该数据
   		return obj;
   	}
   	// 定义一个拷贝后的结果，用来当返回值
   	let _result;
   	// 判断结果值为数组还是对象
   	if(obj instanceOf Array){
   		_result = []
   	}else{
   		_result = {}
   	}
   	// 遍历传入的对象，并赋值
   	for(let key in obj){
   		// 判断是否为自己本身的属性
   		if(obj.hasOwnProperty(key)){
   			// 如果是，赋值(递归复制深层)
   			_result[key] = deepClone(obj[key])
   		}
   	}
   	// 返回结果数据
   	return _result
   }
   ```

2. vuex源码中的DeepCopy

   ```javascript
   function find(list, f) {
       return list.filter(f)[0]
   }
   function deepCopy(obj, cache) {
       const Constructor = obj.constructor
       // typeof null的返回值为object，所以可以直接省略
       if (typeof obj !== 'object') {
           return obj
       } else if (Constructor === RegExp) {
           return new Constructor(obj)
       } else if (Constructor === Date) {
           return new Constructor(obj.getTime())
       }

       if (cache === void 0) cache = []

       // just return if obj is immutable value
       if (obj === null || typeof obj !== 'object') {
           return obj
       }

       // if obj is hit, it is in circular structure
       var hit = find(cache, function (c) { return c.original === obj })
       if (hit) {
           return hit.copy
       }

       var copy = Array.isArray(obj) ? [] : {}
       // put the copy into cache at first
       // because we want to refer it in recursive deepCopy
       cache.push({
           original: obj,
           copy: copy
       })

       Object.keys(obj).forEach(function (key) {
           copy[key] = deepCopy(obj[key], cache)
       })

       return copy
   }

   const obj1 = { x: 1 }
   const obj2 = { x: 2 }
   obj1.fn = function add() {
       return 's'
   }
   obj1.reg = /\s+/g
   obj1.time = new Date()
   const obj3 = deepCopy(obj1);
   console.log(obj1)
   console.log(obj2)
   console.log(obj3)

   /* 输出
   > {"x":1,"reg":{},"time":"2022-08-02T07:18:15.517Z"}
   > {"x":2}
   > {"x":1,"reg":{},"time":"2022-08-02T07:18:15.517Z"}
   */
   ```

## 防抖 & 节流

### 防抖

* 案例

  ```html
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <title>Document</title>
      <style>
        * {
          margin: 0;
          padding: 0;
        }
        #content {
          width: 200px;
          height: 200px;
          line-height: 200px;
          background-color: #ccc;
          margin: 0 auto;
          font-size: 60px;
          text-align: center;
          color: #000;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div id="content"></div>
      <script>
        /*
        连续onmousemove在最后一次触发changeNum函数，
        多余的处理函数的都会被clearTimeout掉
        */
          let num=1
          let oDiv= document.getElementById('content')
  
          let changeNum=function () {
              oDiv.innerHTML=num++
          }
  
          let deBounce = function (fn,delay){
            let timer=null
            return function (...args) {
              if(timer) clearTimeout(timer)
              timer = setTimeout(()=>{
                fn(...args)
              },delay)
            }
          }
          oDiv.onmousemove=deBounce(changeNum,500)
          // or
          let _deBounce = deBounce(changeNum,500)
          oDiv.onmousemove=function(){
            _deBounce()
           }
      </script>
    </body>
  </html>
  ```

* underscore 库 debounce 源码

  ```javascript
  _.debounce = function(func, wait, immediate) {
    var timeout, result
  
    var later = function(context, args) {
      timeout = null
      if (args) result = func.apply(context, args)
    }
  
    var debounced = restArguments(function(args) {
      if (timeout) clearTimeout(timeout)
      if (immediate) {
        var callNow = !timeout
        timeout = setTimeout(later, wait)
        if (callNow) result = func.apply(this, args)
      } else {
        timeout = _.delay(later, wait, this, args)
      }
  
      return result
    })
  
    debounced.cancel = function() {
      clearTimeout(timeout)
      timeout = null
    }
  
    return debounced
  }
  ```

* 防抖使用场景

  ```html
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <title>Document</title>
    </head>
    <body>
      <input type="text" />
      <!-- 防抖场景 -->
      <script>
        //  防抖函数
        let deBounce = (fn, delay) => {
          let timer = null
          return function(...args) {
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => {
              fn(...args)
            }, delay)
          }
        }
        let oInput = document.getElementsByTagName('input')[0]
        //  模拟请求
        let ajax = message => {
          let json = { message }
          console.log(JSON.stringify(json))
        }
        let doAjax = deBounce(ajax, 200)
  
        // 键盘弹起执行
        oInput.addEventListener('keyup', e => {
          doAjax(e.target.value)
        })
      </script>
    </body>
  </html>
  ```

### 节流源码

* 案例

  ```html
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <title>Document</title>
    </head>
    <body></body>
    <button>点击</button>
    <script>
      /*
       * 连续点击只会1000执行一次btnClick函数
       */
      let obutton = document.getElementsByTagName('button')[0]
      //  如果用箭头函数，箭头函数没有arguments，也不能通过apply改变this指向
      function btnClick() {
        console.log('我响应了')
      }
      /*
         方法1: 定时器方式实现
         缺点：第一次触发事件不会立即执行fn，需要等delay间隔过后才会执行
      */
      let throttle = (fn, delay) => {
        let flag = false
        return function(...args) {
          if (flag) return
          flag = true
          setTimeout(() => {
            fn(...args)
            flag = false
          }, delay)
        }
      }
      /*
          方法2:时间戳方式实现
          缺点：最后一次触发回调与前一次的触发回调的时间差小于delay，则最后一次触发事件不会执行回调
      */
      let throttle = (fn, delay) => {
        let _start = Date.now()
        return function(...args) {
          let _now = Date.now(),
            that = this
          if (_now - _start > delay) {
            fn.apply(that, args)
            start = Date.now()
          }
        }
      }
  
      // 方法3:时间戳与定时器结合
      let throttle = (fn, delay) => {
        let _start = Date.now()
        return function(...args) {
          let _now = Date.now(),
            that = this,
            remainTime = delay - (_now - _start)
          if (remainTime <= 0) {
            fn.apply(that, args)
          } else {
            setTimeout(() => {
              fn.apply(that, args)
            }, remainTime)
          }
        }
      }
      /*
           方法4:requestAnimationFrame实现
           优点：由系统决定回调函数的执行机制，60Hz的刷新频率，每次刷新都会执行一次回调函数，不
           会引起丢帧和卡顿
           缺点：1.有兼容性问题2.时间间隔有系统决定
      */
      let throttle = (fn, delay) => {
        let flag
        return function(...args) {
          if (!flag) {
            requestAnimationFrame(function() {
              fn.apply(that, args)
              flag = false
            })
          }
          flag = true
        }
      }
  
      obutton.onclick = throttle(btnClick, 1000)
    </script>
  </html>
  ```

* underscore 库 throttle 源码

  ```javascript
  _.throttle = function(func, wait, options) {
    var timeout, context, args, result
    var previous = 0
    if (!options) options = {}
  
    var later = function() {
      previous = options.leading === false ? 0 : _.now()
      timeout = null
      result = func.apply(context, args)
      if (!timeout) context = args = null
    }
  
    var throttled = function() {
      var now = _.now()
      if (!previous && options.leading === false) previous = now
      var remaining = wait - (now - previous)
      context = this
      args = arguments
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }
        previous = now
        result = func.apply(context, args)
        if (!timeout) context = args = null
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining)
      }
      return result
    }
  
    throttled.cancel = function() {
      clearTimeout(timeout)
      previous = 0
      timeout = context = args = null
    }
  
    return throttled
  }
  ```

  



