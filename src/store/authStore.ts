import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/database.types'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  status: 'idle' | 'loading' | 'ready'
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>
}

async function loadProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) {
    console.error('Failed to load profile', error)
    return null
  }
  return data
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  status: 'idle',

  initialize: async () => {
    if (get().status !== 'idle') return
    set({ status: 'loading' })

    const { data } = await supabase.auth.getSession()
    const session = data.session
    const profile = session?.user ? await loadProfile(session.user.id) : null
    set({ session, user: session?.user ?? null, profile, status: 'ready' })

    supabase.auth.onAuthStateChange(async (_event, session) => {
      const profile = session?.user ? await loadProfile(session.user.id) : null
      set({ session, user: session?.user ?? null, profile })
    })
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  },

  signUp: async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { error: error?.message ?? null }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, profile: null })
  },

  refreshProfile: async () => {
    const userId = get().user?.id
    if (!userId) return
    const profile = await loadProfile(userId)
    set({ profile })
  },

  updateProfile: async (updates) => {
    const userId = get().user?.id
    if (!userId) return { error: 'Not authenticated' }
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select('*')
      .single()
    if (error) return { error: error.message }
    set({ profile: data })
    return { error: null }
  },
}))
