import { Action } from "redux";
import { SagaIterator } from "redux-saga";
import { call, CallEffect, put, PutEffect } from "redux-saga/effects";
import { ActionHandler, INIT, LOADING, MetaData, ModuleState, newActionCreator, RootState, SET_INIT_DATA, NSP } from "./global";
import { setLoading } from "./loading";

export { PutEffect };
export class BaseModuleActions<S extends ModuleState, R extends RootState> {
  protected readonly namespace: string;
  protected readonly initState: S;

  protected call: typeof call = call;
  protected callPromise: CallPromise = callPromise;
  protected get state(): S {
    return MetaData.rootState.project[this.namespace];
  }
  protected get rootState(): R {
    return MetaData.rootState as any;
  }
  protected put(action: Action | S | SagaIterator) {
    let type: string = (action as any).type;
    const arr = type.split("NSP");
    if (!arr[1]) {
      type = this.namespace + NSP + type;
      if (MetaData.reducerMap[type] || MetaData.effectMap[type]) {
        (action as any).type = type;
      }
    }
    return put(action as any);
  }
  @reducer
  [SET_INIT_DATA](): S {
    return this.initState;
  }
  @reducer
  [LOADING](payload: { [group: string]: string }): S {
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
  *[INIT](): SagaIterator {
    yield this.put(this.SET_INIT_DATA());
  }
}
export function logger(before: (actionName: string, moduleName: string) => void, after: (beforeData: any, data: any) => void) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const fun: ActionHandler = descriptor.value.__handler__ ? descriptor.value.__handler__ : descriptor.value;
    if (!fun.__decorators__) {
      fun.__decorators__ = [];
    }
    fun.__decorators__.push([before, after, null]);
  };
}
export function loading(loadingForModuleName: string = "app", loadingForGroupName: string = "global") {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const fun: ActionHandler = descriptor.value.__handler__ ? descriptor.value.__handler__ : descriptor.value;
    if (loadingForModuleName !== null) {
      const before = () => {
        let loadingCallback: Function | null = null;
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
export function reducer(target: any, key: string, descriptor: PropertyDescriptor) {
  const fun = descriptor.value as ActionHandler;
  fun.__isReducer__ = true;
  descriptor.value = newActionCreator(payload => ({ type: key, payload }), fun);
  return descriptor;
}
export function effect(target: any, key: string, descriptor: PropertyDescriptor) {
  const fun = descriptor.value as ActionHandler;
  fun.__isEffect__ = true;
  descriptor.value = newActionCreator(payload => ({ type: key, payload }), fun);
  return descriptor;
}
export interface CallProxy<T> extends CallEffect {
  getResponse: () => T;
}

export interface CallPromise {
  <T>(fn: () => Promise<T>): CallProxy<T>;
  <T, R1, A1 extends R1>(fn: (req1: R1) => Promise<T>, arg1: A1): CallProxy<T>;
  <T, R1, R2, A1 extends R1, A2 extends R2>(fn: (req1: R1, req2: R2) => Promise<T>, arg1: A1, arg2: A2): CallProxy<T>;
  <T, R1, R2, R3, A1 extends R1, A2 extends R2, A3 extends R3>(fn: (req1: R1, req2: R2, req3: R3) => Promise<T>, arg1: A1, arg2: A2, arg3: A3): CallProxy<T>;
  <T, R1, R2, R3, R4, A1 extends R1, A2 extends R2, A3 extends R3, A4 extends R4>(fn: (req1: R1, req2: R2, req3: R3, req4: R4) => Promise<T>, arg1: A1, arg2: A2, arg3: A3, arg4: A4): CallProxy<T>;
  <T, R1, R2, R3, R4, R5, A1 extends R1, A2 extends R2, A3 extends R3, A4 extends R4, A5 extends R5>(fn: (req1: R1, req2: R2, req3: R3, req4: R4, req5: R5) => Promise<T>, arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5): CallProxy<T>;
}
export const callPromise: CallPromise = (fn: (...args) => any, ...rest) => {
  let response: any;
  const proxy = (...args) => {
    return fn(...args).then(
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
};
