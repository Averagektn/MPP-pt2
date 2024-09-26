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
const jwt_secret_key_1 = require("../config/jwt_secret_key");
class AuthRepository {
    constructor() {
        this.db = admin.database();
        this.auth = admin.auth();
    }
    authorizeUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshot = yield this.db.ref('users').once('value');
            let user = null;
            snapshot.forEach(childSnapshot => {
                const userData = childSnapshot.val();
                if (userData.email === email) {
                    user = Object.assign({ id: childSnapshot.key }, userData);
                }
            });
            if (yield (0, bcrypt_1.compare)(password, user.passwordHash)) {
                const token = jwt.sign(user.id, jwt_secret_key_1.default);
                return token;
            }
            throw new Error('Invalid credentials');
        });
    }
    createUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const passwordHash = yield (0, bcrypt_1.hash)(password, 1);
            yield this.db.ref('users').push({ email, passwordHash });
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