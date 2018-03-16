import { loadingAction } from "./actions";
import { TaskCounter, TaskCounterState, TaskCountEvent } from "./sprite";
import { getStore } from "./storeProxy";

const loadings: { [namespace: string]: TaskCounter } = {};

export function setLoading<T>(item: T, namespace: string = "app", group: string = "global"): T {
  const key = namespace + "/" + group;
  if (!loadings[key]) {
    loadings[key] = new TaskCounter(3);
    loadings[key].addListener(TaskCountEvent, e => {
      const store = getStore();
      store && store.dispatch(loadingAction(namespace, group, e.data));
    });
  }
  loadings[key].addItem(item as any);
  return item;
}

export { TaskCounterState as LoadingState };
