const PETAL_COUNT = 50;

export const Petals = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-2 overflow-hidden">
      {Array.from({ length: PETAL_COUNT }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 8;
        const duration = 10 + Math.random() * 10;
        const size = 0.6 + Math.random() * 0.9;
        return (
          <span
            key={i}
            className="petal"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              transform: `scale(${size})`,
            }}
          />
        );
      })}
    </div>
  );
};
