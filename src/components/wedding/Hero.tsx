
interface HeroProps {
  bride: string;
  groom: string;
  date: Date;
  eyebrow: string;
  imageUrl?: string;
  imageUrl2?: string;
  imagePath?: string;
  imagePath2?: string;
  inviteText?: string;
}

export const Hero = ({ bride, groom, date, eyebrow, imageUrl, imageUrl2, imagePath, imagePath2, inviteText }: HeroProps) => {
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className="relative z-[2] min-h-screen flex flex-col justify-center items-center text-center px-6 md:px-10 pt-32 pb-20 overflow-hidden">
      {(imageUrl) && (
        imagePath?.match(/\.(mp4|webm|ogg)$/i) ? (
          <video
            src={imageUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
        ) : (
          <img
            src={imageUrl}
            alt="Elegant wedding scene"
            width={1920}
            height={1280}
            className="absolute inset-0 w-full h-full object-cover scale-105"
            style={{ animationDelay: "0.1s" }}
          />
        )
      )}
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero-overlay)" }}
      />
      <div className="absolute inset-0 bg-ivory/20" />

      <p className="eyebrow mb-8 animate-fade-up text-ivory/80" style={{ animationDelay: "0.2s" }}>
        {eyebrow}
      </p>

      <h1 className="font-display italic font-light  leading-[0.9] tracking-tight text-ivory animate-fade-up"
        style={{ fontSize: "clamp(64px, 12vw, 148px)", animationDelay: "0.4s" }}>
        {groom}
      </h1>

      <span
        className="font-display italic leading-[0.8] block mt-4 mb-1 animate-fade-up"
        style={{ fontSize: "clamp(72px, 14vw, 180px)", color: "var(--champagne)", animationDelay: "0.55s" }}
      >
        &amp;
      </span>

      <h1 className="font-display italic font-light leading-[0.9] tracking-tight text-ivory animate-fade-up"
        style={{ fontSize: "clamp(64px, 12vw, 148px)", animationDelay: "0.7s" }}>
        {bride}
      </h1>

      <div className="line-dec my-2 animate-fade-up" style={{ animationDelay: "0.85s" }}>
        <span className="text-cream text-lg">✦</span>
      </div>



      <p className="eyebrow mb-2 animate-fade-up text-ivory/80 text-cream" style={{ animationDelay: "1.1s" }}>
        {inviteText}
      </p>

      <div className="gold-divider my-2 animate-fade-up" style={{ animationDelay: "1.15s" }} />

      <p className="text-[12px] uppercase font-light tracking-[0.45em] text-cream animate-fade-up mt-2"
        style={{ animationDelay: "1.20s" }}>
        {formattedDate}
      </p>
    </section>

  );
};
