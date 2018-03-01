export declare let ErrorActionName: string;
export declare let LoadingActionName: string;
export declare let InitActionName: string;
export declare function errorAction(error: any): {
    type: string;
    error: any;
};
export declare function loadingAction(namespace: string, group: string, status: string): {
    type: string;
    data: {
        [x: string]: string;
    };
};
export declare function initModuleAction(namespace: string): {
    type: string;
};
