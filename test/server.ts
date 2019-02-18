import {Middleware} from "redux";
import {renderApp} from "index";
import {ModuleNames} from "./modules/names";
import {moduleGetter} from "./modules";

export default function render(path: string, middlewares: Middleware[]): Promise<any> {
  return renderApp(moduleGetter, ModuleNames.app, [path], {middlewares});
}
