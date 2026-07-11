import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react'
import { LogoMark } from '@/components/common/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { isSupabaseConfigured } from '@/lib/supabase'

export function Login() {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    if (mode === 'sign-in') {
      const { error } = await signIn(email, password)
      if (error) setError(error)
    } else {
      const { error } = await signUp(email, password, fullName)
      if (error) setError(error)
      else setInfo('Account created. Check your inbox to confirm your email, then sign in.')
    }
    setLoading(false)
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-10%] h-[500px] w-[720px] -translate-x-1/2 rounded-full bg-accent/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.035)_1px,transparent_0)] bg-[size:32px_32px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass relative z-10 w-full max-w-[400px] rounded-2xl p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
      >
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <LogoMark className="h-12 w-12" />
          <div>
            <h1 className="text-lg font-semibold text-white">HR Work Tracker</h1>
            <p className="mt-1 text-[13px] text-secondary">Powered by Alfalah Investments</p>
          </div>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-[12.5px] text-warning">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>
              Supabase isn&apos;t configured yet. Add <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
              <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to a <code className="font-mono">.env</code> file.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'sign-up' && (
            <Input
              label="Full name"
              icon={<User className="size-4" />}
              placeholder="Jordan Blake"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}
          <Input
            label="Work email"
            type="email"
            icon={<Mail className="size-4" />}
            placeholder="you@alfalahinvestments.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type="password"
            icon={<Lock className="size-4" />}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            minLength={6}
            required
          />

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
              <AlertCircle className="size-3.5 shrink-0" />
              {error}
            </div>
          )}
          {info && (
            <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-[12.5px] text-success">
              {info}
            </div>
          )}

          <Button type="submit" size="lg" loading={loading} className="mt-1 w-full">
            {mode === 'sign-in' ? 'Sign in' : 'Create account'}
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-[13px] text-secondary">
          {mode === 'sign-in' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
              setError(null)
              setInfo(null)
            }}
            className="font-medium text-accent-light transition-colors hover:text-accent"
          >
            {mode === 'sign-in' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
