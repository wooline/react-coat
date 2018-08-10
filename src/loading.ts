import { MetaData } from "./global";
import { TaskCounter, TaskCountEvent } from "./sprite";

const loadings: { [namespace: string]: TaskCounter } = {};

let depthTime: number = 2;

export function setLoadingDepthTime(second: number) {
  depthTime = second;
}
export function setLoading<T extends Promise<any>>(item: T, namespace: string = "app", group: string = "global"): T {
  const key = namespace + "/" + group;
  if (!loadings[key]) {
    loadings[key] = new TaskCounter(depthTime);
    loadings[key].addListener(TaskCountEvent, e => {
      const store = MetaData.singleStore;
      if (store) {
        const action = MetaData.actionCreatorMap[namespace]["LOADING"]({ [group]: e.data });
        store.dispatch(action);
      }
    });
  }
  loadings[key].addItem(item as any);
  return item;
}
export enum LoadingState {
  Start = "Start",
  Stop = "Stop",
  Depth = "Depth",
}
