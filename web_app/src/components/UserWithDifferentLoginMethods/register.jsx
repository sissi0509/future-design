import { useState } from 'react';
import { auth, db } from '../../config/Firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

export default function Register({ onClose }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        userName: '',
        prolificId: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault()

        try {
            const result = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password.trim());
            const user = result.user;
            await setDoc(doc(db, "sessionInfo", user.uid), {
                uid: user.uid,
                email: user.email,
                userName: formData.userName,
                prolificId: formData.prolificId || null,
                consentCompleted: false,
                preTestCompleted: false,
                trainingCompleted: false,
                postTestCompleted: false,
                surveyCompleted: false,
            });
            onClose();
        } catch (err) {
            console.error("Registration failed:", err);
        }
    };

    return (
        <form onSubmit={handleRegister}>
            <div>
                <label htmlFor="userName">User Name</label>
                <input
                    className="input"
                    type="text"
                    id="userName"
                    name='userName'
                    placeholder="User Name"
                    value={formData.userName}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label htmlFor="prolificId">Prolific ID</label>
                <input
                    className="input"
                    type="text"
                    id="prolificId"
                    name='prolificId'
                    placeholder="not required for students"
                    value={formData.prolificId}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label htmlFor="email">Email</label>
                <input
                    className="input"
                    type="email"
                    id='email'
                    name='email'
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input
                    className="input"
                    type="password"
                    id='password'
                    name='password'
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                />

            </div>


            <button className="btn" type='submit'>Register</button>
            <button className="btn" type="button" onClick={onClose}>Cancel</button>
        </form>
    );
}