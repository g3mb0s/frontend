import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppHeader } from "@/components/layout/app-header";
import { StudiedClipView } from "@/components/movies/studied-clip-view";

export default async function StudiedClipPage({ params }: { params: Promise<{ clipId: string }> }) {
  const { clipId } = await params;
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <AppHeader />
        <main className="mx-auto max-w-4xl px-6 py-10">
          <Link href="/clips" className="text-sm font-medium text-slate-500 hover:text-slate-950">← Добавленные клипы</Link>
          <div className="mt-6"><StudiedClipView clipId={clipId} /></div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
