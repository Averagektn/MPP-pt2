import authRepository from "../repositroies/AuthRepository";
import validateEmail from "../utils/email_validation";
import jwt = require('jsonwebtoken');

class AuthService {
    async getAccessToken(refreshToken: string): Promise<string> {
        const { uid } = jwt.decode(refreshToken) as jwt.JwtPayload;
        const dbRefreshToken = await authRepository.getCurrentRefreshToken(uid);

        if (dbRefreshToken !== refreshToken) {
            throw new Error('Token comparison error');
        }

        const token = await authRepository.getAccessToken(uid);

        return token;
    }

    async getRefreshToken(email: string, password: string): Promise<string> {
        if (password.length < 8 || !validateEmail(email)) {
            throw new Error('Invalid password length or email');
        }

        return await authRepository.getRefreshToken(email, password);
    }

    async createUser(email: string, password: string): Promise<void> {
        if (password.length < 8 || !validateEmail(email)) {
            throw new Error('Invalid password length or email');
        }

        await authRepository.createUser(email, password);
    }

    async getUidByEmail(email: string): Promise<string> {
        if (!validateEmail(email)) {
            throw new Error('Invalid password email');
        }

        return await authRepository.getUidByEmail(email);
    }

    async userExists(email: string): Promise<boolean> {
        if (!validateEmail(email)) {
            throw new Error('Invalid password email');
        }

        return await authRepository.userExists(email);
    }

    async logout(uid: string): Promise<void> {
        await authRepository.logout(uid);
    }
}

export default new AuthService();