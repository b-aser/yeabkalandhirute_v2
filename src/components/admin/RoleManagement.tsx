'use client';
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import { Search, UserPlus, Trash2, Shield, CheckCircle, User, Loader2, ChevronDown, ChevronUp, KeyRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/integrations/api/client";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";

type Role = "bride" | "groom" | "organizer";

const ROLE_META: Record<Role, { label: string; color: string; bg: string }> = {
  bride:     { label: "Bride",           color: "text-rose-700",   bg: "bg-rose-50 border-rose-200" },
  groom:     { label: "Groom",           color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  organizer: { label: "Event Organizer", color: "text-amber-700",  bg: "bg-amber-50 border-amber-200" },
};

export default function RoleManagement() {
  const { activeWeddingId } = useAuth();
  const qc = useQueryClient();
  const wid = activeWeddingId ?? "";

  // ── create user state ─────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const createMutation = useMutation({
    mutationFn: () => apiClient.createUser(newEmail.trim(), newPassword),
    onSuccess: (created) => {
      toast.success(`Account created for ${created.email}`);
      setNewEmail("");
      setNewPassword("");
      setShowCreate(false);
      // Pre-fill search so admin can immediately assign a role
      setQuery(created.email);
      setSearched(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── search state ──────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>("organizer");

  const {
    data: searchResults = [],
    isFetching: searching,
    refetch: doSearch,
  } = useQuery({
    queryKey: ["user-search", query],
    queryFn: () => apiClient.searchUsers(query),
    enabled: false,
  });

  const handleSearch = async () => {
    if (query.trim().length < 2) return toast.error("Enter at least 2 characters.");
    setSearched(true);
    setSelectedUser(null);
    doSearch();
  };

  // ── existing roles ────────────────────────────────────────────
  const { data: roles = [] } = useQuery({
    queryKey: ["roles", wid],
    queryFn: () => apiClient.getWeddingRoles(wid),
    enabled: !!wid,
  });

  const assignedUserIds = new Set((roles as any[]).map((r: any) => r.user_id));

  // ── mutations ─────────────────────────────────────────────────
  const assignMutation = useMutation({
    mutationFn: () => apiClient.assignWeddingRole(wid, selectedUser!.id, selectedRole),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles", wid] });
      toast.success(`${ROLE_META[selectedRole].label} role assigned to ${selectedUser!.email}`);
      setSelectedUser(null);
      setQuery("");
      setSearched(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMutation = useMutation({
    mutationFn: (roleId: string) => apiClient.removeWeddingRole(wid, roleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles", wid] });
      toast.success("Role removed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const permMutation = useMutation({
    mutationFn: ({ orgUserId, field, value }: { orgUserId: string; field: string; value: boolean }) =>
      apiClient.updateOrganizerPermissions(wid, orgUserId, { [field]: value }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles", wid] }),
    onError: (e: Error) => toast.error(e.message),
  });

  if (!wid) return (
    <div className="min-h-[60vh] flex items-center justify-center text-[#9a7b4f]">
      No wedding selected. Go back to the Admin dashboard and make sure a wedding is active.
    </div>
  );

  const filledRoles = {
    bride:     (roles as any[]).some((r: any) => r.role === "bride"),
    groom:     (roles as any[]).some((r: any) => r.role === "groom"),
    organizer: (roles as any[]).filter((r: any) => r.role === "organizer").length,
  };

  return (
    <div className="space-y-8">

      {/* ── Role slots overview ───────────────────────────────── */}
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.35em] text-warm-soft mb-4">Role Slots</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["bride", "groom"] as Role[]).map(r => (
            <div key={r} className={`rounded-xl border p-4 ${filledRoles[r] ? ROLE_META[r].bg : "bg-white border-[#e8d9c0]"}`}>
              <p className={`text-xs uppercase tracking-widest font-medium ${filledRoles[r] ? ROLE_META[r].color : "text-[#9a7b4f]"}`}>
                {ROLE_META[r].label}
              </p>
              <p className="text-sm mt-1 text-[#3a2a1a]">
                {filledRoles[r]
                  ? (roles as any[]).find((x: any) => x.role === r)?.email
                  : <span className="text-[#c8a96e] italic">not assigned</span>}
              </p>
            </div>
          ))}
          {[0, 1].map(i => {
            const org = (roles as any[]).filter((r: any) => r.role === "organizer")[i];
            return (
              <div key={i} className={`rounded-xl border p-4 ${org ? ROLE_META.organizer.bg : "bg-white border-[#e8d9c0]"}`}>
                <p className={`text-xs uppercase tracking-widest font-medium ${org ? ROLE_META.organizer.color : "text-[#9a7b4f]"}`}>
                  Organizer {i + 1}
                </p>
                <p className="text-sm mt-1 text-[#3a2a1a]">
                  {org ? org.email : <span className="text-[#c8a96e] italic">not assigned</span>}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Create user account ──────────────────────────────── */}
      <div className="bg-white border border-[#e8d9c0] rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#fdf8f0] transition-colors"
          onClick={() => setShowCreate(v => !v)}
        >
          <div className="flex items-center gap-3">
            <KeyRound className="w-5 h-5 text-[#b8860b]" />
            <div className="text-left">
              <p className="font-semibold text-[#3a2a1a]">Create a New Account</p>
              <p className="text-xs text-[#9a7b4f] mt-0.5">
                Create a login for someone who hasn't signed up yet.
              </p>
            </div>
          </div>
          {showCreate ? <ChevronUp className="w-4 h-4 text-[#9a7b4f]" /> : <ChevronDown className="w-4 h-4 text-[#9a7b4f]" />}
        </button>

        {showCreate && (
          <div className="px-6 pb-6 pt-2 border-t border-[#f0e8d8] space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#9a7b4f] mb-1.5 block">
                Email address
              </label>
              <Input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="bride@example.com"
                className="border-[#e8d9c0]"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#9a7b4f] mb-1.5 block">
                Temporary password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="min. 6 characters"
                  className="border-[#e8d9c0] pr-24"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-widest text-[#9a7b4f] hover:text-[#b8860b]"
                >
                  {showPassword ? "hide" : "show"}
                </button>
              </div>
              <p className="text-xs text-[#9a7b4f] mt-1">
                Share these credentials with the person so they can sign in.
              </p>
            </div>
            <Button
              className="w-full bg-[#b8860b] hover:bg-[#9a6e09] text-white"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !newEmail.trim() || newPassword.length < 6}
            >
              {createMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating…</>
                : "Create Account"
              }
            </Button>
          </div>
        )}
      </div>

      {/* ── Assign new role ───────────────────────────────────── */}
      <div className="bg-white border border-[#e8d9c0] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e8d9c0] flex items-center gap-3">
          <UserPlus className="w-5 h-5 text-[#b8860b]" />
          <div>
            <h2 className="font-semibold text-[#3a2a1a]">Assign a Role</h2>
            <p className="text-xs text-[#9a7b4f] mt-0.5">Search by email, pick the person, choose a role.</p>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Step 1 — Search */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#9a7b4f] mb-3">
              Step 1 — Find user by email
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c8a96e]" />
                <Input
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSearched(false); setSelectedUser(null); }}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder="e.g. bride@example.com"
                  className="pl-9 border-[#e8d9c0]"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={searching || query.trim().length < 2}
                className="bg-[#b8860b] hover:bg-[#9a6e09] text-white gap-2"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </Button>
            </div>

            {/* Results */}
            {searched && !searching && (
              <div className="mt-3 space-y-2">
                {(searchResults as any[]).length === 0 ? (
                  <p className="text-sm text-[#9a7b4f] py-2">
                    No users found. Ask them to sign up at <span className="font-mono text-[#b8860b]">/auth</span> first.
                  </p>
                ) : (
                  (searchResults as any[]).map((u: any) => {
                    const alreadyAssigned = assignedUserIds.has(u.id);
                    const isSelected = selectedUser?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        disabled={alreadyAssigned}
                        onClick={() => setSelectedUser({ id: u.id, email: u.email })}
                        className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-all ${
                          alreadyAssigned
                            ? "opacity-50 cursor-not-allowed border-[#e8d9c0] bg-[#fdf8f0]"
                            : isSelected
                            ? "border-[#b8860b] bg-amber-50 ring-1 ring-[#b8860b]"
                            : "border-[#e8d9c0] hover:border-[#b8860b] bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#f0e8d8] flex items-center justify-center">
                            <User className="w-4 h-4 text-[#9a7b4f]" />
                          </div>
                          <div>
                            <p className="font-medium text-[#3a2a1a] text-sm">{u.email}</p>
                            <p className="text-xs text-[#9a7b4f] font-mono">{u.id}</p>
                          </div>
                        </div>
                        {alreadyAssigned
                          ? <span className="text-xs text-[#9a7b4f] bg-[#f0e8d8] px-2 py-0.5 rounded">already assigned</span>
                          : isSelected
                          ? <CheckCircle className="w-5 h-5 text-[#b8860b]" />
                          : <span className="text-xs text-[#c8a96e]">Select</span>
                        }
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Step 2 — Pick role (only shown once a user is selected) */}
          {selectedUser && (
            <div className="border-t border-[#f0e8d8] pt-5">
              <p className="text-[11px] uppercase tracking-[0.35em] text-[#9a7b4f] mb-3">
                Step 2 — Choose role for <span className="text-[#3a2a1a] normal-case tracking-normal font-medium">{selectedUser.email}</span>
              </p>
              <div className="flex gap-2 mb-5">
                {(Object.entries(ROLE_META) as [Role, typeof ROLE_META[Role]][]).map(([r, meta]) => {
                  const unavailable =
                    (r === "bride" && filledRoles.bride) ||
                    (r === "groom" && filledRoles.groom) ||
                    (r === "organizer" && filledRoles.organizer >= 2);
                  return (
                    <button
                      key={r}
                      disabled={unavailable}
                      onClick={() => setSelectedRole(r)}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${
                        unavailable
                          ? "opacity-40 cursor-not-allowed border-[#e8d9c0] text-[#9a7b4f]"
                          : selectedRole === r
                          ? `border-current ${meta.bg} ${meta.color}`
                          : "border-[#e8d9c0] text-[#5c3d1e] hover:border-[#b8860b]"
                      }`}
                    >
                      {meta.label}
                      {unavailable && <span className="block text-[10px] font-normal mt-0.5">slot filled</span>}
                    </button>
                  );
                })}
              </div>
              <Button
                className="w-full bg-[#b8860b] hover:bg-[#9a6e09] text-white"
                onClick={() => assignMutation.mutate()}
                disabled={assignMutation.isPending}
              >
                {assignMutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Assigning…</>
                  : <>Assign {ROLE_META[selectedRole].label} role to {selectedUser.email}</>
                }
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Current assignments ───────────────────────────────── */}
      {(roles as any[]).length > 0 && (
        <div className="bg-white border border-[#e8d9c0] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e8d9c0] flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#b8860b]" />
            <h2 className="font-semibold text-[#3a2a1a]">Current Assignments</h2>
          </div>
          <div className="divide-y divide-[#f0e8d8]">
            {(roles as any[]).map((r: any) => (
              <div key={r.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`px-2.5 py-1 rounded-lg border text-xs font-medium uppercase tracking-wider ${ROLE_META[r.role as Role]?.bg} ${ROLE_META[r.role as Role]?.color}`}>
                      {ROLE_META[r.role as Role]?.label ?? r.role}
                    </div>
                    <div>
                      <p className="font-medium text-[#3a2a1a] text-sm">{r.email}</p>
                      <p className="text-xs text-[#9a7b4f] font-mono mt-0.5">{r.user_id}</p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (confirm(`Remove ${ROLE_META[r.role as Role]?.label ?? r.role} role from ${r.email}?`))
                        removeMutation.mutate(r.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {r.role === "organizer" && (
                  <div className="mt-4 pl-4 border-l-2 border-[#f0e8d8] space-y-3">
                    <p className="text-[10px] uppercase tracking-widest text-[#9a7b4f]">Permissions</p>
                    {[
                      { key: "can_add_guests",          label: "Can add guests",                      value: r.can_add_guests },
                      { key: "can_delete_guests",        label: "Can delete guests",                   value: r.can_delete_guests },
                      { key: "requires_couple_approval", label: "Require couple approval for changes", value: r.requires_couple_approval },
                    ].map(p => (
                      <div key={p.key} className="flex items-center justify-between">
                        <span className="text-sm text-[#5c3d1e]">{p.label}</span>
                        <Switch
                          checked={!!p.value}
                          onCheckedChange={v => permMutation.mutate({ orgUserId: r.user_id, field: p.key, value: v })}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
