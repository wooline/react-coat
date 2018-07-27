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

export function loading(loadingForModuleName: string | null = "app", loadingForGroupName: string = "global") {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const fun = descriptor.value as any;
    if (loadingForModuleName !== null) {
      const before = () => {
        let loadingCallback: Function | null = null;
        setLoading(
          new Promise<any>((resolve, reject) => {
            loadingCallback = resolve;
          }),
          loadingForModuleName,
          loadingForGroupName,
        );
        return loadingCallback;
      };
      const after = (resolve, error?) => {
        resolve(error);
      };

      if (!fun.__decorators__) {
        fun.__decorators__ = [];
      }
      fun.__decorators__.push([before, after]);
    }
  };
}

export { TaskCounterState as LoadingState };
