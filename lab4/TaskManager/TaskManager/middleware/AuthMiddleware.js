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
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const jwt_secret_key_access_1 = require("../config/jwt_secret_key_access");
const jwt_secret_key_refresh_1 = require("../config/jwt_secret_key_refresh");
function validateJwt(req) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.path) {
            return false;
        }
        if (req.path.startsWith('tasks')) {
            try {
                const token = req.accessToken;
                if (!token) {
                    return false;
                }
                console.log('verifying jwt...');
                const decoded = jwt.verify(token, jwt_secret_key_access_1.default);
                return yield checkIfUserExists(decoded.uid);
            }
            catch (error) {
                console.error('Error verifying token:', error);
                return false;
            }
        }
        else if (req.path.startsWith('users/access') || req.path.startsWith('users/logout')) {
            const token = req.refreshToken;
            if (!token) {
                return false;
            }
            try {
                const decoded = jwt.verify(token, jwt_secret_key_refresh_1.default);
                const test = yield checkIfUserExists(decoded.uid);
                return yield checkIfUserExists(decoded.uid);
            }
            catch (error) {
                console.error('Error verifying token:', error);
                return false;
            }
        }
        else {
            return true;
        }
    });
}
exports.default = validateJwt;
function checkIfUserExists(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield admin.database().ref(`users/${uid}`).get();
        const val = user.val();
        return val;
    });
}
//# sourceMappingURL=AuthMiddleware.js.map