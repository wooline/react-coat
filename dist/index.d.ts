/// <reference types="react" />
import { History } from "history";
import { ComponentType } from "react";
import { Middleware, ReducersMapObject } from "redux";
import { delay } from "redux-saga";
import { call, put, cps, fork, take } from "redux-saga/effects";
import { ERROR_ACTION_NAME, INIT_MODULE_ACTION_NAME, LOADING_ACTION_NAME, LOCATION_CHANGE_ACTION_NAME } from "./actions";
import { asyncComponent } from "./asyncImport";
import { LoadingState, setLoading, setLoadingDepthTime } from "./loading";
import { Model } from "./types";
import { delayPromise } from "./utils";
export declare function buildModule<T>(namespace: string): {
    namespace: string;
    actions: T;
};
export interface BaseModuleState {
    loading: {
        global: LoadingState;
    };
}
export declare class BaseModuleActions {
    protected delay: typeof delay;
    protected take: typeof take;
    protected fork: typeof fork;
    protected cps: typeof cps;
    protected call: typeof call;
    protected put: typeof put;
    [INIT_MODULE_ACTION_NAME](data: any, moduleState: any, rootState: any): any;
    [LOADING_ACTION_NAME](loading: {
        [group: string]: string;
    }, moduleState: any, rootState: any): any;
}
export declare class BaseModuleHandlers {
    protected fork: typeof fork;
    protected cps: typeof cps;
    protected call: typeof call;
    protected put: typeof put;
    protected take: typeof take;
    protected dispatch(action: {
        type: string;
    }): void;
}
export declare function effect(loadingForModuleName?: string | null, loadingForGroupName?: string): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function buildlogger(before: (actionName: string, moduleName: string) => void, after: (beforeData: any, data: any) => void): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare type ActionCreator<T, P> = (payload: P) => {
    type: T;
    payload: P;
};
export declare function buildModel<S, A, H>(state: S, actionClass: new () => A, handlerClass: new () => H): {
    state: S;
    actions: { [K in keyof A]: A[K] extends (data: null | undefined, ...args: any[]) => any ? () => {
        type: K;
        payload: null;
    } : A[K] extends (data: infer P, ...args: any[]) => any ? ActionCreator<K, P> : never; };
    handlers: any;
};
export declare function buildViews<T>(namespace: string, views: T, model: Model): T;
export interface StoreState<P> {
    router: {
        location: {
            pathname: string;
            search: {};
            hash: string;
            key: string;
        };
    };
    project: P;
}
export declare function getStore(): any;
export declare function getHistory(): History;
export declare function createApp(view: ComponentType<any>, container: string, storeMiddlewares?: Middleware[], storeEnhancers?: Function[], reducers?: ReducersMapObject, storeHistory?: History): void;
export { asyncComponent, setLoadingDepthTime, setLoading, LoadingState, delayPromise };
export { ERROR_ACTION_NAME, LOCATION_CHANGE_ACTION_NAME };
export { call, put };
