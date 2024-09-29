export default class WsRequest {
    data: any;
    accessToken: string;
    refreshToken: string;
    path: string;

    constructor(data: any, accessToken: string, refreshToken: string, path: string) {
        this.data = data;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.path = path;
    }
}