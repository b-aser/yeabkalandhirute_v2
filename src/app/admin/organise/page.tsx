'use client';
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/integrations/api/client";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Users, ScanLine, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrganizerDashboard() {
  const { user, setActiveWeddingId } = useAuth();

  const { data: weddings = [], isLoading } = useQuery({
    queryKey: ["my-weddings"],
    queryFn: () => apiClient.getMyWeddings(),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf8f0]">
        <p className="text-[#9a7b4f]">Loading your weddings…</p>
      </div>
    );
  }

  if ((weddings as any[]).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf8f0]">
        <div className="text-center">
          <CalendarDays className="w-12 h-12 text-[#c8a96e] mx-auto mb-4" />
          <p className="text-[#5c3d1e] text-lg font-serif">No weddings assigned</p>
          <p className="text-[#9a7b4f] text-sm mt-2">You have not been assigned as an organizer to any wedding yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8f0] p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-serif text-[#5c3d1e] mb-2">Organizer Dashboard</h1>
        <p className="text-[#9a7b4f] text-sm mb-8">Select a wedding to manage guests or open gate authentication.</p>

        <div className="space-y-4">
          {(weddings as any[]).map((w: any) => {
            const date = new Date(w.wedding_date).toLocaleDateString("en-US", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            });
            return (
              <div key={w.id} className="bg-white border border-[#e8d9c0] rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-serif text-[#3a2a1a]">
                      {w.bride_name} <span className="text-[#b8860b]">&</span> {w.groom_name}
                    </h2>
                    <p className="text-sm text-[#9a7b4f] mt-1">{date}</p>
                    {w.role && (
                      <span className="inline-block mt-2 text-xs uppercase tracking-widest bg-[#fdf8f0] border border-[#e8d9c0] text-[#9a7b4f] px-2 py-0.5 rounded">
                        {w.role}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <Button asChild className="bg-[#b8860b] hover:bg-[#9a6e09] text-white gap-2"
                    onClick={() => setActiveWeddingId(w.id)}>
                    <Link href="/admin/organise/guests">
                      <Users className="w-4 h-4" /> Manage Guests
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-[#c8a96e] text-[#5c3d1e] gap-2"
                    onClick={() => setActiveWeddingId(w.id)}>
                    <Link href="/admin/organise/gate">
                      <ScanLine className="w-4 h-4" /> Gate Authentication
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
