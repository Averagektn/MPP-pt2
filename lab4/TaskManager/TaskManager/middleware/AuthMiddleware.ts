import * as admin from 'firebase-admin';
import jwt = require('jsonwebtoken');
import SecretKeyAccess from '../config/jwt_secret_key_access';
import SecretKeyRefresh from '../config/jwt_secret_key_refresh';
import WsRequest from '../model/WsRequest';

export default async function validateJwt(req: WsRequest): Promise<boolean> {
    if (!req.path) {
        return false;
    }

    if (req.path.startsWith('tasks')) {
        try {
            const token = req.accessToken;

            if (!token) {
                return false;
            }

            console.log('verifying jwt...');
            const decoded: any = jwt.verify(token, SecretKeyAccess);
            return await checkIfUserExists(decoded.uid);
        } catch (error) {
            console.error('Error verifying token:', error);
            return false;
        }
    } else if (req.path.startsWith('users/access') || req.path.startsWith('users/logout')) {
        const token = req.refreshToken;

        if (!token) {
            return false;
        }

        try {
            const decoded: any = jwt.verify(token, SecretKeyRefresh);
            const test = await checkIfUserExists(decoded.uid);
            return await checkIfUserExists(decoded.uid);
        } catch (error) {
            console.error('Error verifying token:', error);
            return false;
        }
    } else { 
        return true;
    }
}

async function checkIfUserExists(uid: string): Promise<boolean> {
    const user = await admin.database().ref(`users/${uid}`).get();
    const val = user.val();

    return val;
}
