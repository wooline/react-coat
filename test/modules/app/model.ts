import {api} from "../../api";
import {CurUser} from "../../type";
import {ModuleNames} from "../names";
import {RootState} from "../index";
import {Actions, BaseModuleHandlers, BaseModuleState, effect, exportModel, LoadingState, reducer} from "index";

// 定义本模块的State类型
export interface State extends BaseModuleState {
  curUser: CurUser | null;
  loading: {
    global: LoadingState;
    login: LoadingState;
  };
}

// 定义本模块State的初始值
const initState: State = {
  curUser: null,
  loading: {
    global: LoadingState.Stop,
    login: LoadingState.Stop,
  },
};

// 定义本模块的Handlers
class ModuleHandlers extends BaseModuleHandlers<State, RootState, ModuleNames> {
  @reducer
  protected putCurUser(curUser: CurUser): State {
    return {...this.state, curUser};
  }

  // 兼听自已的INIT Action，做一些异步数据请求，不需要手动触发，所以请使用protected或private
  @effect()
  protected async [ModuleNames.app + "/INIT"]() {
    const curUser = await api.getCurUser();
    this.updateState({
      curUser,
    });
  }
}

// 导出本模块的Actions
export type ModuleActions = Actions<ModuleHandlers>;

export default exportModel(ModuleNames.app, ModuleHandlers, initState);
