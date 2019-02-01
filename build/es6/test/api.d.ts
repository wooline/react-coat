import { CurUser, LoginRequest, LoginResponse } from "./type";
export declare class API {
    getCurUser(): Promise<CurUser>;
    login(req: LoginRequest): Promise<LoginResponse>;
}
export declare const api: API;
