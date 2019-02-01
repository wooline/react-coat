import * as tslib_1 from "tslib";
import { api } from "../../api";
import { ModuleNames } from "../names";
import { BaseModuleHandlers, effect, exportModel, LoadingState, reducer } from "index";
var initState = {
    curUser: null,
    loading: {
        global: LoadingState.Stop,
        login: LoadingState.Stop,
    },
};
var ModuleHandlers = (function (_super) {
    tslib_1.__extends(ModuleHandlers, _super);
    function ModuleHandlers() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ModuleHandlers.prototype.putCurUser = function (curUser) {
        return tslib_1.__assign({}, this.state, { curUser: curUser });
    };
    ModuleHandlers.prototype[_a = ModuleNames.app + "/INIT"] = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var curUser;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, api.getCurUser()];
                    case 1:
                        curUser = _a.sent();
                        this.updateState({
                            curUser: curUser,
                        });
                        return [2];
                }
            });
        });
    };
    var _a;
    tslib_1.__decorate([
        reducer
    ], ModuleHandlers.prototype, "putCurUser", null);
    tslib_1.__decorate([
        effect()
    ], ModuleHandlers.prototype, _a, null);
    return ModuleHandlers;
}(BaseModuleHandlers));
export default exportModel(ModuleNames.app, ModuleHandlers, initState);
