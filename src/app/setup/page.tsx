"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function SetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    current_weight: "",
    target_weight: "",
    height: "",
    primary_goal: "",
    activity_level: "",
    experience_level: "",
  });
  
  const [commitment, setCommitment] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.user_metadata?.full_name || prev.name
        }));
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitment) return alert("You must commit to the Kaizen philosophy.");
    
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
        profile_completed: true,
      })
      .eq('id', user.id);

    if (error) {
      setIsLoading(false);
      return alert("Failed to save profile: " + error.message);
    }

    // Refresh the router to let middleware re-evaluate routes
    router.refresh();
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F7F4] p-4 sm:p-8">
      <div className="w-full max-w-lg rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-sm sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-heading text-3xl text-[#2C2C2A]">Welcome to Kaizen</h1>
          <p className="text-[#888780]">Let's build your foundation.</p>
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

          <div className="mt-8 rounded-xl bg-[#fafafa] p-4 border border-[#e4e4e7]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={commitment}
                onChange={(e) => setCommitment(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-[#1A2237] focus:ring-[#FFC857]"
              />
              <span className="text-sm font-medium text-[#2C2C2A]">
                I commit to the Kaizen philosophy. 1% better, every single day.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !commitment}
            className="w-full rounded-xl bg-[#1A2237] py-4 text-center text-sm font-bold text-[#FFC857] transition-colors hover:bg-[#2C2C2A] disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Start Journey"}
          </button>
        </form>
      </div>
    </div>
  );
}
