```
Dva：我目前 Github 上 12432 个星，你呢？
React-coat：我目前 74 个。
Dva：那你还敢吐槽我？
React-coat：我星少我怕谁？
Dva：...
```

```
Dva：我来自阿里，系出名门，你呢？
React-coat：我来自一家无名小公司，个人项目。
Dva：那你还敢吐槽我？
React-coat：我野蛮生长我怕谁？
Dva：...
```

好吧，我承认有点标题党了，只为博您一阅，客官请上座，喝杯茶！

<!-- TOC -->

- [概况](#概况)
- [开发语言](#开发语言)
- [集成框架](#集成框架)
- [Page vs Module](#page-vs-module)
- [代码分割与按需加载](#代码分割与按需加载)
- [Model 定义](#model-定义)
- [Model 结构](#model-结构)
- [Action 派发](#action-派发)

<!-- /TOC -->

## 概况

- DvaJS：[项目地址](https://github.com/dvajs/dva)
- React-coat：[项目地址](https://github.com/wooline/react-coat)

dvaJS 由阿里系团队维护，可以说是根红苗正的正规军，而 react-coat 只不过是我的个人项目，之前一直在公司内部使用，今年 1 月升级到 4.0 后感觉较稳定了才开始向外界发布。互联网是一个神奇的世界，人人都有机会发表自已的观点，正所谓初生蚂蚁不畏象，希望 Dva 不要介意，毕竟两者不是一个量级，没有吐槽哪有进步嘛。

首先撇开其它因素，仅从一个用户的角度对两者进行横向对比。如果存在对 DvaJS 理解错误的地方，请网友们指正。

## 开发语言

- Dva 基于 JS，支持 Typescript
- React-coat 基于 Typescript 支持 JS

虽然 Dva 号称支持 Typescript，可是看了一下官方给出的：[使用 TypeScript 的例子](https://github.com/umijs/umi-examples/tree/master/typescript)，完全感觉不到诚意，太简单了，action、model、view 之间的数据类型都是孤立的，没有相互约束、没有反射？看得我一头雾水...

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

## 集成框架

两者集成框架都差不多，都属于 Redux 生态圈，最大差别：

- Dva 集成 Redux-Saga，使用 yield 处理异步
- React-Coat 使用原生 async + await

Redux-Saga 有很多优点，比如方便测试、方便 Fork 模拟多线程事务等。缺点也很明显：

- 概念太多、容易把问题复杂化
- 使用 yield 时，不能返回 typescript 类型

**结论：**

你喜不喜欢 Saga，这是个人选择的问题了，没有绝对的标准。

---

跟据 umi 官网给出的 Demo with Dva：[umi-dva-user-dashboard](https://github.com/umijs/umi-dva-user-dashboard)，画出 Dva 工程典型目录结构大至如下：

```
src
├── components
├── layouts
├── models
│       ├── globalModel.js
├── pages
│       ├── .umi
│       │     └── router.js
│       ├── photos
│       │     ├── components
│       │     │    ├── Component1.tsx
│       │     │    └── Component2.tsx
│       │     ├── models
│       │     │    ├── photosModel1.js
│       │     │    └── photosModel2.js
│       │     └── UserComponent.jsx
│       ├── videos
│       │     ├── components
│       │     │    ├── Component1.tsx
│       │     │    └── Component2.tsx
│       │     ├── videosModel.js
│       │     └── videosComponent.jsx

```

同样画出 React-coat 的工程典型目录结构如下：

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

首先从整体目录结构上来说，差不多，主要差别如下：

## Page vs Module

- Dva 中强调 Page 的概念，一个 Page 可以有多个 Component，但是它只能导出一个主 Component，并用此来和 Router 规则绑定。
- React-coat 中没有 Page 的概念，只有 Module。一个 Module = `一个model.ts(维护数据)`和`一组view(展现交互)`。

**试问：**

- 单页 SPA，为什么要用 Page 这个概念来组织？什么是 Page? 它的边界在哪里？它和 View 有什么区别？目前看起来是个 Page，说不一定有一天它被嵌套在别的 View 里，也说不定有一天它被 Modal 弹窗弹出。
- 为什么路由要和 Page 强关联？Page 切换必须要用路由加载吗？

  在 React-coat 中，你可以使用路由方式加载一个 View，比如在 Photos View 中嵌套加载另一个 View：

  ```JS
  render() {
    return (
      <Switch>
        <Route exact={true} path="/photos/:id" component={DetailsView} />
        <Route component={ListView} />
      </Switch>
    );
  }
  ```

  也可以通过 Props 参数的方式加载一个 View，比如：

  ```JS
  render() {
    const {showDetails} = this.props;
    return showDetails ? <DetailsView /> : <ListView />;
  }
  ```

  用哪种方式来加载，这属于 Photos View 的内部事务，对外界来说，你只管加载 Photos View 本身就好了。  
  你觉得 Photos View 应当是一个 Page 么？你觉得 Photos View 应当是一个 RouteComponents 么？

- Dva 中以 Page 为主线，Model 写在 Page 下面，也就是说 model 要跟着 UI 走？model 是抽象的，UI 是具象的，model 和 UI 可能是一对多的关系，一个 model 可能被展示成不同的 UI，怎么重用 model 的逻辑？

  **我们来看看在 React-coat 中**:

  ```
  一个 Module = `一个model(维护数据)`和`一组view(展现交互)`。
  model 和 view 是一对多的关系
  划分Module是以业务功能的高内聚、低偶合，而不是以UI
  ```

**结论：**

- Dva 中的 Page 的概念和路由的集中配置让整个应用变得复杂，且不灵活。
- Dva 中以 Page 为主线来主织业务功能不合理。
- React-coat 的 Module 概念让应用更自由，更利于复用。
- React-coat 将路由逻辑分散在各 View 内部并对外隐藏细节，更符合一切皆组件的理念。
- React-coat 以业务功能的**高内聚、低偶合**来划分 Moduel 更合理。

## 代码分割与按需加载

Dva 中使用代码分割和动态加载，都只能将其放在 Router 配置中，如：

```JS
{
  path: '/user',
  models: () => [import('./pages/users/model.js')],
  component: () => import('./pages/users/page.js'),
}
```

这样写的几个问题：

- 代码分割和路由绑定在一起了。
- models 中如果再有嵌套加载、依赖和判断逻辑怎么写？
- models 和 component 手动配置，如何保证 models 中加载了所有 component 中所需要的 model?
- 将 models 和 component 分开 split code 太细了。

原来，所有的路由都要放到 router.js 中集中配置，简单路由还好，如果是一些复杂的嵌套路由、一些需要权限验证判断的路由，这个文件被写得又臭又长，基本上无可读性。后来出了 umi，强绑定 pages 目录，看上去是省去了配置，但是一方面增加了很多概念和潜规则，另一方面又失去了可程式化。

**React-coat 中：**

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
// 在某组件中加载：
const PhotosView = loadView(moduleGetter, ModuleNames.photos, "Main");
...
<Route exact={false} path="/photos" component={PhotosView} />
```

- 代码分割只做代码分割，不参和路由的事，因为模块也不一定是非得用路由的方式来加载。
- 路由只做路由的事情，不参和代码分割的事，因为模块也不一定非得做代码分割。
- 一个 Module 整体打包成一个 bundle，包括 model 和 views，更清晰合理。
- 使用 loadView 载入 View 就行了，它会自动 load 与该 View 相关的所有 Model
- 路由逻辑被分散在各组件中

**结论：**

- 使用 React-coat 做代码分割和按需加载更简单，一切皆 component

## Model 定义

Dva 中这样描述：

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

React-coat 中这样描述：

```
在 Module 内部，我们可进一步划分为`一个model(维护数据)`和`一组view(展现交互)`
集中在一个名为model.js的文件中编写 Model，并将此文件放在本模块根目录下
```

**结论：**

- Dva 中的 model 跟着 Page 走，感觉很别扭，React-coat 中的 model 跟着业务功能走，更自然。
- Dva 中的 model 分全局 model、页面 model，加重了应用的复杂度。React-coat 中没有这些多余的概念，更简单。
- Dva 中的 model 感觉和 UI 有着密切的关系，而 React-coat 中的 model 更纯粹，它就是个纯数据的维护。

## Model 结构

Dva 中定义 model 使用一个简单的 JS 对象，有五个约定的 key，例如：

```JS
{
  namespace: 'count',
  state: 0,
  reducers: {
    aaa(state) {...},
    bbb(state) {...},
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

- reducers 和 effects 内部可以通过 key 来保证命名不重复，可是如何保证它们之间命名不重复？简单的一目了然还好，如果是复杂的长业务流程，可能涉及到重用和提取，用到 Mixin 和 Extend，这时候怎么保证？
- 如何重用和扩展？官方文档中这样写道：

  > 从这个角度看，我们要新增或者覆盖一些东西，都会是比较容易的，比如说，使用 Object.assign 来进行对象属性复制，就可以把新的内容添加或者覆盖到原有对象上。注意这里有两级，model 结构中的 state，reducers，effects，subscriptions 都是对象结构，需要分别在这一级去做 assign。可以借助 dva 社区的 dva-model-extend 库来做这件事。换个角度，也可以通过工厂函数来生成 model。

  一个字：**饶**

现在反过来看看 React-coat 怎么解决这两个问题：

```JS
class ModuleHandlers extends BaseModuleHandlers<State, RootState, ModuleNames> {
  @reducer
  public putStartup(startupStep: StartupStep): State {
    return {...this.state, startupStep};
  }
  @reducer
  protected putCurUser(curUser: CurUser): State {
    return {...this.state, curUser};
  }
}
```

- 相当于 reducer、effect、subscriptions 都写在一个 Class 中，天然不会重名。
- 因为基于 Class，所以重用和扩展就可以充分利用类的继承、覆盖、重载。

**结论：**

react-coat 的 model 结构更清晰

## Action 派发

在 Dva 中，派发 action 里要手动写 type 和 payload，缺少类型验证和静态检查

```JS
dispatch({ type: 'moduleA/query', payload:{username:"jimmy"}} })
```

看看在 React-coat 中直接利用 TS 的类型反射：

```JS
dispatch(moduleA.actions.query({username:"jimmy"}))
```

**结论：**

react-coat 的 Action 派发方式更优雅
