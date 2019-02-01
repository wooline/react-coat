"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var api_1 = require("../../api");
var names_1 = require("../names");
var index_1 = require("index");
var initState = {
    curUser: null,
    loading: {
        global: index_1.LoadingState.Stop,
        login: index_1.LoadingState.Stop,
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
    ModuleHandlers.prototype[_a = names_1.ModuleNames.app + "/INIT"] = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var curUser;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, api_1.api.getCurUser()];
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
        index_1.reducer
    ], ModuleHandlers.prototype, "putCurUser", null);
    tslib_1.__decorate([
        index_1.effect()
    ], ModuleHandlers.prototype, _a, null);
    return ModuleHandlers;
}(index_1.BaseModuleHandlers));
exports.default = index_1.exportModel(names_1.ModuleNames.app, ModuleHandlers, initState);
