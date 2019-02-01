import { RootState as BaseState } from "index";
import * as appModule from "./app";
export declare const moduleGetter: {
    app: () => typeof appModule;
};
export declare type ModuleGetter = typeof moduleGetter;
export declare type RootState = BaseState<ModuleGetter>;
