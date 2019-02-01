import { buildApp } from "index";
import { ModuleNames } from "./modules/names";
import { moduleGetter } from "./modules";
buildApp(moduleGetter, ModuleNames.app);
