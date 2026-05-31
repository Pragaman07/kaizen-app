import { supabase } from "./client";
import { MasterExerciseInsert } from "@/types/database.types";

export async function seedPragamanPlan(userId: string) {
  const plan: MasterExerciseInsert[] = [
    // MONDAY
    {
      user_id: userId,
      day_of_week: "MON",
      exercise_name: "Standard Push-Ups",
      tracking_type: "reps",
      target_sets: 3,
      default_weight: 0,
      safety_note: "Keep your elbows tucked at a 45-degree angle to your body to completely protect your right shoulder."
    },
    {
      user_id: userId,
      day_of_week: "MON",
      exercise_name: "Diamond Push-Ups",
      tracking_type: "reps",
      target_sets: 3,
      default_weight: 0,
      safety_note: "Drop to your knees if your form breaks down."
    },
    {
      user_id: userId,
      day_of_week: "MON",
      exercise_name: "Single-Arm Dumbbell Bicep Curls",
      tracking_type: "reps",
      target_sets: 4,
      default_weight: 5,
      safety_note: null
    },
    {
      user_id: userId,
      day_of_week: "MON",
      exercise_name: "Single-Arm Dumbbell Tricep Kickbacks",
      tracking_type: "reps",
      target_sets: 3,
      default_weight: 5,
      safety_note: "Keep working upper arm parallel to the floor. This is much safer for your right shoulder than overhead extensions."
    },

    // TUESDAY
    {
      user_id: userId,
      day_of_week: "TUE",
      exercise_name: "Bodyweight Squats (Time Under Tension)",
      tracking_type: "reps",
      target_sets: 4,
      default_weight: 0,
      safety_note: "Go slow. Take 3 full seconds to lower yourself down, pause for 1 second at the bottom, and explode up."
    },
    {
      user_id: userId,
      day_of_week: "TUE",
      exercise_name: "Bulgarian Split Squats",
      tracking_type: "reps",
      target_sets: 3,
      default_weight: 5,
      safety_note: "Hold your 5kg dumbbell in your left hand (letting it hang straight down to avoid shoulder strain)."
    },
    {
      user_id: userId,
      day_of_week: "TUE",
      exercise_name: "Dumbbell Lunges",
      tracking_type: "reps",
      target_sets: 3,
      default_weight: 5,
      safety_note: null
    },
    {
      user_id: userId,
      day_of_week: "TUE",
      exercise_name: "Single-Leg Calf Raises",
      tracking_type: "reps",
      target_sets: 4,
      default_weight: 5,
      safety_note: null
    },

    // WEDNESDAY
    {
      user_id: userId,
      day_of_week: "WED",
      exercise_name: "Outdoor Run",
      tracking_type: "time",
      target_sets: 1,
      default_weight: 0,
      safety_note: "Do not sprint. Keep a steady, moderate pace."
    },
    {
      user_id: userId,
      day_of_week: "WED",
      exercise_name: "Planks",
      tracking_type: "time",
      target_sets: 3,
      default_weight: 0,
      safety_note: "Keep your body in a perfectly straight line from your shoulders to your heels. Do not let your hips sag toward the floor."
    },
    {
      user_id: userId,
      day_of_week: "WED",
      exercise_name: "Bicycle Crunches",
      tracking_type: "reps",
      target_sets: 3,
      default_weight: 0,
      safety_note: null
    },
    {
      user_id: userId,
      day_of_week: "WED",
      exercise_name: "Lying Leg Raises",
      tracking_type: "reps",
      target_sets: 3,
      default_weight: 0,
      safety_note: "Keep your legs straight and raise them up until they point at the ceiling, then lower them slowly without letting your heels touch the floor."
    },
    {
      user_id: userId,
      day_of_week: "WED",
      exercise_name: "Weighted Russian Twists",
      tracking_type: "reps",
      target_sets: 3,
      default_weight: 5,
      safety_note: null
    },

    // THURSDAY
    {
      user_id: userId,
      day_of_week: "THU",
      exercise_name: "Shoulder Rotations & Arm Circles",
      tracking_type: "time",
      target_sets: 1,
      default_weight: 0,
      safety_note: "Very slow, controlled circles to keep the shoulder joint lubricated and pain-free."
    },
    {
      user_id: userId,
      day_of_week: "THU",
      exercise_name: "Child’s Pose",
      tracking_type: "time",
      target_sets: 1,
      default_weight: 0,
      safety_note: null
    },
    {
      user_id: userId,
      day_of_week: "THU",
      exercise_name: "Hamstring & Quad Stretches",
      tracking_type: "time",
      target_sets: 1,
      default_weight: 0,
      safety_note: null
    },
    {
      user_id: userId,
      day_of_week: "THU",
      exercise_name: "Light Walk",
      tracking_type: "time",
      target_sets: 1,
      default_weight: 0,
      safety_note: null
    },

    // FRIDAY
    {
      user_id: userId,
      day_of_week: "FRI",
      exercise_name: "Standard Push-Ups (Tempo Focus)",
      tracking_type: "reps",
      target_sets: 3,
      default_weight: 0,
      safety_note: "Take 3 full seconds to lower your chest to the floor, then push up explosively. Keep elbows tucked."
    },
    {
      user_id: userId,
      day_of_week: "FRI",
      exercise_name: "Diamond Push-Ups",
      tracking_type: "reps",
      target_sets: 3,
      default_weight: 0,
      safety_note: null
    },
    {
      user_id: userId,
      day_of_week: "FRI",
      exercise_name: "Single-Arm Dumbbell Hammer Curls",
      tracking_type: "reps",
      target_sets: 4,
      default_weight: 5,
      safety_note: "Hold the dumbbell vertically like you are holding a hammer."
    },
    {
      user_id: userId,
      day_of_week: "FRI",
      exercise_name: "Single-Arm Dumbbell Floor Press",
      tracking_type: "reps",
      target_sets: 4,
      default_weight: 5,
      safety_note: "The floor physically stops your elbow from dropping too low, which provides 100% protection for your right shoulder joint."
    },

    // SATURDAY
    {
      user_id: userId,
      day_of_week: "SAT",
      exercise_name: "Dumbbell Goblet Squats",
      tracking_type: "reps",
      target_sets: 4,
      default_weight: 5,
      safety_note: "Hold your 5kg dumbbell vertically with both hands right against your chest."
    },
    {
      user_id: userId,
      day_of_week: "SAT",
      exercise_name: "Single-Leg Romanian Deadlifts (RDLs)",
      tracking_type: "reps",
      target_sets: 3,
      default_weight: 5,
      safety_note: "Keep your right knee slightly bent but stiff. Hinge at your hips, pushing your glutes straight back."
    },
    {
      user_id: userId,
      day_of_week: "SAT",
      exercise_name: "Reverse Dumbbell Lunges",
      tracking_type: "reps",
      target_sets: 3,
      default_weight: 5,
      safety_note: "Step backward into the lunge. This puts less stress on the knee joint."
    },
    {
      user_id: userId,
      day_of_week: "SAT",
      exercise_name: "Single-Leg Calf Raises",
      tracking_type: "reps",
      target_sets: 4,
      default_weight: 0,
      safety_note: "Move slowly—take 2 seconds to stretch the heel down, and 2 seconds to push up to the top."
    },

    // SUNDAY
    {
      user_id: userId,
      day_of_week: "SUN",
      exercise_name: "Planks",
      tracking_type: "time",
      target_sets: 3,
      default_weight: 0,
      safety_note: null
    },
    {
      user_id: userId,
      day_of_week: "SUN",
      exercise_name: "Bicycle Crunches",
      tracking_type: "reps",
      target_sets: 3,
      default_weight: 0,
      safety_note: null
    },
    {
      user_id: userId,
      day_of_week: "SUN",
      exercise_name: "Lying Leg Raises",
      tracking_type: "reps",
      target_sets: 3,
      default_weight: 0,
      safety_note: null
    },
    {
      user_id: userId,
      day_of_week: "SUN",
      exercise_name: "Trekking (The Hike)",
      tracking_type: "time",
      target_sets: 1,
      default_weight: 0,
      safety_note: null
    }
  ];

  const { error } = await supabase.from("master_exercises").insert(plan);

  if (error) {
    throw new Error(`Failed to seed plan: ${error.message}`);
  }
}
