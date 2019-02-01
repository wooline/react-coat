export class API {
    getCurUser() {
        return Promise.resolve({ uid: "1", username: "test", hasLogin: true, avatarUrl: "/imgs/1.jpg" });
    }
    login(req) {
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
