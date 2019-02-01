import * as tslib_1 from "tslib";
var _a;
import { api } from "../../api";
import { ModuleNames } from "../names";
import { BaseModuleHandlers, effect, exportModel, LoadingState, reducer } from "index";
const initState = {
    curUser: null,
    loading: {
        global: LoadingState.Stop,
        login: LoadingState.Stop,
    },
};
class ModuleHandlers extends BaseModuleHandlers {
    putCurUser(curUser) {
        return Object.assign({}, this.state, { curUser });
    }
    [_a = ModuleNames.app + "/INIT"]() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const curUser = yield api.getCurUser();
            this.updateState({
                curUser,
            });
        });
    }
}
tslib_1.__decorate([
    reducer
], ModuleHandlers.prototype, "putCurUser", null);
tslib_1.__decorate([
    effect()
], ModuleHandlers.prototype, _a, null);
export default exportModel(ModuleNames.app, ModuleHandlers, initState);
