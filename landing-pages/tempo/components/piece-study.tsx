import { studies } from "@/lib/studies";
export function PieceStudy({ index }: { index: number }) {
  const study = studies[index];
  return (
    <div className="piece-study">
      <div className="study-diagram" role="img" aria-label={study.detail}>
        <svg viewBox="0 0 100 100" aria-hidden="true">
          {Array.from({ length: 25 }, (_, i) => {
            const x = (i % 5) - 2,
              y = Math.floor(i / 5) - 2;
            const move = study.moves.some(([a, b]) => a === x && b === y);
            const capture = study.captures.some(([a, b]) => a === x && b === y);
            return (
              <g key={i}>
                <rect
                  x={(x + 2) * 20 + 1}
                  y={(y + 2) * 20 + 1}
                  width="18"
                  height="18"
                  fill={(x + y) % 2 === 0 ? "currentColor" : "none"}
                  opacity=".07"
                />
                {move && (
                  <circle
                    cx={(x + 2) * 20 + 10}
                    cy={(y + 2) * 20 + 10}
                    r="3"
                    className="diagram-destination"
                  />
                )}
                {capture && (
                  <path
                    d={`M${(x + 2) * 20 + 6} ${(y + 2) * 20 + 6}l8 8m0-8-8 8`}
                    className="diagram-capture"
                  />
                )}
              </g>
            );
          })}
          <rect
            x="43"
            y="43"
            width="14"
            height="14"
            rx="2"
            className="diagram-origin"
          />
        </svg>
      </div>
      <div className="study-notes">
        <span>MOVEMENT ATLAS / {String(index + 1).padStart(2, "0")}</span>
        <strong>{study.title}</strong>
        <p>{study.note}</p>
      </div>
      <div className="study-measure">
        <b>{study.number}</b>
        <span>{study.measure}</span>
      </div>
    </div>
  );
}
