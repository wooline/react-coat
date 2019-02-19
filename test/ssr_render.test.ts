/**
 * @jest-environment node
 */

import server from "./server";

test("ssr success:/photos?search={title:success}", () => {
  const actions: string[] = [];
  const logerMiddleware = ({dispatch}: {dispatch: Function}) => (next: Function) => (originalAction: {type: string}) => {
    actions.push(originalAction.type);
    return next(originalAction);
  };
  expect.assertions(2);
  return server('/photos?search={"title":"success"}', [logerMiddleware]).then(result => {
    // 不验证 connected-react-router 自动加上的一个随机数 key
    delete result.data.router.location.key;
    expect(result).toMatchSnapshot();
    expect(actions).toEqual(["app/INIT", "app/UPDATE", "photos/INIT", "photos/searchList", "photos/UPDATE"]);
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
    expect(result).toMatchSnapshot();
    expect(actions).toEqual(["app/INIT", "app/UPDATE", "photos/INIT", "photos/searchList", "@@framework/ERROR", "app/putSsrError"]);
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
    expect(actions).toEqual(["app/INIT", "app/UPDATE", "photos/INIT", "photos/searchList", "@@framework/ERROR"]);
  });
});
