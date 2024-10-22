// pages/dashboard.tsx
import Navbar from '../components/Navbar';
import Search from '../components/Search';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <main className="p-4">
        <h2 className="text-2xl font-bold">Welcome, {user?.displayName || 'User'}!</h2>
        <p className="mt-2">Here you can search for teammates for your next hackathon.</p>
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Search for Teammates</h3>
          <Search />
        </div>
      </main>
    </>
  );
};

export default Dashboard;
