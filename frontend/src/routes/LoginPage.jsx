import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../lib/schemas';
import { useAuth } from '../hooks/useAuth.jsx';
import FormField from '../components/FormField.jsx';
import AuthShell from '../components/AuthShell.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await login(values);
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <AuthShell
      eyebrow="Sign in"
      title="Welcome back."
      subtitle="Pick up your team's tasks where you left off."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="text-signal-400 hover:text-signal-300">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          label="Username or email"
          error={errors.identifier?.message}
          inputProps={{ ...register('identifier'), autoComplete: 'username', autoFocus: true }}
        />
        <FormField
          label="Password"
          error={errors.password?.message}
          inputProps={{ ...register('password'), type: 'password', autoComplete: 'current-password' }}
        />
        {serverError && (
          <p className="rounded-lg border border-coral-500/30 bg-coral-500/10 px-3 py-2 text-sm text-coral-400">
            {serverError}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-signal-500 px-4 py-2.5 font-display text-sm font-semibold text-ink-950 transition hover:bg-signal-400 disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}
