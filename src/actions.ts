export let ErrorActionName: string = "@@framework/ERROR";
export let LoadingActionName: string = "LOADING";
export let InitModuleActionName: string = "INIT";
export let LocationChangeActionName: string = "@@router/LOCATION_CHANGE";

export function errorAction(error: any) {
  return {
    type: ErrorActionName,
    error
  };
}

export function loadingAction(namespace: string, group: string, status: string) {
  return {
    type: namespace + "/" + LoadingActionName,
    data: { [group]: status }
  };
}

export function initModuleAction(namespace: string, data: any) {
  return {
    type: namespace + "/" + InitModuleActionName,
    data
  };
}
