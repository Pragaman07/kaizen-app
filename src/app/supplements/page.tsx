import { HabitSubtaskList } from "@/components/habits/HabitSubtaskList";

export default function SupplementsPage() {
  return (
    <HabitSubtaskList
      title="Supplements"
      field="supplements_done"
      textKey="supplements_text"
      defaultSubtasks={[
        "Creatine (3-5g)",
        "Whey Protein",
        "Omega-3",
        "Vitamin D3",
        "Vitamin B12"
      ]}
    />
  );
}
