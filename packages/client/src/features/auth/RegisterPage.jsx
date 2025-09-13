import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authStore } from './authStore';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await authStore.register({ email, password, name });
      setMsg('注册成功，请登录');
      setErr('');
      setTimeout(() => navigate('/login'), 800);
    } catch (e) {
      setErr(e?.response?.data?.error?.message || 'Register failed');
    }
  };
  return (
    <div className="max-w-sm mx-auto bg-white shadow rounded p-4">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      {msg && <div className="text-green-600 text-sm mb-2">{msg}</div>}
      {err && <div className="text-red-600 text-sm mb-2">{err}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn-primary w-full" type="submit">Register</button>
      </form>
    </div>
  );
}

