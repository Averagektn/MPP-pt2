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
class AuthController {
    getRefreshToken(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email || !password) {
                throw new Error('401');
            }
            const refreshToken = yield AuthService_1.default.getRefreshToken(email, password);
            yield AuthService_1.default.getUidByEmail(email);
            const accessToken = yield AuthService_1.default.getAccessToken(refreshToken);
            return { refreshToken, accessToken };
        });
    }
    getAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield AuthService_1.default.getAccessToken(refreshToken);
        });
    }
    createUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            yield AuthService_1.default.createUser(email, password);
            const refreshToken = yield AuthService_1.default.getRefreshToken(email, password);
            yield AuthService_1.default.getUidByEmail(email);
            const accessToken = yield AuthService_1.default.getAccessToken(refreshToken);
            return { refreshToken, accessToken };
        });
    }
    logout(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            yield AuthService_1.default.logout(uid);
        });
    }
}
exports.default = new AuthController();
//# sourceMappingURL=AuthController.js.map