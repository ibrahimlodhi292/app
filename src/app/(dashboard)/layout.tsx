import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#050508] text-white overflow-hidden">
      <div className="fixed inset-0 mesh-bg pointer-events-none opacity-30" />
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto scrollbar-hidden relative">
        {children}
      </main>
    </div>
  );
}
