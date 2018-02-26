export declare const TaskCountEvent = "TaskCountEvent";
export declare const TaskCounterState: {
    Start: string;
    Stop: string;
    Depth: string;
};
export declare class PEvent {
    readonly name: string;
    readonly data: any;
    bubbling: boolean;
    readonly target: PDispatcher;
    readonly currentTarget: PDispatcher;
    constructor(name: string, data?: any, bubbling?: boolean);
    setTarget(target: PDispatcher): void;
    setCurrentTarget(target: PDispatcher): void;
}
export declare class PDispatcher {
    readonly parent: PDispatcher | undefined;
    protected readonly _handlers: {
        [key: string]: Array<(e: PEvent) => void>;
    };
    constructor(parent?: PDispatcher | undefined);
    addListener(ename: string, handler: (e: PEvent) => void): this;
    removeListener(ename?: string, handler?: (e: PEvent) => void): this;
    dispatch(evt: PEvent): this;
    setParent(parent?: PDispatcher): this;
}
export declare class TaskCounter extends PDispatcher {
    deferSecond: number;
    readonly list: {
        promise: Promise<any>;
        note: string;
    }[];
    private _timer;
    constructor(deferSecond: number);
    addItem(promise: Promise<any>, note?: string): Promise<any>;
    private completeItem(promise);
}
