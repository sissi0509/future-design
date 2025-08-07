import { useState } from 'react';
import { auth } from '../../config/Firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { sendLoginStatement } from '../../services/xapi/LoginStatement';

export default function EmailLogin({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      await sendLoginStatement(user.email);
      onClose();
    } catch (err) {
      alert("Email login failed, check your email and password");
      console.error("Email login failed:", err);
    }
  };

  return (
    <div>
      <div>
        <label htmlFor="email">Email</label>
        <input
          className="input"
          type="email"
          id='email'
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          className="input"
          type="password"
          id='password'
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button className="btn" onClick={handleEmailLogin}>
        Login
      </button>


      <button className="btn" onClick={onClose}>
        Cancel
      </button>
    </div >
  );
}
