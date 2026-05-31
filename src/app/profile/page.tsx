"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useUserStore } from "@/lib/store/useUserStore";

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    current_weight: "",
    target_weight: "",
    height: "",
    primary_goal: "",
    activity_level: "",
    experience_level: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return router.push('/login');
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data && !error) {
        setFormData({
          name: data.name || user.user_metadata?.full_name || "",
          current_weight: data.current_weight?.toString() || "",
          target_weight: data.target_weight?.toString() || "",
          height: data.height?.toString() || "",
          primary_goal: data.primary_goal || "",
          activity_level: data.activity_level || "",
          experience_level: data.experience_level || "",
        });
      }
      setIsFetching(false);
    }
    loadProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Session lost. Please log in again.");
      return router.push('/login');
    }

    const { error } = await supabase
      .from('users')
      .update({
        name: formData.name,
        current_weight: formData.current_weight ? parseFloat(formData.current_weight) : null,
        target_weight: formData.target_weight ? parseFloat(formData.target_weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        primary_goal: formData.primary_goal || null,
        activity_level: formData.activity_level || null,
        experience_level: formData.experience_level || null,
      })
      .eq('id', user.id);

    if (error) {
      setIsLoading(false);
      return alert("Failed to save profile: " + error.message);
    }

    alert("Profile updated successfully!");
    setIsLoading(false);
    useUserStore.getState().setActiveUser(user.id);
    router.refresh();
  };

  if (isFetching) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-[#888780] animate-pulse">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center bg-[#F8F7F4] p-4 sm:p-8 min-h-[calc(100vh-3.5rem)]">
      <div className="w-full max-w-2xl rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-sm sm:p-10 mb-8">
        <div className="mb-8 border-b border-[#e4e4e7] pb-6">
          <h1 className="font-heading text-3xl text-[#2C2C2A]">Your Profile</h1>
          <p className="mt-2 text-[#888780]">Manage your personal details and fitness goals.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#2C2C2A]">
                Display Name <span className="text-[#ef4444]">*</span>
              </label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#d4d4d8] bg-[#f4f4f5] px-4 py-3 text-sm focus:border-[#FFC857] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FFC857]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#2C2C2A]">
                  Current Weight (kg) <span className="text-[#ef4444]">*</span>
                </label>
                <input
                  required
                  type="number"
                  step="0.1"
                  name="current_weight"
                  value={formData.current_weight}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#d4d4d8] bg-[#f4f4f5] px-4 py-3 text-sm focus:border-[#FFC857] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FFC857]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#2C2C2A]">
                  Target Weight (kg) <span className="text-[#ef4444]">*</span>
                </label>
                <input
                  required
                  type="number"
                  step="0.1"
                  name="target_weight"
                  value={formData.target_weight}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#d4d4d8] bg-[#f4f4f5] px-4 py-3 text-sm focus:border-[#FFC857] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FFC857]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#2C2C2A]">
                Height (cm) <span className="text-[#a1a1aa]">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.1"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#d4d4d8] bg-[#f4f4f5] px-4 py-3 text-sm focus:border-[#FFC857] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FFC857]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#2C2C2A]">
                Primary Fitness Goal <span className="text-[#a1a1aa]">(Optional)</span>
              </label>
              <select
                name="primary_goal"
                value={formData.primary_goal}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#d4d4d8] bg-[#f4f4f5] px-4 py-3 text-sm focus:border-[#FFC857] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FFC857]"
              >
                <option value="">Select a goal</option>
                <option value="Hypertrophy">Hypertrophy (Build Muscle)</option>
                <option value="Cut">Cut (Lose Fat)</option>
                <option value="Recomposition">Recomposition</option>
                <option value="Endurance">Endurance</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#2C2C2A]">
                Current Activity Level <span className="text-[#a1a1aa]">(Optional)</span>
              </label>
              <select
                name="activity_level"
                value={formData.activity_level}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#d4d4d8] bg-[#f4f4f5] px-4 py-3 text-sm focus:border-[#FFC857] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FFC857]"
              >
                <option value="">Select activity level</option>
                <option value="Sedentary">Sedentary</option>
                <option value="Lightly Active">Lightly Active</option>
                <option value="Moderately Active">Moderately Active</option>
                <option value="Highly Active">Highly Active</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#2C2C2A]">
                Experience Level <span className="text-[#a1a1aa]">(Optional)</span>
              </label>
              <select
                name="experience_level"
                value={formData.experience_level}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#d4d4d8] bg-[#f4f4f5] px-4 py-3 text-sm focus:border-[#FFC857] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FFC857]"
              >
                <option value="">Select experience level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[#1A2237] py-4 text-center text-sm font-bold text-[#FFC857] transition-colors hover:bg-[#2C2C2A] disabled:opacity-50 mt-4"
          >
            {isLoading ? "Saving Changes..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
