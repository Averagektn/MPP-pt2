/* eslint-disable @typescript-eslint/no-explicit-any */
export default class WsRequest {
    data: any;
    accessToken: string;
    refreshToken: string;

    constructor(data: any, accessToken: string, refreshToken: string) {
        this.data = data;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}
