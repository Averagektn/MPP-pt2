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
const AuthRepository_1 = require("../repositroies/AuthRepository");
const email_validation_1 = require("../utils/email_validation");
const jwt = require("jsonwebtoken");
class AuthService {
    getAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const { uid } = jwt.decode(refreshToken);
            const dbRefreshToken = yield AuthRepository_1.default.getCurrentRefreshToken(uid);
            if (dbRefreshToken !== refreshToken) {
                throw new Error('Token comparison error');
            }
            const token = yield AuthRepository_1.default.getAccessToken(uid);
            return token;
        });
    }
    getRefreshToken(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (password.length < 8 || !(0, email_validation_1.default)(email)) {
                throw new Error('Invalid password length or email');
            }
            return yield AuthRepository_1.default.getRefreshToken(email, password);
        });
    }
    createUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (password.length < 8 || !(0, email_validation_1.default)(email)) {
                throw new Error('Invalid password length or email');
            }
            yield AuthRepository_1.default.createUser(email, password);
        });
    }
    getUidByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, email_validation_1.default)(email)) {
                throw new Error('Invalid password email');
            }
            return yield AuthRepository_1.default.getUidByEmail(email);
        });
    }
    userExists(email) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, email_validation_1.default)(email)) {
                throw new Error('Invalid password email');
            }
            return yield AuthRepository_1.default.userExists(email);
        });
    }
    logout(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            yield AuthRepository_1.default.logout(uid);
        });
    }
}
exports.default = new AuthService();
//# sourceMappingURL=AuthService.js.map