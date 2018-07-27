import { LocationDescriptorObject } from "history";
import { Action } from "redux";
import { RouterState } from "connected-react-router";
import { delay } from "redux-saga";
import { CallEffect, call, cps, fork, put, take } from "redux-saga/effects";
import { LoadingState } from "./loading";
export { LocationDescriptorObject, Action };
export declare const ERROR_ACTION_NAME = "@@framework/ERROR";
export declare const LOADING_ACTION_NAME = "LOADING";
export declare const INIT_MODULE_ACTION_NAME = "INIT";
export declare const INIT_LOCATION_ACTION_NAME = "@@router/LOCATION_CHANGE";
export declare const LOCATION_CHANGE_ACTION_NAME = "@@router/LOCATION_CHANGE";
export declare const NSP = "/";
export declare function errorAction(error: any): {
    type: string;
    error: any;
};
export declare function initLocationAction(namespace: string, payload: any): {
    type: string;
    payload: any;
};
export declare class BaseModuleHandlers<State extends BaseModuleState, RootState> {
    protected readonly namespace: string;
    protected readonly initState: State;
    protected delay: typeof delay;
    protected take: typeof take;
    protected fork: typeof fork;
    protected cps: typeof cps;
    protected put: typeof put;
    protected call: typeof call;
    protected callPromise: CallPromise;
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
    protected readonly state: State;
    protected readonly rootState: RootState;
    protected dispatch(action: {
        type: string;
    }): void;
}
export declare class BaseModuleActions<State extends BaseModuleState, RootState> extends BaseModuleHandlers<State, RootState> {
    [INIT_MODULE_ACTION_NAME](): State;
    [LOADING_ACTION_NAME](payload: {
        [group: string]: string;
    }): State;
}
export interface BaseModuleState {
    loading: {
        global: LoadingState;
    };
}
export interface StoreState<P extends {
    [namespace: string]: BaseModuleState;
}> {
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
export declare const callPromise: CallPromise;
export declare function buildlogger(before: (actionName: string, moduleName: string) => void, after: (beforeData: any, data: any) => void): (target: any, key: string, descriptor: PropertyDescriptor) => void;
