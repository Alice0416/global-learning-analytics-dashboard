import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authStore } from './authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('user1@example.com');
  const [password, setPassword] = useState('password123');
  const [err, setErr] = useState('');
  const navigate = useNavigate();
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await authStore.login({ email, password });
      navigate('/dashboard');
    } catch (e) {
      setErr(e?.response?.data?.error?.message || 'Login failed');
    }
  };
  return (
    <div className="max-w-sm mx-auto bg-white shadow rounded p-4">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      {err && <div className="text-red-600 text-sm mb-2">{err}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn-primary w-full" type="submit">Login</button>
      </form>
      <p className="text-xs text-gray-500 mt-2">默认密码来自种子数据：password123</p>
    </div>
  );
}

