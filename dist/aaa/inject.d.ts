import { ActionHandlerList } from "./types";
export declare function injectActions(namespace: string, actions: ActionHandlerList<any>): ActionHandlerList<any>;
export declare function injectHandlers(listenerModule: string, handlers: ActionHandlerList<any>): ActionHandlerList<any>;
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
