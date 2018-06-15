/// <reference types="react" />
import { History, LocationDescriptorObject } from "history";
import { ComponentType } from "react";
import { Middleware, ReducersMapObject, Action } from "redux";
import { delay } from "redux-saga";
import { call, put, cps, fork, take } from "redux-saga/effects";
import { RouterState } from "connected-react-router";
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
    protected routerActions: {
        push: {
            (path: string, state?: any): Action<any>;
            (location: LocationDescriptorObject): Action<any>;
        };
        replace: {
            (path: string, state?: any): Action<any>;
            (location: LocationDescriptorObject): Action<any>;
        };
        go: (n: number) => Action<any>;
        goBack: () => Action<any>;
        goForward: () => Action<any>;
    };
    [INIT_MODULE_ACTION_NAME]({payload}: {
        payload: any;
    }): any;
    [LOADING_ACTION_NAME]({payload, moduleState}: {
        payload: {
            [group: string]: string;
        };
        moduleState: any;
    }): any;
}
export declare class BaseModuleHandlers {
    protected routerActions: {
        push: {
            (path: string, state?: any): Action<any>;
            (location: LocationDescriptorObject): Action<any>;
        };
        replace: {
            (path: string, state?: any): Action<any>;
            (location: LocationDescriptorObject): Action<any>;
        };
        go: (n: number) => Action<any>;
        goBack: () => Action<any>;
        goForward: () => Action<any>;
    };
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
export declare type ActionCreator<P> = (payload: P) => {
    type: string;
    payload: P;
};
export declare type EmptyActionCreator = () => {
    type: string;
};
export declare function buildModel<S, A, H>(state: S, actionsIns: A, handlersIns: H): {
    state: S;
    actions: { [K in keyof A]: A[K] extends () => any ? EmptyActionCreator : A[K] extends (data: {
        payload: infer P;
    }) => any ? ActionCreator<P> : EmptyActionCreator; };
    handlers: any;
};
export declare function buildViews<T>(namespace: string, views: T, model: Model): T;
export interface StoreState<P> {
    router: RouterState;
    project: P;
}
export declare function getStore(): any;
export declare function getHistory(): History;
export declare function createApp(view: ComponentType<any>, container: string, storeMiddlewares?: Middleware[], storeEnhancers?: Function[], reducers?: ReducersMapObject, storeHistory?: History): void;
export { Action, LocationDescriptorObject };
export { asyncComponent, setLoadingDepthTime, setLoading, LoadingState, delayPromise };
export { ERROR_ACTION_NAME, LOCATION_CHANGE_ACTION_NAME };
export { call, put };
