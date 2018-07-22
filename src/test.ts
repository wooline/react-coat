interface State {
  messageList: string[];
}
const state: State = {
  messageList: [],
};
class BaseModuleActions<S> {
  getState(): S {
    return {} as any;
  }
}
class ModuleActions extends BaseModuleActions<State> {
  updateMessageList(): State {
    return {} as any;
  }
}
const ins = new ModuleActions();

ins.getState();
ins.updateMessageList();

interface ActionReducer<S> {
  [method: string]: () => S;
}
function buildModel2<A extends { [K in keyof A]: () => S }, S>(actions: A, initState: S) {
  return {} as S;
}
const aaa = buildModel2(ins, state);
