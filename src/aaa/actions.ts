import { LocationDescriptorObject } from "history";
import { Action } from "redux";
import { RouterState, routerActions } from "connected-react-router";
import { delay } from "redux-saga";
import { CallEffect, call, cps, fork, put, take } from "redux-saga/effects";
import { LoadingState } from "./loading";
import { getModuleState, getRootState, getSingleStore } from "./storeProxy";

export { LocationDescriptorObject, Action };
export const ERROR_ACTION_NAME = "@@framework/ERROR";
export const LOADING_ACTION_NAME = "LOADING";
export const INIT_MODULE_ACTION_NAME = "INIT";
export const INIT_LOCATION_ACTION_NAME = "@@router/LOCATION_CHANGE";
export const LOCATION_CHANGE_ACTION_NAME = "@@router/LOCATION_CHANGE";
export const NSP = "/";

export function errorAction(error: any) {
  return {
    type: ERROR_ACTION_NAME,
    error,
  };
}

export function initLocationAction(namespace: string, payload: any) {
  return {
    type: namespace + NSP + INIT_LOCATION_ACTION_NAME,
    payload,
  };
}

export class BaseModuleHandlers<State extends BaseModuleState, RootState> {
  protected readonly namespace: string;
  protected readonly initState: State;

  protected delay: typeof delay = delay;
  protected take: typeof take = take;
  protected fork: typeof fork = fork;
  protected cps: typeof cps = cps;
  protected put: typeof put = put;
  protected call: typeof call = call;
  protected callPromise: CallPromise = callPromise;
  protected routerActions = routerActions;

  protected get state(): State {
    return getModuleState(this.namespace) as any;
  }
  protected get rootState(): RootState {
    return getRootState() as any;
  }
  protected dispatch(action: { type: string }) {
    getSingleStore().dispatch(action);
  }
}

export class BaseModuleActions<State extends BaseModuleState, RootState> extends BaseModuleHandlers<State, RootState> {
  [INIT_MODULE_ACTION_NAME](): State {
    return this.initState;
  }
  [LOADING_ACTION_NAME](payload: { [group: string]: string }): State {
    const state = this.state as any;
    return {
      ...state,
      loading: { ...state.loading, ...payload },
    };
  }
}

export interface BaseModuleState {
  loading: {
    global: LoadingState;
  };
}
export interface StoreState<P extends { [namespace: string]: BaseModuleState }> {
  router: RouterState;
  project: P;
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
export function buildlogger(before: (actionName: string, moduleName: string) => void, after: (beforeData: any, data: any) => void) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const fun = descriptor.value as any;
    if (!fun.__decorators__) {
      fun.__decorators__ = [];
    }
    fun.__decorators__.push([before, after]);
  };
}
