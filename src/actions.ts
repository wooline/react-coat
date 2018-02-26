export function errorAction (error: any) {
  return {
    type: '@@framework/ERROR',
    error
  };
}
export function loadingAction (
  namespace: string,
  group: string,
  status: string
) {
  return {
    type: namespace + '/LOADING',
    data: { [group]: status }
  };
}
export function initModuleAction (namespace: string) {
  return {
    type: namespace + '/' + 'INIT'
  };
}
