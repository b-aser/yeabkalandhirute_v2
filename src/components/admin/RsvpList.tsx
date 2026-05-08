import { apiClient } from '@/integrations/api/client';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

const RsvpList = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRSVPs = async () => {
      try {
        const data = (await apiClient.getRSVPs()) as any[];
        setRows(data);
      } catch (error: any) {
        toast.error("Failed to load RSVPs");
      } finally {
        setLoading(false);
      }
    };

    fetchRSVPs();
  }, []);

  const totalGuests = rows.filter((r) => r.attending === "yes").reduce((s, r) => s + r.guest_count, 0);

  if (loading) return <p className="text-warm-soft text-center py-12">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          ["Total responses", rows.length],
          ["Attending", rows.filter((r) => r.attending === "yes").length],
          ["Total guests", totalGuests],
        ].map(([label, val]) => (
          <div key={label as string} className="border border-blush p-5 bg-white text-center">
            <p className="font-display text-4xl text-gold">{val}</p>
            <p className="text-[10px] tracking-[0.4em] uppercase text-warm-soft mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="border border-blush bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ivory text-[10px] tracking-[0.3em] uppercase text-warm-soft">
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Attending</th>
              <th className="text-left px-4 py-3">Guests</th>
              <th className="text-left px-4 py-3">Dietary</th>
              <th className="text-left px-4 py-3">Message</th>
              <th className="text-left px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-blush/50">
                <td className="px-4 py-3 font-medium text-warm-dark">{r.full_name}</td>
                <td className="px-4 py-3 text-warm-mid">{r.email}</td>
                <td className="px-4 py-3">
                  <span className={r.attending === "yes" ? "text-gold" : "text-warm-soft"}>
                    {r.attending === "yes" ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3 text-warm-mid">{r.guest_count}</td>
                <td className="px-4 py-3 text-warm-mid">{r.dietary || "—"}</td>
                <td className="px-4 py-3 text-warm-mid max-w-xs truncate">{r.message || "—"}</td>
                <td className="px-4 py-3 text-warm-soft text-xs">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-warm-soft py-12">
                  No RSVPs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RsvpList