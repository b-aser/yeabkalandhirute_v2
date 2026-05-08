'use client'
import ContentEditor from '@/components/admin/ContentEditor'
import GalleryEditor from '@/components/admin/GalleryEditor'
import RoleManagement from '@/components/admin/RoleManagement'
import RsvpList from '@/components/admin/RsvpList'
import ScheduleEditor from '@/components/admin/ScheduleEditor'
import TimelineEditor from '@/components/admin/TimelineEditor'
import { useAuth } from '@/hooks/useAuth'
import { useWeddingSettings } from '@/hooks/useWeddingData'
import { Eye } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import Home from '../page'

type Tab = "content" | "timeline" | "gallery" | "schedule" | "rsvps" | "roles" | "preview";

const Admin = () => {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>("content");

  const { data: dbSettings, refetch: refetchSettings } = useWeddingSettings();
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (dbSettings) {
      const settings = dbSettings as any;
      const dt = new Date(settings.wedding_date);
      const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setForm({ ...settings, wedding_date: local });
    }
  }, [dbSettings]);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-warm-soft tracking-[0.2em] uppercase text-sm">Not authorised</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard</title>
        <meta name="description" content="Manage your wedding website content." />
      </Helmet>

      {/* Tab navigation */}
      <nav className="px-6 md:px-10 py-4 flex gap-6 border-b border-blush/60 overflow-x-auto bg-white/20">
        {(["content", "timeline", "gallery", "schedule", "rsvps", "roles", "preview"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-[11px] tracking-[0.3em] uppercase pb-1 border-b-2 transition-colors whitespace-nowrap ${
              tab === t
                ? "border-gold text-warm-dark"
                : "border-transparent text-warm-soft hover:text-warm-dark"
            }`}
          >
            {t === "preview" ? (
              <span className="flex items-center gap-2">
                <Eye className="w-3 h-3" /> {t}
              </span>
            ) : (
              t
            )}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <div className="px-6 md:px-10 py-10 max-w-5xl mx-auto">
        {tab === "content" && (
          <ContentEditor
            form={form}
            setForm={setForm}
            refetch={refetchSettings}
            settingsId={(dbSettings as any)?.id}
          />
        )}
        {tab === "timeline" && <TimelineEditor />}
        {tab === "gallery" && <GalleryEditor />}
        {tab === "schedule" && <ScheduleEditor />}
        {tab === "rsvps" && <RsvpList />}
        {tab === "roles" && <RoleManagement />}
        {tab === "preview" && (
          <div className="border-[10px] border-warm-dark/5 rounded-xl overflow-hidden shadow-2xl bg-cream">
            <div className="bg-warm-dark text-cream px-4 py-2 text-[10px] tracking-[0.2em] uppercase flex justify-between items-center">
              <span>Live Preview (Unsaved Changes)</span>
              <span className="opacity-50">wedding-bloom-studio.preview</span>
            </div>
            <div className="h-[80vh] overflow-y-auto">
              <Home previewData={form} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Admin;