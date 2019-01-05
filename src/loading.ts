import {MetaData, LOADING, getModuleActionCreatorList} from "./global";
import {TaskCounter, TaskCountEvent} from "./sprite";

const loadings: {[namespace: string]: TaskCounter} = {};

let depthTime: number = 2;

export function setLoadingDepthTime(second: number) {
  depthTime = second;
}
export function setLoading<T extends Promise<any>>(item: T, namespace: string = MetaData.appModuleName, group: string = "global"): T {
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
        const action = actions({[group]: e.data});
        store.dispatch(action);
      }
    });
  }
  loadings[key].addItem(item);
  return item;
}
export enum LoadingState {
  Start = "Start",
  Stop = "Stop",
  Depth = "Depth",
}
