import {Middleware} from "redux";
import {ReactElement} from "react";
import {buildApp} from "index";
import {ModuleNames} from "./modules/names";
import {moduleGetter} from "./modules";

export default function render(path: string, middlewares: Middleware[], container: (comp: ReactElement<any>) => void) {
  history.replaceState({}, "Test", `http://localhost${path}`);
  return buildApp(
    moduleGetter,
    ModuleNames.app,
    {
      middlewares,
    },
    container,
  );
}
