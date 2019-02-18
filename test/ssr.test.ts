import server from "./server";
test("ssr success:/photos?search={title:photo}", () => {
  const actions: string[] = [];
  const logerMiddleware = ({dispatch}: {dispatch: Function}) => (next: Function) => (originalAction: {type: string}) => {
    actions.push(originalAction.type);
    return next(originalAction);
  };
  expect.assertions(2);
  return server('/photos?search={"title":"photo"}', [logerMiddleware]).then(result => {
    // 不验证 connected-react-router 自动加上的一个随机数 key
    delete result.data.router.location.key;
    expect(result).toEqual({
      data: {
        app: {curUser: {avatarUrl: "/imgs/1.jpg", hasLogin: true, uid: "1", username: "test"}, isModule: true, loading: {global: "Stop", login: "Stop"}},
        photos: {isModule: true, listItems: [{id: "1", title: "photo1"}, {id: "2", title: "photo1"}], listSearch: {page: 1, pageSize: 10, title: "photo"}, listSummary: {page: 1, pageSize: 10, totalItems: 10, totalPages: 1}, loading: {global: "Stop"}},
        router: {action: "POP", location: {hash: "", pathname: "/photos", search: '?search={"title":"photo"}', state: undefined}},
      },
      html: '<div data-reactroot=""><div class="photos"><ul><li>photo1</li><li>photo1</li></ul><div class="pagination">共10条，第1/1页</div></div></div>',
      ssrInitStoreKey: "reactCoatInitStore",
    });
    expect(actions).toEqual(["app/INIT", "app/LOADING", "app/UPDATE", "photos/INIT", "photos/searchList", "photos/LOADING", "photos/UPDATE", "photos/LOADING", "app/LOADING"]);
  });
});

test("ssr failed:/photos?search={title:error}", () => {
  const actions: string[] = [];
  const logerMiddleware = ({dispatch}: {dispatch: Function}) => (next: Function) => (originalAction: {type: string}) => {
    actions.push(originalAction.type);
    return next(originalAction);
  };
  expect.assertions(2);
  return server('/photos?search={"title":"error"}', [logerMiddleware]).then(result => {
    // 不验证 connected-react-router 自动加上的一个随机数 key
    delete result.data.router.location.key;
    expect(result).toEqual({
      data: {
        app: {curUser: {avatarUrl: "/imgs/1.jpg", hasLogin: true, uid: "1", username: "test"}, isModule: true, loading: {global: "Stop", login: "Stop"}, ssrError: "获取图片列表失败！"},
        photos: {isModule: true, loading: {global: "Stop"}},
        router: {action: "POP", location: {hash: "", pathname: "/photos", search: '?search={"title":"error"}', state: undefined}},
      },
      html: '<div data-reactroot="">获取图片列表失败！</div>',
      ssrInitStoreKey: "reactCoatInitStore",
    });
    expect(actions).toEqual(["app/INIT", "app/LOADING", "app/UPDATE", "photos/INIT", "photos/searchList", "photos/LOADING", "photos/LOADING", "app/LOADING", "@@framework/ERROR", "app/putSsrError"]);
  });
});

test("ssr exception:/photos?search={title:exception}", () => {
  const actions: string[] = [];
  const logerMiddleware = ({dispatch}: {dispatch: Function}) => (next: Function) => (originalAction: {type: string}) => {
    actions.push(originalAction.type);
    return next(originalAction);
  };
  expect.assertions(2);
  return server('/photos?search={"title":"exception"}', [logerMiddleware]).catch(e => {
    expect(e.message).toBe("服务器内部错误！");
    expect(actions).toEqual(["app/INIT", "app/LOADING", "app/UPDATE", "photos/INIT", "photos/searchList", "photos/LOADING", "photos/LOADING", "app/LOADING", "@@framework/ERROR"]);
  });
});
