import { HabitSubtaskList } from "@/components/habits/HabitSubtaskList";

export default function NightRoutinePage() {
  return (
    <HabitSubtaskList
      title="Night Routine"
      field="night_routine_done"
      textKey="night_routine_text"
      defaultSubtasks={[
        "500ml milk",
        "Walnuts",
        "Nut mix"
      ]}
    />
  );
}
