import server from "./server";
test("test", () => {
  expect(
    server("/photos").then(result => {
      // 不验证 connected-react-router 自动加上的一个随机数 key
      delete result.data.router.location.key;
      return result;
    }),
  ).resolves.toEqual({
    data: {
      router: {
        action: "POP",
        location: {hash: "", pathname: "/photos", search: "", state: undefined},
      },
      app: {
        isModule: true,
        curUser: {avatarUrl: "/imgs/1.jpg", hasLogin: true, uid: "1", username: "test"},
        loading: {global: "Stop", login: "Stop"},
      },
    },
    html: '<div data-reactroot="">app</div>',
    ssrInitStoreKey: "reactCoatInitStore",
  });
});
