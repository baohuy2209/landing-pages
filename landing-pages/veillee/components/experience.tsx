"use client";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Moon,
  Sun,
  Waves,
  Wind,
  Menu,
  Download,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
import { roles, party, hostGuide } from "@/lib/game";
const World = dynamic(() => import("./world"), { ssr: false });
const chapters = [
  {
    label: "The invitation",
    time: "DUSK / 19:48",
    eyebrow: "A WEREWOLF STORY, TOLD AFTER DARK",
    title: (
      <>
        Trust no one.
        <br />
        <em>Play together.</em>
      </>
    ),
    copy: "A quiet village. A secret in every hand. And your favourite people, suddenly very convincing strangers.",
  },
  {
    label: "The village",
    time: "DUSK / 20:03",
    eyebrow: "01 / A PLACE AT THE TABLE",
    title: (
      <>
        Every window
        <br />
        has <em>a story.</em>
      </>
    ),
    copy: "Gather your people. Choose a moderator. The village begins with a circle of faces you think you know.",
  },
  {
    label: "The secret",
    time: "NIGHTFALL / 20:17",
    eyebrow: "02 / ONE CARD CHANGES EVERYTHING",
    title: (
      <>
        A familiar face.
        <br />
        An <em>unfamiliar role.</em>
      </>
    ),
    copy: "Some protect the village. Some hunt it. Look closer at the three roles in our introductory game.",
  },
  {
    label: "Close your eyes",
    time: "NIGHT / 23:00",
    eyebrow: "03 / LET THE ROOM GO QUIET",
    title: (
      <>
        The village
        <br />
        <em>falls asleep.</em>
      </>
    ),
    copy: "Eyes closed. No peeking. The moderator’s voice becomes the only light in the room. Somewhere, the wolves wake.",
  },
  {
    label: "The wolves",
    time: "NIGHT / 00:13",
    eyebrow: "04 / A DIFFERENT KIND OF TEAMWORK",
    title: (
      <>
        Keep your friends
        <br />
        <em>guessing.</em>
      </>
    ),
    copy: "The pack chooses together, in silence. When morning comes, the best disguise is a perfectly reasonable explanation.",
  },
  {
    label: "The seer",
    time: "NIGHT / 03:07",
    eyebrow: "05 / KNOWLEDGE HAS A SHADOW",
    title: (
      <>
        You see more.
        <br />
        <em>Say less.</em>
      </>
    ),
    copy: "The seer learns one identity each night. Share too little, and the village misses a clue. Share too much, and the wolves find you.",
  },
  {
    label: "The council",
    time: "FIRST LIGHT / 05:42",
    eyebrow: "06 / NOW EVERY WORD MATTERS",
    title: (
      <>
        A small doubt.
        <br />
        <em>A long discussion.</em>
      </>
    ),
    copy: "The moderator tells the village what happened. Listen to the stories. Remember the details. Ask the question no one else is asking.",
  },
  {
    label: "The vote",
    time: "MORNING / 06:11",
    eyebrow: "07 / THE MOMENT YOU CHOOSE A SIDE",
    title: (
      <>
        Who do
        <br />
        <em>you believe?</em>
      </>
    ),
    copy: "The village votes. One player leaves the circle. Then the night returns, and the story grows another layer.",
  },
  {
    label: "After the game",
    time: "SUNRISE / 06:34",
    eyebrow: "08 / LEAVE THE SUSPICION AT THE TABLE",
    title: (
      <>
        Enemies tonight.
        <br />
        <em>Friends tomorrow.</em>
      </>
    ),
    copy: "The best part is the conversation afterwards. The impossible bluff. The one clue you missed. The person you should never have trusted.",
  },
  {
    label: "Your next night",
    time: "ANOTHER EVENING / SOON",
    eyebrow: "09 / MAKE A LITTLE ROOM FOR MYSTERY",
    title: (
      <>
        Your people.
        <br />
        <em>Your village.</em>
      </>
    ),
    copy: "Set the size of your circle. Keep a simple, printable guide for the moderator. Then put the screens away.",
  },
];
export default function Experience() {
  const j = useJourney();
  const pendingChapter = useRef<number | null>(null);
  const [open, setOpen] = useState(false),
    [role, setRole] = useState(0),
    [players, setPlayers] = useState(10),
    [secret, setSecret] = useState<number | null>(null);
  const setup = party(players);
  function toggle() {
    j.setPaused(!j.paused);
    toast(j.paused ? "The night is moving again" : "A quieter night", {
      description:
        "Ambient animations " +
        (j.paused ? "on" : "off") +
        ". Your scroll still guides the story.",
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
        Skip to the story
      </a>
      <div className="world-fallback" aria-hidden="true">
        <div className="fallback-moon" />
        <div className="fallback-village" />
      </div>
      {!j.fallback && (
        <World
          progress={j.progress}
          paused={j.paused}
          role={role}
          onReady={j.onReady}
        />
      )}
      <div className="vignette" aria-hidden="true" />
      {!j.ready && (
        <div className="loader" role="status">
          <div className="loader-moon">
            <Moon size={38} strokeWidth={0.8} />
          </div>
          <span>VEILLÉE</span>
          <p>Wait for the night.</p>
          <small>Lighting the village & preparing your story</small>
          <Button variant="ghost" onClick={() => j.onReady(false)}>
            Continue without 3D
          </Button>
        </div>
      )}
      <header>
        <a href="#chapter-0" className="brand">
          <Moon size={20} />
          veillée<span>®</span>
        </a>
        <span className="header-note">
          A game of good company.
          <br />
          And very bad alibis.
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
            render={<Button variant="ghost" aria-label="Open the story menu" />}
          >
            The story <Menu size={16} />
          </SheetTrigger>
          <SheetContent>
            <SheetTitle>The night, in chapters.</SheetTitle>
            <SheetDescription>
              Take the long way, or follow a particular secret.
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
                  <small>{String(i + 1).padStart(2, "0")}</small>
                  {c.label}
                  <ArrowRight size={16} />
                </Button>
              ))}
            </nav>
            <p className="menu-note">
              An independent, fictional interpretation of the Werewolf party
              game. Original art. No affiliation with an existing edition.
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
              <div className="chapter-copy">
                <p className="eyebrow">
                  <span />
                  {c.eyebrow}
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
                      Enter the village <ArrowDown size={17} />
                    </Button>
                    <div className="hero-detail">
                      <span>8–18 PLAYERS</span>
                      <i />
                      <span>ONE UNFORGETTABLE NIGHT</span>
                    </div>
                  </>
                )}
                {i === 2 && (
                  <div className="roles">
                    <div
                      className="role-buttons"
                      role="group"
                      aria-label="Explore a role"
                    >
                      {roles.map((r, n) => (
                        <Button
                          key={r.name}
                          variant="outline"
                          aria-pressed={role === n}
                          onClick={() => setRole(n)}
                        >
                          {r.name}
                        </Button>
                      ))}
                    </div>
                    <p className="role-note" aria-live="polite">
                      <strong>{roles[role].clan}</strong>
                      {roles[role].detail}
                    </p>
                  </div>
                )}
                {i === 3 && (
                  <div className="secret">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setSecret(Math.floor(Math.random() * roles.length))
                      }
                    >
                      <Eye size={17} />
                      {secret === null
                        ? "Draw a secret role"
                        : "Draw another role"}
                    </Button>
                    {secret !== null && (
                      <p aria-live="polite">
                        Your role: <strong>{roles[secret].name}.</strong> Keep a
                        straight face.
                        <br />
                        <small>A little preview, not a live game.</small>
                      </p>
                    )}
                  </div>
                )}
                {i === 7 && (
                  <p className="quote">
                    “You’re being unusually quiet.”
                    <br />
                    <em>— Someone who is definitely a wolf.</em>
                  </p>
                )}
                {i === 9 && (
                  <div className="party-planner">
                    <div className="player-label">
                      <span>Players at your table</span>
                      <strong>
                        {players}
                        <small> + 1 moderator</small>
                      </strong>
                    </div>
                    <Slider
                      value={[players]}
                      min={8}
                      max={18}
                      step={1}
                      thumbLabel="Number of players"
                      onValueChange={(v) =>
                        setPlayers(Array.isArray(v) ? v[0] : v)
                      }
                    />
                    <p aria-live="polite">
                      {setup.wolves} wolves · 1 seer · {setup.villagers}{" "}
                      villagers
                    </p>
                    <Button
                      onClick={() =>
                        download("veillee-host-guide.txt", hostGuide(players))
                      }
                    >
                      Keep the host guide <Download size={16} />
                    </Button>
                    <small>Our simple starter variant. Free to print.</small>
                  </div>
                )}
              </div>
              <div className="chapter-caption">
                <span>{c.time}</span>
                <span>
                  {i === 0
                    ? "SCROLL TO LET THE NIGHT UNFOLD"
                    : "A NIGHT IN TEN CHAPTERS"}
                </span>
                <ArrowDown size={17} />
              </div>
            </div>
          </section>
        ))}
      </main>
      <footer>
        <Moon size={30} strokeWidth={1} />
        <p>
          Good stories need
          <br />
          <em>a little darkness.</em>
        </p>
        <Button variant="outline" onClick={() => j.go(0)}>
          One more night <ArrowRight size={16} />
        </Button>
        <div className="credits">
          <span>Veillée · An imagined game night</span>
          <a href="https://lndev.me" target="_blank" rel="noreferrer">
            Developed by LN
          </a>
          <a
            href="https://github.com/ln-dev7/landing-pages/tree/master/landing-pages/veillee"
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
      <nav className="journey-toolbar" aria-label="Story navigation">
        <Button
          size="icon"
          variant="ghost"
          disabled={j.active === 0}
          aria-label="Previous chapter"
          onClick={() => j.go(j.active - 1)}
        >
          <ArrowLeft size={15} />
        </Button>
        <Button
          variant="ghost"
          className="current-chapter"
          aria-label="Choose a chapter"
          onClick={() => setOpen(true)}
        >
          <small>{String(j.active + 1).padStart(2, "0")} / 10</small>
          <span key={j.active}>{chapters[j.active].label}</span>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          disabled={j.active === 9}
          aria-label="Next chapter"
          onClick={() => j.go(j.active + 1)}
        >
          <ArrowRight size={15} />
        </Button>
        <i />
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
