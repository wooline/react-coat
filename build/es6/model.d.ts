import { BaseModuleState, RootState, Model } from "./global";
import { BaseModuleHandlers } from "./actions";
export declare function exportModel<S extends BaseModuleState, N extends string>(namespace: N, HandlersClass: {
    new (initState: S, presetData?: any): BaseModuleHandlers<BaseModuleState, RootState<{}>, N>;
}, initState: S): Model<S>;
