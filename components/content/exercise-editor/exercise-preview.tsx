import type { ExerciseInput } from "@/lib/content/types";
import { Modal } from "@/components/ui/modal";
import { MaterialRenderer } from "../material-renderer";

export function ExercisePreview({ exercise, exerciseId, onClose }: { exercise: ExerciseInput; exerciseId?: string; onClose: () => void }) {
  return (
    <Modal title={exercise.title || "Предпросмотр упражнения"} onClose={onClose}>
      <MaterialRenderer type="exercise" content={{ id: exerciseId ?? "preview", title: exercise.title, status: exercise.metadata.status, level: exercise.level, payload: { ...exercise, id: exerciseId ?? "00000000-0000-4000-8000-000000000000" } }} />
    </Modal>
  );
}
