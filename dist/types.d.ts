/// <reference types="react" />
import { ComponentType } from "react";
export interface ActionsMap {
    [action: string]: {
        [module: string]: Function;
    };
}
export declare type Actions = {
    [action: string]: Function;
} | {};
export interface Views {
    [viewName: string]: ComponentType<any>;
}
export interface Model {
    state: {};
    actions: Actions;
    handlers: Actions;
}
export interface ModuleViews {
    default: Views;
}
