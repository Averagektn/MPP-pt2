import { useState } from 'react'
import '../stylesheets/main.css'
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
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });
            if (response.ok) {
                console.log('Registration successful:');
                onClose();
            } else {
                setError('Registration error');
            }
        } catch (err) {
            setError(`Registration error ${err}`);
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

            if (response.ok) {
                console.log('Login successful:');
                onClose();
            } else {
                setError('Login error');
            }
        } catch (err) {
            setError(`Login error ${err}`);
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