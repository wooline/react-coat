import {api} from "../../api";
import {ListSearch, ListItem, ListSummary} from "../../type";
import {parseQuery} from "../../utils";
import {ModuleNames} from "../names";
import {RootState} from "../index";
import {Actions, BaseModuleHandlers, BaseModuleState, effect, exportModel, VIEW_INVALID} from "index";

// 定义本模块的State类型
export interface State extends BaseModuleState {
  listSearch?: ListSearch;
  listItems?: ListItem[];
  listSummary?: ListSummary;
}

export const defaultListSearch: ListSearch = {
  title: "",
  page: 1,
  pageSize: 10,
};

// 定义本模块State的初始值
const initState: State = {};

// 定义本模块的Handlers
class ModuleHandlers extends BaseModuleHandlers<State, RootState, ModuleNames> {
  @effect()
  public async searchList(options: Partial<ListSearch> = {}) {
    const listSearch: ListSearch = {...(this.state.listSearch || defaultListSearch), ...options};
    const {listItems, listSummary} = await api.searchList(listSearch);
    this.updateState({listSearch, listItems, listSummary});
  }
  protected async parseRouter() {
    const {search} = this.rootState.router.location;
    const listSearch = parseQuery("search", search, defaultListSearch);
    await this.dispatch(this.actions.searchList(listSearch));
  }
  @effect(null)
  protected async [VIEW_INVALID]() {
    const views = this.rootState.views;
    if (views.videos) {
      await this.parseRouter();
    }
  }
}

// 导出本模块的Actions
export type ModuleActions = Actions<ModuleHandlers>;

export default exportModel(ModuleNames.videos, ModuleHandlers, initState);
