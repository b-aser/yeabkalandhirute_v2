import { useTimeline } from '@/hooks/useWeddingData';
import { apiClient } from '@/integrations/api/client';
import { Plus, Trash2 } from 'lucide-react';
import React from 'react'
import { toast } from 'sonner';

const TimelineEditor = () => {
  const { data: eventsData, refetch } = useTimeline();
  const events = (eventsData as any[]) || [];

  const add = async () => {
    try {
      await apiClient.createTimelineEvent({
        title: "New moment",
        date_label: "Date",
        description: "Describe this moment…",
        sort_order: events.length + 1,
      });
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const update = async (id: string, patch: any) => {
    try {
      await apiClient.updateTimelineEvent(id, patch);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const remove = async (id: string) => {
    try {
      await apiClient.deleteTimelineEvent(id);
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={add} className="inline-flex items-center gap-2 px-5 py-2 border border-gold text-gold text-[11px] tracking-[0.3em] uppercase hover:bg-gold hover:text-warm-dark transition-colors">
          <Plus className="w-3 h-3" /> Add moment
        </button>
      </div>
      {events.map((e) => (
        <div key={e.id} className="grid md:grid-cols-[1fr_1fr_2fr_auto] gap-3 items-start border border-blush p-4 bg-white">
          <input
            defaultValue={e.date_label}
            onBlur={(ev) => update(e.id, { date_label: ev.target.value })}
            placeholder="Date label"
            className="bg-transparent border-b border-blush px-2 py-1 outline-none focus:border-gold"
          />
          <input
            defaultValue={e.title}
            onBlur={(ev) => update(e.id, { title: ev.target.value })}
            placeholder="Title"
            className="bg-transparent border-b border-blush px-2 py-1 outline-none focus:border-gold font-display text-lg"
          />
          <textarea
            defaultValue={e.description}
            onBlur={(ev) => update(e.id, { description: ev.target.value })}
            rows={2}
            className="bg-transparent border-b border-blush px-2 py-1 outline-none focus:border-gold resize-none text-sm"
          />
          <button onClick={() => remove(e.id)} className="text-warm-soft hover:text-destructive transition-colors p-2">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      {events.length === 0 && <p className="text-center text-warm-soft py-12">No timeline events yet.</p>}
    </div>
  );
};

export default TimelineEditor