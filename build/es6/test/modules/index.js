import * as appModule from "./app";
export const moduleGetter = ((getter) => {
    return getter;
})({
    app: () => {
        return appModule;
    },
});
