import {api} from "../../api";
import {CurUser} from "../../type";
import {ModuleNames} from "../names";
import {RootState, moduleGetter} from "../index";
import {Actions, BaseModuleHandlers, BaseModuleState, effect, exportModel, ERROR, loadModel, LoadingState, reducer} from "index";

// 定义本模块的State类型
export interface State extends BaseModuleState {
  ssrError?: string;
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
  @reducer
  protected putSsrError(ssrError: string): State {
    return {...this.state, ssrError};
  }
  @effect(null)
  protected async [ERROR](error: Error) {
    if (error.message === "获取图片列表失败！") {
      this.dispatch(this.callThisAction(this.putSsrError, error.message));
    } else {
      throw error;
    }
  }
  @effect()
  protected async [ModuleNames.app + "/INIT"]() {
    const curUser = await api.getCurUser();
    this.updateState({
      curUser,
    });
    if (this.rootState.router.location.pathname === "/photos") {
      await loadModel(moduleGetter.photos).then(subModel => {
        return subModel(this.store);
      });
    }
  }
}

// 导出本模块的Actions
export type ModuleActions = Actions<ModuleHandlers>;

export default exportModel(ModuleNames.app, ModuleHandlers, initState);
