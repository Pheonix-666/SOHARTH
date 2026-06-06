'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import type { User } from '@supabase/supabase-js';

interface Profile {
    full_name: string | null;
    phone: string | null;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: string | null }>;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    addAddress: (address: { street: string; city: string; state: string; zip: string; country: string }) => Promise<{ error: string | null }>;
    getAddresses: () => Promise<any[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        const { data } = await supabaseBrowser
            .from('profiles')
            .select('full_name, phone')
            .eq('id', userId)
            .single();
        setProfile(data);
    };

    useEffect(() => {
        // Get initial session
        supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
            async (_event, session) => {
                setUser(session?.user ?? null);
                if (session?.user) fetchProfile(session.user.id);
                else setProfile(null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, fullName: string, phone: string) => {
        const { data, error } = await supabaseBrowser.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, phone }, // stored in auth.users raw_user_meta_data
            },
        });
        if (error) return { error: error.message };

        // Try to upsert profile immediately (works if email confirmation is off)
        // If email confirmation is on, the DB trigger will handle it on confirmation
        if (data.user) {
            const { error: profileError } = await supabaseBrowser.from('profiles').upsert({
                id: data.user.id,
                full_name: fullName,
                phone,
            }, { onConflict: 'id' });
            if (profileError) {
                console.warn('Profile upsert failed (will be created by DB trigger):', profileError.message);
            }
        }
        return { error: null };
    };

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };

        // Ensure profile exists for this user (safety net for users who signed up
        // before the trigger was added, or if trigger failed)
        if (data.user) {
            const { data: existing } = await supabaseBrowser
                .from('profiles')
                .select('id')
                .eq('id', data.user.id)
                .single();

            if (!existing) {
                const meta = data.user.user_metadata;
                await supabaseBrowser.from('profiles').upsert({
                    id: data.user.id,
                    full_name: meta?.full_name ?? null,
                    phone: meta?.phone ?? null,
                }, { onConflict: 'id' });
            }
        }
        return { error: null };
    };

    const signOut = async () => {
  const { error } = await supabaseBrowser.auth.signOut();
  if (error) console.error('Sign out error:', error);
  setUser(null);
  setProfile(null);
  return;
};

    // ----- Address handling -----
    const addAddress = async (address: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    }) => {
      if (!user?.id) return { error: 'User not authenticated' };
      const { error } = await supabaseBrowser.from('addresses').insert({
        user_id: user.id,
        ...address,
      });
      return { error: error?.message ?? null };
    };

    const getAddresses = async () => {
      if (!user?.id) return [];
      const { data, error } = await supabaseBrowser
        .from('addresses')
        .select('*')
        .eq('user_id', user.id);
      if (error) console.error(error);
      return data ?? [];
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, addAddress, getAddresses }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}