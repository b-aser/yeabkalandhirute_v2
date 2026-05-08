import { apiClient } from '@/integrations/api/client';
import { Upload } from 'lucide-react';
import React, { useState } from 'react'
import { toast } from 'sonner';

interface ContentEditorProps {
  form: Record<string, any>;
  setForm: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  refetch: () => void;
  settingsId?: string;
}

const ContentEditor = ({ form, setForm, refetch, settingsId }: ContentEditorProps) => {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  if (!settingsId) return null;

  const onChange = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(key);

    try {
      const { filename } = await apiClient.uploadWeddingImage(file);
      onChange(key, filename);
      await apiClient.updateWeddingSettings({ [key]: filename });
      refetch();
      toast.success("Image saved successfully.");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(null);
    }
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, wedding_date: new Date(form.wedding_date).toISOString() };



      await apiClient.updateWeddingSettings(payload);
      toast.success("Saved");
      refetch();
    } catch (error) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const fields: Array<[string, string, "input" | "textarea" | "datetime-local"]> = [
    ["bride_name", "Bride name", "input"],
    ["groom_name", "Groom name", "input"],
    ["wedding_date", "Wedding date & time", "datetime-local"],
    ["hero_eyebrow", "Hero eyebrow", "input"],
    ["hero_invite_text", "Hero Invite Text", "input"],
    ["tagline", "Tagline", "input"],

    ["story_greeting", "Story Greeting (e.g. Dearest Family...)", "input"],
    ["story_intro", "Story Introduction", "textarea"],
    ["story_title", "Story Title (Timeline section)", "input"],
    ["story_body", "Story Body (Timeline section)", "textarea"],
    ["story_quote", "Story Quote (Timeline section)", "textarea"],
    ["story_verse_text", "Story Verse Text", "input"],
    ["story_verse_reference", "Story Verse Reference", "input"],
    ["story_quote_2", "Second Story Quote", "textarea"],
    ["story_quote_2_reference", "Second Story Quote Reference", "input"],

    ["countdown_eyebrow", "Countdown Eyebrow", "input"],
    ["countdown_title", "Countdown Title", "input"],

    ["details_eyebrow", "Details Eyebrow", "input"],
    ["details_title", "Details Title", "input"],

    ["ceremony_title", "Ceremony title", "input"],
    ["ceremony_time", "Ceremony time", "input"],
    ["ceremony_venue", "Ceremony venue", "input"],
    ["ceremony_address", "Ceremony address (also used for map)", "input"],

    ["reception_title", "Reception title", "input"],
    ["reception_time", "Reception time", "input"],
    ["reception_venue", "Reception venue", "input"],
    ["reception_address", "Reception address", "input"],

    ["rsvp_eyebrow", "RSVP Eyebrow", "input"],
    ["rsvp_title", "RSVP Title", "input"],
    ["rsvp_message", "RSVP Invite Message", "textarea"],
    ["rsvp_success_message", "RSVP Success Message", "textarea"],
    ["rsvp_option_yes", "RSVP Option: Yes", "input"],
    ["rsvp_option_no", "RSVP Option: No", "input"],

    ["nav_countdown_label", "Nav: Countdown", "input"],
    ["nav_story_label", "Nav: Our Story", "input"],
    ["nav_schedule_label", "Nav: Schedule", "input"],
    ["nav_gallery_label", "Nav: Gallery", "input"],
    ["nav_rsvp_label", "Nav: RSVP", "input"],

    ["instagram_url", "Instagram URL", "input"],
    ["contact_email", "Contact Email", "input"],
    ["footer_made_with", "Footer Credit Text", "input"],
  ];

  return (
    <div className="space-y-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-4 border border-blush p-6 bg-white/50">
          <h3 className="text-[10px] tracking-[0.4em] uppercase text-gold font-medium">Hero Images</h3>
          <div className="grid grid-cols-2 gap-4">
            {["hero_image_path", "hero_image_2_path"].map((k) => (
              <div key={k} className="space-y-2">
                <label className="block text-[9px] uppercase tracking-wider text-warm-soft">{k.replace(/_/g, ' ')}</label>
                <div className="relative aspect-[3/4] bg-blush overflow-hidden group border border-blush/50">
                  {form[k] ? (
                    <img
                      src={form[k].startsWith('hero/') || !form[k].includes('://') ? apiClient.getGalleryImageUrl(form[k]) : form[k]}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-warm-soft italic text-[10px]">No image</div>
                  )}
                  <label className="absolute inset-0 bg-warm-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Upload className="text-cream w-5 h-5" />
                    <input type="file" className="hidden" onChange={(e) => onImageUpload(e, k)} disabled={uploading === k} />
                  </label>
                  {uploading === k && (
                    <div className="absolute inset-0 bg-cream/80 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-gold border-t-transparent animate-spin rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {fields.slice(0, 5).map(([k, label, kind]) => (
            <div key={k}>
              <label className="block text-[10px] tracking-[0.4em] uppercase text-warm-soft mb-2">{label}</label>
              <input
                type={kind}
                value={form[k] ?? ""}
                onChange={(e) => onChange(k, e.target.value)}
                className="w-full bg-white border border-blush px-3 py-2 text-warm-dark outline-none focus:border-gold rounded-none"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {fields.slice(5).map(([k, label, kind]) => (
          <div key={k} className={kind === "textarea" ? "md:col-span-2" : ""}>
            <label className="block text-[10px] tracking-[0.4em] uppercase text-warm-soft mb-2">{label}</label>
            {kind === "textarea" ? (
              <textarea
                rows={3}
                value={form[k] ?? ""}
                onChange={(e) => onChange(k, e.target.value)}
                className="w-full bg-white border border-blush px-3 py-2 text-warm-dark outline-none focus:border-gold rounded-none"
              />
            ) : (
              <input
                type={kind}
                value={form[k] ?? ""}
                onChange={(e) => onChange(k, e.target.value)}
                className="w-full bg-white border border-blush px-3 py-2 text-warm-dark outline-none focus:border-gold rounded-none"
              />
            )}
          </div>
        ))}
        <div className="md:col-span-2 flex justify-end pt-6">
          <button
            onClick={onSave}
            disabled={saving}
            className="px-10 py-3 border border-gold text-gold uppercase text-[11px] tracking-[0.4em] hover:bg-gold hover:text-warm-dark transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor