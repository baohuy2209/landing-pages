"use client";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  Plus,
  Waves,
  Wind,
  Download,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { useJourney } from "@/lib/use-journey";
import { download } from "@/lib/journey";
import { opening, pgn } from "@/lib/chess";
const World = dynamic(() => import("./world"), { ssr: false });
const chapters = [
  {
    label: "An invitation",
    tag: "A DIFFERENT WAY TO LOOK AT CHESS",
    title: (
      <>
        Make
        <br />
        your <em>move.</em>
      </>
    ),
    copy: "A small board. An extraordinary amount of possibility. Take a closer look at the game that never gets old.",
    mark: "01 / 64",
  },
  {
    label: "The board",
    tag: "01 / A WORLD WITHIN REACH",
    title: (
      <>
        Sixty-four
        <br />
        <em>beginnings.</em>
      </>
    ),
    copy: "Eight by eight. Light and dark. A perfectly small space for a very big idea: every decision changes what comes next.",
    mark: "8 × 8",
  },
  {
    label: "The pawn",
    tag: "02 / START SMALL",
    title: (
      <>
        Little moves.
        <br />
        <em>Long stories.</em>
      </>
    ),
    copy: "One square forward. Sometimes two, on the first move. The pawn is a lesson in patience: reach the other side, and become something more.",
    mark: "PAWN / 01",
  },
  {
    label: "The knight",
    tag: "03 / THINK AROUND THE CORNER",
    title: (
      <>
        A beautiful
        <br />
        <em>exception.</em>
      </>
    ),
    copy: "Two in one direction. One to the side. The knight jumps over the obvious, finding a route no other piece can take.",
    mark: "KNIGHT / L",
  },
  {
    label: "The bishop",
    tag: "04 / FIND YOUR LINE",
    title: (
      <>
        See the
        <br />
        <em>whole diagonal.</em>
      </>
    ),
    copy: "The bishop keeps its colour and follows its line. Give it a little room, and suddenly the other side of the board feels very close.",
    mark: "BISHOP / ↗",
  },
  {
    label: "The rook",
    tag: "05 / KEEP IT SIMPLE",
    title: (
      <>
        Straightforward.
        <br />
        <em>Never ordinary.</em>
      </>
    ),
    copy: "Files and ranks. Clear lines. The rook reminds you that a simple idea, in the right position, can change everything.",
    mark: "ROOK / +",
  },
  {
    label: "The queen",
    tag: "06 / POSSIBILITIES MULTIPLY",
    title: (
      <>
        Room
        <br />
        <em>to roam.</em>
      </>
    ),
    copy: "Straight lines and diagonals, all in one piece. The queen can do a great deal. The art is knowing what is worth doing.",
    mark: "QUEEN / 08",
  },
  {
    label: "The king",
    tag: "07 / WHAT REALLY MATTERS",
    title: (
      <>
        Protect
        <br />
        <em>the possibility.</em>
      </>
    ),
    copy: "The king moves one square. The whole game moves around it. When no legal answer to check remains, the story has reached checkmate.",
    mark: "KING / 01",
  },
  {
    label: "The opening",
    tag: "08 / SIX MOVES. ONE NEW PERSPECTIVE.",
    title: (
      <>
        An opening
        <br />
        <em>conversation.</em>
      </>
    ),
    copy: "Meet the Italian Game. Follow each move on the board, and notice how space, development and intention come together.",
    mark: "1. e4 e5",
  },
  {
    label: "Your next move",
    tag: "09 / THERE IS ALWAYS SOMETHING TO SEE",
    title: (
      <>
        Your move.
        <br />
        <em>Your tempo.</em>
      </>
    ),
    copy: "No clock to beat here. Keep the opening, set up a board, and find a little time for a game with someone you like.",
    mark: "∞ / PLAY",
  },
];
export default function Experience() {
  const j = useJourney();
  const pendingChapter = useRef<number | null>(null);
  const [open, setOpen] = useState(false),
    [step, setStep] = useState(0);
  function toggle() {
    j.setPaused(!j.paused);
    toast(j.paused ? "A little movement, again." : "A moment of stillness.", {
      description:
        "Ambient animations " +
        (j.paused ? "on" : "off") +
        ". Scroll and opening controls remain active.",
    });
  }
  return (
    <div
      ref={j.root}
      className="experience"
      data-ready={j.ready}
      data-fallback={j.fallback}
    >
      <a className="skip" href="#chapter-1">
        Skip to the board
      </a>
      <div className="world-fallback" aria-hidden="true">
        <div className="fallback-board" />
      </div>
      {!j.fallback && (
        <World
          progress={j.progress}
          paused={j.paused}
          step={step}
          onReady={j.onReady}
        />
      )}
      {!j.ready && (
        <div className="loader" role="status">
          <div className="loader-board">
            {Array.from({ length: 9 }, (_, i) => (
              <i key={i} />
            ))}
          </div>
          <span>TEMPO</span>
          <p>Setting the pieces.</p>
          <small>A little patience. A whole world of possibility.</small>
          <Button variant="ghost" onClick={() => j.onReady(false)}>
            Continue without 3D
          </Button>
        </div>
      )}
      <header>
        <a className="brand" href="#chapter-0">
          tempo<span>®</span>
          <i />
        </a>
        <span className="header-note">
          THE ART OF
          <br />
          THINKING AHEAD.
        </span>
        <Sheet
          open={open}
          onOpenChange={setOpen}
          onOpenChangeComplete={(isOpen) => {
            if (!isOpen && pendingChapter.current !== null) {
              const chapter = pendingChapter.current;
              pendingChapter.current = null;
              j.go(chapter);
            }
          }}
        >
          <SheetTrigger
            render={<Button variant="outline" aria-label="Open the index" />}
          >
            The index <Plus size={17} />
          </SheetTrigger>
          <SheetContent>
            <SheetTitle>Ten ways in.</SheetTitle>
            <SheetDescription>
              An unhurried study of the world’s most familiar board.
            </SheetDescription>
            <nav className="chapter-menu">
              {chapters.map((c, i) => (
                <Button
                  variant="ghost"
                  key={c.label}
                  onClick={() => {
                    pendingChapter.current = i;
                    setOpen(false);
                  }}
                >
                  <small>{String(i).padStart(2, "0")}</small>
                  {c.label}
                  <ArrowUpRight size={17} />
                </Button>
              ))}
            </nav>
            <p className="menu-note">
              An imaginary chess club. A real love of the game. Original 3D
              pieces, made for this open-source collection.
            </p>
          </SheetContent>
        </Sheet>
      </header>
      <main>
        {chapters.map((c, i) => (
          <section
            className={`chapter chapter-${i}`}
            id={`chapter-${i}`}
            key={c.label}
            aria-labelledby={`title-${i}`}
          >
            <div className="chapter-screen">
              <span className="study-mark" aria-hidden="true">
                {c.mark.replace("↗", "/")}
              </span>
              <div className="chapter-copy">
                <p className="eyebrow">
                  <i />
                  {c.tag}
                </p>
                {i === 0 ? (
                  <h1 id={`title-${i}`}>{c.title}</h1>
                ) : (
                  <h2 id={`title-${i}`}>{c.title}</h2>
                )}
                <p className="description">{c.copy}</p>
                {i === 0 && (
                  <>
                    <Button onClick={() => j.go(1)}>
                      Explore the board <ArrowDown size={18} />
                    </Button>
                    <span className="hero-detail">TEN CHAPTERS. NO RUSH.</span>
                  </>
                )}
                {i === 3 && (
                  <div
                    className="knight-route"
                    aria-label="A knight moves two squares then one to the side"
                  >
                    <span>02</span>
                    <div />
                    <span>01</span>
                    <p>
                      The unexpected
                      <br />
                      is a valid move.
                    </p>
                  </div>
                )}
                {i === 8 && (
                  <div className="opening-lab">
                    <div className="move-heading">
                      <strong>
                        {String(step).padStart(2, "0")}
                        <span> / 06</span>
                      </strong>
                      <span>
                        {step === 0
                          ? "THE STARTING POSITION"
                          : opening[step - 1].notation}
                      </span>
                    </div>
                    <p aria-live="polite">
                      {step === 0
                        ? "White moves first. Take it one idea at a time."
                        : opening[step - 1].idea}
                    </p>
                    <div className="move-buttons">
                      <Button
                        variant="outline"
                        aria-label="Previous opening move"
                        disabled={step === 0}
                        onClick={() => setStep((s) => s - 1)}
                      >
                        <ArrowLeft size={16} />
                      </Button>
                      <Button
                        onClick={() => setStep((s) => Math.min(6, s + 1))}
                        disabled={step === 6}
                      >
                        {step === 6 ? "Opening complete" : "Next move"}
                        <ArrowRight size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Reset the opening"
                        onClick={() => setStep(0)}
                      >
                        <RotateCcw size={17} />
                      </Button>
                    </div>
                    <div className="notation" aria-label="Opening move list">
                      {opening.map((m, n) => (
                        <span key={m.from} data-played={n < step}>
                          {n % 2 === 0 ? `${Math.floor(n / 2) + 1}. ` : ""}
                          {m.notation}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {i === 9 && (
                  <>
                    <Button
                      onClick={() =>
                        download(
                          "tempo-italian-game.pgn",
                          pgn,
                          "application/x-chess-pgn",
                        )
                      }
                    >
                      Keep the opening <Download size={17} />
                    </Button>
                    <p className="download-note">
                      A PGN file for your favourite chess app.
                      <br />
                      Free to explore. Yours to play.
                    </p>
                  </>
                )}
              </div>
              <div className="chapter-caption">
                <span>AN EXERCISE IN POSSIBILITY</span>
                <span>
                  {String(i).padStart(2, "0")} — {c.label.toUpperCase()}
                </span>
                <ArrowDown size={18} />
              </div>
            </div>
          </section>
        ))}
      </main>
      <footer>
        <div className="footer-top">
          <p>
            Good things
            <br />
            take <em>tempo.</em>
          </p>
          <Button variant="outline" onClick={() => j.go(0)}>
            Back to the first move <ArrowUpRight size={17} />
          </Button>
        </div>
        <div className="credits">
          <span>Tempo · An imaginary chess club</span>
          <a href="https://lndev.me" target="_blank" rel="noreferrer">
            Developed by LN
          </a>
          <a
            href="https://github.com/ln-dev7/landing-pages/tree/master/landing-pages/tempo"
            target="_blank"
            rel="noreferrer"
          >
            Open source · MIT
          </a>
          <a
            href="https://lndev.mychariow.shop/prd_3cu1s0"
            target="_blank"
            rel="noreferrer"
          >
            Support the project
          </a>
        </div>
      </footer>
      <nav className="chapter-rail" aria-label="Journey chapters">
        {chapters.map((c, i) => (
          <Button
            key={c.label}
            variant="ghost"
            className="rail-dot"
            aria-label={`Chapter ${i + 1}: ${c.label}`}
            aria-current={j.active === i ? "step" : undefined}
            onClick={() => j.go(i)}
          >
            <span>{String(i).padStart(2, "0")}</span>
            <i />
          </Button>
        ))}
      </nav>
      <nav className="journey-toolbar" aria-label="Journey navigation">
        <Button
          size="icon"
          variant="ghost"
          disabled={j.active === 0}
          aria-label="Previous chapter"
          onClick={() => j.go(j.active - 1)}
        >
          <ArrowLeft size={16} />
        </Button>
        <Button
          variant="ghost"
          className="toolbar-title"
          aria-label="Choose a chapter"
          onClick={() => setOpen(true)}
        >
          <span key={j.active}>
            {String(j.active).padStart(2, "0")} / {chapters[j.active].label}
          </span>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          disabled={j.active === 9}
          aria-label="Next chapter"
          onClick={() => j.go(j.active + 1)}
        >
          <ArrowRight size={16} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label={
            j.paused
              ? "Enable ambient animations"
              : "Disable ambient animations"
          }
          aria-pressed={!j.paused}
          onClick={toggle}
        >
          {j.paused ? <Wind size={18} /> : <Waves size={18} />}
        </Button>
      </nav>
      <div className="journey-line" aria-hidden="true" />
      <Toaster />
      <noscript>
        <style>{`.loader{display:none}.world-fallback{opacity:1}.chapter-copy{opacity:1!important}`}</style>
      </noscript>
    </div>
  );
}
