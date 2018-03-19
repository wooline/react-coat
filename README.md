react 生态圈的开放、自由、繁荣，也导致开发配置繁琐、选择迷茫。本框架放弃某些灵活性、以约定替代某些配置，固化某些最佳实践方案，从而提供给开发者一个更简洁的糖衣外套。

## 特点：

* 集成"history", "react-router-redux", "react-router-dom", "redux-saga"
* 精简，源码不到 500 行，编译成 ES5 并压缩后仅 10k 左右
* 无强侵入性，仅为 redux 的糖衣外套，不改变其本身逻辑
* 业务模块化，code spliting 打包和按需加载
* 使用 typescript，所有 state 和 action 都可以做类型推断

> 感谢 [Dva](https://github.com/dvajs/dva)带来的灵感，本框架与 Dva 主要差异：

* 更精简和自然，不捆绑 roadhog
* 引入 handler 概念，可使用观察者模式组织跨模块之间的交互
* 模块的同步或异步加载不必修改模块本身，同步异步使用一样的代码结构
* action 可使用 ts 强类型推断和检查，例如：

```
// Dva中常这样写
dispatch({ type: 'moduleA/query', payload:{args:[10]} })

//本框架中可直接利用ts类型反射:
dispatch(moduleA.actions.query([10]))
```

## 安装：

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

## 使用：

一个最简单的目录结构如下

```
src
├── modules
│       ├── admin
│       │     ├── views
│       │     │     ├── Other.tsX
│       │     │     ├── Main.tsx
│       │     │     └── index.ts
│       │     ├── model.ts
│       │     ├── index.ts
│       │     └── namespace.ts
│       └── app
│             ├── views
│             │     ├── Other.tsX
│             │     ├── Main.tsx
│             │     └── index.ts
│             ├── model.ts
│             ├── index.ts
│             └── namespace.ts
└── index.tsx
```

* 业务模块 Module：为了解耦与分解，我们将业务上比较独立的功能区块划分成一个 Module，该 Module 可独立打包和按需加载，**一个模块由 model、namespace、以及一组 view 组成**，图中表示有两个业务模块 admin 和 app

* 业务视图 View：一个业务模块将包含一组 UI 视图，它们为普通的 react component 文件，我们可以从逻辑上对 View 和 Component 作一个区分：View 由一个或多个 Component 组成，反映比较独立和完整的具体业务逻辑，而 Component 侧重于交互逻辑的表现，它们多为公共的交互控件，一般不会直接关联到 Store。

* 数据模型 Model：一个业务模块将包含一个 Model 来集中管理其数据模型，与该模块相关的 State、Reducer、SagaEffect 等对数据的定义与操作都集中书写在 Model 中

* 命名空间 Namespace：一个业务模块将包含一个命名空间定义文件 namespace.ts，模块的命名空间不能重复和冲突，一般以目录名作为值。例如：

* src/index.tsx 为入口文件，例如：

```JS
// src/index.tsx
import { createApp } from "react-coat";
import appViews from "modules/app/views";

createApp(appViews.Main, "root");
```

### Model 中的概念

model 用于组织和管理整个模块的数据，Model 的典型结构如下：

```js
// 定义该模块的State数据结构，也就是存放在Redux Store中的数据结构
interface InintState {
  curUser: {
    uid: string;
    username: string;
  };
}
// 定义该模块的State数据结构的初始值
const state = buildState<InintState>({
  curUser: {
    uid: "",
    username: ""
  }
});

type State = typeof state;

// 定义该模块所有的操作
const actions = {

  // 定义一个Reducer来更新state
  updateCurUser: buildActionByReducer(function(curUser: State["curUser"], moduleState: State, rootState: RootState): State {
    return { ...moduleState, curUser };
  }),

  // 定义一个Effect来登录提交并更新
  login: buildActionByEffect(function*({ username, password }: { username: string; password: string }): any {
    const curUser: userService.LoginResponse = yield call(userService.login, username, password);
    yield put(thisModule.actions.updateCurUser(curUser));
  })

};

// 定义该模块所有的监听
const handlers = {

  // 当监听到有"app/Init"这个action发出的时候，去获取当前用户信息并更新
  "app/Init":buildHandlerByEffect(function*(){
    const curUser: userService.GetCurUserResponse = yield call(userService.getCurUser);
    yield put(thisModule.actions.updateCurUser(curUser));
  }),

  // 当监听到有"@framework/ERROR"这个action发出的时候，弹出错误信息
  "@@framework/ERROR": buildHandlerByReducer(function({ message }, moduleState: State, rootState: any): State {
    alert(message);
    return moduleState;
  })
};
```

### 模块的对外接口有 4 笔：namespace、actions、views、State

1. 模块根目录下的 index.ts，该文件将输出 3 笔数据：namespace、actions、State

   * namespace 为该模块的命名空间
   * State 为一个 Typescript 类型，是该模块的 State 数据结构
   * actions 包含了该模块所有可以被外界调用的操作

2. 模块 views 目录下的 index.ts，该文件将输出 1 笔数据：views，将模块的视图暴露给外界使用

例如，模块 A 可以直接使用模块 B 的视图

```JS
// src/modules/A/views/Main.tsx
import BViews from "modules/B/views";

export default function(){
  return <div><BViews.Main /></div>
}
```

例如，模块 A 可以 dispatch 模块 B 的 action：

```JS
// src/modules/A/views/Main.tsx
import B from "modules/B";

export default function(){
  return <button onClick={e => {dispatch(B.actions.login())}}>click me</button>
}
```
