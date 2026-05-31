import { HabitSubtaskList } from "@/components/habits/HabitSubtaskList";

export default function NutritionPage() {
  return (
    <HabitSubtaskList
      title="Nutrition"
      field="nutrition_done"
      textKey="nutrition_text"
      defaultSubtasks={[
        "Sattu",
        "3-4 eggs",
        "Green moong & chana bowl"
      ]}
    />
  );
}
