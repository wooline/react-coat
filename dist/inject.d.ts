import { Actions } from "./types";
export declare function injectActions(namespace: string, actions: Actions): void;
export interface BaseState {
    loading: {
        global: string;
    };
}
export interface BaseAction {
    INIT(data: any, moduleState?: any, rootState?: any): any;
    LOADING(loading: {
        [group: string]: string;
    }, moduleState?: any, rootState?: any): any;
}
export interface BaseHandlers {
}
