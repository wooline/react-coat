/// <reference types="node" />
/// <reference types="react" />
import { ComponentType } from "react";
import { Middleware } from "redux";
import { ErrorActionName, InitModuleActionName, LoadingActionName, LocationChangeActionName } from "./actions";
import { asyncComponent } from "./asyncImport";
import { LoadingState, setLoading } from "./loading";
import { getStore, storeHistory } from "./storeProxy";
import { Model } from "./types";
export declare function buildModule<T>(namespace: string): {
    namespace: string;
    actions: T;
};
export interface BaseState {
    loading: {
        global: string;
    };
}
export declare function buildActionByReducer<T, S>(reducer: (data: T, moduleState: S, rootState: any) => S): (data: T) => {
    type: string;
    data: T;
};
export declare function buildActionByEffect<T, S>(effect: (data: T, moduleState: S, rootState: any) => IterableIterator<any>): (data: T) => {
    type: string;
    data: T;
};
export declare function buildLoading(moduleName?: string, group?: string): (target: any, key: string) => void;
export declare function buildlogger(before: (actionName: string, moduleName: string) => void, after: (beforeData: any, data: any) => void): (target: any, key: string) => void;
export declare function buildModel<S, A, H>(state: S, actionClass: new () => A, handlerClass: new () => H): {
    state: S;
    actions: A;
    handlers: H;
};
export declare function buildViews<T>(namespace: string, views: T, model: Model): T;
export declare class BaseActions<S> {
    INIT: (data: S) => {
        type: string;
        data: S;
    };
    LOADING: (data: {
        [group: string]: string;
    }) => {
        type: string;
        data: {
            [group: string]: string;
        };
    };
}
export interface State {
    router: {
        location: {
            pathname: string;
            search: {};
            hash: string;
            key: string;
        };
    };
    project: {
        app: {
            loading: {
                global: string;
            };
        };
    };
}
export declare function createApp(view: ComponentType<any>, container: string, storeMiddlewares?: Middleware[], storeEnhancers?: Function[]): void;
export { storeHistory, getStore, asyncComponent, setLoading, LoadingState };
export { ErrorActionName, InitModuleActionName, LoadingActionName, LocationChangeActionName };
