react 生态圈的开放、自由、繁荣，也导致开发配置繁琐、选择迷茫。react-coat 放弃某些灵活性、以`约定替代某些配置`，固化某些`最佳实践`方案，从而提供给开发者一个更简洁的糖衣外套。

<!-- TOC -->

- [4.0 发布](#40-发布)
- [react-coat 特点](#react-coat-特点)
- [安装 react-coat](#安装-react-coat)
- [兼容性](#兼容性)
- [快速上手及 Demo](#快速上手及-demo)
- [与 蚂蚁金服 Dav 的异同](#与-蚂蚁金服-dav-的异同)
- [基本概念与名词](#基本概念与名词)
  - [Store、Reducer、Action、State、Dispatch](#storereduceractionstatedispatch)
  - [Effect](#effect)
  - [ActionHandler](#actionhandler)
  - [Module](#module)
  - [ModuleState、RootState](#modulestaterootstate)
  - [Model](#model)
  - [View、Component](#viewcomponent)
- [路由与动态加载](#路由与动态加载)
- [API 一览](#api-一览)
- [几个特殊的 Action](#几个特殊的-action)
- [后续开发](#后续开发)
  - [react-coat-immutable](#react-coat-immutable)
  - [react-shirt](#react-shirt)
  - [学习交流](#学习交流)

<!-- /TOC -->

## 4.0 发布

- 继承并扩展 3.0 的基本理念
- 去除 redux-saga，改用原生的 async 和 await 来组织和管理 effect
- 同时支持 SPA(单页应用)和 SSR(服务器渲染)、完整的支持客户端与服务端同构

## react-coat 特点

- 集成 react、redux、react-router、history 等相关框架
- 仅为以上框架的糖衣外套，不改变其基本概念，无强侵入与破坏性
- 结构化前端工程、业务模块化，支持按需加载
- 同时支持 SPA(单页应用)和 SSR(服务器渲染)
- 使用 typescript 严格类型，更好的静态检查与智能提示
- 开源微框架，源码不到千行，几乎不用学习即可上手

## 安装 react-coat

    $ npm insatll react-coat

依赖周边生态库：

```
"peerDependencies": {
    "@types/node": "^9.0.0 || ^10.0.0",
    "@types/history": "^4.0.0",
    "@types/react": "^16.0.0",
    "@types/react-dom": "^16.0.0",
    "@types/react-redux": "^5.0.0 || ^6.0.0",
    "@types/react-router-dom": "^4.0.0",
    "connected-react-router": "^4.0.0 || ^5.0.0",
    "history": "^4.0.0",
    "react": "^16.0.0",
    "react-dom": "^16.0.0",
    "react-redux": "^5.0.0",
    "react-router-dom": "^4.0.0",
    "redux": "^3.0.0 || ^4.0.0"
  },
```

如果你想省心，并且对以上依赖版本没有特别要求，你可以安装"all in 1"的 [react-coat-pkg](https://github.com/wooline/react-coat-pkg)，它将自动包含以上库，并测试通过各版本不冲突：

    $ npm install react-coat-pkg

## 兼容性

各主流浏览器、IE9 或 IE9 以上

本框架依赖于完整版"Promise"，低版本浏览器请自行安装 polyfill，推荐安装@babel/polyfill，该库可模拟 unhandledrejection error，当你需要在客户端捕捉错误并上报时需要。

## 快速上手及 Demo

本框架上手简单

- 8 个新概念：

  > Effect、ActionHandler、Module、ModuleState、RootState、Model、View、Component

- 4 步创建：
  > exportModel(), exportView(), exportModule(), createApp()
- 2 个 Demo:

  > [入手：SPA(单页应用)](https://github.com/wooline/react-coat-spa-demo)

  > [进阶：SPA(单页应用)+SSR(服务器渲染)](https://github.com/wooline/react-coat-ssr-demo)

## 与 蚂蚁金服 Dav 的异同

> 本框架与 [Dvajs](https://github.com/dvajs/dva) 理念略同，主要差异：

- 使用 typescript 强类型推断和检查
- 去除 redux-saga，使用 async、await 替代，简化代码的同时对 TS 类型支持更全面
- 路由组件化、无 Page 概念、更自然的 API 和更简单的组织结构
- 更大的灵活性和自由度，不强封装
- 支持 SPA(单页应用)和 SSR(服务器渲染)一键切换，
- 支持模块异步按需加载和同步加载一键切换

> 差异示例：使用强类型组织所有 reducer 和 effect

```JS
// Dva中常这样写
dispatch({ type: 'moduleA/query', payload:{username:"jimmy"}} })

//本框架中可直接利用ts类型反射和检查:
this.dispatch(moduleA.actions.query({username:"jimmy"}))
```

> 差异示例：State 和 Actions 支持继承

```JS
// Dva不支持继承

// 本框架可以直接继承

class ModuleHandlers extends ArticleHandlers<State, PhotoResource> {
  constructor() {
    super({}, {api});
  }
  @effect()
  protected async parseRouter() {
    const result = await super.parseRouter();
    this.dispatch(this.actions.putRouteData({showComment: true}));
    return result;
  }
  @effect()
  protected async [ModuleNames.photos + "/INIT"]() {
    await super.onInit();
  }
}

```

> 差异示例：在 Dva 中，因为使用 redux-saga，假设在一个 effect 中使用 yield put 派发一个 action，以此来调用另一个 effect，虽然 yield 可以等待 action 的派发，但并不能等待后续 effect 的处理：

```JS
// 在Dva中,updateState并不会等待otherModule/query的effect处理完毕了才执行
effects: {
    * query (){
        yield put({type: 'otherModule/query',payload:1});
        yield put({type: 'updateState',  payload: 2});
    }
}

// 在本框架中,可使用awiat关键字， updateState 会等待otherModule/query的effect处理完毕了才执行
class ModuleHandlers {
    async query (){
        await this.dispatch(otherModule.actions.query(1));
        this.dispatch(thisModule.actions.updateState(2));
    }
}
```

> 差异示例：如果 ModuleA 进行某项操作成功之后，ModuleB 或 ModuleC 都需要 update 自已的 State，由于缺少 action 的观察者模式，所以只能将 ModuleB 或 ModuleC 的刷新动作写死在 ModuleA 中：

```JS
// 在Dva中需要主动Put调用ModuleB或ModuleC的Action
effects: {
    * update (){
        ...
        if(callbackModuleName==="ModuleB"){
          yield put({type: 'ModuleB/update',payload:1});
        }else if(callbackModuleName==="ModuleC"){
          yield put({type: 'ModuleC/update',payload:1});
        }
    }
}

// 在本框架中,可使用ActionHandler观察者模式：
class ModuleB {
    //在ModuleB中兼听"ModuleA/update"方法
    async ["ModuleA/update"] (){
        ....
    }
}

class ModuleC {
    //在ModuleC中兼听"ModuleA/update"方法
    async ["ModuleA/update"] (){
        ....
    }
}
```

## 基本概念与名词

前提：假设你已经熟悉了 `React` 和 `Redux`，有过一定的开发经验

### Store、Reducer、Action、State、Dispatch

以上概念与 Redux 基本一致，本框架无强侵入性，遵循 react 和 redux 的理念和原则：

- M 和 V 之间使用单向数据流
- 整站保持单个 Store
- Store 为 Immutability 不可变数据
- 改变 Store 数据，必须通过 Reducer
- 调用 Reducer 必须通过显式的 dispatch Action
- Reducer 必须为 pure function 纯函数
- 有副作用的行为，全部放到 Effect 函数中
- 每个 reducer 只能修改 Store 下的某个节点，但可以读取所有节点
- 路由组件化，不使用集中式配置

### Effect

我们知道在 Redux 中，改变 State 必须通过 dispatch action 以触发 reducer，在 reducer 中返回一个新的 state， reducer 是一个 pure function 纯函数，无任何副作用，只要入参相同，其返回结果也是相同的，并且是同步执行的。而 effect 是相对于 reducer 而言的，与 reducer 一样，它也必须通过 dispatch action 来触发，不同的是：

- 它是一个非纯函数，可以包含副作用，可以无返回，也可以是异步的。
- 它不能直接改变 State，要改变 State，它必须再次 dispatch action 来触发 reducer

### ActionHandler

我们可以简单的认为：在 Redux 中 store.dispatch(action)，可以触发一个注册过的 reducer，看起来似乎是一种观察者模式。推广到以上的 effect 概念，effect 同样是一个观察者。一个 action 被 dispatch，可能触发多个观察者被执行，它们可能是 reducer，也可能是 effect。所以 reducer 和 effect 统称为：**ActionHandler**

- 如果有一组 actionHandler 在兼听某一个 action，那它们的执行顺序是什么呢？

  答：当一个 action 被 dispatch 时，最先执行的是所有的 reducer，它们被依次同步执行。所有的 reducer 执行完毕之后，才开始所有 effect 执行。

- 我想等待这一组 actionHandler 全部执行完毕之后，再下一步操作，可是 effect 是异步执行的，我如何知道所有的 effect 都被处理完毕了？
  答：本框架改良了 store.dispatch()方法，如果有 effect 兼听此 action，它会返回一个 Promise，所以你可以使用 await store.dispatch({type:"search"}); 来等待所有的 effect 处理完成。

### Module

当我们接到一个复杂的前端项目时，首先要化繁为简，进行功能拆解。通常以**高内聚、低偶合**的原则对其进行模块划分，一个 Module 是相对独立的业务功能的集合，它通常包含一个 Model(用来处理业务逻辑)和一组 View(用来展示数据与交互)，需要注意的是：

- SPA 应用已经没有了 Page 的边界，不要以 Page 的概念来划分模块
- 一个 Module 可能包含一组 View，不要以 View 的概念来划分模块

Module 虽然是逻辑上的划分，但我们习惯于用文件夹目录来组织与体现，例如：

```
src
├── modules
│       ├── user
│       │     ├── userOverview(Module)
│       │     ├── userTransaction(Module)
│       │     └── blacklist(Module)
│       ├── agent
│       │     ├── agentOverview(Module)
│       │     ├── agentBonus(Module)
│       │     └── agentSale(Module)
│       └── app(Module)
```

通过以上可以看出，此工程包含 7 大模块 app、userOverview、userTransaction、blacklist、agentOverview、agentBonus、agentSale，虽然 modules 目录下面还有子目录 user、angent，但它们仅属于归类，不属于模块。我们约定：

- 每个 Module 是一个独立的文件夹
- Module 本身只有一级，但是可以放在多级的目录中进行归类
- 每个 Module 文件夹名即为该 Module 名，因为所有 Module 都是平级的，所以需要保证 Module 名不重复，实践中，我们可以通过 Typescript 的 enum 类型来保证，你也可以将所有 Module 都放在一级目录中。
- 每个 Module 保持一定的独立性，它们可以被同步、异步、按需、动态加载

### ModuleState、RootState

系统被划分为多个相对独立且平级的 Module，不仅体现在文件夹目录，更体现在 Store 上。每个 Module 负责维护和管理 Store 下的一个节点，我们称之为 **ModuleState**，而整个 Store 我们习惯称之为**RootState**

例如：某个 Store 数据结构:

```JS

{
router:{...},// StoreReducer
app:{...}, // ModuleState
userOverview:{...}, // ModuleState
userTransaction:{...}, // ModuleState
blacklist:{...}, // ModuleState
agentOverview:{...}, // ModuleState
agentBonus:{...}, // ModuleState
agentSale:{...} // ModuleState
}
```

- 每个 Module 管理并维护 Store 下的某一个节点，我们称之为 ModuleState
- 每个 ModuleState 都是 Store 的根子节点，并以 Module 名为 Key
- 每个 Module 只能修改自已的 ModuleState，但是可以读取其它 ModuleState
- 每个 Module 修改自已的 ModuleState，必须通过 dispatch action 来触发
- 每个 Module 可以观察者身份，监听其它 Module 发出的 action，来配合修改自已的 ModuleState

你可能注意到上面 Store 的子节点中，第一个名为 router，它并不是一个 ModuleState，而是一个由第三方 Reducer 生成的节点。我们知道 Redux 中允许使用多个 Reducer 来共同维护 Stroe，并提供 combineReducers 方法来合并。由于 ModuleState 的 key 名即为 Module 名，所以：`Module名自然也不能与其它第三方Reducer生成节点重名`。

### Model

在 Module 内部，我们可进一步划分为`一个model(维护数据)`和`一组view(展现交互)`，此处的 Model 实际上指的是 view model，它主要包含两大功能：

- ModuleState 的定义
- ModuleState 的维护，前面有介绍过 ActionHandler，实际上就是对 ActionHandler 的编写

> 数据流是从 Model 单向流入 View，所以 Model 是独立的，是不依赖于 View 的。所以理论上即使没有 View，整个程序依然是可以通过命令行来驱动的。

我们约定：

- 集中在一个名为**model.js**的文件中编写 Model，并将此文件放在本模块根目录下
- 集中在一个名为**ModuleHandlers**的 class 中编写 所有的 ActionHandler，每个 reducer、effect 都对应该 class 中的一个方法

例如，userOverview 模块中的 Model:

```
src
├── modules
│       ├── user
│       │     ├── userOverview(Module)
│       │     │         ├──views
│       │     │         └──model.ts
│       │     │
```

src/modules/user/userOverview/model.ts

```JS
// 定义本模块的ModuleState类型
export interface State extends BaseModuleState {
  listSearch: {username:string; page:number; pageSize:number};
  listItems: {uid:string; username:string; age:number}[];
  listSummary: {page:number; pageSize:number; total:number};
  loading: {
    searchLoading: LoadingState;
  };
}

// 定义本模块所有的ActionHandler
class ModuleHandlers extends BaseModuleHandlers<State, RootState, ModuleNames> {
  constructor() {
    // 定义本模块ModuleState的初始值
    const initState: State = {
      listSearch: {username:null, page:1, pageSize:20},
      listItems: null,
      listSummary: null,
      loading: {
        searchLoading: LoadingState.Stop,
      },
    };
    super(initState);
  }

  // 一个reducer，用来update本模块的ModuleState
  @reducer
  public putSearchList({listItems, listSummary}): State {
    return {...this.state, listItems, listSummary};
  }


  // 一个effect，使用ajax查询数据，然后dispatch action来触发以上putSearchList
  // this.dispatch是store.dispatch的引用
  // searchLoading指明将这个effect的执行状态注入到State.loading.searchLoading中
  @effect("searchLoading")
  public async searchList(options: {username?:string; page?:number; pageSize?:number} = {}) {
    // this.state指向本模块的ModuleState
    const listSearch = {...this.state.listSearch, ...options};
    const {listItems, listSummary} = await api.searchList(listSearch);
    this.dispatch(this.action.putSearchList({listItems, listSummary}));
  }

  // 一个effect，监听其它Module发出的Action，然后改变自已的ModuleState
  // 因为是监听其它Module发出的Action，所以它不需要主动触发，使用非public权限对外隐藏
  // @effect(null)表示不需要跟踪此effect的执行状态
  @effect(null)
  protected async ["@@router/LOCATION_CHANGE]() {
      // this.rootState指向整个Store
      if(this.rootState.router.location.pathname === "/list"){
          // 使用await 来等待所有的actionHandler处理完成之后再返回
          await this.dispatch(this.action.searchList());
      }
  }
}
```

需要特别说明的是以上代码的最后一个 ActionHandler：

```JS
protected async ["@@router/LOCATION_CHANGE](){
    // this.rootState指向整个Store
    if(this.rootState.router.location.pathname === "/list"){
        await this.dispatch(this.action.searchList());
    }
}
```

前面有强调过两点：

- Module 可以兼听其它 Module 发出的 Action，并配合来完成自已 ModuleState 的更新。
- Module 只能更新自已的 ModuleState 节点，但是可以读取整个 Store。

另外注意到语句：await this.dispatch(this.action.searchList())：

- dispatch 派发一个名为 searchList 的 action 可以理解，可是为什么前面还能 awiat？难道 dispatch action 也是异步的？

  答：dispatch 派发 action 本身是同步的，我们前面讲过 ActionHandler 的概念，一个 action 被 dispatch 时，可能有一组 reducer 或 effect 在兼听它，reducer 是同步处理的，可是 effect 可能是异步处理的，如果你想等所有的兼听都执行完成之后，再做下一步操作，此处就可以使用 await，否则，你可以不使用 await。

### View、Component

在 Module 内部，我们可进一步划分为`一个model(维护数据)`和`一组view(展现交互)`。所以一个 Module 中的 view 可能有多个，我们习惯在 Module 根目录下创建一个名为 views 的文件夹：

例如，userOverview 模块中的 views:

```
src
├── modules
│       ├── user
│       │     ├── userOverview(Module)
│       │     │         ├──views
│       │     │         │     ├──imgs
│       │     │         │     ├──List
│       │     │         │     │     ├──index.css
│       │     │         │     │     └──index.ts
│       │     │         │     ├──Main
│       │     │         │     │    ├──index.css
│       │     │         │     │    └──index.ts
│       │     │         │     └──index.ts
│       │     │         │
│       │     │         │
│       │     │         └──model.ts
│       │     │
```

- 每个 view 其实是一个 React Component 类，所以使用大写字母打头
- 对于 css 和 img 等附属资源，如果是属于某个 view 私有的，跟随 view 放到一起，如果是多个 view 公有的，提出来放到公共目录中。
- view 可以嵌套，包括可以给别的 Module 中的 view 嵌套，如果需要给别的 Module 使用，必须在 views/index.ts 中使用`exportView()`导出。
- 在 view 中通过 dispatch action 的方式触发 Model 中的 ActionHandler，除了可以 dispatch 本模块的 action，也能 dispatch 其它模块的 action

例如，某个 LoginForm：

```JS
interface Props extends DispatchProp {
  logining: boolean;
}

class Component extends React.PureComponent<Props> {
  public onLogin = (evt: any) => {
    evt.stopPropagation();
    evt.preventDefault();
    // 发出本模块的action，将触发本model中定义的名为login的ActionHandler
    this.props.dispatch(thisModule.actions.login({username: "", password: ""}));
  };

  public render() {
    const {logining} = this.props;
    return (
      <form className="app-Login" onSubmit={this.onLogin}>
        <h3>请登录</h3>
        <ul>
          <li><input name="username" placeholder="Username" /></li>
          <li><input name="password" type="password" placeholder="Password" /></li>
          <li><input type="submit" value="Login" disabled={logining} /></li>
        </ul>
      </form>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    logining: state.app.loading.login !== LoadingState.Stop,
  };
};

export default connect(mapStateToProps)(Component);
```

从以上代码可看出，View 就是一个 Component，那 View 和 Component 有区别吗？编码上没有，逻辑上是有的：

- view 体现的是 ModuleState 的视图展现，更偏重于表现特定的具体的业务逻辑，所以它的 props 一般是直接用 mapStateToProps connect 到 store。
- component 体现的是一个没有业务逻辑上下文的纯组件，它的 props 一般来源于父级传递。
- component 通常是公共的，而 view 通常非公用

## 路由与动态加载

react-coat 赞同 react-router 4 `组件化路由`的理念，路由即组件，嵌套路由好比嵌套 component 一样简单，无需繁琐的配置。如：

```JS
import {BottomNav} from "modules/navs/views"; // BottomNav 来自于 navs 模块
import LoginForm from "./LoginForm"; // LoginForm 来自于本模块

// PhotosView 和 VideosView 分别来自于 photos 模块和 videos 模块，使用异步按需加载
const PhotosView = loadView(moduleGetter, ModuleNames.photos, "Main");
const VideosView = loadView(moduleGetter, ModuleNames.videos, "Main");

<div className="g-page">
    <Switch>
        <Route exact={false} path="/photos" component={PhotosView} />
        <Route exact={false} path="/videos" component={VideosView} />
        <Route exact={true} path="/login" component={LoginForm} />
    </Switch>
    <BottomNav />
</div>
```

以上某个 view 中以不同加载方式嵌套了多个其它 view：

- BottomNav 是一个名为 navs 模块下的 view，直接嵌套意味着它会同步加载到本 view 中
- LoginForm 是本模块下的一个 view，所以直接用相对路径引用，同样直接嵌套，意味着它会同步加载
- PhotosView 和 VideosView 来自于别的模块，但是是通过 loadView()获取和 Route 嵌套，意味着它们会异步按需加载，当然你也可以直接 import {PhotosView} from "modules/photos/views"来同步按需加载

所以本框架对于模块和视图的加载灵活简单，无需复杂配置与修改：

- 不管是同步、异步、按：需、动态加载，要改变的仅仅是加载方式，而不用修改被加载的模块。模块本身并不需要事先拟定自已将被谁、以何种方式加载，保证的模块的独立性。
- 前面讲过，view 是 model 数据的展现，那嵌入其它模块 view 时，是否还要导入其它模块的 model 呢？无需，框架将自动导入。

## API 一览

[API 一览](https://github.com/wooline/react-coat/blob/master/docs/api.md)

```
BaseModuleHandlers, BaseModuleState, buildApp, delayPromise, effect, ERROR, errorAction, exportModel, exportModule, exportView, GetModule, INIT, LoadingState, loadModel, loadView, LOCATION_CHANGE, logger, ModelStore, Module, ModuleGetter, reducer, renderApp, RootState, RouterParser, setLoading, setLoadingDepthTime
```

## 几个特殊的 Action

- **@@router/LOCATION_CHANGE**：本框架集成了 connected-react-router，路由发生变化时将触发此 action，你可以在 moduleHandlers 中监听此 action
- **"@@framework/ERROR**：本框架 catch 了未处理的 error，发生 error 时将自动派发此 action，你可以在 moduleHandlers 中监听此 action
- **module/INIT**：模块初次载入时会触发此 action，来向 store 注入初始 moduleState
- **module/LOADING**：触发加载进度时会触发此 action，比如 @effect(login)

## 后续开发

### react-coat-immutable

将 immutable.js 引入本框架

### react-shirt

用 mobx 替换 redux。本框架不仅是一个 redux 框架，也是一种数据流模型、API 风格、代码组织架构，所以理论上不仅仅适应于 redux。react-shirt 是计划中的后续开发项目，使用 mobx 替换 redux，并将部分 Immutability 不可变数据变为可变数据，敬请期待。

### 学习交流

- 使用本框架必须使用 typescript 吗？

  答：推荐使用 typescript，可以做到静态检查与智能提示，但也可以直接使用原生 JS

- 欢迎批评指正，觉得还不错的别忘了给个`Star` >\_<，如有错误或 Bug 请反馈
- [讨论留言专用贴](https://github.com/wooline/react-coat/issues/1)
- Email：[wooline@qq.com](wooline@qq.com)
- reac-coat 学习交流 QQ 群：**929696953**，有问题可以在群里问我

  ![QQ群二维码](https://github.com/wooline/react-coat/blob/master/docs/imgs/qr.jpg)
