interface LogoProps {
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export function Logo({ size = "md", animate = true }: LogoProps) {
  const dimensions = {
    sm: { wrapper: "h-8 w-8", viewBox: "0 0 40 40" },
    md: { wrapper: "h-10 w-10", viewBox: "0 0 40 40" },
    lg: { wrapper: "h-12 w-12", viewBox: "0 0 40 40" },
  };

  const { wrapper, viewBox } = dimensions[size];

  return (
    <div className={`${wrapper} relative`}>
      <svg
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        {/* Background canvas square with rounded corners */}
        <rect x="2" y="2" width="36" height="36" rx="8" fill="url(#canvasGradient)" />

        {/* Grid dots pattern */}
        <g opacity="0.3">
          {[10, 20, 30].map((x) =>
            [10, 20, 30].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1" fill="white" />)
          )}
        </g>

        {/* Playful squiggle line */}
        <path
          d="M8 28 Q 14 22, 20 26 T 32 24"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          className={animate ? "animate-squiggle" : ""}
        />

        {/* Sticky note (tilted) */}
        <g className={animate ? "animate-wiggle" : ""}>
          <rect
            x="22"
            y="8"
            width="12"
            height="12"
            rx="2"
            fill="#fbbf24"
            transform="rotate(6 28 14)"
          />
          <line
            x1="24"
            y1="12"
            x2="32"
            y2="12"
            stroke="#92400e"
            strokeWidth="1.5"
            strokeLinecap="round"
            transform="rotate(6 28 14)"
            opacity="0.5"
          />
          <line
            x1="24"
            y1="15"
            x2="30"
            y2="15"
            stroke="#92400e"
            strokeWidth="1.5"
            strokeLinecap="round"
            transform="rotate(6 28 14)"
            opacity="0.5"
          />
        </g>

        {/* Cursor 1 - teal */}
        <g className={animate ? "animate-cursor-1" : ""}>
          <path
            d="M12 8 L12 20 L16 17 L19 22 L21 21 L18 16 L22 16 L12 8Z"
            fill="var(--color-accent)"
            stroke="white"
            strokeWidth="1"
          />
        </g>

        {/* Cursor 2 - coral (offset) */}
        <g className={animate ? "animate-cursor-2" : ""}>
          <path
            d="M6 18 L6 28 L9 26 L11 30 L13 29 L11 25 L14 25 L6 18Z"
            fill="var(--color-secondary)"
            stroke="white"
            strokeWidth="0.8"
            opacity="0.9"
          />
        </g>

        {/* Small circle accent */}
        <circle
          cx="32"
          cy="30"
          r="4"
          fill="var(--color-tertiary)"
          className={animate ? "animate-pulse-subtle" : ""}
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="canvasGradient" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="100%" stopColor="#0f0f1a" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
