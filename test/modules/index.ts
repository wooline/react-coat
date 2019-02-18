import {RootState as BaseState} from "index";
import {ModuleNames} from "./names";
import * as appModule from "./app";
import * as photosModule from "./photos";

export const moduleGetter = (<T extends {[moduleName in ModuleNames]: () => any}>(getter: T) => {
  return getter as {[key in ModuleNames]: T[key]};
})({
  app: () => {
    return appModule;
  },
  photos: () => {
    return photosModule;
  },
});

export type ModuleGetter = typeof moduleGetter;

export type RootState = BaseState<ModuleGetter>;
