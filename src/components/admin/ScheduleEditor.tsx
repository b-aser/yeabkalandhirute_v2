import { useSchedule } from '@/hooks/useWeddingData';
import { apiClient } from '@/integrations/api/client';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import React from 'react'
import { toast } from 'sonner';

const ScheduleEditor = () => {
  const queryClient = useQueryClient();
  const { data: eventsData = [] } = useSchedule();
  const events = eventsData as any[];

  const add = async () => {
    try {
      await apiClient.createScheduleEvent({
        time: "12:00 PM",
        title: "New Event",
        venue: "Venue name",
        address: "Address",
        lat: 40.6492,
        lng: 14.6125,
        sort_order: events.length + 1,
      });
      queryClient.invalidateQueries({ queryKey: ["schedule_events"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const update = async (id: string, patch: any) => {
    try {
      await apiClient.updateScheduleEvent(id, patch);
      queryClient.invalidateQueries({ queryKey: ["schedule_events"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const remove = async (id: string) => {
    try {
      await apiClient.deleteScheduleEvent(id);
      queryClient.invalidateQueries({ queryKey: ["schedule_events"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={add} className="inline-flex items-center gap-2 px-5 py-2 border border-gold text-gold text-[11px] tracking-[0.3em] uppercase hover:bg-gold hover:text-warm-dark transition-colors">
          <Plus className="w-3 h-3" /> Add event
        </button>
      </div>
      <div className="grid gap-4">
        {events.map((e) => (
          <div key={e.id} className="border border-blush p-6 bg-white space-y-4">
            <div className="flex justify-between items-start">
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-warm-soft mb-1">Time</label>
                  <input
                    defaultValue={e.time}
                    onBlur={(ev) => update(e.id, { time: ev.target.value })}
                    className="w-full bg-transparent border-b border-blush px-2 py-1 outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-warm-soft mb-1">Title</label>
                  <input
                    defaultValue={e.title}
                    onBlur={(ev) => update(e.id, { title: ev.target.value })}
                    className="w-full bg-transparent border-b border-blush px-2 py-1 outline-none focus:border-gold font-display text-lg"
                  />
                </div>
              </div>
              <button onClick={() => remove(e.id)} className="text-warm-soft hover:text-destructive transition-colors p-2 ml-4">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-warm-soft mb-1">Venue</label>
                <input
                  defaultValue={e.venue}
                  onBlur={(ev) => update(e.id, { venue: ev.target.value })}
                  className="w-full bg-transparent border-b border-blush px-2 py-1 outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-warm-soft mb-1">Address</label>
                <input
                  defaultValue={e.address}
                  onBlur={(ev) => update(e.id, { address: ev.target.value })}
                  className="w-full bg-transparent border-b border-blush px-2 py-1 outline-none focus:border-gold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-xs">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-warm-soft mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  defaultValue={e.lat}
                  onBlur={(ev) => update(e.id, { lat: parseFloat(ev.target.value) })}
                  className="w-full bg-transparent border-b border-blush px-2 py-1 outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-warm-soft mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  defaultValue={e.lng}
                  onBlur={(ev) => update(e.id, { lng: parseFloat(ev.target.value) })}
                  className="w-full bg-transparent border-b border-blush px-2 py-1 outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {events.length === 0 && <p className="text-center text-warm-soft py-12">No schedule events yet.</p>}
    </div>
  );
};

export default ScheduleEditor