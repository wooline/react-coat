import {routerActions} from "connected-react-router";
import {Action, ActionHandler, BaseModuleState, getModuleActionCreatorList, MetaData, ModelStore, RootState} from "./global";
import {setLoading} from "./loading";

export class BaseModuleHandlers<S extends BaseModuleState, R extends RootState, N extends string> {
  protected readonly initState: S;
  protected readonly namespace: N = "" as any;
  protected readonly store: ModelStore = null as any;
  protected readonly actions: Actions<this> = null as any;
  protected readonly routerActions: typeof routerActions = routerActions;

  constructor(initState: S, presetData?: any) {
    initState.isModule = true;
    this.initState = initState;
  }

  protected get state(): S {
    return this.store.reactCoat.prevState[this.namespace as string];
  }

  protected get rootState(): R {
    return this.store.reactCoat.prevState as any;
  }

  protected get currentState(): S {
    return this.store.reactCoat.currentState[this.namespace as string];
  }

  protected get currentRootState(): R {
    return this.store.reactCoat.currentState as any;
  }

  protected dispatch(action: Action): Action | Promise<void> {
    return this.store.dispatch(action) as any;
  }

  protected callThisAction<T extends any[]>(handler: (...args: T) => any, ...rest: T): {type: string; playload?: any} {
    const actions = getModuleActionCreatorList(this.namespace);
    return actions[(handler as ActionHandler).__actionName__](rest[0]);
  }

  @reducer
  protected INIT(payload: S): S {
    return payload;
  }
  @reducer
  protected UPDATE(payload: S): S {
    return payload;
  }

  @reducer
  protected LOADING(payload: {[group: string]: string}): S {
    const state = this.state;
    if (!state) {
      return state;
    }
    return {
      ...state,
      loading: {...state.loading, ...payload},
    };
  }
  protected updateState(payload: Partial<S>) {
    this.dispatch(this.callThisAction(this.UPDATE, {...this.state, ...payload}));
  }
}

export function logger(before: (action: Action, moduleName: string, promiseResult: Promise<any>) => void, after: null | ((status: "Rejected" | "Resolved", beforeResult: any, effectResult: any) => void)) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const fun: ActionHandler = descriptor.value;
    if (!fun.__decorators__) {
      fun.__decorators__ = [];
    }
    fun.__decorators__.push([before, after]);
  };
}
// loading2() [global, app]
// loading2(login)[login, currentModule]
// loading(login, photos)[login,photos]
// loading2(null)[]
export function effect(loadingForGroupName?: string | null, loadingForModuleName?: string) {
  if (loadingForGroupName === undefined) {
    loadingForGroupName = "global";
    loadingForModuleName = MetaData.appModuleName;
  }
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const fun = descriptor.value as ActionHandler;
    fun.__actionName__ = key;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;
    if (loadingForGroupName) {
      const before = (curAction: Action, moduleName: string, promiseResult: Promise<any>) => {
        if (MetaData.isBrowser) {
          if (!loadingForModuleName) {
            loadingForModuleName = moduleName;
          }
          setLoading(promiseResult, loadingForModuleName, loadingForGroupName as string);
        }
      };
      if (!fun.__decorators__) {
        fun.__decorators__ = [];
      }
      fun.__decorators__.push([before, null]);
    }
    return descriptor;
  };
}

export function reducer(target: any, key: string, descriptor: PropertyDescriptor) {
  const fun = descriptor.value as ActionHandler;
  fun.__actionName__ = key;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return descriptor;
}

type Handler<F> = F extends (...args: infer P) => any
  ? (
      ...args: P
    ) => {
      type: string;
    }
  : never;

export type Actions<Ins> = {[K in keyof Ins]: Ins[K] extends (...args: any[]) => any ? Handler<Ins[K]> : never};
