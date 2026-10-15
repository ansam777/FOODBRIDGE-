'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { UserRole } from '@/lib/mock-data';

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleDemoLogin = (role: UserRole) => {
    setRole(role);
    if (role === 'donor') router.push('/donate');
    else if (role === 'volunteer') router.push('/volunteer');
    else router.push('/feed');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-[24px]">restaurant</span>
          </div>
          <span className="text-2xl font-black text-primary tracking-tight">FoodBridge</span>
        </Link>
        <h2 className="text-2xl font-bold text-on-surface">Sign in to your account</h2>
        <p className="mt-1 text-xs text-on-surface-variant">
          Or test any role immediately with one-click demo credentials below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-container-lowest py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-outline-variant/30">
          
          {/* Quick Persona Demo Buttons */}
          <div className="mb-6">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
              1-Click Demo Login (PRD Personas)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('recipient')}
                className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-on-surface flex items-center gap-2 transition-all border border-outline-variant/20"
              >
                <span>🤲</span>
                <span>Recipient (NGO)</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('donor')}
                className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-on-surface flex items-center gap-2 transition-all border border-outline-variant/20"
              >
                <span>🏪</span>
                <span>Food Donor</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('volunteer')}
                className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-on-surface flex items-center gap-2 transition-all border border-outline-variant/20"
              >
                <span>🚴</span>
                <span>Volunteer</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-on-surface flex items-center gap-2 transition-all border border-outline-variant/20"
              >
                <span>🛡️</span>
                <span>System Admin</span>
              </button>
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-container" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-surface-container-lowest text-on-surface-variant font-medium">
                Or continue with email
              </span>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleDemoLogin('recipient');
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.org"
                className="w-full h-11 px-4 rounded-full bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 rounded-full bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-on-primary-fixed-variant transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-on-surface-variant">
            Don&apos;t have an account?{' '}
            <Link href="/" className="font-bold text-primary hover:underline">
              Back to Home
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
