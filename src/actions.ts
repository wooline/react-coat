export let ErrorActionName: string = "@@framework/ERROR";
export let LoadingActionName: string = "LOADING";
export let InitActionName: string = "INIT";

export function errorAction(error: any) {
  return {
    type: ErrorActionName,
    error
  };
}
export function loadingAction(
  namespace: string,
  group: string,
  status: string
) {
  return {
    type: namespace + "/" + LoadingActionName,
    data: { [group]: status }
  };
}
export function initModuleAction(namespace: string) {
  return {
    type: namespace + "/" + InitActionName
  };
}
