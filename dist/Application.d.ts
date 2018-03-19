/// <reference types="react" />
import { ComponentType } from "react";
import { Middleware, Store } from "redux";
export default function buildApp(view: ComponentType<any>, container: string, storeMiddlewares: Middleware[], storeEnhancers: Function[], store: Store<any>): void;
