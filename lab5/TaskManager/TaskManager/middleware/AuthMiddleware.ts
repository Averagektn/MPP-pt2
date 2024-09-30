import * as admin from 'firebase-admin';
import jwt = require('jsonwebtoken');
import SecretKeyAccess from '../config/jwt_secret_key_access';
import SecretKeyRefresh from '../config/jwt_secret_key_refresh';

export default async function validateJwt(token: string, path: string): Promise<boolean> {
    if (!path) {
        return false;
    }

    if (path.startsWith('tasks')) {
        try { 
            if (!token) {
                return false;
            }
        
            const decoded: any = jwt.verify(token, SecretKeyAccess);
            return await checkIfUserExists(decoded.uid);
        } catch (error) {
            console.error('Error verifying token:', error);
            return false;
        }
    } else if (path.startsWith('auth')) {
        if (!token) {
            return false;
        }

        try {
            const decoded: any = jwt.verify(token, SecretKeyRefresh);
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
