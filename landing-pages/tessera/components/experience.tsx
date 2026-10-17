"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  AudioLines,
  Download,
  Grid2X2,
  MoveUpRight,
  Waves,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
const World = dynamic(() => import("./world"), { ssr: false });
const rooms = [
  {
    name: "The threshold",
    title: (
      <>
        Other
        <br />
        spaces.
      </>
    ),
    text: "A little architecture. A lot of elsewhere. Eight impossible places for a mind that likes to wander.",
    note: "Every journey starts with an opening.",
    material: "01 / SUN-BAKED PLASTER",
    tag: "AN ARCHITECTURE OF POSSIBILITY",
  },
  {
    name: "The passage",
    title: (
      <>
        A rhythm.
        <br />
        Not a rush.
      </>
    ),
    text: "One opening becomes another. Perspective makes a promise: there is always more beyond what you can see.",
    note: "Repetition changes the way we look.",
    material: "02 / RHYTHM & REPETITION",
    tag: "FOLLOW THE SPACE BETWEEN",
  },
  {
    name: "The ascent",
    title: (
      <>
        Take the
        <br />
        long way.
      </>
    ),
    text: "A staircase with no urgent destination. A turn, a landing, a different point of view. Getting there is the interesting part.",
    note: "Sometimes the detour is the place.",
    material: "03 / CAST CONCRETE",
    tag: "UP IS ONLY A SUGGESTION",
  },
  {
    name: "The courtyard",
    title: (
      <>
        Room
        <br />
        to breathe.
      </>
    ),
    text: "An open ceiling. A still pool. Enough room for the light to move and for you to do absolutely nothing.",
    note: "The most useful room holds nothing.",
    material: "04 / WATER & GLAZED TILE",
    tag: "A SMALL PAUSE, OPEN TO THE SKY",
  },
  {
    name: "The light room",
    title: (
      <>
        Made of
        <br />
        almost
        <br />
        nothing.
      </>
    ),
    text: "A circle cut out of a roof. The sun does the rest. Architecture is as much about what we leave out as what we build.",
    note: "An opening is a material, too.",
    material: "05 / LIGHT & LIMESTONE",
    tag: "WATCH WHAT THE LIGHT LEAVES",
  },
  {
    name: "The suspension",
    title: (
      <>
        Less ground.
        <br />
        More wonder.
      </>
    ),
    text: "Here, the rules loosen their grip. A sequence of floating landings invites a leap that only the imagination needs to make.",
    note: "An impossible place. A real feeling.",
    material: "06 / PIGMENT & POSSIBILITY",
    tag: "GRAVITY TAKES THE AFTERNOON OFF",
  },
  {
    name: "The blue hour",
    title: (
      <>
        Stay a<br />
        little later.
      </>
    ),
    text: "The same world, a quieter voice. Warm points of light find their way through the blue. Even imaginary places have an evening.",
    note: "Darkness makes room for a different kind of light.",
    material: "07 / BRASS & MIDNIGHT",
    tag: "THE DAY HAS ONE MORE ROOM",
  },
  {
    name: "The souvenir",
    title: (
      <>
        A place
        <br />
        to keep.
      </>
    ),
    text: "You have been nowhere you can point to on a map. Take a small piece of it with you, in a colour that feels like yours.",
    note: "End of the walk. Beginning of something else.",
    material: "08 / YOUR OWN LITTLE WORLD",
    tag: "SOME PLACES STAY WITH YOU",
  },
];
function Mark() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M5 28V14a11 11 0 0 1 22 0v14h-7V14a4 4 0 0 0-8 0v14Z"
        fill="currentColor"
      />
    </svg>
  );
}
export default function Experience() {
  const progress = useRef(0),
    sections = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0),
    [ready, setReady] = useState(false),
    [webgl, setWebgl] = useState(true),
    [paused, setPaused] = useState(false),
    [palette, setPalette] = useState(0),
    [indexOpen, setIndexOpen] = useState(false);
  const onReady = useCallback((ok: boolean) => {
    setWebgl(ok);
    document.fonts.ready.then(() => setReady(true));
  }, []);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    setPaused(mq.matches);
    const update = () => setPaused(mq.matches);
    mq.addEventListener("change", update);
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = scrollY;
        let index = 0;
        for (let i = 0; i < sections.current.length; i++) {
          const section = sections.current[i];
          if (section && y >= section.offsetTop - 2) index = i;
        }
        const element = sections.current[index];
        const fraction = element
          ? Math.min(
              0.999,
              Math.max(0, (y - element.offsetTop) / element.offsetHeight),
            )
          : 0;
        progress.current = index + fraction;
        setActive(Math.min(7, Math.floor(progress.current + 0.12)));
        document.documentElement.style.setProperty(
          "--journey",
          `${Math.min(100, (y / (document.documentElement.scrollHeight - innerHeight)) * 100)}%`,
        );
      });
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      mq.removeEventListener("change", update);
      cancelAnimationFrame(frame);
    };
  }, []);
  useEffect(() => {
    if (!ready) {
      const before = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = before;
      };
    }
  }, [ready]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!ready) {
        setWebgl(false);
        setReady(true);
      }
    }, 20000);
    return () => clearTimeout(timeout);
  }, [ready]);
  function go(i: number) {
    setIndexOpen(false);
    sections.current[i]?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  function toggle() {
    const next = !paused;
    setPaused(next);
    toast(next ? "Ambient motion off" : "Ambient motion on", {
      description: "Your scroll still guides the journey.",
      icon: <Waves size={17} />,
    });
  }
  function download() {
    const colors = [
      ["#bf7357", "#455c96"],
      ["#bb927c", "#716d8e"],
      ["#cd965c", "#427e79"],
    ][palette];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200"><rect width="1600" height="1200" fill="#eee8da"/><text x="95" y="120" font-family="sans-serif" font-size="35" fill="#33352c">TESSERA / A PLACE TO KEEP</text><path d="M500 900V500a300 300 0 0 1 600 0v400H950V500a150 150 0 0 0-300 0v400Z" fill="${colors[0]}"/><path d="M450 900h700v60H450zM400 960h800v45H400z" fill="${colors[1]}"/><circle cx="1150" cy="260" r="70" fill="#d5b35f"/><text x="95" y="1100" font-family="sans-serif" font-size="24" fill="#33352c">Eight impossible spaces. One wandering mind.</text><text x="1505" y="1100" text-anchor="end" font-family="sans-serif" font-size="22" fill="#33352c">tessera-lndev.vercel.app</text></svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "tessera-a-place-to-keep.svg";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("A little elsewhere, saved.", { icon: <Download size={17} /> });
  }
  return (
    <main className="experience" data-night={active === 6} data-ready={ready}>
      <a className="skip-link" href="#room-1">
        Skip to the journey
      </a>
      {
        <div
          className="loader"
          role={ready ? undefined : "status"}
          aria-hidden={ready}
          aria-live="polite"
        >
          <div className="loader-arch">
            <Mark />
          </div>
          <p>
            Making room
            <br />
            <em>for elsewhere.</em>
          </p>
          <span>ASSEMBLING EIGHT LITTLE WORLDS</span>
          <div className="loader-track" />
        </div>
      }
      {webgl ? (
        <World
          progress={progress}
          paused={paused}
          palette={palette}
          onReady={onReady}
        />
      ) : (
        <div className="world-fallback" aria-hidden="true">
          <div className="fallback-arch" />
          <div className="fallback-steps" />
        </div>
      )}
      <header className="header">
        <a href="#room-0" className="wordmark" aria-label="Tessera home">
          <Mark />
          tessera<span>®︎</span>
        </a>
        <span className="header-caption">Spaces for the wandering mind.</span>
        <Sheet open={indexOpen} onOpenChange={setIndexOpen}>
          <SheetTrigger render={<Button variant="ghost" />}>
            The atlas <Grid2X2 size={17} />
          </SheetTrigger>
          <SheetContent>
            <SheetTitle>The little atlas.</SheetTitle>
            <SheetDescription>
              Eight architectural studies. No destination required.
            </SheetDescription>
            <nav className="atlas">
              {rooms.map((r, i) => (
                <Button
                  key={r.name}
                  variant="unstyled"
                  className={i === active ? "selected" : ""}
                  onClick={() => go(i)}
                >
                  <span>0{i + 1}</span>
                  {r.name}
                  <ArrowUpRight size={20} />
                </Button>
              ))}
            </nav>
            <p className="atlas-note">
              Tessera is an imaginary architectural exhibition. All spaces are
              original procedural 3D models, made for the open-source Landing
              Pages collection.
            </p>
            <a
              className="text-link"
              href="https://github.com/ln-dev7/landing-pages/tree/master/landing-pages/tessera"
              target="_blank"
              rel="noreferrer"
            >
              Explore the source <ArrowUpRight size={15} />
            </a>
          </SheetContent>
        </Sheet>
      </header>
      <div className="side-index" aria-hidden="true">
        <span>STUDY 0{active + 1} / 08</span>
        <i />
        <span>{rooms[active].name}</span>
      </div>
      <div className="journey-line" aria-hidden="true" />
      {rooms.map((r, i) => (
        <section
          key={r.name}
          id={`room-${i}`}
          className={`room room-${i}`}
          ref={(el) => {
            sections.current[i] = el;
          }}
          aria-labelledby={`title-${i}`}
        >
          <div className="room-sticky">
            <div className="room-copy">
              <p className="eyebrow">
                <span /> {r.tag}
              </p>
              {i === 0 ? (
                <h1 id={`title-${i}`}>{r.title}</h1>
              ) : (
                <h2 id={`title-${i}`}>{r.title}</h2>
              )}
              <p className="room-description">{r.text}</p>
              {i === 0 && (
                <Button variant="outline" onClick={() => go(1)}>
                  Step inside <ArrowDown size={18} />
                </Button>
              )}
              {i === 7 && (
                <div className="souvenir">
                  <div
                    className="palette"
                    role="group"
                    aria-label="Choose a postcard palette"
                  >
                    {["Terracotta", "Dusk", "Lagoon"].map((name, p) => (
                      <Button
                        variant="unstyled"
                        key={name}
                        aria-pressed={palette === p}
                        className={`swatch swatch-${p}`}
                        onClick={() => setPalette(p)}
                      >
                        <i />
                        {name}
                      </Button>
                    ))}
                  </div>
                  <Button onClick={download}>
                    Keep a little elsewhere <Download size={17} />
                  </Button>
                </div>
              )}
            </div>
            <div className="room-bottom">
              <span>{r.material}</span>
              <span>{r.note}</span>
              {i < 7 ? (
                <Button
                  variant="ghost"
                  onClick={() => go(i + 1)}
                  aria-label={`Continue to ${rooms[i + 1].name}`}
                >
                  <ArrowDown size={22} />
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => go(0)}>
                  Walk again <MoveUpRight size={18} />
                </Button>
              )}
            </div>
          </div>
        </section>
      ))}
      <footer>
        <a className="footer-brand" href="#room-0">
          Leave with a<br />
          <em>different perspective.</em>
          <ArrowUpRight />
        </a>
        <div className="footer-links">
          <span>An imaginary world, made with care.</span>
          <a href="https://lndev.me" target="_blank" rel="noreferrer">
            Developed by LN
          </a>
          <a
            href="https://github.com/ln-dev7/landing-pages"
            target="_blank"
            rel="noreferrer"
          >
            Open source · MIT <ArrowUpRight size={14} />
          </a>
          <a
            href="https://lndev.mychariow.shop/prd_3cu1s0"
            target="_blank"
            rel="noreferrer"
          >
            Support the project <ArrowUpRight size={14} />
          </a>
        </div>
      </footer>
      <nav className="toolbar" aria-label="Journey chapters">
        <div className="chapter-buttons">
          <span
            className="chapter-indicator"
            style={{ transform: `translateX(${active * 100}%)` }}
          />
          {rooms.map((r, i) => (
            <Button
              key={r.name}
              variant="unstyled"
              aria-label={`Chapter ${i + 1}: ${r.name}`}
              aria-current={active === i ? "step" : undefined}
              onClick={() => go(i)}
            >
              <span>0{i + 1}</span>
            </Button>
          ))}
        </div>
        <Button
          variant="unstyled"
          className="toolbar-name"
          onClick={() => setIndexOpen(true)}
          aria-label="Open the chapter atlas"
        >
          {rooms[active].name}
        </Button>
        <Button
          className="motion-toggle"
          variant="unstyled"
          aria-pressed={!paused}
          aria-label={
            paused ? "Enable ambient animations" : "Disable ambient animations"
          }
          onClick={toggle}
        >
          {paused ? <AudioLines size={18} /> : <Waves size={18} />}
        </Button>
      </nav>
      <Toaster />
    </main>
  );
}
