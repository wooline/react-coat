import { INIT_MODULE_ACTION_NAME, LOADING_ACTION_NAME, ModuleState, RootState } from "./global";
import { CallEffect, call, put } from "redux-saga/effects";
export declare class BaseModuleListeners<S extends ModuleState, R extends RootState> {
    protected readonly namespace: string;
    protected readonly initState: S;
    protected put: typeof put;
    protected call: typeof call;
    protected callPromise: CallPromise;
    protected readonly state: S;
    protected readonly rootState: R;
}
export declare class BaseModuleActions<S extends ModuleState, R extends RootState> extends BaseModuleListeners<S, R> {
    [INIT_MODULE_ACTION_NAME](): S;
    [LOADING_ACTION_NAME](payload: {
        [group: string]: string;
    }): S;
}
export declare function logger(before: (actionName: string, moduleName: string) => void, after: (beforeData: any, data: any) => void): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function effect(loadingForModuleName?: string | null, loadingForGroupName?: string): (target: any, key: string, descriptor: PropertyDescriptor) => void;
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
