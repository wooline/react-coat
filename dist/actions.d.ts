export declare const ERROR_ACTION_NAME = "@@framework/ERROR";
export declare const LOADING_ACTION_NAME = "LOADING";
export declare const INIT_MODULE_ACTION_NAME = "INIT";
export declare const INIT_LOCATION_ACTION_NAME = "@@router/LOCATION_CHANGE";
export declare const LOCATION_CHANGE_ACTION_NAME = "@@router/LOCATION_CHANGE";
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
export declare function initModuleAction(namespace: string, data: any): {
    type: string;
    data: any;
};
export declare function initLocationAction(namespace: string, data: any): {
    type: string;
    data: any;
};
