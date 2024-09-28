import express = require('express');
import authRepository from '../repositroies/AuthRepository';
import jwt = require('jsonwebtoken');

class AuthController {
    async getRefreshToken(req: express.Request, res: express.Response): Promise<void> {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(401).send();
            return;
        }

        try {
            const refreshToken = await authRepository.getRefreshToken(email, password);

            res.status(200)
                .cookie('token', refreshToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict',
                    maxAge: 5 * 60 * 1000
                }).send();
        } catch (err) {
            res.status(401).send();
        }
    }

    async getAccessToken(req: express.Request, res: express.Response): Promise<void> {
        const token: string = req.cookies.token;
        const { uid } = jwt.decode(token) as jwt.JwtPayload;

        try {
            const accessToken = await authRepository.getAccessToken(token, uid);

            res.status(200)
                .header('Authorization', `Bearer ${accessToken}`)
                .send();
        } catch (err) {
            res.status(401).send();
        }
    }

    async createUser(req: express.Request, res: express.Response): Promise<void> {
        const { email, password } = req.body;

        try {
            await authRepository.createUser(email, password);
            res.status(201).send();
        } catch {
            res.status(401).send();
        }
    }
}

export default new AuthController()