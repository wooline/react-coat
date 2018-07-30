react 生态圈的开放、自由、繁荣，也导致开发配置繁琐、选择迷茫。react-coat 放弃某些灵活性、以约定替代某些配置，固化某些最佳实践方案，从而提供给开发者一个更简洁的糖衣外套。

## 3.0.0 发布：

- 基于 2.0 的基本概念，进一步简化和清晰 API 的定义

## react-coat 特点：

- 集成 react、redux、redux-saga、react-router、history 等相关框架
- 仅为以上框架的糖衣外套，不改变其基本概念，无强侵入与破坏性
- 精简而自然的 API 语法，几乎不用学习即可上手
- 微框架，源码不到千行，编译成 ES5 并压缩后仅 15k 左右
- 业务模块化，支持按需加载
- 使用 typescript 强类型，更好的静态检查与智能提示

> 感谢 [Dva](https://github.com/dvajs/dva)带来的灵感，本框架与 Dva 主要差异：

- 更优雅和自然的 API
- 更清晰和简单的组织结构
- 使用 typescript 强类型推断和检查
- 路由支持按需加载，也支持整体加载

```
// 比如：Dva中常这样写
dispatch({ type: 'moduleA/query', payload:{args:[10]} })

//本框架中可直接利用ts类型反射和检查:
this.dispatch(moduleA.actions.query([10]))
```

## 安装 react-coat：

    $ yarn add react-coat

兼容 react 周边生态版本：

```
"peerDependencies": {
    "@types/history": "^4.0.0",
    "@types/react": "^16.0.0",
    "@types/react-dom": "^16.0.0",
    "@types/react-redux": "^5.0.0",
    "@types/react-router-dom": "^4.0.0",
    "connected-react-router": "^4.0.0",
    "history": "^4.0.0",
    "react": "^16.0.0",
    "react-dom": "^16.0.0",
    "react-redux": "^5.0.0",
    "react-router-dom": "^4.0.0",
    "redux": "^3.0.0 || ^4.0.0",
    "redux-saga": "^0.16.0"
  },
```

#### 套装版 react-coat-pkg

如果你想省心，你也可以直接安装"all in 1"的 [react-coat-pkg](https://github.com/wooline/react-coat-pkg)，它将自动包含以上组件，并保证各组件版本不会冲突：

    $ yarn add react-coat-pkg

### 兼容性：

IE9 或 IE9 以上

本框架依赖于浏览器 API "Promise"，低版本浏览器请自行安装 polyfill

## 使用 react-coat：

> 快速上手：[一个简单的 Hello Word](https://github.com/wooline/react-coat-demo-simple)

> 快速上手：[使用 react-coat 重构 antd-pro](https://github.com/wooline/react-coat-antd)

> 为何需要此框架？redux 实践中的痛点与总结可参考 Dva

### Module 概念

> react-coat 建议将复杂的业务场景分解为多个独立的`业务Module`，它们可以独立开发和测试，可以打包、可以同步或异步加载。**一个 Module 主要由 namespace、model、views 组成**。

- namespace 表示该 Module 的命名空间，不能重复和冲突，常与目录同名
- model 用于集中管理和操作 State
- views 跟据 State 来渲染界面

### 总结为简单四步：exportModel(), exportViews(), exportModule(), createApp()

示例一个基本目录结构如下：

```
src
├── modules  \\存放业务模块
│       ├── admin  \\一个名叫admin的业务模块
│       │     ├── views  \\存放该业务模块的视图
│       │     │     ├── Other.tsX  \\一个名叫Other的视图
│       │     │     ├── Main.tsx  \\一个名叫Main的视图
│       │     │     └── index.ts  \\导出该模块对外的视图  exportViews()
│       │     ├── model.ts  \\该模块的数据模型定义和操作  exportModel()
│       │     ├── index.ts  \\导出该模块对外的操作  exportModule()
│       │     └── exportNames.ts \\定义该模块的某些常量
│       └── app  \\一个名叫app的业务模块
│             ├── views
│             │     ├── Other.tsX
│             │     ├── Main.tsx
│             │     └── index.ts
│             ├── model.ts
│             ├── index.ts
│             └── exportActionNames.ts
└── index.tsx  \\入口文件  createApp()
```

```JS
// src/index.tsx 入口文件
import appViews from "modules/app/views";
import { createApp } from "react-coat";

createApp(appViews.Main, "root");
```

### Model 概念

> Model 为 Module 提供数据与状态的维护和更新，**主要定义 State 和 Action**

- State 表示本 Module 的状态，需要定义好数据结构和初始值
- Action 表示交互操作，分为 reducer、effect，其概念与 redux 和 saga 中的定义相同
- 原则上每个模块的 reducer 只能更新本模块的 State，但可以读取 RootState
- reducer 和 effect 只能通过 `dispatch` 方法（在 view 中）或 `put` 方法（在 model）来触发执行
- 将所有 reducer 和 effect 集中写在一个 ModuleActions 的 class 中
- 对外输出 actions 和 state，供外界调用
- Model 的启动过程会触发三个特定的 Action：`INIT->START->STARTED`，它们在 BaseModuleActions 中有默认的定义，你可以通过覆盖基类中的方法来扩展或自定义，其意义如下：
  - `INIT(): State` 它是一个 reducer，它将本模块的 initState 注入到全局 RootState 中
  - `START(): SagaIterator` 它是一个 Effect，它表示本模块正在启动，你可以在此过程中去异步拉取一些外部数据，并更新当前 State
  - `STARTED(payload: State): State` 它是一个 reducer，它表示本模块启动完毕，并更新 State，该 Action 必须在前面 `START()`Effect 中手动触发

示例一个 Model.ts 如下：

```js
// 定义该模块的State数据结构
interface State extends ModuleState {
  todosList: string[];
  curUser: { //用于表示当前用户状态
    uid: string;
    username: string;
  };
  loading: { //用于表示本module中的各种loading状态
    global: LoadingState;
    login: LoadingState;
  },
}
// 定义该模块的State的初始值
const initState: State = {
  todosList: [];
  curUser: {
    uid: "",
    username: ""
  },
  loading: {
    global: "Stop",
    login: "Stop",
  },
});

// 定义该模块的Actions
// RootState表示全局的State，State表示本模块的State
class ModuleActions extends BaseModuleActions<State, RootState> {

  // 定义一个名为updateTodosList的reducer
  @reducer
  updateTodosList(todosList: string[]): State {
    return { ...this.state, todosList };
  }

  // 定义一个名为updateCurUser的reducer
  @reducer
  setCurUser(curUser: { uid: string; username: string; }): State {
    return { ...this.state, curUser };
  }

  // 定义一个名为login的effect
  @effect
  @loading("login") // 将该effect的loading状态注入State.loading.login中
  *login({username,password}:{ username: string; password: string }): SagaIterator {
    // 调用登录api，并获取Resphonse
    const curUser = yield this.call(api.login, username, password);
    // 通过this.put触发并调用前面定义的setCurUser
    yield this.put(this.setCurUser(curUser));
    // 对于非Action，可以直接调用
    this.log(username);
    // 为了方便，基类中集成了routerActions
    // 包括history方法push,replace,go,goBack,goForward
    yield this.put(this.routerActions.push("/"));
  }

  // 非Action请使用private或protected权限
  private log(username: string){
    console.log(`${username} 已登录！`)
  }

  // 可以兼听另一个模块的 Action 来协同修改本模块的 State, 可以是reducer或effect
  // 以观察者模式对全局的"错误Action："@framework/ERROR"兼听，并上报后台
  // 因为兼听并不需要主动调用，请设置为private或protected权限
  @effect
  protected *[ERROR as string](payload: Error): SagaIterator {
    yield this.call(settingsService.api.reportError, payload);
  }
  // 兼听路由变化的Action，并作出更新
  @effect
  protected *[LOCATION_CHANGE as string](payload: { location: { pathname: string } }): SagaIterator {
    if (payload.location.pathname === "/admin/todos") {
      const todos = yield this.call(todoService.api.getTodosList);
      yield this.put(this.updateTodosList(todos.list));
    }
  }

  // 自定义启动项，覆盖基类默认的START Effect
  // 初次进入，需要获取当前用户的信息
  @effect
  @globalLoading // 使用全局loading状态
  *START(): SagaIterator {
    const curUser = yield this.call(sessionService.api.getCurUser);
    // 必须手动触发并调用基类的STARTED Reducer
    yield this.put(this.STARTED({ ...this.state, curUser }));
  }

};
 // 创建并导出Model
const model = exportModel(NAMESPACE, initState, new ModuleActions());
export default model;

// 导出类型Actions, State供外界使用
type Actions = typeof model.actions;
export { Actions, State };
```

从上面示例代码中看到，在 Model 内部，触发并调用一个 Action 必须使用`this.put`，而如果在 View 中，则需要用 dispatch 方法，请看示例，在模块 A 的 View 中，dispatch 模块 B 的 action：

```JS
// src/modules/A/views/Main.tsx
import B from "modules/B";

export default function(){
  return <button onClick={e => {this.props.dispatch(B.actions.logout())}}>注销</button>
}
```

### Module 路由与加载

> react-coat 中的业务 Module 是相对独立的，可以同步加载，也可以按需加载。

- 同步加载：直接引用一个 Module 的 View，会执行同步加载。 例如，模块 A 直接使用模块 B 的视图

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

- 按需加载：使用 react-router 的方式加载。

```js
// src/modules/A/views/Main.tsx
const BView = async(() => import("modules/B/views"));
...
<Route exact path={`${match.url}/todos`} component={BView} />;
```

### Loading 机制

- loading 状态存放在每个 module 的 state 中，可以让组件绑定此状态来展示 loading UI

```js
app: {
  username: string;
  loading: {
    global: LoadingState;
    login: LoadingState;
  }
}
```

- 每个模块都有自已的一组 loading 状态，同属于一组的多个 loading 会合并，例如

```js
// 假设发起了多个异步请求，但他们可以共用一个loading状态
// 当同组内所有请求全部完成时，loading状态才Stop
setLoading(promise1, "app", "login");
setLoading(promise2, "app", "login");
```

- 每个 loading 状态有三种变化值：Start、Depth、Stop，Depth 表示深度加载，当超过一定时间，默认为 2 秒，还没有返回，则过渡为 Depth 状态

- 设置 Loading 状态有两种方法：`setLoading`和`@loading`。@loading 专门用来对 Effect 进行跟踪

### 框架 API

- Model 相关：

  - `StoreState<P>` 整个 Store 的 State 类型
  - `BaseModuleState` 模块 State 需继承此 interface
  - `BaseModuleActions` 模块 Actions 需继承此基类，该基类拥有 saga 的 put、call 和 store 的 dispatch 和 routerActions 等方法
  - `BaseModuleHandlers` 模块 Handlers 需继承此基类，该基类拥有 saga 的 put、call 和 store 的 dispatch 和 routerActions 等方法
  - `buildModel(state, actions, handlers)` 创建模块的 Model
  - `@effect()` 装饰器，指明该 Action 为异步 Effect，并可注入 loading 状态
  - `@buildlogger(beforeFun, afterFun)` 装饰器，在该 Action 的执行前后各留下勾子

- View 相关

  - `buildViews(namespace, views, model)` 创建模块的对外调用接口

- 模块调用相关

  - `createApp(component, container, storeMiddlewares?, storeEnhancers?, reducers?, storeHistory?)` 创建 App
  - `buildModule(namespace)` 创建模块的对外调用接口
  - `getStore()` 获取全局的 Redux Store
  - `asyncComponent(ModuleViews, componentName, LoadingComponent, ErrorComponent)` 异步加载模块的视图
  - `getHistory()` 获取全局的 history

- Loading 相关
  - `@effect(moduleName, group)` 装饰器，指明该 Action 为异步 Effect，并可注入 loading 状态
  - `setLoading(promiseItem, moduleName, group)` 用函数的方式设置 loading
  - `LoadingState` loading 的三种状态
  - `setLoadingDepthTime(second)` 设置 Loading 等待多少秒后转 Depth 状态

### FAQ

- `使用本框架必须使用typescript吗？`

  答：推荐使用 typescript，可以做到智能提示，但也可以直接使用原生 JS

- `框架能用于生产环境吗，会一直维护吗？`
  答：本人会持续升级维护。区别于某些强侵入型框架，本微框架原理简单，核心代码也就百多行，无过多封装。

### 后记

> 欢迎批评指正，觉得还不错的别忘了给个`Star` >\_<，如有错误或 Bug 请反馈或 Email：wooline@qq.com

> [讨论留言专用贴](https://github.com/wooline/react-coat/issues/1)
