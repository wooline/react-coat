import { TaskCounterState } from "./sprite";
export declare function setLoadingDepthTime(second: number): void;
export declare function setActions(moduleActions: {
    [moduleName: string]: {
        [action: string]: Function;
    };
}): void;
export declare function setLoading<T>(item: T, namespace?: string, group?: string): T;
export { TaskCounterState as LoadingState };
