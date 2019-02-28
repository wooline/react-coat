**English** | [简体中文](./API_zh-CN.md)

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

The base class of ModuleHandlers, which all ModuleHandlers must extends it.

```JS
declare class BaseModuleHandlers<S extends BaseModuleState, R extends RootState, N extends string> {
    protected readonly initState: S;
    protected readonly namespace: N; // moduleName
    protected readonly store: ModelStore; // reference store
    protected readonly actions: Actions<this>; // this module's actions
    protected readonly routerActions: typeof routerActions; // reference connected-react-router
    constructor(initState: S, presetData?: any);
    protected readonly state: S; // this module's state
    protected readonly rootState: R; // entire store state
    protected readonly currentState: S; // this module's current state
    protected readonly currentRootState: R; // entire store current state
    protected dispatch(action: Action): Action | Promise<void>; // reference store.dispatch
    // If an action handler does not want to be triggered by the outside world, set it to protected or private.
    // Cannot use this.actions.someAction() at this time, but use this.callThisAction(this.someAction)
    protected callThisAction<T extends any[]>(handler: (...args: T) => any, ...rest: T): {
        type: string;
        playload?: any;
    };
    protected INIT(payload: S): S; // a Reducer Handler，subscribed action: moduleName/INIT
    protected UPDATE(payload: S): S; // a Reducer Handler，subscribed action: moduleName/UPDATE
    protected LOADING(payload: { // a Reducer Handler，subscribed action: moduleName/LOADING
        [group: string]: string;
    }): S;
    // a shortcut method，Alias: this.dispatch(this.callThisAction(this.UPDATE, {...this.state, ...payload}));
    protected updateState(payload: Partial<S>): void;
}
```

- state / currentState and rootState / currentRootState Difference:
  Because of the use of the action handler observer-subscriber mode, an action may be subscribed to by multiple actionHandlers, whose execution is sequential, and when all reducer executions are completed, the combine will form a total rootState to update the store.If you need to get the latest state after other handler update in one actionHandler in time during the update process, please use currentState or currentRootState.

### BaseModuleState

The abstract interface of ModuleState, which must be implemented by all ModuleState

```JS
interface BaseModuleState {
    // Specifies whether the node is a ModuleState
    // This attribute data is automatically assigned by the framework.
    isModule?: boolean;
    // Record the loading state of this module, which can be multiple different loading states
    loading?: {
        [key: string]: LoadingState;
    };
}
```

### buildApp

The browser side of the total entry method, using this method to create applications.

```JS
declare function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(
    moduleGetter: M, // Module acquisition, synchronous or asynchronous
    appName: A, // Entry module name
    storeOptions?: StoreOptions, // Store configuration
    container?: string | Element | Function, // container
    ssrInitStoreKey?: string // In ssr mode，dehydrate data key
): Store<any, AnyAction>;

// Store configuration
interface StoreOptions {
    reducers?: ReducersMapObject; // Be careful not to conflict with moduleName
    middlewares?: Middleware[];
    enhancers?: StoreEnhancer[];
    routerParser?: RouterParser; // Custom route parser
    initData?: any; // Initialize the store state, and in SSR mode, dehydrate data to be both merge
}
```

### delayPromise

a decorator of the method, which decorates a method returning to promise, simulates a delay of seconds before returning, such as: @delayPromise(5)

```JS
declare function delayPromise(
    second: number // How many seconds late to return
):(target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
```

### effect

The decorator of the method specifies that the method is an effect action handler and can be injected into the loading tracking state

```JS
declare function effect(
    // Inject loading key，default value is "global"
    // If you don't want to track loading status, you must set it to null
    loadingForGroupName?: string | null,
    // Inject loading state to which module，default value is this module
    loadingForModuleName?: string
): (target: any, key: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
```

### ERROR

A constant defined. When the framework catches uncatched errors, it will dispatching the Error action, which can be subscribed to in the module to focus on handling certain errors, such as reporting to the server.

```JS
declare const ERROR = "@@framework/ERROR";
```

### exportModel

Create and export the model of the module, usually written in `module/model.ts`

```JS
declare function exportModel<S extends BaseModuleState, N extends string>(
    namespace: N, // module name
    HandlersClass: { // ModuleActionHandlers
        new (initState: S, presetData?: any): BaseModuleHandlers<BaseModuleState, RootState<{}>, N>;
    },
    initState: S
): Model<S>;
```

### exportModule

Create and export the external interface of the module, usually written in `module/facade.ts`

```JS
declare function exportModule<T extends ActionCreatorList>(
    namespace: string // module name
): {
    namespace: string;
    actions: T;
};
```

### exportView

Create and export the view of the module，usually written in `module/views/index.ts`

```JS
declare function exportView<C extends ComponentType<any>>(
    ComponentView: C, //  React Component
    model: Model
    viewName?: string // view name
): C;
```

### INIT

A constant defined, when module initialized, dispatches a module/INIT action that can subscribe to and respond.

```JS
declare const INIT = "INIT";
```

### LoadingState

A traceable loading state can be created using @effect() or setLoading().

- Multiple loading statuses with the same key name are automatically merged and tracked. For example, multiple ajaxes are issued simultaneously, but only as a loading status tracking.
- For a loading state that exceeds a certain period of time (default 2 seconds), it changes to Depth state. For example, for Ajax requests returned in less than 2 seconds, no black masks are needed to prevent flickering.

```JS
declare enum LoadingState {
    Start = "Start",
    Stop = "Stop",
    Depth = "Depth"
}
```

### loadModel

Models that load specified modules are generally applicable to SSR projects, not SSR projects. Models are automatically loaded when viewing is displayed without special calls.In SSR project, due to the restriction of one-way data flow, all the model must be loaded before loading view, and can not wait for view to load automatically.Note that this method returns a promise, so you can use await to wait.

```JS
declare function loadModel<M extends Module>(
    getModule: GetModule<M>
): Promise<M["model"]>;
```

### loadView

Asynchronous loading of a view, if it is synchronous load, directly use ES6 import

```JS
declare function loadView<MG extends ModuleGetter, M extends Extract<keyof MG, string>, V extends ReturnViews<MG[M]>, N extends Extract<keyof V, string>>(
    moduleGetter: MG,
    moduleName: M,
    viewName: N,
    loadingComponent?: React.ReactNode
): V[N];
```

### LOCATION_CHANGE

A constant defined，when the URL changes, will dispatch an @@router/LOCATION_CHANGE action, can subscribe to this action, and respond to it.

```JS
declare const LOCATION_CHANGE = "@@router/LOCATION_CHANGE";
```

### logger

Method decorator, used to decorate an effect Action Handler, can inject a hook before and after execution to record certain information, such as execution time.

```JS
declare function logger(
    before: (action: Action, moduleName: string, promiseResult: Promise<any>) => void,
    after: null | ((status: "Rejected" | "Resolved", beforeResult: any, effectResult: any) => void)
): (target: any, key: string, descriptor: PropertyDescriptor) => void;
```

### reducer

Method decorator to indicate that the method is a reducer action handler

```JS
declare function reducer(target: any, key: string, descriptor: PropertyDescriptor): PropertyDescriptor;
```

### renderApp

The entry method of server side rendering, this is only used on server side, which corresponds to buildApp.

```JS
declare function renderApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(
    moduleGetter: M, // Module acquisition, synchronous or asynchronous
    appName: A, // Entry module name
    initialEntries: string[], // Virtual history on the server side when http requests, usually containing the current URL
    storeOptions?: StoreOptions, // Store configuration
    ssrInitStoreKey?: string, // Dehydrate data key
    renderToStream?: boolean // Whether to use renderToStream
): Promise<{
    html: string | NodeJS.ReadableStream; // render to html string
    data: any; // Dehydrate data
    ssrInitStoreKey: string; // Dehydrate data key
}>;
```

### RootState

Overall Store Data Structure Type Interface.  
Contain routing data named router, which is generated by default by connected-react-router. a custom RouterParser can be used to.  
Contain the current display view data named views, which is automatically generated by the framework based on the current display.

```JS
declare declare type RootState<G extends ModuleGetter = {}, R = RouterState> = {
    router: R;  // RouteData
    views: { // Currently displayed view
        [moduleName:string]?: {[viewName:string]:number};
    };
}
```

### RouterParser

Custom routing parser, framework integrates the connected-react-router, will do simple URL parsing, if you need custom parsing, you can pass in the parser in StoreOptions.

```JS
declare type RouterParser<T = any> = (nextRouter: T, prevRouter?: T) => T;
```

### setLoading

Actively set a loading set, just like @effect("loadingKey")

```JS
declare function setLoading<T extends Promise<any>>(
    item: T, // A Promise
     // namespace/group named a loading key that the same key will automatically merging
    namespace?: string,
    group?: string
): T;
```

### setLoadingDepthTime

See Loading State, which sets the waiting time for the loading state to Depth by default of 2 seconds

```JS
declare function setLoadingDepthTime(second: number): void;
```

### VIEW_INVALID

A constant defined，when the view needs to be updated, a VIEW_INVALID action is dispatched.

```JS
export declare const VIEW_INVALID = "@@framework/VIEW_INVALID";
```

When it's necessary to subscribe for views to be updated, it's more reasonable to subscribe for this action than LOCATION_CHANGE.
The action is dispatched on:

- A task cycle after @@router/LOCATION_CHANGE is dispatched
- A task cycle after any view is mounted or Unmounted
