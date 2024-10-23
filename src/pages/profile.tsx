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
import '../app/globals.css';


interface ProfileData {
  bio: string;
  skills: string;
  college: string;
  linkedIn: string;
  github: string;
  resumeUrl?: string;
  photoUrl?: string;
}

const ProfilePage: React.FC = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    bio: '',
    skills: '',
    college: '',
    linkedIn: '',
    github: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto mt-10 p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Your Profile</CardTitle>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ProfilePage;
