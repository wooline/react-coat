import { TaskCounterState } from "./sprite";
export declare function setLoadingDepthTime(second: number): void;
export declare function setActions(moduleActions: {
    [moduleName: string]: {
        [action: string]: Function;
    };
}): void;
export declare function setLoading<T>(item: T, namespace?: string, group?: string): T;
export declare function loading(loadingForModuleName?: string | null, loadingForGroupName?: string): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export { TaskCounterState as LoadingState };
