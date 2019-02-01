import { CurUser } from "../../type";
import { ModuleNames } from "../names";
import { RootState } from "../index";
import { Actions, BaseModuleHandlers, BaseModuleState, LoadingState } from "index";
export interface State extends BaseModuleState {
    curUser: CurUser | null;
    loading: {
        global: LoadingState;
        login: LoadingState;
    };
}
declare class ModuleHandlers extends BaseModuleHandlers<State, RootState, ModuleNames> {
    protected putCurUser(curUser: CurUser): State;
}
export declare type ModuleActions = Actions<ModuleHandlers>;
declare const _default: import("../../../src/global").Model<State>;
export default _default;
