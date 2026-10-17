export function Flower({
  color = "currentColor",
  size = 100,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
      <g fill={color}>
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse
            key={i}
            cx="100"
            cy="49"
            rx="19"
            ry="49"
            transform={`rotate(${i * 30} 100 100)`}
          />
        ))}
      </g>
      <circle cx="100" cy="100" r="25" fill="#f5efc9" />
      <circle cx="92" cy="96" r="3" fill={color} />
      <circle cx="108" cy="96" r="3" fill={color} />
      <path
        d="M89 107Q100 119 112 106"
        fill="none"
        stroke={color}
        strokeWidth="3"
      />
    </svg>
  );
}
export function Poster({
  variant = 0,
  ink = "#df482f",
  second = "#3345bb",
  offset = 3,
  id = "poster",
}: {
  variant?: number;
  ink?: string;
  second?: string;
  offset?: number;
  id?: string;
}) {
  return (
    <svg
      className="poster-art"
      viewBox="0 0 420 560"
      role="img"
      aria-label={
        [
          "Good things take ink, a floral print",
          "Make room for play, a geometric print",
          "Stay a little odd, a checkerboard print",
          "A very good accident, an abstract print",
          "Fresh eyes, a typographic print",
          "Slow days, a sun print",
        ][variant % 6]
      }
    >
      <defs>
        <pattern
          id={`${id}-grain`}
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r=".45" fill="#433b2b" opacity=".14" />
          <circle cx="4" cy="3" r=".3" fill="#fff" opacity=".5" />
        </pattern>
      </defs>
      <rect width="420" height="560" fill="#f5efcf" />
      <g fill={ink} style={{ mixBlendMode: "multiply" }}>
        {variant % 6 === 0 ? (
          <>
            {Array.from({ length: 12 }, (_, i) => (
              <ellipse
                key={i}
                cx="210"
                cy="190"
                rx="43"
                ry="101"
                transform={`rotate(${i * 30} 210 290)`}
              />
            ))}
            <text
              x="24"
              y="72"
              fontSize="55"
              fontWeight="900"
              letterSpacing="-3"
            >
              GOOD THINGS
            </text>
            <text
              x="24"
              y="515"
              fontSize="56"
              fontWeight="900"
              letterSpacing="-3"
            >
              TAKE INK.
            </text>
          </>
        ) : variant % 6 === 1 ? (
          <>
            <rect x="35" y="160" width="350" height="280" rx="140" />
            <text x="25" y="73" fontSize="62" fontWeight="900">
              MAKE ROOM
            </text>
            <text x="25" y="523" fontSize="68" fontWeight="900">
              FOR PLAY.
            </text>
          </>
        ) : variant % 6 === 2 ? (
          <>
            {Array.from({ length: 30 }, (_, i) => {
              const x = i % 6,
                y = Math.floor(i / 6);
              return (x + y) % 2 === 0 ? (
                <rect
                  key={i}
                  x={x * 70}
                  y={y * 85 + 75}
                  width="70"
                  height="85"
                />
              ) : null;
            })}
            <text x="20" y="58" fontSize="48" fontWeight="900">
              STAY A LITTLE
            </text>
            <text x="20" y="541" fontSize="48" fontWeight="900">
              ODD. ALWAYS.
            </text>
          </>
        ) : variant % 6 === 3 ? (
          <>
            <path d="M50 210Q210 -20 370 210T210 480T50 210" />
            <text x="22" y="65" fontSize="50" fontWeight="900">
              A VERY GOOD
            </text>
            <text x="22" y="527" fontSize="53" fontWeight="900">
              ACCIDENT.
            </text>
          </>
        ) : variant % 6 === 4 ? (
          <>
            <text x="22" y="180" fontSize="106" fontWeight="900">
              FRESH
            </text>
            <text x="22" y="290" fontSize="118" fontWeight="900">
              EYES.
            </text>
            <path d="M30 395Q210 265 390 395Q210 535 30 395" />
          </>
        ) : (
          <>
            <circle cx="210" cy="260" r="155" />
            <text x="25" y="78" fontSize="77" fontWeight="900">
              SLOW
            </text>
            <text x="25" y="520" fontSize="80" fontWeight="900">
              DAYS.
            </text>
          </>
        )}
      </g>
      <g
        fill={second}
        style={{ mixBlendMode: "multiply" }}
        transform={`translate(${offset} ${offset * 0.6})`}
      >
        {variant % 6 === 0 ? (
          <>
            <circle cx="210" cy="290" r="85" />
            <circle cx="182" cy="275" r="9" fill="#f5efcf" />
            <circle cx="238" cy="275" r="9" fill="#f5efcf" />
            <path
              d="M172 310Q210 345 248 310"
              fill="none"
              stroke="#f5efcf"
              strokeWidth="6"
            />
          </>
        ) : variant % 6 === 1 ? (
          <>
            <circle cx="130" cy="242" r="76" />
            <circle cx="290" cy="350" r="76" />
            <path
              d="M90 413L330 177"
              fill="none"
              stroke={second}
              strokeWidth="25"
            />
          </>
        ) : variant % 6 === 2 ? (
          <>
            <circle cx="210" cy="280" r="130" />
            <path
              d="M137 280L190 330L286 219"
              stroke="#f5efcf"
              strokeWidth="24"
              fill="none"
            />
          </>
        ) : variant % 6 === 3 ? (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <rect
                key={i}
                x={70 + i * 55}
                y="140"
                width="25"
                height="300"
                transform={`rotate(25 210 290)`}
              />
            ))}
          </>
        ) : variant % 6 === 4 ? (
          <circle cx="210" cy="395" r="62" />
        ) : (
          <>
            {Array.from({ length: 7 }, (_, i) => (
              <rect key={i} x="35" y={140 + i * 42} width="350" height="16" />
            ))}
            <circle cx="210" cy="260" r="60" fill="#f5efcf" />
          </>
        )}
      </g>
      <rect width="420" height="560" fill={`url(#${id}-grain)`} />
      <text x="20" y="550" fontSize="7" letterSpacing="1.5" fill="#322b2a">
        ODDPRESS PRINT CLUB / EXPERIMENT NO. 00{variant + 1} / MADE TO BE A
        LITTLE DIFFERENT
      </text>
    </svg>
  );
}
