'use client';
import "@/app/globals.css";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, needsOnboarding } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (needsOnboarding) {
        router.push('/onboarding');
      }
    }
  }, [user, loading, needsOnboarding, router]);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
