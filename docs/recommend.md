这年头，Redux 状态管理框架满天飞，前几天在网上闲逛偶然又发现 Rematch、Mirror、Smox、Xredux，都用了一下，发现都是套瓷娃娃，大同小异，拿几个比较历害的来说：

- [DvaJS](https://github.com/dvajs/dva) Github Stars `12000+`
- [Rematch](https://github.com/rematch/rematch) Github Stars `5000+`
- [Mirror](https://github.com/mirrorjs/mirror) Github Stars `1200+`

无非就是类似这样的：

```JS
model({
    state: ...,
    reducers: {
        aaa(playload)
        bbb(playload)
    },
    effects: {
        ccc(playload)
        ddd(playload)
    }
})
```

![无聊](https://github.com/wooline/react-coat/blob/master/docs/imgs/c.gif)

审美疲劳了？H 起来，给大家推荐一款小鲜肉：`React-coat`：

[https://github.com/wooline/react-coat](https://github.com/wooline/react-coat)

```JS
class ModuleHandlers extends BaseModuleHandlers {
  @reducer
  public aaa(playload): State {...}

  @reducer
  private bbb(playload): State {...}

  @effect("ajaxLoading")
  public async ccc(playload) {...}

  @effect("loginLoading")
  private async ddd(playload) {...}
}
```

spring 风格？ng 风格？

![好](https://github.com/wooline/react-coat/blob/master/docs/imgs/e.gif) 就问你骚气不骚气？😂

可能你会说，用 Class 呀，不喜欢，我喜欢 FP 风格。我想说，这是状态管理框架非 React UI 框架，不要为了流行 FP 就皆 FP，就象当年 JS 流行面向对象编程，把面向过程说成洪水猛兽。

## 武装到牙齿的 TS 类型反射

React-coat 全面拥抱 Typescript，直接上图：

action 调用时的类型反射：

![好](https://github.com/wooline/react-coat/blob/master/docs/imgs/4.png)

动态加载模块时的类型反射：

![好](https://github.com/wooline/react-coat/blob/master/docs/imgs/5.png)

Store State 结构的类型反射：

![好](https://github.com/wooline/react-coat/blob/master/docs/imgs/6.png)

连路由参数也有类型反射：

![好](https://github.com/wooline/react-coat/blob/master/docs/imgs/7.png)

![好](https://github.com/wooline/react-coat/blob/master/docs/imgs/e.gif) 就问你骚气不骚气？😂

## 支持单页 SPA 和服务器渲染 SSR 同构

Demo：[SPA(单页) + SSR(服务器渲染)](https://github.com/wooline/react-coat-ssr-demo)

- 而且**SSR 在开发时也可以享受：“热更新”**
- 还支持 SPA(单页) + SSR(服务器渲染)一键切换。

> 打开项目根下的./package.json，在"devServer"项中，将 ssr 设为 true 将启用服务器渲染，设为 false 仅使用浏览器渲染

![好](https://github.com/wooline/react-coat/blob/master/docs/imgs/e.gif) 就问你骚气不骚气？😂

## 强大而便捷的 Dispatch Action

对比一下各大框架 Dispatch Action 的语法：

```JS
// Dva中
yield put({type: 'moduleA/increment',  payload: 2});

// Rematch中
dispatch.moduleA.increment(2);

// Mirror中
actions.moduleA.increment(2);

// React-coat中
import moduleA from "modules/moduleA/facade";
...
await this.dispatch(moduleA.actions.increment(2));
```

- 语法简洁性上，Dva 用的 saga 中的 yield put，还要写 type 和 payload，最繁琐。其它三款都直接用方法调用，更简洁。
- Rematch 和 Mirror 等于把所有 action 都放到一个全局变量中去了，而 React-coat **去中心化**，按需引入 moduleA，`更利于系统保持松散结构`。
- 从语义上来说 React-coat 依然显示的保留 dispatch 关键字，`moduleA.actions.increment(2)` 返回的是依然是 Action，`dispatch(action)` 作为 Redux 的基本理念得到完整的保持，Rematch 和 Mirror 已经变成传统的 MVC 了。
- 从功能上，只有 Dva 和 React 支持`同步 effect`。其它两款都不支持，或者是我没发现？什么是同步 effect？例如：

  - query 会触发一个 effect，updateState 会触发一个 reducer
  - updateState 需要等待 query 执行完后再 dispatch

  ```JS
  // Dva中使用 saga 的 put.resolve 来支持同步 effect
  yield put.resolve({type: 'query',payload:1});
  yield put({type: 'updateState',  payload: 2});
  ```

  ```JS
  // React-coat 中可以直接 awiat dispatch
  await this.dispatch(thisModule.actions.query(1));
  this.dispatch(thisModule.actions.updateState(2));
  ```

- React-coat 的独有的杀手锏：action 名称和参数的类型反射和智能提示、public private 权限的控制，让你感受什么才叫真正的封装。试想下如果多人同时并行开发多个模块，你还需要为你的模块写一大篇 API 说明文档么？

![好](https://github.com/wooline/react-coat/blob/master/docs/imgs/e.gif) 就问你骚气不骚气？😂

## 彻底的模块化

既然是企业级应用，那模块化自然是少不了的，包括模块封装、代码分割、按需加载。模块化的目的主要是拆分复杂系统、解耦与重用。

以上框架中，Rematch 和 Mirror 的模块化功能比较弱，且不优雅。Dva 和 React-coat 都有强大的模块化功能，其中 Dva 可以搭配 UMI 来自动配置。

在 dva 中动态加载 model 和 component，要靠路由配置：

```JS
{
  path: '/user',
  models: () => [import(/* webpackChunkName: 'userModel' */'./pages/users/model.js')],
  component: () => import(/* webpackChunkName: 'userPage' */'./pages/users/page.js'),
}
```

React-coat 中代码分割和路由分层而治，一个 module 一个分割：

```JS
// 定义代码分割
export const moduleGetter = {
  app: () => {
    return import(/* webpackChunkName: "app" */ "modules/app");
  },
  photos: () => {
    return import(/* webpackChunkName: "photos" */ "modules/photos");
  },
}
```

React-coat 中支持路由动态加载，也支持非路由动态加载

```JS
// 使用路由加载：
const PhotosView = loadView(moduleGetter, ModuleNames.photos, "Main");
...
<Route exact={false} path="/photos" component={PhotosView} />
```

```JS
// 直接加载：
const PhotosView = loadView(moduleGetter, ModuleNames.photos, "Main");
...
render() {
  const {showDetails} = this.props;
  return showDetails ? <DetailsView /> : <ListView />;
}
```

- Dva 以 Page UI 主线来划分模块；React-coat 以业务功能**高内聚、低偶合**来划分模块。后者更适合解耦与重用。
- Dva 使用集中配置、将 Page、路由、model、代码分割全部都集中写在一个中心文件中；**React-coat 去中心化**，将各自的逻辑封装在各自模块中，并且 model、代码分割、路由分层而治，互不干涉。后者更干净整洁。
- Dva 将每个 model 和 component 都做成一个代码分割包；React-coat 将一个 Module 整体做成一个代码分割包，前者太碎，后者更符合 bundle 概念。
- React-coat 支持路由动态加载 View，也支持非路由动态加载 View，二条腿走路步子迈得更大。
- React-coat 动态加载 View 时会自动导入 Model，无需手工配置加载 Model，是真正的路由组件化。

更多差异还是请看：[与 DvaJS 风云对话，是 DvaJS 挑战者？还是又一轮子？](https://juejin.im/post/5c7c84a951882546c54c1910)

![好](https://github.com/wooline/react-coat/blob/master/docs/imgs/e.gif) 就问你骚气不骚气？😂

## 跨模块的调用与协作

在复杂的长业务流程中，跨模块调用与协作是少不了的，Dva、Rematch、Mirror、React-coat 都支持跨模块派发 action，跨模块读取 State。比如：

```JS
// Mirror中
if(resphonse.success){
    actions.moduleA.doSomeEffect();
    actions.moduleB.doSomeEffect();
}
```

这是一种串联调用的模式，适应于一些耦合紧密的业务流。 但对于一些松散耦合的业务流程，最佳的方式应当是观察者模式，或叫事件广播模式。

> 场景：当 moduleA 执行了一个 action，moduleB、moduleC、moduleD...都需要执行一些各自的动作

这就是 React-coat 独有的杀手锏：ActionHandler 概念。

```JS
class ModuleB {
    //在ModuleB中监听"ModuleA/update" action
    async ["ModuleA/update"] (){
        await this.dispatch(this.action.featchData())
    }
}

class ModuleC {
    //在ModuleC中监听"ModuleA/update" action
    async ["ModuleA/update"] (){
        await this.dispatch(this.action.featchData())
    }
}
```

React-coat 主动调用、事件广播两种模式都支持，二手都要抓，二手都要硬。就问你骚气不骚气？😂

![完毕](https://github.com/wooline/react-coat/blob/master/docs/imgs/a.gif)
![完毕](https://github.com/wooline/react-coat/blob/master/docs/imgs/b.gif)
