"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./server");
test("test", function () {
    expect(server_1.default("/photos").then(function (result) {
        delete result.data.router.location.key;
        return result;
    })).resolves.toEqual({
        data: {
            router: {
                action: "POP",
                location: { hash: "", pathname: "/photos", search: "", state: undefined },
            },
            app: {
                isModule: true,
                curUser: { avatarUrl: "/imgs/1.jpg", hasLogin: true, uid: "1", username: "test" },
                loading: { global: "Stop", login: "Stop" },
            },
        },
        html: '<div data-reactroot="">app</div>',
        ssrInitStoreKey: "reactCoatInitStore",
    });
});
