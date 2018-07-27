/// <reference types="react" />
import { History } from "history";
import { ComponentType } from "react";
import { Middleware, Store } from "redux";
export default function buildApp(view: ComponentType<any>, container: string, storeMiddlewares: Middleware[], storeEnhancers: Function[], store: Store, history: History): void;
