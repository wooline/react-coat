import { renderApp } from "index";
import { ModuleNames } from "./modules/names";
import { moduleGetter } from "./modules";
export default function render(path) {
    return renderApp(moduleGetter, ModuleNames.app, [path]);
}
