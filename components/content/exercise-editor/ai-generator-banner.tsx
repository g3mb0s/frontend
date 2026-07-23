import { Button } from "@/components/ui/button";

export function AiGeneratorBanner({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 p-[1px] shadow-sm">
      <div className="flex flex-col gap-5 rounded-[15px] bg-slate-950 px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-xl" aria-hidden="true">✦</span>
          <div>
            <h2 className="font-semibold">Создать упражнение с ИИ</h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">Задайте тему и параметры — поля редактора заполнятся автоматически.</p>
          </div>
        </div>
        <Button variant="secondary" className="shrink-0 border-white/20 bg-white text-slate-950 hover:bg-indigo-50" onClick={onOpen}>
          ✦ Сгенерировать
        </Button>
      </div>
    </section>
  );
}
