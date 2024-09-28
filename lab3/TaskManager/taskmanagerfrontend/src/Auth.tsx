import { useState } from 'react'
import '../public/stylesheets/main.css'
import React from 'react'

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleSubmitRegistration = async (event: React.FormEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:1337/auth/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            console.log('Registration successful:', response.json());

            await handleSubmitLogin(event);
        } catch (err) {
            setError(`Auth error ${err}`);
        }
    }

    const handleSubmitLogin = async (event: React.FormEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:1337/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });
            console.log('Login successful:', response.json());
            onClose();
        } catch (err) {
            setError(`Auth error ${err}`);
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
                    <button type="submit" className="btn" onClick={handleSubmitLogin}>Login</button>
                    <button type="submit" className="btn" onClick={handleSubmitRegistration}>Registration</button>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;