import { TaskCounter, TaskCounterState, TaskCountEvent } from "./sprite";
import { getSingleStore } from "./storeProxy";
import { LOADING_ACTION_NAME } from "./actions";

const loadings: { [namespace: string]: TaskCounter } = {};
let actions: { [moduleName: string]: { [action: string]: Function } };
let depthTime: number = 2;

export function setLoadingDepthTime(second: number) {
  depthTime = second;
}

export function setActions(moduleActions: { [moduleName: string]: { [action: string]: Function } }) {
  actions = moduleActions;
}

export function setLoading<T>(item: T, namespace: string = "app", group: string = "global"): T {
  const key = namespace + "/" + group;
  if (!loadings[key]) {
    loadings[key] = new TaskCounter(depthTime);
    loadings[key].addListener(TaskCountEvent, e => {
      const store = getSingleStore();
      if (store) {
        store.dispatch(actions[namespace][LOADING_ACTION_NAME]({ [group]: e.data }));
      }
    });
  }
  loadings[key].addItem(item as any);
  return item;
}

export { TaskCounterState as LoadingState };
