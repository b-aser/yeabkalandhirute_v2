
interface MessageProps {
  verseText?: string;
  verseRef?: string;
  greeting?: string;
  intro?: string;
  quote2?: string;
  quote2Ref?: string;
}

export const Message = ({  
  verseText, verseRef, greeting, intro, quote2, quote2Ref 
}: MessageProps) => {
  return (
    <section id="story" className="bg-ivory relative z-[2] text-center px-6 md:px-10 py-8 md:py-16">
      <div className="max-w-2xl mx-auto">
        <p className="eyebrow mb-5">{verseText}</p>
        <p className="eyebrow mb-5">{verseRef}</p>
        <h2 className="font-display font-light leading-tight text-warm-dark mb-8"
            style={{ fontSize: "clamp(36px, 5vw, 64px)" }}>
          {greeting}
        </h2>

        <p className="text-warm-mid leading-[1.9] text-[15px] font-light max-w-xl mx-auto">
          {intro}
        </p>

        <blockquote className="font-display italic font-light text-warm-dark leading-tight my-8 md:my-12"
                    style={{ fontSize: "clamp(14px, 4vw, 34px)" }}>
          <p className="text-gold">{quote2}</p>
          <br />
          <p className="text-gold">{quote2Ref}</p>
        </blockquote>
      </div>

      
    </section>
  );
};
