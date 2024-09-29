import { useState } from 'react'
import '../stylesheets/main.css'
import React from 'react'
import { io } from 'socket.io-client';
import WsResponse from '../model/WsResponse';
import WsRequest from '../model/WsRequest';

interface AuthModalProps {
    isOpen: boolean;
    onClose: (accessToken: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    const socket = io('http://localhost:1337');
    socket.on('users/refresh', (response: WsResponse) => {
        if (response.status >= 200 && response.status < 300) {
            localStorage.setItem('refreshJwt', response.data.refreshToken);
            onClose(response.data.accessToken);
        } else {
            setError('Login error');
        }
    });

    socket.on('users/create', (response: WsResponse) => {
        if (response.status >= 200 && response.status < 300) {
            localStorage.setItem('refreshJwt', response.data.refreshToken);
            onClose(response.data.accessToken);
        } else {
            setError('Registration error');
        }
    });

    const handleSubmitRegistration = async (event: React.FormEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setError('');

        socket.emit('users/create', JSON.stringify(new WsRequest({ email, password }, '', '')));
    }

    const handleSubmitLogin = async (event: React.FormEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setError('');

        socket.emit('users/refresh', JSON.stringify(new WsRequest({ email, password }, '', '')));
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Auth</h2>
                <form>
                    <div>
                        <label htmlFor="email">Email:</label><br />
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required />
                    </div>

                    <div>
                        <label htmlFor="password">Password:</label><br />
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required />
                    </div>

                    {error && <p className="error">{error}</p>}
                    <button type="submit" className="btn" onClick={handleSubmitLogin}>Login</button><br/>
                    <button type="submit" className="btn" onClick={handleSubmitRegistration}>Registration</button>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;