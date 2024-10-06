import * as admin from 'firebase-admin';
import express = require('express');
import jwt = require('jsonwebtoken');
import SecretKeyAccess from '../config/jwt_secret_key_access';
import SecretKeyRefresh from '../config/jwt_secret_key_refresh';

export default async function validateJwt(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.path.startsWith('/tasks')) {
        try {
            const token = req.headers['authorization'].split(' ')[1];
            const refresh = req.cookies.token;
            console.log(refresh);
            if (!token) {
                return res.status(401).send('Unauthorized: No token provided');
            }
        
            const decoded: any = jwt.verify(token, SecretKeyAccess);
            await checkIfUserExists(decoded.uid);
            next();
        } catch (error) {
            console.error('Error verifying token:', error);
            return res.status(401).send('Unauthorized: Invalid token');
        }
    } else if (req.path.startsWith('/auth/access') || req.path.startsWith('/auth/logout')) {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).send('Unauthorized: No token provided');
        }

        try {
            const decoded: any = jwt.verify(token, SecretKeyRefresh);
            await checkIfUserExists(decoded.uid);
            next();
        } catch (error) {
            console.error('Error verifying token:', error);
            return res.status(401).send('Unauthorized: Invalid token');
        }
    } else { 
        next();
    }
}

async function checkIfUserExists(uid: string): Promise<void> {
    const user = await admin.database().ref(`users/${uid}`).get();
    const val = user.val();
    if (!val) {
        throw new Error();
    }
}
