import { routerActions } from "connected-react-router";
import { Action } from "redux";
import { SagaIterator } from "redux-saga";
import { call, CallEffect, put, PutEffect } from "redux-saga/effects";
import { ActionHandler, ActionHandlerList, BaseModuleState, getModuleActionCreatorList, MetaData, NSP, RootState } from "./global";
import { setLoading } from "./loading";

export { PutEffect };

export class BaseModuleHandlers<S extends BaseModuleState, R extends RootState> {
  protected readonly namespace: string;
  protected readonly initState: S;
  protected readonly put: typeof put = put;
  protected readonly call: typeof call = call;
  protected readonly callPromise = callPromise;
  protected readonly routerActions: typeof routerActions = routerActions;

  protected get state(): S {
    return MetaData.rootState.project[this.namespace];
  }
  protected get rootState(): R {
    return MetaData.rootState as any;
  }
  protected callThisAction<T extends any[]>(handler: (...args: T) => S | SagaIterator, ...rest: T): { type: string } {
    const actions = getModuleActionCreatorList(this.namespace);
    return actions[(handler as ActionHandler).__actionName__](rest[0]);
  }
  @reducer
  protected INIT(): S {
    return this.initState;
  }
  @reducer
  protected STARTED(payload: S): S {
    return payload;
  }
  @reducer
  protected LOADING(payload: { [group: string]: string }): S {
    const state = this.state as any;
    if (!state) {
      return state;
    }
    return {
      ...state,
      loading: { ...state.loading, ...payload },
    };
  }
  @effect
  protected *START(): SagaIterator {
    yield this.put(this.callThisAction(this.STARTED, this.state));
  }
}

export function exportModel<S, A extends { [K in keyof A]: (payload?) => S | SagaIterator }>(namespace: string, initState: S, handlers: A): { namespace: string; handlers: ActionHandlerList } {
  (handlers as any).namespace = namespace;
  (handlers as any).initState = initState;
  return { namespace, handlers } as any;
}
export function logger(before: (action: Action, moduleName: string) => void, after: (beforeData: any, data: any) => void) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const fun: ActionHandler = descriptor.value;
    if (!fun.__decorators__) {
      fun.__decorators__ = [];
    }
    fun.__decorators__.push([before, after, null]);
  };
}
export function loading(loadingKey: string = "app/global") {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const fun: ActionHandler = descriptor.value;
    if (loadingKey) {
      const before = (curAction: Action, moduleName: string) => {
        let loadingCallback: Function | null = null;
        let [loadingForModuleName, loadingForGroupName] = loadingKey.split(NSP);
        if (!loadingForGroupName) {
          loadingForGroupName = loadingForModuleName;
          loadingForModuleName = moduleName;
        }
        setLoading(
          new Promise<any>((resolve, reject) => {
            loadingCallback = resolve;
          }),
          loadingForModuleName,
          loadingForGroupName,
        );
        return loadingCallback;
      };
      const after = (resolve, error?) => {
        resolve(error);
      };

      if (!fun.__decorators__) {
        fun.__decorators__ = [];
      }
      fun.__decorators__.push([before, after, null]);
    }
  };
}
export const globalLoading = loading();
export const moduleLoading = loading("global");

export function reducer(target: any, key: string, descriptor: PropertyDescriptor) {
  const fun = descriptor.value as ActionHandler;
  fun.__actionName__ = key;
  fun.__isReducer__ = true;
}
export function effect(target: any, key: string, descriptor: PropertyDescriptor) {
  const fun = descriptor.value as ActionHandler;
  fun.__actionName__ = key;
  fun.__isEffect__ = true;
}
export interface CallProxy<T> extends CallEffect {
  getResponse: () => T;
}

export function callPromise<R, T extends any[]>(fn: (...args: T) => Promise<R>, ...rest: T): CallProxy<R> {
  let response: any;
  const proxy = (...args) => {
    return fn(...(args as any)).then(
      res => {
        response = res;
        return response;
      },
      rej => {
        response = rej;
        throw rej;
      },
    );
  };
  const callEffect = (call as any)(proxy, ...rest);
  (callEffect as any).getResponse = () => {
    return response;
  };
  return callEffect;
}

export type Actions<Ins> = {
  [K in keyof Ins]: Ins[K] extends () => any
    ? () => {
        type: string;
      }
    : Ins[K] extends (data: infer P) => any
      ? (
          payload: P,
        ) => {
          type: string;
          payload: P;
        }
      : never
};
