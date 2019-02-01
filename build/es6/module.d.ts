import * as React from "react";
import { ComponentType } from "react";
import { Model, Module, GetModule, ModuleGetter } from "./global";
export declare function loadModel<M extends Module>(getModule: GetModule<M>): Promise<M["model"]>;
export declare type ReturnViews<T extends () => any> = T extends () => Promise<Module<Model, infer R>> ? R : never;
export declare function loadView<MG extends ModuleGetter, M extends Extract<keyof MG, string>, V extends ReturnViews<MG[M]>, N extends Extract<keyof V, string>>(moduleGetter: MG, moduleName: M, viewName: N, loadingComponent?: React.ReactNode): V[N];
export declare function exportView<C extends ComponentType<any>>(ComponentView: C, model: Model, viewName: string): C;
