<!-- TOC -->

- [开发语言](#开发语言)
- [集成框架](#集成框架)
- [Page vs Module](#page-vs-module)
- [路由设计](#路由设计)
- [代码分割与按需加载](#代码分割与按需加载)
- [动态加载 model 时对 Redux 的破坏](#动态加载-model-时对-redux-的破坏)
- [Model 定义](#model-定义)
- [Model 结构](#model-结构)
- [Action 派发](#action-派发)
- [React-coat 独有的 ActionHandler 机制](#react-coat-独有的-actionhandler-机制)
- [结语](#结语)

<!-- /TOC -->

## 开发语言

- Dva 基于 JS，支持 Typescript
- React-coat 基于 Typescript 支持 JS

虽然 Dva 号称支持 Typescript，可是看了一下官方给出的：[使用 TypeScript 的例子](https://github.com/umijs/umi-examples/tree/master/typescript)，完全感觉不到诚意，action、model、view 之间的数据类型都是孤立的，没有相互约束？路由配置里的文件路径也是无法反射，全是字符串，看得我一头雾水...

举个 Model 例子，在 Dva 中定义一个 Model：

```JS
export default {
  effects: {
    // Call、Put、State类型都需自已手动引入
    *fetch(action: {payload: {page: number}}, {call: Call, put: Put}) {
      //使用 yield 后，data 将反射不到 usersService.fetch
      const data = yield call(usersService.fetch, {page: action.payload.page});
      // 这里将触发下面 save reducer，可是它们之间没有建立强关联
      // 如何让这里的 playload 类型与下面 save reducer中的 playload 类型自动约束？
      // 如果下面 save reducer 改名为 save2，如何让这里的 type 自动感应报错？
      yield put({type: "save", payload: data});
    },
  },
  reducers: {
    save(state: State, action: {payload: {list: []}}) {
      return {...state, ...action.payload};
    },
  },
};
```

反过来看看在 React-coat 中定义一个同样的 Model：

```JS
class ModuleHandlers extends BaseModuleHandlers {
  // this.state、this.actions、this.dispatch都集成在Model中，直接调用即可
  @effect("loading") // 注入loading状态
  public async fetch(payload: {page: number}) {
    // 使用 await 更直观，而且 data 能自动反射类型
    const data = await usersService.fetch({page: action.payload.page});
    // 使用方法调用，更直观，而且参数类型和方法名都有自动约束
    this.dispatch(this.actions.save(data));
  }

  @reducer
  public save(payload: {list: []}): State {
    return {...this.state, ...payload};
  }
}
```

另外，在 react-coat 的 demo 中用了大量的 TS 泛型运算来保证 module、model、action、view、router 之间相互检查与约束，具体可看一下[react-coat-helloworld](https://github.com/wooline/react-coat-helloworld)

**结论：**

- react-coat 将 Typescript 转换为生产力，而 dva 只是让你玩玩 Typescript。
- react-coat 有着更直观和自然的 API 调用。

---

## 集成框架

两者集成框架都差不多，都属于 Redux 生态圈，最大差别：

- Dva 集成 Redux-Saga，使用 yield 处理异步
- React-Coat 使用原生 async + await

Redux-Saga 有很多优点，比如方便测试、方便 Fork 多任务、 多个 Effects 之间 race 等。但缺点也很明显：

- 概念太多、容易把问题复杂化
- 使用 yield 时，不能返回 typescript 类型

**结论：**

你喜不喜欢 Saga，这是个人选择的问题了，没有绝对的标准。

---

## Page vs Module

umi 和 dva 都喜欢用 Page 为主线来组织站点结构，并和 Router 绑定，官方文档中这样说：

> 在组件设计方法中，我们提到过 Container Components，在 dva 中我们通常将其约束为 Route Components，因为在 dva 中我们通常以页面维度来设计 Container Components。

所以，dva 的工程多为这种目录结构：

```
src
├── components
├── layouts
├── models
│       └── globalModel.js
├── pages
│       ├── photos
│       │     ├── page.js
│       │     └── model.js
│       ├── videos
│       │     ├── page.js
│       │     └── model.js

```

几个质疑：

- 单页 SPA，什么是 Page? 它的边界在哪里？它和其它 Component 有什么区别？目前看起来是个 Page，说不一定有一天它被嵌套在别的 Component 里，也说不定有一天它被 Modal 弹窗弹出。
- 某些 Component 可能被多个 Page 引用，那应当放在哪个 Page 下面呢？
- 为什么路由要和 Page 强关联？Page 切换必须要用路由加载吗？不用路由行不行？
- model 跟着 Page 走？model 是抽象的数据，它与 UI 可能是一对多的关系。

**来看看 React-coat**

在 React-coat 中没有 Page 的概念，只有 View，因为一个 View 有可能被路由加载成为一个所谓的 Page，也可能被一个 modal 弹出成为一个弹窗，也可能被其它 View 直接嵌套。

假如有一个 PhotosView：

```JS
// 以路由方式加载，所谓的 Page
render() {
  return (
    <Switch>
      <Route exact={true} path="/photos/:id" component={DetailsView} />
      <Route component={ListView} />
    </Switch>
  );
}
```

```JS
// 也可以直接用 props 参数来控制加载
render() {
  const {showDetails} = this.props;
  return showDetails ? <DetailsView /> : <ListView />;
}
```

- 用哪种方式来加载，这属于 PhotosView 的内部事务，对外界来说，你只管加载 PhotosView 本身就好了。
- 对于 DetailsView 和 ListView 来说，它并不知道自已将来被外界如何加载。

在 React-coat 中的组织结构的主线是 Module，它以业务功能的**_高内聚，低耦合_**的原则划分：一个 Module = `一个model(维护数据)`和`一组view(展现交互)`。典型的目录结构如下：

```
src
├── components
├── modules
│       ├── app
│       │     ├── views
│       │     │     ├── View1.tsx
│       │     │     ├── View2.tsx
│       │     │     └── index.ts
│       │     ├── model.ts
│       │     └── index.ts
│       ├── photos
│       │     ├── views
│       │     │     ├── View1.tsx
│       │     │     ├── View2.tsx
│       │     │     └── index.ts
│       │     ├── model.ts
│       │     └── index.ts
```

**结论：**

- Dva 中以 UI Page 为主线来主织业务功能，并将其与路由绑定，比较死板，在简单应用中还好，对于交互性复杂的项目，Model 和 UI 的重用将变得很麻烦。
- React-coat 以业务功能的**高内聚、低偶合**来划分 Moduel，更自由灵活，也符合编程理念。

---

## 路由设计

在 Dva 中的路由是`集中配置`式的，需要用 app.router()方法来注册。比较复杂，涉及到 Page、Layout、ContainerComponents、RealouteComponents、loadComponent、loadMode 等概念。复杂一点的应用会有动态路由、权限判断等，所以 Router.js 写起来又臭又长，可读性很差。而且使用一些相对路径和字符串名称，没办法用引起 TS 的检查。

后面在 umi+dva 中，路由以 Pages 目录结构自动生成，对于简单应用尚可，对于复杂一点的又引发出新问题。比如某个 Page 可能被多个 Page 嵌套，某个 model 被多个 page 共用等。所以，umi 又想出来一些潜规则：

```
model 分两类，一是全局 model，二是页面 model。全局 model 存于 /src/models/ 目录，所有页面都可引用；页面 model 不能被其他页面所引用。

规则如下：

src/models/**/*.js 为 global model
src/pages/**/models/**/*.js 为 page model
global model 全量载入，page model 在 production 时按需载入，在 development 时全量载入
page model 为 page js 所在路径下 models/**/*.js 的文件
page model 会向上查找，比如 page js 为 pages/a/b.js，他的 page model 为 pages/a/b/models/**/*.js + pages/a/models/**/*.js，依次类推
约定 model.js 为单文件 model，解决只有一个 model 时不需要建 models 目录的问题，有 model.js 则不去找 models/**/*.js
```

**看看在 React-coat 中：**

不使用路由集中配置，路由逻辑分散在各个组件中，没那么多强制的概念和潜规则。

> 一句话：一切皆 Component

**结论：**

React-coat 的路由无限制，更简单明了。

---

## 代码分割与按需加载

在 Dva 中，因为 Page 是和路由绑定的，所以按需加载只能使用在路由中，需要配置路由：

```JS
{
  path: '/user',
  models: () => [import(/* webpackChunkName: 'userModel' */'./pages/users/model.js')],
  component: () => import(/* webpackChunkName: 'userPage' */'./pages/users/page.js'),
}
```

几个问题：

- models 和 component 分开配置，如何保证 models 中加载了 component 中所需要的 所有 model?
- 每个 model 和 component 都作为一个 split code，会不会太碎了？
- 路由和代码分割绑定在一起，不够灵活。
- 集中配置加载逻辑导致配置文件可读性差。

在 React-coat 中，View 可以用路由加载，也可以直接加载：

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

React-coat 这样做的好处：

- 代码分割只做代码分割，不参和路由的事，因为模块也不一定是非得用路由的方式来加载。
- 路由只做路由的事情，不参和代码分割的事，因为模块也不一定非得做代码分割。
- 一个 Module 整体打包成一个 bundle，包括 model 和 views，不至于太碎片。
- 载入 View 会自动 载入与该 View 相关的所有 Model，无需手工配置。
- 将路由逻辑分散在各 View 内部并对外隐藏细节，更符合一切皆组件的理念。

**结论：**

- 使用 React-coat 做代码分割和按需加载更简单也更灵活。

---

## 动态加载 model 时对 Redux 的破坏

在使用 Dva 时发现一个严重的问题，让我一度怀疑是自已哪里弄错了：

1.首先进入一个页面：localhost:8000/pages，此时查看 Redux-DevTools 如下：

![第一步](https://github.com/wooline/react-coat/blob/master/docs/imgs/1.png)

2.然后点击一个 link 进入 localhost:8000/photos，此时查看 Redux-DevTools 如下：

![第二步](https://github.com/wooline/react-coat/blob/master/docs/imgs/2.png)

眼尖的伙伴们看出什么毛病来没有？

> 加载 photos model 时，第一个 action @@INIT 时的 State 快照竟然变了，把 photos 强行塞进去了。Redux 奉行的不是不可变数据么？？？

**结论：**

Dva 动态加载 model 时，破坏了 Redux 的基本原则，而 React-coat 不会。

---

## Model 定义

- Dva 中的 Model 跟着 Page 走，而 Page 又跟着路由走。
- Dva 中的 Model 比较散，可以随意定义多个，也可以随意 load，于是 umi 又出了某些限制，如：

```
model 分两类，一是全局 model，二是页面 model。全局 model 存于 /src/models/ 目录，所有页面都可引用；页面 model 不能被其他页面所引用。
global model 全量载入，page model 在 production 时按需载入，在 development 时全量载入。

```

一个字：**饶**

React-coat 中 model 跟着业务功能走，一个 module 只能有一个 model：

```
在 Module 内部，我们可进一步划分为`一个model(维护数据)`和`一组view(展现交互)`
集中在一个名为model.js的文件中编写 Model，并将此文件放在本模块根目录下
model状态可以被所有Module读取，但只能被自已Module修改，(切合combineReducers理念)
```

**结论：**

- React-coat 中的 model 更简单和纯粹，不与 UI 和路由挂勾。
- Dva 中路由按需加载 Page 时还需要手工配置加载 Model。
- React-coat 中按需加载 View 时会自动加载相应的 Model。

---

## Model 结构

Dva 中定义 model 使用一个 Object 对象，有五个约定的 key，例如：

```JS
{
  namespace: 'count',
  state: 0,
  reducers: {
    aaa(payload) {...},
    bbb(payload) {...},
  },
  effects: {
    *ccc(action, { call, put }) {...},
    *ddd(action, { call, put }) {...},
  },
  subscriptions: {
    setup({ dispatch, history }) {...},
  },
}
```

这样有几个问题：

- 如何保证 reducers 和 effects 之间命名不重复？简单的一目了然还好，如果是复杂的长业务流程，可能涉及到重用和提取，用到 Mixin 和 Extend，这时候怎么保证？
- 如何重用和扩展？官方文档中这样写道：

  > 从这个角度看，我们要新增或者覆盖一些东西，都会是比较容易的，比如说，使用 Object.assign 来进行对象属性复制，就可以把新的内容添加或者覆盖到原有对象上。注意这里有两级，model 结构中的 state，reducers，effects，subscriptions 都是对象结构，需要分别在这一级去做 assign。可以借助 dva 社区的 dva-model-extend 库来做这件事。换个角度，也可以通过工厂函数来生成 model。

  一个字：**饶**

现在反过来看看 React-coat 怎么解决这两个问题：

```JS
class ModuleHandlers extends BaseModuleHandlers<State, RootState, ModuleNames> {
  @reducer
  public aaa(payload): State {...}
  @reducer
  protected bbb(payload): State {...}
  @effect("loading")
  protected async ccc(payload) {...}
}
```

- 相当于 reducer、effect、subscriptions 都作为方法写在一个 Class 中，天然不会重名。
- 因为基于 Class，所以重用和扩展就可以充分利用类的继承、覆盖、重载。
- 因为基于 TS，还可以利用 public 或 private 权限来减少对外暴露。

**结论：**

react-coat 的 model 利用 Class 和装饰器来实现，更简单，更适合 TS 类型检查，也更利于重用与提取。

---

## Action 派发

在 Dva 中，派发 action 里要手动写 type 和 payload，缺少类型验证和静态检查

```JS
dispatch({ type: 'moduleA/query', payload:{username:"jimmy"}} })
```

在 React-coat 中直接利用 TS 的类型反射：

```JS
dispatch(moduleA.actions.query({username:"jimmy"}))
```

**结论：**

react-coat 的 Action 派发方式更优雅

---

## React-coat 独有的 ActionHandler 机制

我们可以简单的认为：在 Redux 中 store.dispatch(action)，可以触发一个注册过的 reducer，看起来似乎是一种观察者模式。推广到以上的 effect 概念，effect 同样是一个观察者。一个 action 被 dispatch，可能触发多个观察者被执行，它们可能是 reducer，也可能是 effect。所以 reducer 和 effect 统称为：**ActionHandler**

ActionHandler 机制对于复杂业务流程、跨 model 之间的协作有着强大的作用，举例说明：

- 在 React-coat 中，有一些框架级的特别 Action 在适当的时机被触发，比如：

  ```JS
  **module/INIT**：模块初次载入时触发
  **@@router/LOCATION_CHANGE**： 路由变化时触发
  **@@framework/ERROR**：发生错误时触发
  **module/LOADING**：loading状态变化时触发
  **@@framework/VIEW_INVALID**：UI界面失效时触发
  ```

  有了 ActionHandler 机制，它们全部变成了可注入的 hooks，你可以监听它们，例如：

  ```JS
  // 兼听自已的INIT Action
  @effect()
  protected async [ModuleNames.app + "/INIT"]() {
    const [projectConfig, curUser] = await Promise.all([settingsService.api.getSettings(), sessionService.api.getCurUser()]);
    this.updateState({
      projectConfig,
      curUser,
      startupStep: StartupStep.configLoaded,
    });
  }
  ```

- 在 Dva 中，要同步处理 effect 必须使用 put.resolve，有点抽象，在 React-coat 中直接 await 更直观和容易理解。

```JS
// 在 Dva 中处理同步 effect
effects: {
    * query (){
        yield put.resolve({type: 'otherModule/query',payload:1});
        yield put({type: 'updateState',  payload: 2});
    }
}

// 在React-coat中,可使用 awiat
class ModuleHandlers {
    async query (){
        await this.dispatch(otherModule.actions.query(1));
        this.dispatch(thisModule.actions.updateState(2));
    }
}
```

- 如果 ModuleA 进行某项操作成功之后，ModuleB 或 ModuleC 都需要 update 自已的 State，由于缺少 action 的观察者模式，所以只能将 ModuleB 或 ModuleC 的刷新动作写死在 ModuleA 中：

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

// 在React-coat中,可使用ActionHandler观察者模式：
class ModuleB {
    //在ModuleB中兼听"ModuleA/update" action
    async ["ModuleA/update"] (){
        ....
    }
}

class ModuleC {
    //在ModuleC中兼听"ModuleA/update" action
    async ["ModuleA/update"] (){
        ....
    }
}
```

**结论**

React-coat 中因为引入了 ActionHandler 机制，对于复杂流程和跨 model 协作比 Dva 简单清晰得多。

---

## 结语

好了，先对比这些点，其它想起来再补充吧！百闻不如一试，只有切身用过这两个框架才能感受它们之间的差别。所以还是请君一试吧：

```JS
git clone https://github.com/wooline/react-coat-helloworld.git
npm install
npm start
```

当然，Dva 也有很多优秀的地方，因为它已经广为人知，所以就不在此复述了。重申一下，以上观点仅代表个人，如果文中对 Dva 理解有误，欢迎批评指正。
