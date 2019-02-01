var API = (function () {
    function API() {
    }
    API.prototype.getCurUser = function () {
        return Promise.resolve({ uid: "1", username: "test", hasLogin: true, avatarUrl: "/imgs/1.jpg" });
    };
    API.prototype.login = function (req) {
        return Promise.resolve({
            data: {
                uid: "1",
                username: "Jimmy",
                hasLogin: true,
                avatarUrl: "imgs/u1.jpg",
            },
            error: null,
        });
    };
    return API;
}());
export { API };
export var api = new API();
