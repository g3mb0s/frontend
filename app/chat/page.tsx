import { ProtectedRoute } from "@/components/auth/protected-route";
import { Chat } from "@/components/chat";
import { AppHeader } from "@/components/layout/app-header";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <AppHeader />
        <Chat />
      </div>
    </ProtectedRoute>
  );
}
