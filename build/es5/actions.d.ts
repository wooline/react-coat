import { routerActions } from "connected-react-router";
import { Action, BaseModuleState, ModelStore, RootState } from "./global";
export declare class BaseModuleHandlers<S extends BaseModuleState, R extends RootState, N extends string> {
    protected readonly initState: S;
    protected readonly namespace: N;
    protected readonly store: ModelStore;
    protected readonly actions: Actions<this>;
    protected readonly routerActions: typeof routerActions;
    constructor(initState: S, presetData?: any);
    protected readonly state: S;
    protected readonly rootState: R;
    protected readonly currentState: S;
    protected readonly currentRootState: R;
    protected dispatch(action: Action): Action | Promise<void>;
    protected callThisAction<T extends any[]>(handler: (...args: T) => any, ...rest: T): {
        type: string;
        playload?: any;
    };
    protected INIT(payload: S): S;
    protected UPDATE(payload: S): S;
    protected LOADING(payload: {
        [group: string]: string;
    }): S;
    protected updateState(payload: Partial<S>): void;
}
export declare function logger(before: (action: Action, moduleName: string, promiseResult: Promise<any>) => void, after: null | ((status: "Rejected" | "Resolved", beforeResult: any, effectResult: any) => void)): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function effect(loadingForGroupName?: string | null, loadingForModuleName?: string): (target: any, key: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function reducer(target: any, key: string, descriptor: PropertyDescriptor): PropertyDescriptor;
declare type Handler<F> = F extends (...args: infer P) => any ? (...args: P) => {
    type: string;
} : never;
export declare type Actions<Ins> = {
    [K in keyof Ins]: Ins[K] extends (...args: any[]) => any ? Handler<Ins[K]> : never;
};
export {};
