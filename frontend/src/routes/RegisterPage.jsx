import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../lib/schemas';
import { useAuth } from '../hooks/useAuth.jsx';
import FormField from '../components/FormField.jsx';
import AuthShell from '../components/AuthShell.jsx';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await registerUser(values);
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <AuthShell
      eyebrow="Create account"
      title="Join the team."
      subtitle="Set a password with an upper, lower, number, and symbol."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-signal-400 hover:text-signal-300">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          label="Username"
          error={errors.username?.message}
          inputProps={{ ...register('username'), autoComplete: 'username', autoFocus: true }}
        />
        <FormField
          label="Email"
          error={errors.email?.message}
          inputProps={{ ...register('email'), type: 'email', autoComplete: 'email' }}
        />
        <FormField
          label="Password"
          error={errors.password?.message}
          inputProps={{ ...register('password'), type: 'password', autoComplete: 'new-password' }}
        />
        {serverError && (
          <p className="rounded-lg border border-coral-500/30 bg-coral-500/10 px-3 py-2 text-sm text-coral-400">
            {serverError}
          </p>
        )}
        {success && (
          <p className="rounded-lg border border-signal-500/30 bg-signal-500/10 px-3 py-2 text-sm text-signal-400">
            Registered — redirecting to sign in…
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-signal-500 px-4 py-2.5 font-display text-sm font-semibold text-ink-950 transition hover:bg-signal-400 disabled:opacity-60"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
