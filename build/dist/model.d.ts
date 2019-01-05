import { BaseModuleState, RootState, Model } from "./global";
import { BaseModuleHandlers } from "./actions";
export declare function exportModel<N extends string>(namespace: N, HandlersClass: {
    new (presetData?: any): BaseModuleHandlers<BaseModuleState, RootState, N>;
}): Model;
