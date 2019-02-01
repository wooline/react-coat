import {CurUser, LoginRequest, LoginResponse} from "./type";

export class API {
  public getCurUser(): Promise<CurUser> {
    return Promise.resolve({uid: "1", username: "test", hasLogin: true, avatarUrl: "/imgs/1.jpg"});
  }
  public login(req: LoginRequest): Promise<LoginResponse> {
    return Promise.resolve({
      data: {
        uid: "1",
        username: "Jimmy",
        hasLogin: true,
        avatarUrl: "imgs/u1.jpg",
      },
      error: null,
    });
  }
}

export const api = new API();
