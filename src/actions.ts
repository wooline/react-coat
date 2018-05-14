export const ERROR_ACTION_NAME = "@@framework/ERROR";
export const LOADING_ACTION_NAME = "LOADING";
export const INIT_MODULE_ACTION_NAME = "INIT";
export const INIT_LOCATION_ACTION_NAME = "@@router/LOCATION_CHANGE";
export const LOCATION_CHANGE_ACTION_NAME = "@@router/LOCATION_CHANGE";
export const NSP = "/";

export function errorAction(error: any) {
  return {
    type: ERROR_ACTION_NAME,
    error,
  };
}

export function loadingAction(namespace: string, group: string, status: string) {
  return {
    type: namespace + NSP + LOADING_ACTION_NAME,
    data: { [group]: status },
  };
}

export function initModuleAction(namespace: string, data: any) {
  return {
    type: namespace + NSP + INIT_MODULE_ACTION_NAME,
    data,
  };
}

export function initLocationAction(namespace: string, data: any) {
  return {
    type: namespace + NSP + INIT_LOCATION_ACTION_NAME,
    data,
  };
}
