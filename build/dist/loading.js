"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var global_1 = require("./global");
var sprite_1 = require("./sprite");
var loadings = {};
var depthTime = 2;
function setLoadingDepthTime(second) {
    depthTime = second;
}
exports.setLoadingDepthTime = setLoadingDepthTime;
function setLoading(item, namespace, group) {
    if (namespace === void 0) { namespace = global_1.MetaData.appModuleName; }
    if (group === void 0) { group = "global"; }
    if (!global_1.MetaData.isBrowser) {
        return item;
    }
    var key = namespace + "/" + group;
    if (!loadings[key]) {
        loadings[key] = new sprite_1.TaskCounter(depthTime);
        loadings[key].addListener(sprite_1.TaskCountEvent, function (e) {
            var _a;
            var store = global_1.MetaData.clientStore;
            if (store) {
                var actions = global_1.getModuleActionCreatorList(namespace)[global_1.LOADING];
                var action = actions((_a = {}, _a[group] = e.data, _a));
                store.dispatch(action);
            }
        });
    }
    loadings[key].addItem(item);
    return item;
}
exports.setLoading = setLoading;
var LoadingState;
(function (LoadingState) {
    LoadingState["Start"] = "Start";
    LoadingState["Stop"] = "Stop";
    LoadingState["Depth"] = "Depth";
})(LoadingState = exports.LoadingState || (exports.LoadingState = {}));
