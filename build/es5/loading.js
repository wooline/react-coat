import { MetaData, LOADING, getModuleActionCreatorList } from "./global";
import { TaskCounter, TaskCountEvent } from "./sprite";
var loadings = {};
var depthTime = 2;
export function setLoadingDepthTime(second) {
    depthTime = second;
}
export function setLoading(item, namespace, group) {
    if (namespace === void 0) { namespace = MetaData.appModuleName; }
    if (group === void 0) { group = "global"; }
    if (!MetaData.isBrowser) {
        return item;
    }
    var key = namespace + "/" + group;
    if (!loadings[key]) {
        loadings[key] = new TaskCounter(depthTime);
        loadings[key].addListener(TaskCountEvent, function (e) {
            var _a;
            var store = MetaData.clientStore;
            if (store) {
                var actions = getModuleActionCreatorList(namespace)[LOADING];
                var action = actions((_a = {}, _a[group] = e.data, _a));
                store.dispatch(action);
            }
        });
    }
    loadings[key].addItem(item);
    return item;
}
export var LoadingState;
(function (LoadingState) {
    LoadingState["Start"] = "Start";
    LoadingState["Stop"] = "Stop";
    LoadingState["Depth"] = "Depth";
})(LoadingState || (LoadingState = {}));
