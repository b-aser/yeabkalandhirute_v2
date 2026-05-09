'use client';
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/integrations/api/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { InvitationCard } from "@/components/guests/InvitationCard";
import { Users, Plus, Trash2, Eye, ChevronDown, ChevronUp, CheckCircle, Clock, XCircle, ArrowLeft } from "lucide-react";

type Guest = {
  id: string; name: string; email: string; phone: string;
  entrance_code: string; qr_code_data: string; attending: string;
  checked_in: boolean; plus_ones_allowed: number; family_count: number;
  invitation_text: string; notes: string;
};

export default function GuestManagement() {
  const { activeWeddingId } = useAuth();
  const qc = useQueryClient();
  const wid = activeWeddingId ?? "";

  const [showAdd, setShowAdd] = useState(false);
  const [invitationGuest, setInvitationGuest] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", invitation_text: "",
    plus_ones_allowed: 0, family_count: 0, notes: "",
  });

  const { data: guests = [], isLoading } = useQuery({
    queryKey: ["guests", wid],
    queryFn: () => apiClient.getGuests(wid),
    enabled: !!wid,
  });

  const { data: invitationData } = useQuery({
    queryKey: ["invitation", wid, invitationGuest],
    queryFn: () => apiClient.getGuestInvitation(wid, invitationGuest!),
    enabled: !!wid && !!invitationGuest,
  });

  const { data: pending = [] } = useQuery({
    queryKey: ["pending", wid],
    queryFn: () => apiClient.getPendingChanges(wid),
    enabled: !!wid,
  });

  const addMutation = useMutation({
    mutationFn: (data: typeof form) => apiClient.addGuest(wid, data),
    onSuccess: (result: any) => {
      qc.invalidateQueries({ queryKey: ["guests", wid] });
      if (result?.pending) {
        toast.info("Guest add request submitted for couple approval.");
      } else {
        toast.success("Guest added successfully.");
      }
      setShowAdd(false);
      setForm({ name: "", email: "", phone: "", invitation_text: "", plus_ones_allowed: 0, family_count: 0, notes: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (guestId: string) => apiClient.deleteGuest(wid, guestId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["guests", wid] }); toast.success("Guest removed."); },
    onError: (e: Error) => toast.error(e.message),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "approved" | "rejected" }) =>
      apiClient.reviewPendingChange(wid, id, decision),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["guests", wid] });
      qc.invalidateQueries({ queryKey: ["pending", wid] });
      toast.success("Change reviewed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (guests as Guest[]).filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.email?.toLowerCase().includes(search.toLowerCase()) ||
    g.entrance_code.includes(search.toUpperCase())
  );

  const attendingBadge = (s: string) => {
    if (s === "yes") return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
    if (s === "no") return <Badge className="bg-red-100 text-red-800 border-red-300"><XCircle className="w-3 h-3 mr-1" />Declined</Badge>;
    return <Badge className="bg-amber-100 text-amber-800 border-amber-300"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
  };

  if (!wid) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      No wedding selected. Please select a wedding from the dashboard.
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdf8f0] p-6">
      <div className="max-w-5xl mx-auto">
        <a href="/admin/organise" className="flex my-4 gap-4 text-xl items-center font-serif"><ArrowLeft/> Back</a>
        <div className="flex items-center justify-between mb-6">
             
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-[#b8860b]" />
            <h1 className="text-2xl font-serif text-[#5c3d1e]">Guest Management</h1>
          </div>
          <Button onClick={() => setShowAdd(true)} className="bg-[#b8860b] hover:bg-[#9a6e09] text-white gap-2">
            <Plus className="w-4 h-4" /> Add Guest
          </Button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Guests", value: (guests as Guest[]).length },
            { label: "Confirmed", value: (guests as Guest[]).filter(g => g.attending === "yes").length },
            { label: "Checked In", value: (guests as Guest[]).filter(g => g.checked_in).length },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#e8d9c0] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#5c3d1e]">{s.value}</p>
              <p className="text-xs uppercase tracking-widest text-[#9a7b4f]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Pending approvals */}
        {(pending as any[]).length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-amber-800 mb-3">Pending Approvals ({(pending as any[]).length})</h2>
            <div className="space-y-2">
              {(pending as any[]).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between bg-white rounded p-3 border border-amber-100">
                  <div>
                    <span className="text-sm font-medium text-gray-800 capitalize">{c.change_type}</span>
                    <span className="text-xs text-gray-500 ml-2">by {c.requested_by_email}</span>
                    {c.proposed_data?.name && <span className="text-xs text-gray-600 ml-2">— {c.proposed_data.name}</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7"
                      onClick={() => reviewMutation.mutate({ id: c.id, decision: "approved" })}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 border-red-300 text-red-600"
                      onClick={() => reviewMutation.mutate({ id: c.id, decision: "rejected" })}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <Input
          placeholder="Search by name, email, or entrance code…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-4 border-[#e8d9c0]"
        />

        {/* Guest table */}
        {isLoading ? (
          <div className="text-center py-12 text-[#9a7b4f]">Loading guests…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-[#9a7b4f]">No guests yet. Add your first guest above.</div>
        ) : (
          <div className="bg-white border border-[#e8d9c0] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#fdf8f0] border-b border-[#e8d9c0]">
                <tr>
                  {["Name", "Email", "Entrance Code", "Status", "Checked In", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-widest text-[#9a7b4f]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((g: Guest) => (
                  <tr key={g.id} className="border-b border-[#f0e8d8] hover:bg-[#fdf8f0]">
                    <td className="px-4 py-3 font-medium text-[#3a2a1a]">{g.name}</td>
                    <td className="px-4 py-3 text-gray-500">{g.email || "—"}</td>
                    <td className="px-4 py-3 font-mono text-[#5c3d1e] font-bold tracking-wider">{g.entrance_code}</td>
                    <td className="px-4 py-3">{attendingBadge(g.attending)}</td>
                    <td className="px-4 py-3">
                      {g.checked_in
                        ? <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Yes</span>
                        : <span className="text-gray-400">No</span>}
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <Button size="icon" variant="ghost" title="View Invitation"
                        onClick={() => setInvitationGuest(g.id)}>
                        <Eye className="w-4 h-4 text-[#b8860b]" />
                      </Button>
                      <Button size="icon" variant="ghost" title="Remove Guest"
                        onClick={() => { if (confirm(`Remove ${g.name}?`)) deleteMutation.mutate(g.id); }}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Guest Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#5c3d1e]">Add Guest</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="Full name *" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <Input placeholder="Phone" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Textarea placeholder="Custom invitation text (optional)" value={form.invitation_text}
              onChange={e => setForm(f => ({ ...f, invitation_text: e.target.value }))} rows={3} />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Plus-ones allowed</label>
                <Input type="number" min={0} value={form.plus_ones_allowed}
                  onChange={e => setForm(f => ({ ...f, plus_ones_allowed: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Family count</label>
                <Input type="number" min={0} value={form.family_count}
                  onChange={e => setForm(f => ({ ...f, family_count: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <Textarea placeholder="Internal notes (optional)" value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            <Button className="w-full bg-[#b8860b] hover:bg-[#9a6e09] text-white"
              onClick={() => addMutation.mutate(form)}
              disabled={!form.name.trim() || addMutation.isPending}>
              {addMutation.isPending ? "Adding…" : "Add Guest"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invitation Card Dialog */}
      <Dialog open={!!invitationGuest} onOpenChange={open => !open && setInvitationGuest(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#5c3d1e]">Digital Invitation</DialogTitle>
          </DialogHeader>
          {invitationData && (
            <InvitationCard guest={invitationData.guest} wedding={invitationData.wedding} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
