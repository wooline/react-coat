/// <reference types="react" />
import { History } from "history";
import { ComponentType } from "react";
import { Middleware } from "redux";
import { SingleStore } from "./types";
export default function buildApp(view: ComponentType<any>, container: string, storeMiddlewares: Middleware[], storeEnhancers: Function[], store: SingleStore, history: History): void;
