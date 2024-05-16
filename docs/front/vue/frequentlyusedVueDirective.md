---
title: 6大vue常用指令
date: 2022-06-23
sidebar: 'auto'
tags:
 - Vue
categories:
 - 前端
---

## v-copy

* 思路分析

  要想实现文本的自动复制，我们需要借助原生js的 document.execCommand("Copy")来实现，但是此方法有一个局限性，那就是只能复制文本框input或多行文本textarea中的文本内容，所以要**想实现自由复制避免不了借助input或textarea来实现**。

  - 要实现点击复制，首先我们应该给要点击的元素绑定一个click事件，并在该点击事件中动态的创建一个textarea，用于保存当前元素中的文本内容（因为前面说过document.execCommand('Copy')只能复制input或textarea中的文本）。这些操作可以放在==beforeMount==钩子函数中，对应2.0的是bind函数。
  - 另外我们创建的这个textarea只是作为一个中介的作用，而并不是实际的业务组件，所以新创建的textarea不应该显示在页面上的，需要隐藏掉（需要注意的是不能用display=none隐藏，因为这种隐藏依然无法复制，可以使用opacity=0来实现）。完成复制后再把该textarea删除掉。
  - 另外还需考虑当元素的数据更新的时候，我们要复制的值也同样是需要更新的，这一步可以在==updated==钩子函数中实现，对应2.0中的componentUpdate函数。
  - 最后我们对元素添加的click事件，当指令解绑时还需把对应的事件删除。这一步可以在==unmounted==钩子中实现，对应2.0中的unbind

* 自定义指令 v-copy 代码实现

  ```javascript
  const app = createApp();
  app.directive('copy',{
  	beforeMount(el,binding){
  		//先给el元素挂上2个自定义属性，因为el是每个钩子函数都能访问到的
  		//一个是$value用于存放要复制的文本，另一个$handle用于定义click事件回调函数（因为在其它钩子函数中还需要删除该事件）
  		el.$value = binding.value;
  		el.$handle=function(){
  			if(!el.$value) return;//如果文本为空不做任何操作
  			let textarea = document.createElement('textarea');
  			textarea.value = el.$value;			
  			textarea.style.cssText('opacity:0;position:fixed;left:-999px');//隐藏textarea
  			document.body.appendChild(textarea);
  			textarea.select();//让文本全部选中
  			let copyText = document.execCommand('Copy');
  			document.body.removeChild(textarea);//复制完成后删除创建的textarea
  		}
  		el.addEventListener('click',el.$handle);
  	},
  	updated(el,binding){
  		el.$value = binding.value;//数据变化后重新赋值
  	},
  	unmounted(el){
  		el.removeEventListener('click', el.$handle);//移除点击事件
  	}
  });
  ```


## v-emoji

* 思路分析

  输入限制相对前面讲过的自动复制还要简单一些，整个过程我们只需要用到2个钩子函数：**一个是beforeMount用于在指令第一次绑定时给元素添加keyup事件并处理非法输入的逻辑，另一个是unmounted用于移除元素的keyup事件**

  - beforeMount：指令第一次绑定元素前
    - 给要绑定的元素el添加keyup事件
    - 在keyup的回调函数中接收自定义指令的限制规则（程序开发时可以将限制规则通过指令值的形式传给指令，如v-emoji="[^a-zA-Z0-9]/g"）
    - 将不符合限制规则的非法字符替换并重新赋值给元素的value
  - unmounted：指令解绑后同时移除元素的keyup事件

* 代码实现

  ```html
  <input type='text' v-emoji="'[^a-zA-Z0-9]'" v-model='dataText' />
  <span>{{dataText}}</span>
  ```

  ```javascript
  const app =  createApp();
  app.directive('emoji',{
  	beforeMount(el, binding){
  		//keyup事件回调函数，便于后续删除
  		el.$handle = function(){
  			let val = el.value;//input输入框的value
  			let reg = new RegExp(binding.value);//指令的限制规则
  			el.value = val.replace(reg,'');//不符合规定的字符替换
  		}
  		el.addEventListener('keyup', el.$handle);
  	},
  	unmounted(el){
  		el.removeEventListener('keyup', el.$handle);
  	}
  });
  ```

* 优化

  上面的代码从表面上看貌似是已经实现了我们的需求。然鹅这里还有个问题：如果将上面的代码运行起来，你会发现当我们在文本框中输入一个特殊字符时，文本框中会立即把特殊字符值删除掉，但是下面的span却依然还保留着特殊字符。这是因为在上面的代码中我们在把特殊字符替换掉后直接赋值给了input的value属性，这时并没有触发文本框的input事件。而了解v-model原理的小伙伴应该都知道，v-model之所以能够实现双向绑定，是因为v-model会监听文本框的input事件，当input被触发时会去更新对应的属性值。而我们代码中的替换值操作并没有触发input事件。
  那么找到了问题的原因，也就好解决了，我们只需要在代码中触发一些input事件就可了，下面来看一下优化后的完整代码。

  ```javascript
  const app =  createApp();
  const trigger = function trigger(el,type){
  	let ev = document.createEvent('HTMLEvents');//创建HTML事件
  	ev.initEvent(type,true,true);//初始化事件，type为事件类型，如input
  	el.dispatchEvent(ev);//派发事件
  }

  app.directive('emoji',{
  	beforeMount(el, binding){
  		//keyup事件回调函数，便于后续删除
  		el.$handle = function(){
  			let val = el.value;//input输入框的value
  			let reg = new RegExp(binding.value);//指令的限制规则
  			el.value = val.replace(reg,'');//不符合规定的字符替换
  			//同步到响应式数据中
  			trigger(el, 'input');//触发元素是input事件
  		}
  		el.addEventListener('keyup', el.$handle);
  	},
  	unmounted(el){
  		el.removeEventListener('keyup', el.$handle);
  	}
  });
  ```

## v-debounce

* 思路分析

  我们知道一般情况下，防抖函数会接收3个参数：一个是防抖函数中要执行的具体函数func，一个是等待的时间wait，还有一个就是immediate标识立即执行还是最后执行。

  之前学习vue自定义指令时我们已经知道：指令等号后面值会作为参数传递给指令函数，但是等号后面只有一个值，而我们要传递是3个值甚至更多，怎么办，其实也简单，我们只需要把要传递的参数拼成一个对象传递就可以了。这样传多少个参数都不是问题

  另外像wait和immediate这两个参数算是特殊参数，为什么这么说呢？wait是设置防抖时间的而immediate是作为标识的。这个时候冒号和修饰符就派上用场了。我们在使用vue指令的时候，在指令的后面可以跟一个冒号和一个值，而这个值也会被传给指令函数，并在函数中通过binding.arg或者这个值。同时指令后面还可以接修饰符，类似v-xxx.yyy，点后面的就是修饰符，在指令函数中通过binding.modifier.yyy获取该指令（一般是true或false值）

  通过上面的分析，其中的两个参数我们已经通过冒号和修饰符的形式传递了，那么就只剩下一个函数了，这个时候我们完全可以不用传递对象而是直接将函数传给指令即可。所以这里就出现了两种情况，一种是传递了一个对象，还有一种是只穿一个函数。所以后面我们写代码时应该有所区分，如果是函数直接执行，如果是对象则需要解析出对象中的值。

  另外为了让我们的自定义指令更灵活更通用，我们还需要做如下处理

  - 在指令函数中再额外接收一个type参数，用来标识是什么类型的防抖，比如click或scroll等，这个可以自由选择
  - 同时也接收一个额外的params参数。想想如果我们传递给指令的函数也需要其它参数呢，这时仍然可以通过外面以对象属性的形式进行传递
  - 最后就是除了函数是必须要传的参数以外，其它几个参数可以传也可以不传，所以我们需要为这些除了func以外的其它参数设置默认值。

* 防抖v-debounce自定义指令代码

  ```javascript
  function debounce(func, wait = 300, immediate = true){
  	let timer = null;
  	return function anonymouse(...params){
  		clearTimeout(timer);
  		let now = immediate && !timer;
  		timer = setTimeout(() => {
  			timer = null;
  			!immediate ? func.call(this, ...params) : null;
  		},wait);
  		now ? func.call(this, ...params) : null;
  	}
  }

  const app = createApp();
  app.directive("debounce",{
  	beforeMount(el,binding){
  		let val = binding.value,//获取指令传递的参数
  			wait = 500,//wait默认500毫秒
  			immidiate = false,
  			type = 'click',
  			params = [],
  			func
  		if(val == null) return;//如果没有传递任何参数则什么也不做
  		if(typeof val !== 'object' && typeof val !== 'function') return ;//如何传递的参数既不是对象也不是函数则也什么都不做
  		if(binding.arg) wait = +binding.arg;//获取冒号后面的参数
  		if(binding.modifiers && binding.modifiers.immediate) immediate = binding.modifiers.immediate;//获取修饰符
  		if(typeof val === 'function') func = val;//如果传递的是函数则直接赋给func
  		if(typeof val === 'object'){//如果是对象则对对象进行解析
  			func = val.func || function(){};
  			type = val.type || 'click';
  			params = val.params || [];			
  		}
  		el.$type = type;
  		//此步操作多定义了一个proxy函数目的是可以给func传递参数，同时保证func中的this指向
  		el.$handle = debounce(function proxy(...args){
  			return func.call(this, ...params.concat(args));
  		},wait, immediate);
  		el.addEventListener(el.$type, el.$handle);
  	},
  	unmounted(el){
  		el.removeEventListener(el.$type, el.$handle);
  	}
  });
  ```

## v-throttle

* 思路分析

  节流函数一般会接收2个参数：一个是节流函数中要执行的具体函数func，另一个则是节流等待的时间wait。

  同样需要传递多个参数给指令函数时，我们可以组装一个对象一起传递

  - wait参数仍然可以以冒号的形式进行传递

  - 对于指令函数体内接收到的参数进行判断处理：如果是函数直接传给节流函数，如果是对象则需对对象进行解析拆分。

  - 另外还是为了让我们的自定义指令更灵活更通用，我们仍然需要在指令函数中再额外接收一个type和一个params参数，分别用来标识是什么类型的节流和节流函数所需的参数

    最后就是除了函数以外的其它参数均需设置默认值。

* v-throttle节流自定义指令代码

  ```javascript
  function throttle(func, wait){
  	let timer = null,
  		previous = 0;
  	return function anonmouse(...params){
  		let now = new Date(),
  			remaining = wait - (now - previous);
  		if(remaining <= 0){
  			previous = now;
  			clearTimeout(timer);
  			timer = null;
  			func.call(this, ...params);
  		}else if(!timer){
  			timer = setTimeout(() => {
  				timer = null;
  				previous = new Date();				
  				func.call(this, ...params);
  			}, remaining);
  		}
  	}
  }

  const app = createApp();
  app.directive("throttle",{
  	beforeMount(el,binding){
  		let val = binding.value,//获取指令传递的参数
  			wait = 500,//wait默认500毫秒
  			type = 'click',
  			params = [],
  			func
  		if(val == null) return;//如果没有传递任何参数则什么也不做
  		if(typeof val !== 'object' && typeof val !== 'function') return ;//如何传递的参数既不是对象也不是函数则也什么都不做
  		if(binding.arg) wait = +binding.arg;//获取冒号后面的参数
  		if(typeof val === 'function') func = val;//如果传递的是函数则直接赋给func
  		if(typeof val === 'object'){//如果是对象则对对象进行解析
  			func = val.func || function(){};
  			type = val.type || 'click';
  			params = val.params || [];			
  		}
  		el.$type = type;
  		//此步操作多定义了一个proxy函数目的是可以给func传递参数，同时保证func中的this指向
  		el.$handle = throttle(function proxy(...args){
  			return func.call(this, ...params.concat(args));
  		},wait, immediate);
  		el.addEventListener(el.$type, el.$handle);
  	},
  	unmounted(el){
  		el.removeEventListener(el.$type, el.$handle);
  	}
  });
  ```

## v-permission

* 前言

  在我们日常开发中权限校验是必不可少的一个环节，尤其是对于一些应用系统或一些中后台的开发，更是需要用到权限校验的。那么权限校验也有很多种类，比如菜单权限、组件权限甚至是小到元素权限等等，本文我们就将以元素权限为例，实现一个简单的权限校验自定义指令。

  在有一些场景中我们可能会根据用户登录后所拥有的权限来决定哪些元素该显示，哪些元素不该显示。比如我们最常使用的就是增删改查操作，那么对于管理员来说权限很大，增删改查都有权限操作，而对于普通用户来说可能只有查询操作，这个时候就需要根据不同用户权限来决定元素的显示和隐藏了。


* 思路分析

  首先因为会涉及到元素的展示和隐藏操作，所以在我们自定义指令时就不能再用beforeMount钩子函数了，而是需要用mounted函数，也就是说等元素渲染后再去控制是否展示

  在mounted函数中，我们首先需要获取登录用户所拥有的权限。一般情况下在用户登录后会去请求服务器获取用户权限，然后再把权限数据保存在vuex中。这里我们要做的就是把权限数据从vuex中解析出来，便于后续使用。（为了方便展示，我们就直接使用字符串代替了）

  权限数据拿到以后，我们还需要判断当前元素需要哪些权限，比如删除按钮需要的就是对应的删除权限，而这个权限在元素被定义时就应该已经确定了，所以我们应该在对应的元素中把需要的权限传给我们的自定义指令，然后再通过binding.value拿到该权限

  最后就是对比校验，看看当前元素所需要的权限是否存在于用户的权限列表中，如果存在则说明有权限元素应该显示，否则没有权限移除对应的元素

* 权限校验代码实现

  ```html
  <button v-permission="'add'">add</button>
  <button v-permission="'del'">del</button>
  <button v-permission="'update'">update</button>
  <button v-permission="'query'">query</button>
  ```

  ```javascript
  const app = createApp();
  app.directive('permission',{
  	mounted(el,binding){
  		//从服务获取用户的权限列表，一般获取后存放于vuex中，本案例为了方便演示将直接以字符串的形式展示
  		//权限之间以分号分隔
  		//管理员权限："add;del;update;query"
  		//普通用户权限："add;del;update;query"
  		let permission = "update;query",//权限字符串
  			permissionList = [];//权限列表
  		if(!permission) permission = "";
  		permissionList = permission.split(";");

  		//获取需要的权限标识，即元素给指令传进来的参数值
  		let passText = binding.value,//可以是多个值，中间以分号分隔
  			passTextArr = [];//将权限解析到数组中
  		if(!passText) passText = "";
  		passTextArr = passText.split(';');
  		
  		//定义一个权限标识变量，用于标识是否有权限
  		let flag = false;
  		//循环遍历权限列表，检测用户是否有相应的操作权限
  		for(let i = 0; i < passTextArr.length; i++){
  			if(permissionList.includes(passTextArr[i])){
  				//如果从服务器中获取的权限列表中有组件所需的权限，则将flag置为true,同时跳出循环
  				flag = true;
  				break;
  			}
  		}
  		//如果flag为false，也就是没权限则直接将元素移除或者隐藏
  		if(!flag) el.parentNode && el.parentNode.removeChild(el);
  	}
  })
  ```

  :::tip

  代码运行起来后，我们会发现对应管理员来说，会看到全部按钮，而对于普通用户来说则只能看到update和query按钮

  :::

## v-lazyload

* 前言

  先来简单介绍下，为什么要用图片懒加载而不是直接加载？小伙伴们应该都知道，在前端中向引入外部css文件，JavaScript文件以及一些图片资源等等都是需要发送单独的http请求的，而http请求多了势必会影响到页面的性能，如果一个页面有大量的图片需要加载，如果不采用懒加载的话，就会需要大量的http请求从而占用了页面其它资源的正常请求进而就会影响到了页面的性能，这绝对是不可取的。因此图片的懒加载就因运而生了。

  虽然大量的http请求是不可避免的，但是我们可以让它们分批分时去请求而不是一次性的全部请求，这也是懒加载的核心所在。懒加载最大的的有点就是可以让图片最后请求，或者说是需要展示的时候再请求，不展示就不请求，这样一来必然就节省了很多的http占用。比如说像京东、淘宝这类电商网站，当我们搜索一件商品时，会搜出很多很多，这时候我们就需要向下拖动滚动条来筛选适合我们想要的商品，而这个过程就利用了图片懒加载的技术，也就是说当前屏幕中呈现在我们面前的图片会优先展示出来，而那些隐藏的图片是不会去请求的而是随着滚动条的向下滚动，图片即将要出现在屏幕中时在去请求。

* 实现思路

  这里要实现一个图片懒加载的自定义指令，我们还需要借助浏览器为我们提供的一个原生的构造函数：IntersectionObserver，它可以用来监听元素是否进入了设备的可视区域之内。因此我们就利用它的这一特点来控制是否需要进行图片的加载。关于IntersectionObserver这里不做过多的介绍，仅仅拿来使用。

  IntersectionObserver需要两个参数，一个是回调函数，一个是配置对象。其中配置对象中有个threshold属性（其值为0~1）可以用来控制什么时候来触发回调函数。比如元素刚刚出现在视口或者元素完全出现在视口等等.

  在IntersectionObserver的回调函数中我们需要解析出两个值target和isIntersecting，target就是要监听的元素对象，而isIntersecting是一个布尔值用于标识是否达到了视口条件。

  一般情况下，我们的img元素不会直接放在文档流中，而是将其包裹在div或者是li中，我们需要绑定指令的也不是直接给img元素而是它的父元素div或li，因此我们要监听的也是父元素div或者li，即我们在回调函数中解析出来的target应该是img的父元素。所以这里还需要通过父元素获取到真正的img元素，然后把真正的图片地址赋值给img的src属性从而实现图片的加载展示。

  在自定义指令的mounted函数中只需要两句代码，一个是接收指令传过来的图片的真实路径，并把它保存于元素el的自定义属性中，便于后续IntersectionObserver使用。另一句则是将元素el通过IntersectionObserver的observe实现监听

* 懒加载指令代码

  ```html
  <div v-lazyload="./xxx.jpg"><img src=""/></div>
  <div v-lazyload="./xxx.jpg"><img src=""/></div>
  <div v-lazyload="./xxx.jpg"><img src=""/></div>
  <div v-lazyload="./xxx.jpg"><img src=""/></div>
  ```

  ```javascript
  const ob_config = {
  	threshold: [1]//当图片完全出现在视口中时在加载
  };
  const ob = new IntersectionObserver((entries)=>{
  	entries.forEach(item=>{
  		let {target, isIntersecting} = item;//解析出监听元素对象（div）和标识
  		if(!isIntersecting) return;
  		let imgBox = target.querySelector('img');//获取真实的img元素
  		if(!imgBox) return;
  		imgBox.src = target.$src;//通过监听元素的自定义属性拿到真实的图片路径并绑定给img的src属性
  		imgBox.style.opacity = 1;//让图片显示
  		ob.unobserve(target);//解除监听
  	});
  }, ob_config);

  const app = createApp();
  app.directive('lazyload', {
  	mounted(el, binding){
  		let imgBox = el.querySelector('img');
  		if(!imgBox) return;
  		imgBox.src = '';
  		//以上3句代码完全可以省略
  		//下面的2句可以放在同一样式中
  		imgBox.style.opacity = 0;//不显示图片元素
  		imgBox.style.transition = 'opacity .3s';//设置过度效果
  		//以下两句才是关键
  		el.$src = binding.value;//接收指令值并绑定给el的自定义属性$src上
  		ob.observe(el);//监听el
  	}
  });
  ```

  ​