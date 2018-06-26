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
