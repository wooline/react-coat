export interface ErrorType<Code = any, Detail = null> {
    code: Code;
    message: string;
    detail?: Detail;
}
export interface DefaultResult<Data = any, Error extends ErrorType = ErrorType> {
    data: Data;
    error: Error | null;
}
export interface CurUser {
    uid: string;
    username: string;
    hasLogin: boolean;
    avatarUrl: string;
}
export interface LoginRequest {
    username: string;
    password: string;
}
export declare type LoginErrorCode = "passwordWrong" | "usernameHasExisted";
export declare const loginErrorCode: {
    passwordWrong: string;
    usernameHasExisted: string;
};
export declare type LoginResponse = DefaultResult<CurUser, {
    code: LoginErrorCode;
    message: string;
}>;
