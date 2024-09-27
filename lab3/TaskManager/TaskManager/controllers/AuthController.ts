import express = require('express');
import authRepository from '../repositroies/AuthRepository';

class AuthController {
    async performAuth(req: express.Request, res: express.Response): Promise<void> {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(401).send();
            return;
        }

        try {
            const token = await authRepository.authorizeUser(email, password);

            res.status(200)
                .cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict',
                    maxAge: 5 * 60 * 1000
                }).send(); 
        } catch(err) {
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