'use client'
import "../app/globals.css";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { storage } from '../lib/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface OnboardingData {
  name: string;
  college: string;
  course: string;
  semester: string;
  branch: string;
  skills: string;
  github: string;
  linkedin: string;
  role: string;
  bio: string;
  photoUrl?: string;
  projects: {
    description: string;
    github: string;
    deployed: string;
  }[];
}

const OnboardingPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    name: user?.displayName || '',  // Initialize with Google name
    college: '',
    course: '',
    semester: '',
    branch: '',
    skills: '',
    github: '',
    linkedin: '',
    role: '',
    bio: '',
    projects: [{ description: '', github: '', deployed: '' }],
  });

  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setData({ ...data, [name]: value });
  };

  const handleProjectChange = (index: number, field: string, value: string) => {
    const updatedProjects = [...data.projects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setData({ ...data, projects: updatedProjects });
  };

  const addProject = () => {
    setData({ ...data, projects: [...data.projects, { description: '', github: '', deployed: '' }] });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (user) {
      try {
        let photoUrl = data.photoUrl;

        if (photo) {
          const photoRef = ref(storage, `profile-photos/${user.uid}`);
          await uploadBytes(photoRef, photo);
          photoUrl = await getDownloadURL(photoRef);
        }

        const onboardingData = {
          ...data,
          photoUrl,
          onboardingCompleted: true,
        };

        await setDoc(doc(db, 'users', user.uid), onboardingData, { merge: true });
        toast({
          title: "Onboarding completed",
          description: "Your profile has been updated successfully!",
        });
        router.push('/dashboard');
      } catch (error) {
        console.error("Error updating profile:", error);
        toast({
          title: "Error",
          description: "There was an error updating your profile. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Input
              name="name"
              value={data.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="mb-4"
            />
            <Input
              type="file"
              onChange={handlePhotoChange}
              accept="image/*"
              className="mb-4"
            />
            <Input
              name="college"
              value={data.college}
              onChange={handleChange}
              placeholder="College"
              className="mb-4"
            />
            <Input
              name="course"
              value={data.course}
              onChange={handleChange}
              placeholder="Current Course"
              className="mb-4"
            />
            <Input
              name="semester"
              value={data.semester}
              onChange={handleChange}
              placeholder="Current Semester"
              className="mb-4"
            />
            <Input
              name="branch"
              value={data.branch}
              onChange={handleChange}
              placeholder="Current Branch"
              className="mb-4"
            />
          </>
        );
      case 2:
        return (
          <>
            <Textarea
              name="bio"
              value={data.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              className="mb-4"
            />
            <Textarea
              name="skills"
              value={data.skills}
              onChange={handleChange}
              placeholder="Skills (comma-separated)"
              className="mb-4"
            />
            <Input
              name="github"
              value={data.github}
              onChange={handleChange}
              placeholder="GitHub Profile URL"
              className="mb-4"
            />
            <Input
              name="linkedin"
              value={data.linkedin}
              onChange={handleChange}
              placeholder="LinkedIn Profile URL"
              className="mb-4"
            />
            <Select onValueChange={(value) => handleSelectChange('role', value)}>
              <SelectTrigger className="mb-4">
                <SelectValue placeholder="Select your primary role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
                <SelectItem value="fullstack">Full Stack</SelectItem>
                <SelectItem value="devops">DevOps</SelectItem>
                <SelectItem value="ml">Machine Learning</SelectItem>
              </SelectContent>
            </Select>
          </>
        );
      case 3:
        return (
          <>
            {data.projects.map((project, index) => (
              <div key={index} className="mb-4">
                <Textarea
                  value={project.description}
                  onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                  placeholder="Project Description"
                  className="mb-2"
                />
                <Input
                  value={project.github}
                  onChange={(e) => handleProjectChange(index, 'github', e.target.value)}
                  placeholder="GitHub Repository URL"
                  className="mb-2"
                />
                <Input
                  value={project.deployed}
                  onChange={(e) => handleProjectChange(index, 'deployed', e.target.value)}
                  placeholder="Deployed Project URL"
                  className="mb-2"
                />
              </div>
            ))}
            <Button onClick={addProject} variant="outline" className="mb-4">Add Another Project</Button>
          </>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStep()}
          <div className="flex justify-between">
            {step > 1 && (
              <Button onClick={() => setStep(step - 1)} variant="outline">
                Previous
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)}>Next</Button>
            ) : (
              <Button onClick={handleSubmit}>Complete</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPage;
