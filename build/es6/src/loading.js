import { MetaData, LOADING, getModuleActionCreatorList } from "./global";
import { TaskCounter, TaskCountEvent } from "./sprite";
const loadings = {};
let depthTime = 2;
export function setLoadingDepthTime(second) {
    depthTime = second;
}
export function setLoading(item, namespace = MetaData.appModuleName, group = "global") {
    if (!MetaData.isBrowser) {
        return item;
    }
    const key = namespace + "/" + group;
    if (!loadings[key]) {
        loadings[key] = new TaskCounter(depthTime);
        loadings[key].addListener(TaskCountEvent, e => {
            const store = MetaData.clientStore;
            if (store) {
                const actions = getModuleActionCreatorList(namespace)[LOADING];
                const action = actions({ [group]: e.data });
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
