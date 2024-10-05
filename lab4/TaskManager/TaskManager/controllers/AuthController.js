"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthService_1 = require("../services/AuthService");
const WsResponse_1 = require("../model/WsResponse");
class AuthController {
    getRefreshToken(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email || !password) {
                return new WsResponse_1.default(401, null);
            }
            try {
                const refreshToken = yield AuthService_1.default.getRefreshToken(email, password);
                yield AuthService_1.default.getUidByEmail(email);
                const accessToken = yield AuthService_1.default.getAccessToken(refreshToken);
                return new WsResponse_1.default(200, { refreshToken, accessToken });
            }
            catch (err) {
                return new WsResponse_1.default(401, null, `${err}`);
            }
        });
    }
    getAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accessToken = yield AuthService_1.default.getAccessToken(refreshToken);
                return new WsResponse_1.default(200, { accessToken });
            }
            catch (err) {
                return new WsResponse_1.default(401, null, `${err}`);
            }
        });
    }
    createUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield AuthService_1.default.createUser(email, password);
                const refreshToken = yield AuthService_1.default.getRefreshToken(email, password);
                const uid = yield AuthService_1.default.getUidByEmail(email);
                const accessToken = yield AuthService_1.default.getAccessToken(refreshToken);
                return new WsResponse_1.default(201, { refreshToken, accessToken });
            }
            catch (err) {
                return new WsResponse_1.default(401, null, `${err}`);
            }
        });
    }
    logout(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield AuthService_1.default.logout(uid);
                return new WsResponse_1.default(200, {}, 'logout');
            }
            catch (err) {
                return new WsResponse_1.default(400, err, 'logout failed');
            }
        });
    }
}
exports.default = new AuthController();
//# sourceMappingURL=AuthController.js.map