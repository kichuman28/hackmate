import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, storage } from '../lib/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Navbar from '../components/Navbar';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';

interface ProfileData {
  bio: string;
  skills: string;
  college: string;
  linkedIn: string;
  github: string;
  resumeUrl?: string;
  photoUrl?: string;
  followers?: number;
  following?: number;
}

const ProfileView: React.FC<{ profile: ProfileData; user: any; onEdit: () => void }> = ({ profile, user, onEdit }) => {
  return (
    <div className="max-w-4xl mx-auto mt-24 p-4">
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 rounded-t-lg"></div>
        <Avatar className="w-32 h-32 absolute bottom-0 left-8 transform translate-y-1/2 border-4 border-white">
          <AvatarImage src={profile.photoUrl} alt="Profile" />
          <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
        </Avatar>
      </div>
      <div className="mt-16 px-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{user.displayName || 'Your Name'}</h1>
            <p className="text-gray-600 text-sm mt-1">{profile.college || 'Your College'}</p>
          </div>
          <Button onClick={onEdit}>Edit Profile</Button>
        </div>
        <p className="text-gray-600 mt-2">{profile.followers || 0} Followers · {profile.following || 0} Following</p>
        <p className="mt-4">{profile.bio}</p>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Skills</h2>
          <p>{profile.skills}</p>
        </div>
        <div className="mt-6 flex space-x-4">
          {profile.linkedIn && (
            <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              LinkedIn
            </a>
          )}
          {profile.github && (
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              GitHub
            </a>
          )}
          {profile.resumeUrl && (
            <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Resume
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    bio: '',
    skills: '',
    college: '',
    linkedIn: '',
    github: '',
    followers: 0,
    following: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as ProfileData);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      setIsSubmitting(true);
      try {
        let photoUrl = profile.photoUrl;
        let resumeUrl = profile.resumeUrl;

        if (photo) {
          const photoRef = ref(storage, `profile-photos/${user.uid}`);
          await uploadBytes(photoRef, photo);
          photoUrl = await getDownloadURL(photoRef);
        }

        if (resume) {
          const resumeRef = ref(storage, `resumes/${user.uid}`);
          await uploadBytes(resumeRef, resume);
          resumeUrl = await getDownloadURL(resumeRef);
        }

        const updatedProfile = { ...profile, photoUrl, resumeUrl };
        await setDoc(doc(db, 'users', user.uid), updatedProfile);
        setProfile(updatedProfile);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } catch (error) {
        console.error("Error updating profile:", error);
        alert('An error occurred while updating your profile.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // This will prevent any flash of content before redirect
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="pt-20">
        {isEditing ? (
          <div className="container mx-auto mt-10 p-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Edit Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile.photoUrl} alt={user.displayName || 'User'} />
                      <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <Input type="file" onChange={handlePhotoChange} accept="image/*" />
                  </div>
                  <div>
                    <label className="block mb-1">Bio</label>
                    <Textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Skills (comma-separated)</label>
                    <Input
                      type="text"
                      name="skills"
                      value={profile.skills}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">College</label>
                    <Input
                      type="text"
                      name="college"
                      value={profile.college}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">LinkedIn</label>
                    <Input
                      type="url"
                      name="linkedIn"
                      value={profile.linkedIn}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">GitHub</label>
                    <Input
                      type="url"
                      name="github"
                      value={profile.github}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Resume</label>
                    <Input type="file" onChange={handleResumeChange} accept=".pdf,.doc,.docx" />
                    {profile.resumeUrl && (
                      <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        View current resume
                      </a>
                    )}
                  </div>
                  <div className="flex space-x-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Updating...' : 'Update Profile'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <ProfileView profile={profile} user={user} onEdit={() => setIsEditing(true)} />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
