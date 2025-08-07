import { useState } from 'react';
import { useAuth } from './AuthSetUp';
import EmailLogin from './EmailLogin';
import IdLogin from './IdLogin';
import Register from './Register';
import Logout from './Logout';

export default function Auth() {
    const { currentUser, userProfile } = useAuth();
    const [activeForm, setActiveForm] = useState(null);

    return (
        <div>
            {!currentUser ? (
                <>
                    <button className="btn" onClick={() => setActiveForm('EmailLogin')}>Email Login</button>
                    {/* <button className="btn" onClick={() => setActiveForm('IDlogin')}>IDLogin</button>
                    <button className="btn" onClick={() => setActiveForm('register')}>Register</button> */}
                </>
            ) : (
                <div>
                    <p>Hello {userProfile?.userName} ! {currentUser.email}</p>
                    <Logout />
                </div>
            )}

            {activeForm === 'EmailLogin' && (
                <div>
                    <EmailLogin onClose={() => setActiveForm(null)} />
                </div>
            )}

            {/* {activeForm === 'IDlogin' && (
                <div>
                    <IdLogin onClose={() => setActiveForm(null)} />
                </div>
            )}

            {activeForm === 'register' && (
                <div>
                    <Register onClose={() => setActiveForm(null)} />
                </div>
            )} */}
        </div>
    );
}
