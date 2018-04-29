import { loadingAction } from "./actions";
import { TaskCounter, TaskCounterState, TaskCountEvent } from "./sprite";
import { getSingleStore } from "./storeProxy";

const loadings: { [namespace: string]: TaskCounter } = {};

let depthTime: number = 2;

export function setLoadingDepthTime(second: number) {
  depthTime = second;
}

export function setLoading<T>(item: T, namespace: string = "app", group: string = "global"): T {
  const key = namespace + "/" + group;
  if (!loadings[key]) {
    loadings[key] = new TaskCounter(depthTime);
    loadings[key].addListener(TaskCountEvent, e => {
      const store = getSingleStore();
      if (store) {
        store.dispatch(loadingAction(namespace, group, e.data));
      }
    });
  }
  loadings[key].addItem(item as any);
  return item;
}

export { TaskCounterState as LoadingState };
