import * as appModule from "./app";
export var moduleGetter = (function (getter) {
    return getter;
})({
    app: function () {
        return appModule;
    },
});
