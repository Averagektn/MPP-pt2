"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WsResponse {
    constructor(status, data, message = '') {
        this.status = status;
        this.data = data;
        this.message = message;
    }
}
exports.default = WsResponse;
//# sourceMappingURL=WsResponse.js.map