**English** | [简体中文](./README_zh-CN.md)

- The framework is React state and data flow management. It does not improve and encapsulate React itself, nor does it violate the style and trend of React FP.
- The framework follows the concept of Redux, but it exposes the packaged sugar-coated API and does not bind Redux strongly.Subsequently, with the API unchanged, React Hooks will be used to replace Redux and React-Redux to facilitate user's senseless upgrade.
- The framework uses Class to organize the Model, supports inheritance, but does not force the use of inheritance, sometimes inheritance will increase the complexity of the project.
- Criticism and correction are welcome. Feedback if there are any mistakes or Bugs. Don't forget to **give a Star** if you think it's good.\_<

The opening, freedom and prosperity of react ecosphere also lead to tedious development and configuration and confused choice.Reaction-coat abandons some flexibility, replaces some configurations with conventions, solidifies some best practices, and provides developers with a more concise sugar coat.

Are you still honestly maintaining the store according to the native Redux tutorial?Try react-coat, which is so simple that you can do it almost without learning.

For example:

```JS
//  Only one class, action、reducer、effect、loading
class ModuleHandlers extends BaseModuleHandlers {
  @reducer
  protected putCurUser(curUser: CurUser): State {
    return {...this.state, curUser};
  }
  @reducer
  public putShowLoginPop(showLoginPop: boolean): State {
    return {...this.state, showLoginPop};
  }
  @effect("login") // use loading state
  public async login(payload: {username: string; password: string}) {
    const loginResult = await sessionService.api.login(payload);
    if (!loginResult.error) {
      // this.updateState() is a shortcut to this.dispatch(this.actions.updateState())
      this.updateState({curUser: loginResult.data});
      Toast.success("welcome！");
    } else {
      Toast.fail(loginResult.error.message);
    }
  }
  // uncatched error will dispatch @@framework/ERROR action
  // subscribe it and reporting to the server
  @effect(null) // set null that means loading state are not needed
  protected async ["@@framework/ERROR"](error: CustomError) {
    if (error.code === "401") {
      // dispatch action: putShowLoginPop
      this.dispatch(this.actions.putShowLoginPop(true));
    } else if (error.code === "301" || error.code === "302") {
      // dispatch action: router change
      this.dispatch(this.routerActions.replace(error.detail));
    } else {
      Toast.fail(error.message);
      await settingsService.api.reportError(error);
    }
  }
  // subscribe itself's INIT Action and to do any async request
  @effect()
  protected async ["app/INIT"]() {
    const [projectConfig, curUser] = await Promise.all([
      settingsService.api.getSettings(),
      sessionService.api.getCurUser()
    ]);
    // this.updateState() is a shortcut to this.dispatch(this.actions.updateState())
    this.updateState({
      projectConfig,
      curUser,
    });
  }
}
```

<!-- TOC -->

- [4.0 Released](#40-released)
- [Feature](#feature)
- [why not dvaJS](#why-not-dvajs)
- [Install](#install)
- [Compatibility](#compatibility)
- [List of API](#list-of-api)
- [Quick Start and Demo](#quick-start-and-demo)
- [Basic concepts and nouns](#basic-concepts-and-nouns)
  - [Store、Reducer、Action、State、Dispatch](#storereduceractionstatedispatch)
  - [Effect](#effect)
  - [ActionHandler](#actionhandler)
  - [Module](#module)
  - [ModuleState、RootState](#modulestaterootstate)
  - [Model](#model)
  - [View、Component](#viewcomponent)
- [Routing and Dynamic Loading](#routing-and-dynamic-loading)
- [Several special actions](#several-special-actions)
- [Roadmap](#roadmap)

<!-- /TOC -->

## 4.0 Released

- Remove redux-saga and use es6 async and await to organize and manage effects
- Support SPA (single page application) and SSR (server side rendering), complete support client and server isomorphism

## Feature

- Integrated react, redux, react-router, history and other related frameworks
- Sugarcoat for the above frame only, does not change its basic concept, does not have strong invasion and destructiveness.
- Structured front-end engineering, business modularization, support on-demand loading
- Support SPA (single page application) and SSR (server side rendering)
- Using Typescript, better static checking and intelligent prompts
- Open source micro framework, less than 1000 lines of source code, almost without learning to start

## why not dvaJS

> The framework is similar to `dvajs` in concept, and the main differences are as follows:：

- Introduce the ActionHandler Observer Model to collaborate between more elegant processing modules.
- Remove redux-saga and replace it with async and await to simplify the code and support `TS Types` more comprehensively.
- Using Typescript organization and development, more comprehensive type safety.
- Module division by business function, Page-free concepts.
- Routing componentization and not configuration, simpler organizational structure.
- Support SPA (single page application) and SSR (server rendering) isomorphic.
- [**More differences with dvaJS**](https://github.com/wooline/react-coat/blob/master/docs/vs-dva.md)

## Install

    $ npm install react-coat

peerDependencies

```
  "peerDependencies": {
    "@types/node": "^9.0.0 || ^10.0.0  || ^11.0.0",
    "@types/history": "^4.0.0",
    "@types/react": "^16.0.0",
    "@types/react-dom": "^16.0.0",
    "@types/react-redux": "^5.0.0 || ^6.0.0 || ^7.0.0",
    "@types/react-router-dom": "^4.0.0",
    "connected-react-router": "^5.0.0 || ^6.0.0",
    "history": "^4.0.0",
    "react": "^16.3.0",
    "react-dom": "^16.3.0",
    "react-redux": "^5.0.0 || ^6.0.0",
    "react-router-dom": "^4.0.0",
    "redux": "^3.0.0 || ^4.0.0"
  }

```

If you want to save your mind and have no special requirements for the dependent versions, you can install the [**react-coat-pkg**](https://github.com/wooline/react-coat-pkg) of "all in 1", which will automatically contain the above libraries and the versions pass without conflict after test.

    $ npm install react-coat-pkg

## Compatibility

Mainstream browser、>=IE9 (with es6 polyfill，recommend @babel/polyfill)

## List of API

[Click to view](./API.md)

```

BaseModuleHandlers, BaseModuleState, buildApp, delayPromise, effect, ERROR, errorAction, exportModel, exportModule, exportView, GetModule, INIT, LoadingState, loadModel, loadView, LOCATION_CHANGE, logger, ModelStore, Module, ModuleGetter, reducer, renderApp, RootState, RouterParser, setLoading, setLoadingDepthTime

```

## Quick Start and Demo

The framework is simple to use.

- 8 new concepts：

  > Effect、ActionHandler、Module、ModuleState、RootState、Model、View、Component

- 4 steps to create:

  > exportModel(), exportView(), exportModule(), createApp()

- 3 demos, Step by Step:

  > [Single Page Helloworld](https://github.com/wooline/react-coat-helloworld)

  > [Single Page Optimization](https://github.com/wooline/react-coat-spa-demo)

  > [SPA+SSR (Server-Side Rendering)](https://github.com/wooline/react-coat-ssr-demo)

## Basic concepts and nouns

Premise: Suppose you are familiar with React and Redux and have some development experience.

### Store、Reducer、Action、State、Dispatch

The above concepts are basically the same as Redux. The framework is non-intrusive and follows the concepts and principles of react and redux:

- Using one-way data flow between M and V.
- Keep a single Store for the whole station.
- Store is Immutability immutable data.
- To change the store state, you need reducer.
- Calling Reducer must pass explicit dispatch action.
- Reducer must be pure function
- Behaviors with side effects, all in the Effect function
- Each reducer can only modify a node under Store, but it can read all nodes.
- Componentized routing without centralized configuration

### Effect

We know that in Redux, changing the state must trigger the reducer through dispatch action and return a new State in the reducer. The reducer is a pure function with no side effects. As long as the input parameters are the same, the return results are the same and are executed synchronously.And effect is relative to reducer. Like reducer, it must also be triggered by dispatch action. The difference is:

- It is a non-pure function that can contain side effects. It can be either non-return or asynchronous.
- It can't change state directly. To change state, it must dispatch action again to trigger reducer.

### ActionHandler

We can simply think that:In Redux, store.dispatch(action) can trigger a registered reducer, which seems to be an observer mode. Extending to the above concept of effect, effect is also an observer.An action is dispatched, which may trigger multiple observers to be executed. They may be reducer or effect. So reducer and effect are collectively called: **ActionHandler**

- If a group of actionHandlers are subscribe to an action at the same time, what is their execution order?

  Answer: When an action is dispatched, all reducers are executed first, and they are executed synchronously in turn. After all reducer have been executed, all effect execution will begin.

- I want to wait for this set of actionHandlers to complete the execution, then the next step, but the effect is asynchronous, how do I know that all the effects have been processed?

  Answer: The framework improves the store.dispatch method. If has any effect subscribe to this action, it will return a Promise, so you can use await store.dispatch({type: search"}) to wait for all effect processing to complete.

### Module

When we receive a complex front-end project, we first need to simplify the complexity and disassemble the functions.It is usually divided into Modules according to the principles of high cohesion and low coupling. A module is a collection of relatively independent business functions. It usually includes a Model ( for processing business logic ) and a group of View ( for render data and interaction ). It should be noted that:

- SPA applications have no boundaries of Page. Don't divide modules by Page concepts.
- A Module may contain a set of Views. Don't divide modules by the concept of View

Module is a logical division, but we are used to using folder directories to organize and reflect, for example:

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

As can be seen from the above, the project includes seven modules: app、userOverview、userTransaction、blacklist、agentOverview、agentBonus、agentSale, Although there are subdirectories user and angent under the modules directory, they are only classified and do not belong to modules. We agree that:

- Each Module is a separate folder
- Module itself has only one level, but it can be categorized in a multilevel directory
- Each Module folder name is the Module name, because all Modules are level-level, so we need to ensure that the Module name does not repeat, in practice, we can use the Enum type of Typescript to ensure that, you can also put all Modules in the first directory.
- Each module maintains a certain degree of independence and can be loaded synchronously, asynchronously, on-demand and dynamically.

### ModuleState、RootState

The system is divided into several relatively independent and level Modules, not only in the folder directory, but also in Store State. Each Module is responsible for maintaining and managing a node under the Store, which we call **ModuleState**, while the entire Store is customarily called **RootState**.

For example:A Store data structure:

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

- Each Module manages and maintains a node under the Store, which we call ModuleState.
- Each ModuleState is the root node of Store and is named Key by Module.
- Each Module can only update its own ModuleState, but it can read other ModuleState.
- Each Module update its own Module State and must be triggered by dispatch action.
- Each Module can be the identity of the observer and subscribe for actions emanating from other Modules to cooperate with modifying its own Module State.

You may notice that the first of the Store's sub-nodes above is `router`, which is not a ModuleState, but a node generated by a third-party Reducer.We know that Redux allows multiple Reducers to co-maintain Stroe and provides a combineReducers method for merging. Because the key name of ModuleState is Module name, so:`Module names naturally cannot be renamed with other third-party Reducers`.

### Model

Within Module, we can further divide it into `a model` (maintenance data) and `a set of views` (render data). Here, the model actually refers to the view model, which mainly contains two functions:

- ModuleStated Definition
- Maintenance of ModuleState. ActionHandler has been introduced before. There is actually coding for ActionHandler.

> Data flow flows from Model into View in one direction, so Model is independent and independent of View.So in theory, even without View, the program can still be driven from the command line.

We agree that:

- Focus on coding Model in a file named **model.js**, and put this file under the root directory of this module.
- Coding all **ActionHandlers** in a class called ModuleHandlers, and each reducer and effect corresponds to a method in that class.

For example, Model in the userOverview module:

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
// Define ModuleState types
export interface State extends BaseModuleState {
  listSearch: {username:string; page:number; pageSize:number};
  listItems: {uid:string; username:string; age:number}[];
  listSummary: {page:number; pageSize:number; total:number};
  loading: {
    searchLoading: LoadingState;
  };
}

// Coding Module's ActionHandler
class ModuleHandlers extends BaseModuleHandlers<State, RootState, ModuleNames> {
  constructor() {
    // Define ModuleState's initial value
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

  // Define a reducer
  @reducer
  public putSearchList({listItems, listSummary}): State {
    return {...this.state, listItems, listSummary};
  }


  // Define a effect that request data with ajax
  // And then dispatch a action that tigger putSearchList reducer
  // this.dispatch is store.dispatch's feference
  // searchLoading indicates to inject the execution state of this effect into State.loading.searchLoading
  @effect("searchLoading")
  public async searchList(options: {username?:string; page?:number; pageSize?:number} = {}) {
    // this.state is own ModuleState
    const listSearch = {...this.state.listSearch, ...options};
    const {listItems, listSummary} = await api.searchList(listSearch);
    this.dispatch(this.action.putSearchList({listItems, listSummary}));
  }

  // Define a effect that subscribed another module's action and then update its own ModuleState
  // Use protected permission because there is no need to actively call
  // @effect(null) indicates that there is no need to track the execution state
  @effect(null)
  protected async ["@@router/LOCATION_CHANGE]() {
      // this.rootState is the entire store state
      if(this.rootState.router.location.pathname === "/list"){
          await this.dispatch(this.action.searchList());
      }
  }
}
```

In particular, the last ActionHandler of the above code:

```JS
protected async ["@@router/LOCATION_CHANGE](){
    if(this.rootState.router.location.pathname === "/list"){
        await this.dispatch(this.action.searchList());
    }
}
```

Two points have been emphasized before:

- Module can subscribe to actions from other modules and cooperate to update its own ModuleState.
- Module can only update its own ModuleState node, but it can read the entire Store.

Also note the statement：await this.dispatch(this.action.searchList())：

- It's understandable that dispatch dispatches an action called searchList, but why can we still have awiat before? Is dispatch action asynchronous?

  Answer: The dispatch dispatch action itself is synchronous. We talked about the concept of ActionHandler before. When an action is dispatch, there may be a group of reducers or effects subscribe to it simultaneously. Reducers are synchronous, but effects may be asynchronous. If you want to wait for all the concurrent subscriber to be completed, you can use await here. Otherwise, you can not use await.

### View、Component

Within the Module, we can further divide it into a model ( maintenance data ) and a group of view ( render data ).So there may be more than one view in a Module, and we are used to creating a folder named views under the Module root directory:

For example, views in the userOverview module:

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

- Each view is actually a React Component, so start with uppercase letters.
- For accessory resources such as CSS and img, if they belong to a view private, follow the view together, and if multiple views are public, put them in the public directory.
- Views can be nested, including views that can be nested in other modules. If you need to use them for other modules, you must use `exportView()` in `views/index.ts` to export.
- ActionHandler in Model is triggered by dispatch action in view. In addition to dispatch action of this module, it can also dispatch action of other modules.

For example: LoginForm：

```JS
interface Props extends DispatchProp {
  logining: boolean;
}

class Component extends React.PureComponent<Props> {
  public onLogin = (evt: any) => {
    evt.stopPropagation();
    evt.preventDefault();
    // ActionHandler in Model is triggered by dispatch action
    this.props.dispatch(thisModule.actions.login({username: "", password: ""}));
  };

  public render() {
    const {logining} = this.props;
    return (
      <form className="app-Login" onSubmit={this.onLogin}>
        <h3>Login</h3>
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

As you can see from the above code, View is a Component. Is there any difference between View and Component? No coding, logically there are:

- View embodies the view presentation of ModuleState, which emphasizes the specific business logic, so its props are usually connected directly to the store with mapStateToProps connect.
- Component represents a pure component without business logic context, and its props are generally derived from parent delivery.
- Components are usually public, while views are not.

## Routing and Dynamic Loading

React-coat agrees with the idea of react-router 4 modular routing. Routing is a component. Nested routing is as simple as nested component, without complicated configuration. Such as: `PhotosView` and `VideosView` come from Photos module and Videos module respectively. They are loaded asynchronously on demand.

```JS
import {BottomNav} from "modules/navs/views"; // BottomNav come from another module
import LoginForm from "./LoginForm"; // LoginForm come from this module

// PhotosView an VideosView come from other module
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

Several other views are nested in one of the above views in different loading modes:

- BottomNav is a view of navsModule. Direct import means that it will be loaded into this view synchronously.
- LoginForm is a view of this module, so it is directly import by relative paths and nested directly, which means it will load synchronously.
- PhotosView and VideosView come from other modules, but they are acquired through loadView() and nested by Route, which means that they will load asynchronously on demand. Of course, you can also `import {PhotosView} from "modules/photos/views"` to load on demand synchronously.

Therefore, the framework is flexible and simple to load modules and views without complex configuration and modification.

- Whether synchronous, asynchronous, on-demand, dynamic loading, only to change the loading mode, without modifying the module.The module itself does not need to formulate in advance who and how it will be loaded to ensure the independence of the module.
- As mentioned earlier, view is the presentation of model data. When embedding other module views, do you need to import other module models? No, the framework will be imported automatically.

## Several special actions

- **@@router/LOCATION_CHANGE**：The framework integrates connected-react-router, which dispatches the action when the routing changes, and you can subscribe the action in moduleHandlers.
- **@@framework/VIEW_INVALID**：This action is dispatched when the routing changes, or when any view has Mount or Unmount behavior, which more accurately reflects view updates than @@router/LOCATION_CHANGE
- **@@framework/ERROR**: The framework catches uncatched error and automatically dispatches this action when errors occur. You can monitor this action in moduleHandlers
- **module/INIT**：This action is dispatched when the module is first loaded to inject the initial moduleState into the store
- **module/LOADING**：This action is dispatched when loading progress is triggered, such as @effect("login")

## Roadmap

- react hooks

with the API unchanged, React Hooks will be used to replace Redux and React-Redux to facilitate user's senseless upgrade.

- react-shirt

with the same API, Mobx will be used to replace Redux.
