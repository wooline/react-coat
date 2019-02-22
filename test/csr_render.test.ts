import {mount} from "enzyme";
import client from "./client";

test("spa success:/videos?search={title:success}", done => {
  expect.assertions(2);
  const actions: string[] = [];
  const logerMiddleware = ({dispatch}: {dispatch: Function}) => (next: Function) => (originalAction: {type: string}) => {
    actions.push(originalAction.type);
    return next(originalAction);
  };
  const store = client('/videos?search={"title":"success"}', [logerMiddleware], app => {
    const wrapper = mount(app);
    setTimeout(() => {
      expect({html: wrapper.html(), data: store.getState()}).toMatchSnapshot();
      expect(actions).toEqual(["app/INIT", "app/LOADING", "app/UPDATE", "videos/INIT", "app/LOADING", "@@framework/VIEW_INVALID", "videos/searchList", "videos/LOADING", "videos/UPDATE", "videos/LOADING"]);
      done();
    }, 1000);
  });
});
