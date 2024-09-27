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
const jwt_secret_key_1 = require("../config/jwt_secret_key");
function validateJwt(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.path.startsWith('/tasks')) {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).send('Unauthorized: No token provided');
            }
            try {
                const decoded = jwt.verify(token, jwt_secret_key_1.default);
                const user = yield admin.database().ref(`users/${decoded.uid}`).get();
                const val = user.val();
                if (!val) {
                    throw new Error();
                }
                next();
            }
            catch (error) {
                console.error('Error verifying token:', error);
                return res.status(401).send('Unauthorized: Invalid token');
            }
        }
        else {
            next();
        }
    });
}
exports.default = validateJwt;
//# sourceMappingURL=AuthMiddleware.js.map