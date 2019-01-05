export declare function setLoadingDepthTime(second: number): void;
export declare function setLoading<T extends Promise<any>>(item: T, namespace?: string, group?: string): T;
export declare enum LoadingState {
    Start = "Start",
    Stop = "Stop",
    Depth = "Depth"
}
