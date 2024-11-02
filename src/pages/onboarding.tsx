'use client'
import "../app/globals.css";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { db, storage } from '../lib/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { COLLEGES, COURSES, BRANCHES, SEMESTERS, SKILLS } from '../app/constants';

interface OnboardingData {
  name: string;
  college: string;
  course: string;
  semester: string;
  branch: string;
  skills: string;
  github: string;
  linkedIn: string;
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
    name: user?.displayName || '',
    college: '',
    course: '',
    semester: '',
    branch: '',
    skills: '',
    github: '',
    linkedIn: '',
    role: '',
    bio: '',
    projects: [{ description: '', github: '', deployed: '' }],
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [otherCollege, setOtherCollege] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'college') {
      if (value === 'Other') {
        setIsOtherSelected(true);
        setData({ ...data, college: '' }); // Reset college to empty string
        setOtherCollege(''); // Reset other college input
      } else {
        setIsOtherSelected(false);
        setData({ ...data, college: value });
        setOtherCollege('');
      }
    } else {
      setData({ ...data, [name]: value });
    }
  };

  const handleOtherCollegeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const customCollege = e.target.value;
    setOtherCollege(customCollege);
    setData({ ...data, college: customCollege });
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
          skills: selectedSkills.join(', '),
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

  const handleSkillSelect = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else if (selectedSkills.length < 8) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={photo ? URL.createObjectURL(photo) : undefined} />
                <AvatarFallback>{data.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Input
                type="file"
                onChange={handlePhotoChange}
                accept="image/*"
                className="w-full max-w-xs"
              />
            </div>
            
            <div className="space-y-4">
              <Input
                name="name"
                value={data.name}
                onChange={handleChange}
                placeholder="Your Name"
              />
              
              <div className="space-y-2">
                <Select 
                  onValueChange={(value) => handleSelectChange('college', value)}
                  value={isOtherSelected ? 'Other' : data.college}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select College" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLEGES.map(college => (
                      <SelectItem key={college} value={college}>{college}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isOtherSelected && (
                  <Input
                    value={otherCollege}
                    onChange={handleOtherCollegeChange}
                    placeholder="Enter your college name"
                    className="mt-2"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select onValueChange={(value) => handleSelectChange('course', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Course" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSES.map(course => (
                      <SelectItem key={course} value={course}>{course}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => handleSelectChange('semester', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map(sem => (
                      <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Select onValueChange={(value) => handleSelectChange('branch', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {BRANCHES.map(branch => (
                    <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Textarea
              name="bio"
              value={data.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              className="min-h-[100px]"
            />

            <div>
              <h3 className="text-sm font-medium mb-2">Select up to 8 skills</h3>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map(skill => (
                  <Badge
                    key={skill}
                    variant={selectedSkills.includes(skill) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleSkillSelect(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Input
                name="github"
                value={data.github}
                onChange={handleChange}
                placeholder="GitHub Profile URL"
              />
              <Input
                name="linkedIn"
                value={data.linkedIn}
                onChange={handleChange}
                placeholder="LinkedIn Profile URL"
              />
            </div>

            <Select onValueChange={(value) => handleSelectChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your primary role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frontend">Frontend Developer</SelectItem>
                <SelectItem value="backend">Backend Developer</SelectItem>
                <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                <SelectItem value="devops">DevOps Engineer</SelectItem>
                <SelectItem value="ml">ML Engineer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <CardDescription>
              Add your best projects (at least one)
            </CardDescription>
            {data.projects.map((project, index) => (
              <Card key={index} className="p-4">
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
                />
              </Card>
            ))}
            <Button 
              onClick={addProject} 
              variant="outline" 
              className="w-full"
            >
              Add Another Project
            </Button>
          </div>
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
          <div className="flex justify-between mt-8">
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