"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Download,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  gameMoves,
  gameSource,
  lastPly,
  moveLabel,
  gameMoment,
  initialPieces,
  positionAt,
} from "@/lib/chess";

export function GamePlayer({
  active,
  ready,
  step,
  setStep,
  fallback,
}: {
  active: boolean;
  ready: boolean;
  step: number;
  setStep: (step: number | ((previous: number) => number)) => void;
  fallback: boolean;
}) {
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(true);
  const panel = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => {
      if (media.matches) setPlaying(false);
    };
    const visibility = () => setVisible(!document.hidden);
    preference();
    visibility();
    media.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(
      ([entry]) =>
        setInView(entry.isIntersecting && entry.intersectionRatio >= 0.5),
      { threshold: 0.5 },
    );
    if (panel.current) observer.observe(panel.current);
    return () => {
      media.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
      observer.disconnect();
    };
  }, []);
  const running =
    playing && active && ready && visible && inView && step < lastPly;
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(
      () => setStep((s) => Math.min(lastPly, s + 1)),
      1900,
    );
    return () => clearTimeout(timer);
  }, [running, step, setStep]);
  function seek(ply: number) {
    setPlaying(false);
    setStep(Math.min(lastPly, Math.max(0, ply)));
  }
  function toggle() {
    if (step === lastPly) {
      setStep(0);
      setPlaying(true);
    } else setPlaying((p) => !p);
  }
  const row = Math.max(0, Math.min(41, Math.floor((step - 1) / 2) - 1));
  const position = positionAt(step);
  return (
    <div
      className="game-player"
      ref={panel}
      data-ply={step}
      data-playing={running}
    >
      <div className="game-players">
        <div>
          <i className="white-piece" />
          <span>
            Garry Kasparov<small>GM · 2812</small>
          </span>
        </div>
        <span className="game-versus">vs.</span>
        <div>
          <i className="black-piece" />
          <span>
            Veselin Topalov<small>GM · 2700</small>
          </span>
        </div>
      </div>
      <div className="game-current" aria-live={running ? "off" : "polite"}>
        <strong>{moveLabel(step)}</strong>
        <span>
          {step === lastPly
            ? "WHITE WINS · 1–0"
            : `${step % 2 ? "BLACK" : "WHITE"} TO MOVE`}
        </span>
      </div>
      <p className="game-moment">{gameMoment(step)}</p>
      <Slider
        value={step}
        min={0}
        max={lastPly}
        step={1}
        thumbLabel="Game position"
        getAriaValueText={(value) => moveLabel(Number(value))}
        onValueChange={(value) => seek(Number(value))}
      />
      <div className="game-progress">
        <span>
          {step} / {lastPly} plies
        </span>
        <span>
          {running
            ? "AUTO PLAYING"
            : step === lastPly
              ? "GAME COMPLETE"
              : "YOUR TEMPO"}
        </span>
      </div>
      <div className="game-controls">
        <Button
          variant="outline"
          size="icon"
          aria-label="Restart game"
          onClick={() => seek(0)}
          disabled={step === 0}
        >
          <RotateCcw size={16} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous move"
          onClick={() => seek(step - 1)}
          disabled={step === 0}
        >
          <ArrowLeft size={17} />
        </Button>
        <Button
          className="game-play"
          onClick={toggle}
          aria-label={
            step === lastPly
              ? "Replay game"
              : playing
                ? "Pause game"
                : "Play game"
          }
        >
          {step === lastPly ? (
            <RotateCcw size={16} />
          ) : playing ? (
            <Pause size={16} />
          ) : (
            <Play size={16} />
          )}
          {step === lastPly ? "Replay" : playing ? "Pause" : "Play"}
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next move"
          onClick={() => seek(step + 1)}
          disabled={step === lastPly}
        >
          <ArrowRight size={17} />
        </Button>
      </div>
      <div className="game-notation" aria-label="Nearby moves">
        {[row, row + 1, row + 2].map((n) => (
          <div key={n}>
            <small>{n + 1}.</small>
            {[n * 2, n * 2 + 1]
              .filter((p) => p < lastPly)
              .map((p) => (
                <Button
                  key={p}
                  variant="ghost"
                  aria-label={`Go to ${moveLabel(p + 1)}`}
                  aria-current={step === p + 1 ? "step" : undefined}
                  onClick={() => seek(p + 1)}
                >
                  {gameMoves[p].notation}
                </Button>
              ))}
          </div>
        ))}
      </div>
      <div className="game-bookmarks">
        <span>KEY MOMENTS</span>
        <Button variant="ghost" onClick={() => seek(47)}>
          24. The sacrifice
        </Button>
        <Button variant="ghost" onClick={() => seek(lastPly)}>
          44. The finish
        </Button>
      </div>
      <div className="game-links">
        <a href="/games/kasparov-topalov-1999.pgn" download>
          Keep the PGN <Download size={13} />
        </a>
        <a href={gameSource} target="_blank" rel="noreferrer">
          The story <ArrowUpRight size={13} />
        </a>
      </div>
      {fallback && (
        <div
          className="game-flat-board"
          role="img"
          aria-label={`Board after ${moveLabel(step)}. Pieces are labelled K king, Q queen, R rook, B bishop, N knight, P pawn.`}
        >
          {Array.from({ length: 64 }, (_, i) => {
            const square = "abcdefgh"[i % 8] + (8 - Math.floor(i / 8));
            const piece = initialPieces.find((p) => position[p.id] === square);
            return (
              <span
                key={square}
                data-dark={((i % 8) + Math.floor(i / 8)) % 2 === 1}
                title={square}
              >
                {piece && (
                  <b data-white={piece.white}>{piece.type.toUpperCase()}</b>
                )}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
