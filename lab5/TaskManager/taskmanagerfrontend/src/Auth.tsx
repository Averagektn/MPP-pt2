import { useState } from 'react'
import '../stylesheets/main.css'
import React from 'react'
import { Client } from 'graphql-ws';

interface AuthModalProps {
    isOpen: boolean;
    onClose: (accessToken: string) => void;
    client: Client;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, client }) => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleSubmitRegistration = async (event: React.FormEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setError('');

        const query = client.iterate({
            query: `mutation CreateUser($email: String!, $password: String!) {
                  createUser(email: $email, password: $password) {
                    accessToken
                    refreshToken
                  }
                }`,
            variables: { email, password },
        });

        const { value } = await query.next();

        console.log(value);

        if (value.errors) {
            setError('Registration error');
        } else {
            localStorage.setItem('refreshJwt', value.data.createUser.refreshToken);
            onClose(value.data.createUser.accessToken);
        }
    }

    const handleSubmitLogin = async (event: React.FormEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setError('');

        const query = client.iterate({
            query: `query GetRefreshToken($email: String!, $password: String!) {
                        getRefreshToken(email: $email, password: $password) {
                            accessToken
                            refreshToken
                        }
                    }`,
            variables: { email, password },
        });

        const { value } = await query.next();

        console.log(value);

        if (value.errors) {
            setError('Login error');
        } else {
            localStorage.setItem('refreshJwt', value.data.getRefreshToken.refreshToken);
            onClose(value.data.getRefreshToken.accessToken);
        }
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