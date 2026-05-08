interface GalleryImage {
  id: string;
  public_url: string;
  storage_path: string;
  caption: string | null;
}

export const Gallery = ({ images }: { images: GalleryImage[] }) => {
  return (
    <section id="gallery" className="bg-ivory relative z-[2] px-6 md:px-10 py-20 md:py-28">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="eyebrow mb-5">Captured Moments</p>
          <h2 className="font-display font-light leading-tight text-warm-dark"
              style={{ fontSize: "clamp(36px, 5vw, 64px)" }}>
            <em className="italic text-gold">A glimpse</em> of us
          </h2>
        </div>

        {images.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-14">
            {Array.from({ length: 6}).map((_, i) => (
              <div
                key={i}
                className={`bg-blush/60 flex items-center justify-center font-display italic text-warm-soft text-2xl ${
                  i === 0 ? "col-span-2 md:row-span-2 h-64 md:h-[calc(100%-0px)]" : "h-40 md:h-60"
                }`}
              >
                photo
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-14 auto-rows-[200px] md:auto-rows-[240px]">
            {images.map((img, i) => (
              <div
                key={img.id}
                className={`overflow-hidden bg-blush group ${
                  i === 0 ? "col-span-2 row-span-2" : ""
                }`}
              >
                {img.storage_path.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={img.public_url}
                    controls
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <img
                    src={img.public_url}
                    alt={img.caption ?? "Wedding photo"}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
