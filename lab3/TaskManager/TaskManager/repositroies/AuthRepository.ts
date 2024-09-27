import * as admin from 'firebase-admin';
import { compare, hash } from 'bcrypt';
import jwt = require('jsonwebtoken');
import SecretKeyAccess from '../config/jwt_secret_key_access';
import SecretKeyRefresh from '../config/jwt_secret_key_refresh';
import { randomInt } from 'crypto';

class AuthRepository {
    auth: admin.auth.Auth;
    db: admin.database.Database

    constructor() {
        this.db = admin.database();
        this.auth = admin.auth();
    }

    async getAccessToken(refreshToken: string, uid: string): Promise<string> {
        const tokenSnapshot = await this.db.ref(`tokens/${uid}`).get();
        const dbRefreshToken: string = tokenSnapshot.val();

        if (dbRefreshToken !== refreshToken) {
            throw new Error('Token comparison error');
        }

        const token = jwt.sign({ uid: uid }, SecretKeyAccess, { expiresIn: 5 * 60 });

        return token;
    }

    async getRefreshToken(email: string, password: string): Promise<string> {
        const authUser = await this.auth.getUserByEmail(email);

        const uid = authUser.uid;
        const snapshot = await this.db.ref(`users/${uid}`).get();
        let user;
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const id = childSnapshot.key;
            user = { ...data, id };
        });

        if (await compare(password, user.passwordHash)) {
            const token = jwt.sign({ uid: uid }, SecretKeyRefresh, { expiresIn: 15 * 60 });
            await this.db.ref(`tokens/${uid}`).set(token);

            return token;
        }

        throw new Error('Invalid credentials');
    }

    async createUser(email: string, password: string): Promise<void> {
        const user = await this.auth.createUser({ email, password });
        const passwordHash = await hash(password, 1);

        await this.db.ref(`users/${user.uid}`).push({ email, passwordHash });
    }

    async userExists(email: string): Promise<boolean> {
        try {
            await this.auth.getUserByEmail(email);
            return true;
        } catch (error) {
            return false;
        }
    }
}

export default new AuthRepository();