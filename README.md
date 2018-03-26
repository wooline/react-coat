react 生态圈的开放、自由、繁荣，也导致开发配置繁琐、选择迷茫。react-coat 放弃某些灵活性、以约定替代某些配置，固化某些最佳实践方案，从而提供给开发者一个更简洁的糖衣外套。

## react-coat 特点：

* 集成"history", "react-router-redux", "react-router-dom", "redux-saga"
* 精简而自然的 API 语法，几乎不用学习即可上手
* 微框架，源码不到 500 行，编译成 ES5 并压缩后仅 11k 左右
* 无强侵入性，仅为 redux 的糖衣外套，不改变其本身逻辑
* 业务模块化，可独立打包和按需加载
* 使用 typescript，所有 state 和 action 都可以做类型推断

> 感谢 [Dva](https://github.com/dvajs/dva)带来的灵感，本框架与 Dva 主要差异：

* 采用 reducer 代理的原理实现，而非 combineReducers
* 更加精简和自然的 API
* 引入 handler 概念，模块之间彼此独立，使用观察者模式进行监听
* 同步模块和异步模块采用同样的代码结构
* action 可使用 ts 强类型推断和检查，例如：

```
// Dva中常这样写
dispatch({ type: 'moduleA/query', payload:{args:[10]} })

//本框架中可直接利用ts类型反射和检查:
dispatch(moduleA.actions.query([10]))
```

## 安装 react-coat：

    $ yarn add react-coat

本框架依赖于以下包，请自行安装：

```
"glbDependencies": {
    "react": "^16.2.0",
    "react-dom": "^16.2.0",
    "react-redux": "^5.0.6",
    "redux": "^3.7.2"
  }
```

本框架会安装以下依赖，请避免重复安装：

```
"dependencies": {
    "history": "^4.7.2",
    "react-router-dom": "^4.2.2",
    "react-router-redux": "^5.0.0-alpha.9",
    "redux-saga": "^0.16.0"
  }
```

## 兼容性：

IE9 或 IE9 以上

本框架依赖于浏览器 API "Promise"，低版本浏览器请自行安装 polyfill

## 使用 react-coat：

> 快速上手：[一个简单的 Hello Word](https://github.com/wooline/react-coat-demo-simple)

> 快速上手：[使用 react-coat 重构 antd-pro](https://github.com/wooline/react-coat-antd)

基本目录结构如下

```
src
├── modules  \\存放业务模块
│       ├── admin  \\一个名叫admin的业务模块
│       │     ├── views  \\存放该业务模块的视图
│       │     │     ├── Other.tsX  \\一个名叫Other的视图
│       │     │     ├── Main.tsx  \\一个名叫Main的视图
│       │     │     └── index.ts  \\导出该模块对外的视图
│       │     ├── model.ts  \\该模块的数据模型定义和操作
│       │     ├── index.ts  \\导出该模块对外的操作
│       │     └── actionNames.ts \\该模块的ActionName定义
│       └── app  \\一个名叫app的业务模块
│             ├── views
│             │     ├── Other.tsX
│             │     ├── Main.tsx
│             │     └── index.ts
│             ├── model.ts
│             ├── index.ts
│             └── actionNames.ts
└── index.tsx  \\入口文件
```

```JS
// src/index.tsx 入口文件
import appViews from "modules/app/views";
import { createApp } from "react-coat";

/*
createApp()还可以传入三个可选参数以自定义扩展Store：
storeMiddlewares?: Middleware[]
storeEnhancers?: Function[]
storeHistory?: History  //如果不传，则使用history/createBrowserHistory
*/
createApp(appViews.Main, "root");
```

### Module 机制

> react-coat 建议将复杂的业务场景分解为多个独立的`业务Module`，它们可以独立开发测试，可以独立打包、可以同步或异步加载。**一个基本的业务 Module 由 model、namespace、以及一组 view 组成，放在 modules 目录下**。

* namespace 表示该 Module 的命名空间，模块的命名空间不能重复和冲突，建议与目录同名
* 模块的 ActionName 不能重复或冲突，建议使用 namespace 和\_开头
* view 为普通的 React Component 文件，一个 Module 可以有多个 view，我们建议从逻辑上对 View 和 Component 作一个区分：View 由一个或多个 Component 组成，反映比较独立和完整的具体业务逻辑，而 Component 侧重于抽象的交互逻辑，它们多为公共的交互控件，一般不会直接关联到全局 Store。
* model 集中编写模块的数据定义和操作

### Module 接口机制

> Module 是相对独立的，对内封装自已的逻辑，对外暴露接口，外部不要直接引用 Module 内部文件，而要通过其接口。Module 对外接口主要有 4 笔：**NAMESPACE、actions、State、views**

1. 模块根目录下的 index.ts，该文件将输出：actions、State

   * State 为一个 Type 类型，是该模块的 State 数据结构
   * actions 包含了该模块所有可以被外界调用的操作

2. 模块 views 目录下的 index.ts，该文件将输出：views

3. 模块根目录下的 actionNames.ts 该文件将输出该模块所有 Action 名称以供外界监听

> 例如，模块 A 可以 dispatch 模块 B 的 action：

```JS
// src/modules/A/views/Main.tsx
import B from "modules/B";

export default function(){
  return <button onClick={e => {dispatch(B.actions.b_login())}}>click me</button>
}
```

### Module 加载机制

> react-coat 中的业务 Module 是相对独立的，可以同步加载，也可以按需加载。

* 同步加载：直接引用一个 Module 的 View，会执行同步加载。 例如，模块 A 直接使用模块 B 的视图

```js
// src/modules/A/views/Main.tsx
import BViews from "modules/B/views";

export default function() {
  return (
    <div>
      <BViews.Main />
    </div>
  );
}
```

* 按需加载：使用 react-router 的方式加载。本框架集成了 react-router-redux 5，

```js
// src/modules/A/views/Main.tsx
const BViewsLoader = asyncComponent(() => import("modules/B/views"));
...
<Route component={BViewsLoader} />;
```

### Model 机制

> model 用于组织和管理整个模块的数据，Model 的典型结构如下：

```js
// 定义该模块的State数据结构
interface State extends BaseModuleState {
  curUser: {
    uid: string;
    username: string;
  };
}
// 定义该模块的State的初始值
const state: State = {
  curUser: {
    uid: "",
    username: ""
  }
});

// 定义该模块的操作
class ModuleActions {

  // 定义一个名为updateCurUser的Action
  [UPDATE_CUR_USER] = buildActionByReducer(
    function(curUser: State["curUser"], moduleState: State, rootState: RootState): State {
      // 需要符合reducer的要求，moduleState和rootState都是只读，不要去修改
      return { ...moduleState, curUser };
    }
  );

  // 定义一个名为login的Action
  @buildLoading(NAMESPACE) //注入加载状态
  [LOGIN] = buildActionByEffect(
    function*({ username, password }: { username: string; password: string }): any {
      const curUser: userService.LoginResponse = yield call(userService.login, username, password);
      yield put(thisModule.actions.app_updateCurUser(curUser));
    }
  );

};

// 以观察者模式对action监听
class ModuleHandlers {

  // 监听"app_Init"这个action
  @buildlogger( //可选，注入跟踪勾子，打印该Action的执行时间
    (actionName: string, moduleName: string) => {
      const startTime = new Date().getTime();
      console.log(moduleName,actionName,"start at",time)
      return {startTime, moduleName, actionName};
    },
    ({startTime, moduleName, actionName}) => {
      const endTime = new Date().getTime();
      console.log(moduleName,actionName,"spend",endTime-startTime)
    }
  )
  @buildLoading() //注入加载状态
  [INIT] = buildActionByEffect(
    function*(){
      const curUser: userService.GetCurUserResponse = yield call(userService.getCurUser);
      yield put(thisModule.actions.app_updateCurUser(curUser));
    }
  ),

  // 监听"@framework/ERROR"这个action
  [ERROR_ACTION_NAME] = buildActionByReducer(
    function({ message }, moduleState: State, rootState: any): State {
      alert(message);
      return moduleState;
    }
  )
};
```

### Action 机制

> Action 用于调用 Reducer 或 saga-effect 来加载和更新模块的 State。原则上每个模块的 Action 只能更新自已的 State。

* 定义 ActionName，模块 Action 的名称可供自已或外界监听与调用，通常使用常量定义在模块根目录下的 actionName.ts 中
* 定义 Action，使用 `buildActionByReducer` 和 `buildActionByEffect` 在 Model 中集中集中编写整个模块的 Action
* 执行 Action，使用 redux 的 `dispatch` 或 saga 的 `put` 方法
* 监听 Action，模块可以监听所有 Action 来修改本模块的 State
* Action 装饰器，框架提供两个 Decorator
  * `@buildLoading(moduleName, group)` 为 Action 注入 loading 状态
  * `@buildlogger(beforeFun, afterFun)` 为 Action 注入跟踪勾子
* 框架内置 Action，在特定的生命周期，框架会自动触发以下特定的 Action，你可以监听它们，但不要覆盖或修改它们

  * `ERROR_ACTION_NAME` = "@@framework/ERROR" 当出现错误时触发
  * `LOCATION_CHANGE_ACTION_NAME` = "@@router/LOCATION_CHANGE" 当路由切换时触发
  * `moduleName + "_INIT"` 当模块初始化时触发，每个模块只会触发一次
  * `moduleName + "_LOADING"` 当出现 loading 状态时触发
  * `moduleName + "_@@router/LOCATION_CHANGE"` 异步模块初始化路由时触发

### Loading 机制

* loading 状态存放在每个 module 的 state 中，可以让组件绑定此状态，固定的 key 为 loading，每个模块有一个固定的 loading 分组为 global 例如：

```
app: {
  username: string;
  loading: {  // 固定key名
    global: string; // 固定分组
    login: string; // 自定义分组
  };
};
```

* loading 每个模块都有自已的一组 loading 状态，同属于一组的多个 loading 会合并，例如

```
// 假设发起了多个异步请求，但他们可以共用一个loading状态
// 当同组内所有请求全部完成时，loading状态才Stop
setLoading(promise1, "app", "login");
setLoading(promise2, "app", "login");
```

* 每个 loading 状态有三种变化值：Start、Depth、Stop，Depth 表示深度加载，当超过一定时间，默认为 2 秒，还没有返回，则过渡为 Depth 状态

* 设置 Loading 状态有两种方法：函数式、Decorator。Decorator 方便用于对 action 的注入

```
setLoading(item: Promise, moduleName?: string="app", group?: string="global")
@buildLoading(moduleName:string, group:string)
```

### 框架 API

* Model 相关：

  * `StoreState<P>` 整个 Store 的 State 类型
  * `BaseModuleState` 模块 State 需继承此 interface
  * `buildState(initState)` 创建模块的 state
  * `buildActionByReducer(reducer)` 使用 reducer 创建 action
  * `buildActionByEffect(reducer)` 使用 effect 创建 action
  * `buildModel(state, actions, handlers)` 创建模块的 Model
  * `@buildlogger(beforeFun, afterFun)` 提供一个 Action 的 Decorator，用来跟踪 Action 的执行情况

* View 相关

  * `buildViews(namespace, views, model)` 创建模块的对外调用接口

* 模块调用相关

  * `createApp(component, container, storeMiddlewares?, storeEnhancers?, storeHistory?)` 创建 App
  * `buildModule(namespace)` 创建模块的对外调用接口
  * `getStore()` 获取全局的 Redux Store
  * `asyncComponent(ModuleViews, componentName, LoadingComponent, ErrorComponent)` 异步加载模块的视图
  * `storeHistory` 全局的 history

* Loading 相关
  * `@buildLoading(moduleName, group)` 以 Decorator 的方式设置 loading
  * `setLoading(promiseItem, moduleName, group)` 用函数的方式设置 loading
  * `LoadingState` loading 的三种状态
  * `setLoadingDepthTime(second)` 设置 Loading 等待多少秒后转 Depth 状态

### FAQ

* `使用本框架必须使用typescript吗？`

  答：推荐使用 typescript，可以做到智能提示，但也可以直接使用原生 JS

### 后记

> 欢迎各位高人批评指正，觉得还不错的别忘了给个`Star` >\_<，如有错误或 Bug 请反馈或 Email：wooline@qq.com

> 有问题也可以去：[知乎留言](https://zhuanlan.zhihu.com/p/34964264)
