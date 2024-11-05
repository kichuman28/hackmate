// pages/dashboard.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { TeamCard } from '@/components/TeamCard';
import { TeamFiltersSection } from '@/components/TeamFilters';
import { UserProfile, TeamFilters } from '@/types/team';
import { TEAM_STATUS } from '@/app/constants';

const Dashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TeamFilters>({
    skills: '',
    projectInterest: 'all',
    teamStatus: 'all',
    experienceLevel: 'all'
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchUsers();
  }, [user, filters]);

  const fetchUsers = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const usersRef = collection(db, 'users');
      
      // First, let's try without any constraints to see if we get any users
      const q = query(usersRef);
      
      console.log('Current user ID:', user.uid); // Log current user's ID
      
      const querySnapshot = await getDocs(q);
      console.log('Total users found:', querySnapshot.size);
      
      // Log all users to see what we're getting
      querySnapshot.forEach(doc => {
        console.log('User:', {
          id: doc.id,
          data: doc.data()
        });
      });

      let usersList = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as UserProfile));

      console.log('Mapped users list:', usersList);
      
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <Navbar />
        <main className="container mx-auto px-4 pt-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold">Find Your Dream Team</h1>
                <p className="text-gray-600 mt-2">
                  Connect with other hackers and build something amazing together
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/my-connections')}
              >
                View Connections
              </Button>
            </div>
            
            <TeamFiltersSection 
              filters={filters}
              onFilterChange={setFilters}
            />

            {error ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error: {error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setError(null);
                    fetchUsers();
                  }}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                <p>Loading potential teammates...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No users found matching your criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((profile) => (
                  <TeamCard
                    key={profile.id}
                    profile={profile}
                    currentUserId={user!.uid}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
