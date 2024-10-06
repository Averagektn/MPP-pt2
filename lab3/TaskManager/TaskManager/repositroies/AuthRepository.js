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
const bcrypt_1 = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwt_secret_key_access_1 = require("../config/jwt_secret_key_access");
const jwt_secret_key_refresh_1 = require("../config/jwt_secret_key_refresh");
class AuthRepository {
    constructor() {
        this.db = admin.database();
        this.auth = admin.auth();
    }
    getCurrentRefreshToken(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenSnapshot = yield this.db.ref(`tokens/${uid}`).get();
            return tokenSnapshot.val();
        });
    }
    getAccessToken(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = jwt.sign({ uid: uid }, jwt_secret_key_access_1.default, { expiresIn: 3 * 60 });
            return token;
        });
    }
    getRefreshToken(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const authUser = yield this.auth.getUserByEmail(email);
            const uid = authUser.uid;
            const snapshot = yield this.db.ref(`users/${uid}`).get();
            let user;
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                const id = childSnapshot.key;
                user = Object.assign(Object.assign({}, data), { id });
            });
            if (yield (0, bcrypt_1.compare)(password, user.passwordHash)) {
                const token = jwt.sign({ uid: uid }, jwt_secret_key_refresh_1.default, { expiresIn: 30 * 60 });
                yield this.db.ref(`tokens/${uid}`).set(token);
                return token;
            }
            throw new Error('Invalid credentials');
        });
    }
    createUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.auth.createUser({ email, password });
            const passwordHash = yield (0, bcrypt_1.hash)(password, 1);
            yield this.db.ref(`users/${user.uid}`).push({ email, passwordHash });
        });
    }
    getUidByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.auth.getUserByEmail(email);
            return user.uid;
        });
    }
    logout(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.ref(`tokens/${uid}`).remove();
        });
    }
    userExists(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.auth.getUserByEmail(email);
                return true;
            }
            catch (error) {
                return false;
            }
        });
    }
}
exports.default = new AuthRepository();
//# sourceMappingURL=AuthRepository.js.map