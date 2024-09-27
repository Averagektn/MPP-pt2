import * as admin from 'firebase-admin';
import { compare, hash } from 'bcrypt';
import jwt = require('jsonwebtoken');
import SecretKey from '../config/jwt_secret_key';

class AuthRepository {
    auth: admin.auth.Auth;
    db: admin.database.Database

    constructor() {
        this.db = admin.database();
        this.auth = admin.auth();
    }

    async authorizeUser(email: string, password: string): Promise<string> {
        const snapshot = await this.db.ref('users').once('value');

        let user = null;

        snapshot.forEach(childSnapshot => {
            const userData = childSnapshot.val();
            if (userData.email === email) {
                user = { id: childSnapshot.key, ...userData };
            }
        });

        if (await compare(password, user.passwordHash)) {
            const token = jwt.sign({ uid: user.id }, SecretKey, { expiresIn: 60 });
            
            return token;
        }

        throw new Error('Invalid credentials');
    }

    async createUser(email: string, password: string): Promise<void> {
        const passwordHash = await hash(password, 1);
        await this.db.ref('users').push({ email, passwordHash })
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