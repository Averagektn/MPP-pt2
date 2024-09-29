import authService from '../services/AuthService';
import WsResponse from '../model/WsResponse';

class AuthController {
    async getRefreshToken(email: string, password: string): Promise<WsResponse> {
        if (!email || !password) {
            return new WsResponse(401, null);
        }

        try {
            const refreshToken = await authService.getRefreshToken(email, password);
            await authService.getUidByEmail(email);
            const accessToken = await authService.getAccessToken(refreshToken)

            return new WsResponse(200, { refreshToken, accessToken });
        } catch (err) {
            return new WsResponse(401, null, `${err}`);
        }
    }

    async getAccessToken(refreshToken: string): Promise<WsResponse> {
        try {
            const accessToken = await authService.getAccessToken(refreshToken);

            return new WsResponse(200, { accessToken });
        } catch (err) {
            return new WsResponse(401, null, `${err}`);
        }
    }

    async createUser(email: string, password: string): Promise<WsResponse> {
        try {
            await authService.createUser(email, password);

            const refreshToken = await authService.getRefreshToken(email, password);
            const uid = await authService.getUidByEmail(email);
            const accessToken = await authService.getAccessToken(refreshToken);

            return new WsResponse(201, { refreshToken, accessToken });
        } catch (err) {
            return new WsResponse(401, null, `${err}`);
        }
    }
}

export default new AuthController();