import { useState } from "react";
import { apiClient } from "@/integrations/api/client";
import { toast } from "sonner";

export const RSVP = ({ 
  message, 
  eyebrow, 
  title, 
  successMessage,
  optionYes,
  optionNo 
}: { 
  message: string; 
  eyebrow?: string;
  title?: string;
  successMessage?: string;
  optionYes?: string;
  optionNo?: string;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      full_name: String(fd.get("full_name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      attending: String(fd.get("attending") ?? "yes"),
      guest_count: Number(fd.get("guest_count") ?? 1),
      dietary: String(fd.get("dietary") ?? "") || null,
      message: String(fd.get("message") ?? "") || null,
    };

    try {
      await apiClient.createRSVP(payload);
      setSubmitted(true);
      toast.success("Thank you for your RSVP!");
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="rsvp" className="relative z-[2] bg-warm-dark text-center px-6 md:px-10 py-24 md:py-32">
      <p className="eyebrow mb-5" style={{ color: "hsl(var(--warm-soft))" }}>
        {eyebrow}
      </p>
      <h2 className="font-display font-light leading-tight text-cream"
          style={{ fontSize: "clamp(36px, 5vw, 64px)" }}>
        {title}
      </h2>
      <p className="text-warm-soft max-w-xl mx-auto mt-6 mb-14 leading-loose text-md font-normal">
        {message}
      </p>

      {submitted ? (
        <p className="font-display italic text-gold text-3xl">{successMessage}</p>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex flex-col gap-5 text-left font-medium">
          <div className="grid md:grid-cols-2 gap-4 ">
            <Field name="full_name" label="Full Name" required />
            <Field name="email" label="Email" type="email" required />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field name="attending" label="Will you attend?" as="select">
              <option className="bg-warm-dark" value="yes">{optionYes || "Joyfully accepts"}</option>
              <option className="bg-warm-dark" value="no">{optionNo || "Regretfully declines"}</option>
            </Field>
            <Field name="guest_count" label="Number of Guests" type="number" defaultValue="1" min="1" max="6" />
          </div>
          <Field name="dietary" label="Dietary requirements" />
          <Field name="message" label="A note to the couple" as="textarea" />
          <button
            type="submit"
            disabled={submitting}
            className="self-center mt-4 px-14 py-4 border border-gold text-gold font-medium uppercase text-[14px] tracking-[0.45em] font-light hover:bg-gold hover:text-warm-dark transition-colors disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Send RSVP"}
          </button>
        </form>
      )}
    </section>
  );
};

function Field({
  name,
  label,
  type = "text",
  as,
  children,
  ...rest
}: {
  name: string;
  label: string;
  type?: string;
  as?: "select" | "textarea";
  children?: React.ReactNode;
  [k: string]: any;
}) {
  const baseCls =
    "bg-transparent border-0 border-b border-gold/30 py-3 text-cream font-body text-sm font-light placeholder:text-warm-soft/40 outline-none transition-colors focus:border-gold rounded-none";
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[9px] tracking-[0.45em] uppercase text-warm-soft">{label}</label>
      {as === "select" ? (
        <select name={name} className={baseCls} {...rest}>
          {children}
        </select>
      ) : as === "textarea" ? (
        <textarea name={name} rows={3} className={`${baseCls} resize-none`} {...rest} />
      ) : (
        <input name={name} type={type} className={baseCls} {...rest} />
      )}
    </div>
  );
}
