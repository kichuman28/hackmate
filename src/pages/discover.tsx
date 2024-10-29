'use client'
import "../app/globals.css";
import React, { useEffect, useState } from 'react';
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfile {
  id: string;
  name?: string;
  photoUrl?: string;
  college?: string;
  role?: string;
}

const DiscoverPage: React.FC = () => {
  useProtectedRoute();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;

      try {
        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs
          .filter(doc => doc.id !== user.uid) // Exclude the current user's document
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as UserProfile));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto pt-24 px-4">
        <h1 className="text-3xl font-bold mb-8">Discover Users</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {users.map((user) => (
            <UserTile key={user.id} user={user} />
          ))}
        </div>
      </div>
    </div>
  );
};

const UserTile: React.FC<{ user: UserProfile }> = ({ user }) => {
  const fallbackInitial = user.name ? user.name[0].toUpperCase() : '?';

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative pb-[75%]">
        <Avatar className="absolute inset-0 w-full h-full rounded-none">
          <AvatarImage src={user.photoUrl} alt={user.name || 'User'} className="object-cover" />
          <AvatarFallback className="text-4xl">{fallbackInitial}</AvatarFallback>
        </Avatar>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg truncate">{user.name || 'Anonymous User'}</h3>
        <p className="text-sm text-muted-foreground truncate">{user.college || 'College not specified'}</p>
        <div className="mt-2 inline-block bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
          {user.role || 'Role not specified'}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscoverPage;
