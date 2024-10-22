// pages/dashboard.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Search from '../components/Search';
import { useAuth } from '../hooks/useAuth';
import '../app/globals.css';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center p-6 bg-gradient-to-r from-green-400 to-yellow-300 min-h-screen">
        <div className="max-w-4xl w-full bg-white shadow-md rounded-lg p-6">
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Welcome, {user?.displayName || 'User'}!
          </h2>
          <p className="mt-2 text-gray-600 text-center">
            Here you can search for teammates for your next hackathon.
          </p>
          <div className="mt-6">
            <h3 className="text-2xl font-semibold text-gray-700">Search for Teammates</h3>
            <div className="mt-4">
              <Search />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
