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
export type LoginErrorCode = "passwordWrong" | "usernameHasExisted";
export const loginErrorCode = {
  passwordWrong: "passwordWrong",
  usernameHasExisted: "usernameHasExisted",
};
export type LoginResponse = DefaultResult<CurUser, {code: LoginErrorCode; message: string}>;

export interface ListSearch {
  page: number;
  pageSize: number;
  title: string;
}
export interface ListItem {
  id: string;
  title: string;
}
export interface ListSummary {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
