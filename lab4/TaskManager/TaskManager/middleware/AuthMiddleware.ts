import * as admin from 'firebase-admin';
import express = require('express');
import jwt = require('jsonwebtoken');
import SecretKey from '../config/jwt_secret_key';

export default async function validateJwt(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.path.startsWith('/tasks')) {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).send('Unauthorized: No token provided');
        }

        try {
            const decoded: any = jwt.verify(token, SecretKey);

            const user = await admin.database().ref(`users/${decoded.uid}`).get();
            const val = user.val();
            if (!val) {
                throw new Error();
            } 

            next();
        } catch (error) {
            console.error('Error verifying token:', error);
            return res.status(401).send('Unauthorized: Invalid token');
        }
    } else {
        next();
    }
}