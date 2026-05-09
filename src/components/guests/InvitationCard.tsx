import { useRef } from "react";
import { Button } from "../../components/ui/button";

interface InvitationCardProps {
  guest: {
    id: string;
    name: string;
    invitation_text: string | null;
    entrance_code: string;
    qr_code_data: string;
    plus_ones_allowed: number;
    family_count: number;
  };
  wedding: {
    bride_name: string;
    groom_name: string;
    wedding_date: string;
    ceremony_venue: string;
    ceremony_address: string;
    ceremony_time: string;
  };
}

export function InvitationCard({ guest, wedding }: InvitationCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const weddingDate = new Date(wedding.wedding_date).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const handlePrint = () => {
    const printContent = cardRef.current?.innerHTML;
    if (!printContent) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Invitation — ${guest.name}</title>
      <style>
        body { font-family: Georgia, serif; background: #fdf8f0; margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .card { max-width: 480px; width: 100%; padding: 48px; background: #fff; border: 1px solid #e8d9c0; text-align: center; }
        h1 { font-size: 2rem; color: #5c3d1e; margin: 0 0 4px; }
        .amp { font-size: 2.5rem; color: #b8860b; margin: 0 8px; }
        .divider { border: none; border-top: 1px solid #e8d9c0; margin: 20px auto; width: 60%; }
        .label { font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: #9a7b4f; margin-bottom: 4px; }
        .value { font-size: 1rem; color: #3a2a1a; margin-bottom: 16px; }
        .invite-text { font-style: italic; color: #5c3d1e; margin: 16px 0; line-height: 1.6; }
        .code-box { background: #fdf8f0; border: 1px dashed #c8a96e; padding: 12px 24px; display: inline-block; margin: 12px auto; border-radius: 4px; }
        .code { font-family: monospace; font-size: 1.4rem; letter-spacing: 0.2em; color: #5c3d1e; font-weight: bold; }
        img.qr { margin: 16px auto; display: block; width: 180px; height: 180px; }
        .footer-note { font-size: 0.75rem; color: #9a7b4f; margin-top: 16px; }
      </style>
      </head><body><div class="card">${printContent}</div></body></html>
    `);
    win.document.close();
    win.print();
  };

  const inviteText = guest.invitation_text ||
    `Dear ${guest.name},\nWe joyfully request the honour of your presence at our wedding celebration.`;

  const guestsAllowed =
    guest.plus_ones_allowed > 0 || guest.family_count > 0
      ? `Plus-ones: ${guest.plus_ones_allowed} · Family: ${guest.family_count}`
      : null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={cardRef}
        className="w-full max-w-md bg-white border border-[#e8d9c0] p-10 text-center font-serif"
        style={{ background: "#fdf8f0" }}
      >
        <p className="text-xs tracking-widest uppercase text-[#9a7b4f] mb-2">Together with their families</p>
        <h1 className="text-3xl text-[#5c3d1e]">
          {wedding.bride_name}
          <span className="text-[#b8860b] mx-2 text-4xl">&</span>
          {wedding.groom_name}
        </h1>
        <hr className="border-[#e8d9c0] my-4 w-3/5 mx-auto" />

        <p className="text-xs tracking-widest uppercase text-[#9a7b4f] mb-1">Dear Guest</p>
        <p className="text-xl text-[#3a2a1a] mb-4">{guest.name}</p>

        <p className="italic text-[#5c3d1e] whitespace-pre-line leading-relaxed mb-4">{inviteText}</p>

        <hr className="border-[#e8d9c0] my-4 w-3/5 mx-auto" />
        <p className="text-xs tracking-widest uppercase text-[#9a7b4f] mb-1">Date</p>
        <p className="text-[#3a2a1a] mb-3">{weddingDate}</p>

        <p className="text-xs tracking-widest uppercase text-[#9a7b4f] mb-1">Venue</p>
        <p className="text-[#3a2a1a] mb-1">{wedding.ceremony_venue}</p>
        <p className="text-sm text-[#9a7b4f] mb-3">{wedding.ceremony_address}</p>

        {guestsAllowed && (
          <p className="text-xs text-[#9a7b4f] mb-4">{guestsAllowed}</p>
        )}

        <hr className="border-[#e8d9c0] my-4 w-3/5 mx-auto" />

        <img src={guest.qr_code_data} alt="QR Code" className="w-44 h-44 mx-auto mb-2" />

        <div className="inline-block border border-dashed border-[#c8a96e] bg-white px-6 py-3 rounded mt-1">
          <p className="text-xs tracking-widest uppercase text-[#9a7b4f] mb-1">Entrance Code</p>
          <p className="font-mono text-2xl tracking-widest text-[#5c3d1e] font-bold">{guest.entrance_code}</p>
        </div>

        <p className="text-xs text-[#9a7b4f] mt-4">
          Please present this card (QR code or entrance code) at the entrance.
        </p>
      </div>

      <Button variant="outline" onClick={handlePrint} className="border-[#c8a96e] text-[#5c3d1e]">
        Print / Save as PDF
      </Button>
    </div>
  );
}
