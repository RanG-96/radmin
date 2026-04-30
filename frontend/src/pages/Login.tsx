import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-secondary)]">
      <div className="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-8 shadow-sm">
        <h2 className="mb-6 text-center text-2xl font-semibold text-[var(--color-text)]">
          Sign In
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p className="rounded bg-red-50 p-2 text-sm text-[var(--color-error)]">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--color-text-secondary)]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[var(--color-primary)] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
