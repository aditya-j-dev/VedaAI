'use client';

import { useState, useRef, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuthStore } from '@/store/authStore';
import { useAssignmentStore } from '@/store/assignmentStore';
import { profileApi } from '@/lib/api';
import { Camera, User, School as SchoolIcon, MapPin, Mail, Save, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { teacher, school, setAuth, updateTeacher, updateSchool } = useAuthStore();
  const { setProfile } = useAssignmentStore();

  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolLocation, setSchoolLocation] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with current values
  useEffect(() => {
    if (teacher) {
      setName(teacher.name || '');
      setAvatarPreview(teacher.avatarUrl || null);
    }
    if (school) {
      setSchoolName(school.name || '');
      setSchoolLocation(school.location || '');
    }
  }, [teacher, school]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !schoolName || !schoolLocation) {
      setError('Name, School Name, and School Location are required.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('schoolName', schoolName);
      formData.append('schoolLocation', schoolLocation);
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await profileApi.update(formData);
      const { teacher: updatedTeacher, school: updatedSchool } = res.data.data as any;

      // Update both stores immediately
      setAuth(
        { id: String(updatedTeacher._id), name: updatedTeacher.name, email: updatedTeacher.email, avatarUrl: updatedTeacher.avatarUrl, onboardingComplete: true },
        { id: String(updatedSchool._id), name: updatedSchool.name, location: updatedSchool.location }
      );
      setProfile(res.data.data); // Update assignmentStore (used in legacy places)
      
      toast.success('Profile updated successfully!');
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell breadcrumb="Profile Settings">
      <div className="max-w-3xl mx-auto py-6 px-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        <div className="bg-white rounded-3xl shadow-sm border border-[#e8eaed] overflow-hidden">
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600 relative">
            <div className="absolute -bottom-12 left-8">
              <div 
                className="relative w-24 h-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <span className="text-orange-500 font-bold text-3xl">{name.charAt(0) || 'T'}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white mb-1" />
                  <span className="text-white text-xs font-medium">Change</span>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg"
              />
            </div>
          </div>

          <div className="pt-16 pb-8 px-8">
            <h1 className="text-2xl font-bold text-[#171717] mb-1">Account Settings</h1>
            <p className="text-sm text-[#5d5d5d] mb-8">Update your personal and school details.</p>

            {error && (
              <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#2f2f2f]">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a9a9a9]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full h-11 pl-10 pr-4 bg-[#f6f6f6] border border-[#e8eaed] rounded-xl text-[15px] text-[#2f2f2f] outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all"
                    />
                  </div>
                </div>

                {/* Email (Read Only) */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#2f2f2f]">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a9a9a9]" />
                    <input
                      type="email"
                      value={teacher?.email || ''}
                      disabled
                      className="w-full h-11 pl-10 pr-4 bg-[#f0f0f0] border border-[#e8eaed] rounded-xl text-[15px] text-[#a9a9a9] outline-none cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-[#a9a9a9]">Email cannot be changed.</p>
                </div>

                {/* School Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#2f2f2f]">School Name</label>
                  <div className="relative">
                    <SchoolIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a9a9a9]" />
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      required
                      className="w-full h-11 pl-10 pr-4 bg-[#f6f6f6] border border-[#e8eaed] rounded-xl text-[15px] text-[#2f2f2f] outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all"
                    />
                  </div>
                </div>

                {/* School Location */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#2f2f2f]">School Location</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a9a9a9]" />
                    <input
                      type="text"
                      value={schoolLocation}
                      onChange={(e) => setSchoolLocation(e.target.value)}
                      required
                      className="w-full h-11 pl-10 pr-4 bg-[#f6f6f6] border border-[#e8eaed] rounded-xl text-[15px] text-[#2f2f2f] outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all"
                    />
                  </div>
                </div>

              </div>

              <div className="pt-6 mt-6 border-t border-[#e8eaed] flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-11 px-8 bg-[#171717] rounded-xl text-white font-medium hover:bg-[#2a2a2a] transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
