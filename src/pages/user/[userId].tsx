'use client'
import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebaseConfig';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  collection,
  addDoc
} from 'firebase/firestore';
import Navbar from '../../components/Navbar';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";

interface UserProfile {
  id: string;
  name: string;
  bio: string;
  photoUrl?: string;
  college?: string;
  role?: string;
  skills?: string;
  followers: string[];
  following: string[];
  course?: string;
  semester?: string;
  branch?: string;
  linkedIn?: string;
  github?: string;
  projects?: {
    description: string;
    github: string;
    deployed: string;
  }[];
  teamStatus?: string;
  experienceLevel?: string;
  projectInterests?: string[];
  preferredTeamSize?: string;
  hackathonInterests?: string[];
  communicationPreference?: string[];
  availabilityPreference?: string;
}

const UserProfilePage: React.FC = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [canMessage, setCanMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId || !user) return;

      try {
        const docRef = doc(db, 'users', userId as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const profileData = {
            id: docSnap.id,
            ...docSnap.data()
          } as UserProfile;
          
          setProfile(profileData);

          // Check if current user is following this profile
          const currentUserDoc = await getDoc(doc(db, 'users', user.uid));
          if (currentUserDoc.exists()) {
            const following = currentUserDoc.data().following || [];
            setIsFollowing(following.includes(userId));
            setCanMessage(following.includes(userId) && 
              profileData.following?.includes(user.uid));
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, user]);

  const handleFollow = async () => {
    if (!user || !profile) return;

    try {
      const currentUserRef = doc(db, 'users', user.uid);
      const targetUserRef = doc(db, 'users', profile.id);

      if (!isFollowing) {
        // Follow user
        await updateDoc(currentUserRef, {
          following: arrayUnion(profile.id)
        });

        // Create notification
        await addDoc(collection(db, 'notifications'), {
          type: 'FOLLOW_REQUEST',
          from: user.uid,
          to: profile.id,
          timestamp: new Date(),
          status: 'pending'
        });

        toast({
          title: "Follow request sent!",
          description: "You'll be able to message once they accept.",
        });
      } else {
        // Unfollow user
        await updateDoc(currentUserRef, {
          following: arrayRemove(profile.id)
        });
        
        toast({
          title: "Unfollowed successfully",
        });
      }

      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: "Error",
        description: "Failed to follow user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMessage = () => {
    if (canMessage && profile) {
      router.push(`/chat/${profile.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">User not found</h1>
          <Button onClick={() => router.push('/discover')} className="mt-4">
            Back to Discover
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto mt-24 p-4">
        <div className="relative">
          <div className="h-64 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-lg"></div>
          <Avatar className="w-40 h-40 absolute bottom-0 left-8 transform translate-y-1/2 border-4 border-white rounded-full shadow-xl">
            <AvatarImage src={profile?.photoUrl} alt="Profile" />
            <AvatarFallback className="text-2xl">{profile?.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        </div>
        <div className="mt-24 px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{profile?.name || 'Anonymous User'}</h1>
              <p className="text-gray-600 text-lg mt-2">{profile?.college || 'College not specified'}</p>
            </div>
            <div className="space-x-4">
              <Button 
                onClick={handleFollow}
                className={`px-6 py-2 transition-colors ${
                  isFollowing 
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              {canMessage && (
                <Button 
                  onClick={handleMessage}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  Message
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <div className="bg-white rounded-lg shadow-md p-4 flex-1 text-center">
              <p className="text-2xl font-bold text-indigo-600">{profile?.followers?.length || 0}</p>
              <p className="text-gray-600">Followers</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 flex-1 text-center">
              <p className="text-2xl font-bold text-indigo-600">{profile?.following?.length || 0}</p>
              <p className="text-gray-600">Following</p>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-700 leading-relaxed">{profile?.bio || 'No bio provided'}</p>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Education</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Course</p>
                <p className="font-medium">{profile?.course || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-600">Semester</p>
                <p className="font-medium">{profile?.semester || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-600">Branch</p>
                <p className="font-medium">{profile?.branch || 'Not specified'}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile?.skills?.split(',').map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Role</h2>
            <span className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm uppercase">
              {profile?.role || 'Not specified'}
            </span>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Team Preferences</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">Team Status</p>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  {profile?.teamStatus ? profile.teamStatus.replace(/_/g, ' ').toLowerCase() : 'Not specified'}
                </span>
              </div>

              <div>
                <p className="text-gray-600">Experience Level</p>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  {profile?.experienceLevel || 'Not specified'}
                </span>
              </div>

              <div>
                <p className="text-gray-600">Project Interests</p>
                <div className="flex flex-wrap gap-2">
                  {profile?.projectInterests?.map((interest, index) => (
                    <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                      {interest}
                    </span>
                  )) || <span className="text-gray-500">No interests specified</span>}
                </div>
              </div>

              <div>
                <p className="text-gray-600">Preferred Team Size</p>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  {profile?.preferredTeamSize || 'Not specified'}
                </span>
              </div>

              <div>
                <p className="text-gray-600">Hackathon Interests</p>
                <div className="flex flex-wrap gap-2">
                  {profile?.hackathonInterests?.map((interest, index) => (
                    <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                      {interest}
                    </span>
                  )) || <span className="text-gray-500">No interests specified</span>}
                </div>
              </div>

              <div>
                <p className="text-gray-600">Communication Preferences</p>
                <div className="flex flex-wrap gap-2">
                  {profile?.communicationPreference?.map((pref, index) => (
                    <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                      {pref}
                    </span>
                  )) || <span className="text-gray-500">Not specified</span>}
                </div>
              </div>
            </div>
          </div>

          {profile?.projects && profile.projects.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.projects.map((project, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6">
                    <p className="font-medium mb-3">{project.description}</p>
                    <div className="flex flex-col space-y-2">
                      <a href={project.github} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center text-indigo-600 hover:text-indigo-800">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                        GitHub Repository
                      </a>
                      <a href={project.deployed} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center text-indigo-600 hover:text-indigo-800">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Live Demo
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex space-x-4">
            {profile?.linkedIn && (
              <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" 
                 className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <span className="mr-2">LinkedIn</span>
              </a>
            )}
            {profile?.github && (
              <a href={profile.github} target="_blank" rel="noopener noreferrer" 
                 className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <span className="mr-2">GitHub</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;