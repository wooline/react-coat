<!-- TOC -->

- [BaseModuleHandlers](#basemodulehandlers)
- [BaseModuleState](#basemodulestate)
- [buildApp](#buildapp)
- [delayPromise](#delaypromise)
- [effect](#effect)
- [ERROR](#error)
- [exportModel](#exportmodel)
- [exportModule](#exportmodule)
- [exportView](#exportview)
- [INIT](#init)
- [LoadingState](#loadingstate)
- [loadModel](#loadmodel)
- [loadView](#loadview)
- [LOCATION_CHANGE](#location_change)
- [logger](#logger)
- [reducer](#reducer)
- [renderApp](#renderapp)
- [RootState](#rootstate)
- [RouterParser](#routerparser)
- [setLoading](#setloading)
- [setLoadingDepthTime](#setloadingdepthtime)
- [VIEW_INVALID](#view_invalid)

<!-- /TOC -->

### BaseModuleHandlers

ModuleHandlers 的基类，所有 ModuleHandlers 必须继承此类

```JS
declare class BaseModuleHandlers<S extends BaseModuleState, R extends RootState, N extends string> {
    protected readonly initState: S; // 初始值
    protected readonly namespace: N; // moduleName
    protected readonly store: ModelStore; // 引用 store
    protected readonly actions: Actions<this>; // 引用本模块的 actions
    protected readonly routerActions: typeof routerActions; // 引用 connected-react-router
    constructor(initState: S, presetData?: any);
    protected readonly state: S; // 本模块的 ModuleState
    protected readonly rootState: R; // 全部的 State
    protected readonly currentState: S; // 当前本模块的 ModuleState
    protected readonly currentRootState: R; // 当前全部的 State
    protected dispatch(action: Action): Action | Promise<void>; // 引用store.dispatch
    // 如果某个 actionHandler 不希望被外界触发，请设为 protected 或 private，
    // 此时不能使用 this.actions.someAction() 触发，而要使用 this.callThisAction(this.someAction)
    protected callThisAction<T extends any[]>(handler: (...args: T) => any, ...rest: T): {
        type: string;
        playload?: any;
    };
    protected INIT(payload: S): S; // 一个 Reducer Handler，兼听action: moduleName/INIT
    protected UPDATE(payload: S): S; // 一个 Reducer Handler，兼听action: moduleName/UPDATE
    protected LOADING(payload: { // 一个 Reducer Handler，兼听action: moduleName/LOADING
        [group: string]: string;
    }): S;
    // 一个快捷方法，相当于this.dispatch(this.callThisAction(this.UPDATE, {...this.state, ...payload}));
    protected updateState(payload: Partial<S>): void;
}
```

- state / currentState 以及 rootState / currentRootState 区别：  
  由于使用 action handler 观察者兼听模式，一个 action 可能被多个 actionHandler 共同兼听，它们的执行是顺序依次执行的，当所有 reducer 执行完成了，才会 combine 成一个总的 rootState 来更新 store。如果在更新过程中，一个 actionHandler 中需要及时得到其它 handler update 之后的最新 state，请使用 currentState 或 currentRootState

### BaseModuleState

ModuleState 的抽象接口，所有 ModuleState 必须实现此接口

```JS
interface BaseModuleState {
    // 指明该节点是不是一个ModuleState
    // 该属性数据由框架自动赋值，请不要人为赋值
    isModule?: boolean;
    // 记录本模块的 loading 状态，可以是多个不同的 loading 状态
    loading?: {
        [key: string]: LoadingState;
    };
}
```

### buildApp

浏览器端总的入口方法，使用此方法创建应用。

```JS
declare function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(
    moduleGetter: M, // 模块的获取方式，同步或是异步
    appName: A, // 入口模块的 moduleName
    storeOptions?: StoreOptions, // store配置参数
    container?: string, // 容器 dom id
    ssrInitStoreKey?: string // 如果使用ssr，服务端的脱水数据 key
): Store<any, AnyAction>;

// store配置参数
interface StoreOptions {
    reducers?: ReducersMapObject; // 第三方的 reducers，注意不要与 moduleName 冲突
    middlewares?: Middleware[]; // 第三方的 中间件
    enhancers?: StoreEnhancer[]; // 第三方的 enhancers
    routerParser?: RouterParser; // 自定义路由解析器
    initData?: any; // 初始化 store 状态，如果使用 ssr，初始化 store 状态为两者 merge
}
```

### delayPromise

方法的装饰器，装饰返回 promise 的某方法，模拟延迟 second 秒后才返回，如：@delayPromise(5)

```JS
declare function delayPromise(
    second: number //延迟多少秒返回
):(target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
```

### effect

方法的装饰器，指明该方法为一个 effect actionHandler，并可注入 loading 跟踪状态

```JS
declare function effect(
    // 注入 loading key，如果不写默认 key 为 global，如果不想跟踪 loading 状态，必须设置为 null
    loadingForGroupName?: string | null,
    // 注入 loading key 的模块，默认为本模块
    loadingForModuleName?: string
): (target: any, key: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
```

### ERROR

一个常量，当框架捕获到未处理的错误时，会派发此 Error action，可以在模块中兼听此 action，来集中处理某些错误，比如上报给服务器

```JS
declare const ERROR = "@@framework/ERROR";
```

### exportModel

创建并导出模块的 Model，一般写在 module/model.ts 中

```JS
declare function exportModel<S extends BaseModuleState, N extends string>(
    namespace: N, // 模块名称
    HandlersClass: { // ModuleActionHandlers
        new (initState: S, presetData?: any): BaseModuleHandlers<BaseModuleState, RootState<{}>, N>;
    },
    initState: S // 初始 ModuleState
): Model<S>;
```

### exportModule

创建并导出模块的对外接口，一般写在 module/facade.ts 中

```JS
declare function exportModule<T extends ActionCreatorList>(
    namespace: string // 模块名称
): {
    namespace: string;
    actions: T;
};
```

### exportView

创建并导出模块的 view，一般写在 module/views/index.ts 中

```JS
declare function exportView<C extends ComponentType<any>>(
    ComponentView: C, // 要导出的 React Component
    model: Model // 本模块的 Model
    viewName?: string // view名称
): C;
```

### INIT

一个常量，当模块初始化时，会派发一个 module/INIT 的 action，可以兼听本模块或其它模块的此 action，并对此作出反应

```JS
declare const INIT = "INIT";
```

### LoadingState

一个可追踪的 loading 状态，使用 @effect() 或 setLoading() 可创建一个追踪的 loading 状态。

- 同一个 key 名的多个 loading 状态会自动合并追踪。比如同时发出多个 ajax，但只想作为一个 loading 状态追踪。
- 对于超过一定时间(默认 2 秒)的 loading 状态，会转为 Depth 状态。比如对于未超过 2 秒就返回的 ajax 请求，不需要显示黑色遮罩，防止闪烁。

```JS
declare enum LoadingState {
    Start = "Start",
    Stop = "Stop",
    Depth = "Depth"
}
```

### loadModel

加载指定模块的 Model，一般适用于 ssr 项目，非 ssr 项目，展示 view 的时候会自动加载其 Model，无需特别调用。在 ssr 项目中由于单向数据流的限定，加载 view 前必须先加载 model，不能等待 view 来自动加载。注意，此方法会返回一个 promise，所以可以使用 await 来等待。

```JS
declare function loadModel<M extends Module>(
    getModule: GetModule<M>
): Promise<M["model"]>;
```

### loadView

异步加载某个 view，如果是同步加载，直接用 es6 import 即可。

```JS
declare function loadView<MG extends ModuleGetter, M extends Extract<keyof MG, string>, V extends ReturnViews<MG[M]>, N extends Extract<keyof V, string>>(
    moduleGetter: MG,
    moduleName: M,
    viewName: N,
    loadingComponent?: React.ReactNode
): V[N];
```

### LOCATION_CHANGE

一个常量，当 URL 发生变化时时，会派发一个 @@router/LOCATION_CHANGE 的 action，可以兼听此 action，并对此作出反应

```JS
declare const LOCATION_CHANGE = "@@router/LOCATION_CHANGE";
```

### logger

方法装饰器，用来装饰某个 effect ActionHandler，可以注入一个执行前和执行后的钩子，用来记录某些信息，比如执行时间等。

```JS
declare function logger(
    before: (action: Action, moduleName: string, promiseResult: Promise<any>) => void,
    after: null | ((status: "Rejected" | "Resolved", beforeResult: any, effectResult: any) => void)
): (target: any, key: string, descriptor: PropertyDescriptor) => void;
```

### reducer

方法装饰器，用来指明该方法为一个 reducer actionHandler

```JS
declare function reducer(target: any, key: string, descriptor: PropertyDescriptor): PropertyDescriptor;
```

### renderApp

ssr 服务器渲染的入口方法，仅用于 server 端，与 buildApp 呼应。

```JS
declare function renderApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(
    moduleGetter: M, // 模块的获取方式，同步或是异步
    appName: A, // 入口模块的 moduleName
    initialEntries: string[], // http请求时在 server 端虚拟 history 历史记录，一般包含当前 url 即可
    storeOptions?: StoreOptions, // 与 buildApp 的 storeOptions 相同
    ssrInitStoreKey?: string, // 服务端的脱水数据 key
    renderToStream?: boolean // 是否采用 renderToStream 来渲染 react
): Promise<{
    html: string | NodeJS.ReadableStream; // 服务器端渲染生成的 html
    data: any; // 服务器端生成的脱水数据
    ssrInitStoreKey: string; // 服务端的脱水数据 key
}>;
```

### RootState

总的 Store 数据结构类型接口。
包含名为 router 的路由数据，该节点默认由 connected-react-routert 生成，可以使用自定义的 RouterParser
包含名为 views 的当前展示视图数据，该节点由框架根据当前 view 自动生成

```JS
declare declare type RootState<G extends ModuleGetter = {}, R = RouterState> = {
    router: R;  // 路由节点
    views: { // 当前视图展示节点
        [moduleName:string]?: {[viewName:string]:number};
    };
}
```

### RouterParser

自定义路由解析器，框架集成 connected-react-router，会作简单的 URL 解析，如果需要自定义解析，可以在 StoreOptions 中传入该解析器

```JS
declare type RouterParser<T = any> = (nextRouter: T, prevRouter?: T) => T;
```

### setLoading

主动设置一个加载项，与 @effect("loadingKey") 注入 loading 状态一样。

```JS
declare function setLoading<T extends Promise<any>>(
    item: T, // 异步加载项，必须是一个Promise
     // namespace/group 一起创建一个跟踪此加载项的 key，所有 key 相同的加载项将合并成一个
    namespace?: string,
    group?: string
): T;
```

### setLoadingDepthTime

参见 LoadingState，设置 loading 状态变为 Depth 的等待时间，默认为 2 秒

```JS
declare function setLoadingDepthTime(second: number): void;
```

### VIEW_INVALID

一个常量，当视图需要更新时，会派发一个 @@framework/VIEW_INVALID 的 action，可以兼听此 action，并对此作出反应

```JS
export declare const VIEW_INVALID = "@@framework/VIEW_INVALID";
```

当需要监听视图是否需要更新时，兼听此 action 比 @@router/LOCATION_CHANGE 更合理，该 action 的派发时机：

- 当@@router/LOCATION_CHANGE 被派发后的一个任务周期内
- 当任何一个 view 被 Mount 或 Unmount 后的一个任务周期内
