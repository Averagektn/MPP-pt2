import authService from '../services/AuthService';
import WsResponse from '../model/WsResponse';

class AuthController {
    async getRefreshToken(email: string, password: string): Promise<any> {
        if (!email || !password) {
            throw new Error('401');
        }

        const refreshToken = await authService.getRefreshToken(email, password);
        await authService.getUidByEmail(email);
        const accessToken = await authService.getAccessToken(refreshToken)

        return { refreshToken, accessToken };
    }

    async getAccessToken(refreshToken: string): Promise<string> {
        return await authService.getAccessToken(refreshToken);
    }

    async createUser(email: string, password: string): Promise<any> {
        await authService.createUser(email, password);

        const refreshToken = await authService.getRefreshToken(email, password);
        await authService.getUidByEmail(email);
        const accessToken = await authService.getAccessToken(refreshToken);

        return { refreshToken, accessToken };
    }

    async logout(uid: string): Promise<void> {
        await authService.logout(uid);
    }
}

export default new AuthController();