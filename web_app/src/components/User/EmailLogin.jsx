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
      alert('Email login failed, check your email and password');
      console.error('Email login failed:', err);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleEmailLogin();
      }}
      className="card   w-full max-w-md  shadow-md bg-base-100 p-6 space-y-4"
    >


      <fieldset className="fieldset space-y-2">
        <label htmlFor="email" className="label text-lg font-medium ">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          className="input input-bordered w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password" className="label text-lg font-medium ">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          className="input input-bordered w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </fieldset>

      <div className="flex flex-col gap-2 mt-4">
        <button className="btn btn-primary w-full" type="submit">
          Login
        </button>
        <button className="btn btn-ghost w-full" type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}
