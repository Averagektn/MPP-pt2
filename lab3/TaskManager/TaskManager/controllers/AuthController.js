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
const jwt = require("jsonwebtoken");
class AuthController {
    getRefreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(401).send();
                return;
            }
            try {
                const refreshToken = yield AuthRepository_1.default.getRefreshToken(email, password);
                const uid = yield AuthRepository_1.default.getUidByEmail(email);
                const accessToken = yield AuthRepository_1.default.getAccessToken(refreshToken, uid);
                res.status(200)
                    .header('Authorization', `Bearer ${accessToken}`)
                    .cookie('token', refreshToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict',
                    maxAge: 5 * 60 * 1000
                }).send();
            }
            catch (err) {
                res.status(401).send();
            }
        });
    }
    getAccessToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = req.cookies.token;
            const { uid } = jwt.decode(token);
            try {
                const accessToken = yield AuthRepository_1.default.getAccessToken(token, uid);
                res.status(200)
                    .header('Authorization', `Bearer ${accessToken}`)
                    .send();
            }
            catch (err) {
                res.status(401).send();
            }
        });
    }
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            try {
                yield AuthRepository_1.default.createUser(email, password);
                const refreshToken = yield AuthRepository_1.default.getRefreshToken(email, password);
                const uid = yield AuthRepository_1.default.getUidByEmail(email);
                const accessToken = yield AuthRepository_1.default.getAccessToken(refreshToken, uid);
                res.status(201)
                    .header('Authorization', `Bearer ${accessToken}`)
                    .cookie('token', refreshToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict',
                    maxAge: 30 * 60 * 1000
                }).send();
            }
            catch (_a) {
                res.status(401).send();
            }
        });
    }
}
exports.default = new AuthController();
//# sourceMappingURL=AuthController.js.map