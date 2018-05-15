/// <reference types="react" />
import { History } from "history";
import { ComponentType } from "react";
import { Middleware, ReducersMapObject } from "redux";
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
export interface BaseModuleActions {
    [INIT_MODULE_ACTION_NAME]: ActionCreator<"INIT", any>;
    [LOADING_ACTION_NAME]: ActionCreator<"LOADING", {
        [group: string]: string;
    }>;
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
    } : A[K] extends (data: infer P, ...args: any[]) => any ? ActionCreator<K, P> : never; } & BaseModuleActions;
    handlers: H;
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
