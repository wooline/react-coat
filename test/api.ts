import {CurUser, LoginRequest, LoginResponse, ListSearch, ListItem, ListSummary} from "./type";

export class API {
  public getCurUser(): Promise<CurUser> {
    return Promise.resolve({uid: "1", username: "test", hasLogin: true, avatarUrl: "/imgs/1.jpg"});
  }
  public login(req: LoginRequest): Promise<LoginResponse> {
    return Promise.resolve({
      data: {
        uid: "1",
        username: "Jimmy",
        hasLogin: true,
        avatarUrl: "imgs/u1.jpg",
      },
      error: null,
    });
  }
  public searchList(listSearch: ListSearch): Promise<{listItems: ListItem[]; listSummary: ListSummary}> {
    if (listSearch.title === "error") {
      return Promise.reject(new Error("获取列表失败！"));
    } else if (listSearch.title === "exception") {
      return Promise.reject(new Error("服务器内部错误！"));
    } else {
      return Promise.resolve({
        listItems: [{id: "1", title: "item1"}, {id: "2", title: "item2"}],
        listSummary: {
          page: 1,
          pageSize: 10,
          totalItems: 10,
          totalPages: 1,
        },
      });
    }
  }
}

export const api = new API();
