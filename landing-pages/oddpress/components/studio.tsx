"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Download,
  Menu,
  Minus,
  Plus,
  RotateCcw,
  Pause,
  Play,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Toaster } from "@/components/ui/sonner";
import { Flower, Poster } from "./poster";
const inks = [
  { name: "Poppy", hex: "#df482f" },
  { name: "Cobalt", hex: "#3345bb" },
  { name: "Orchid", hex: "#b2579b" },
  { name: "Evergreen", hex: "#34785c" },
];
const prints = [
  { title: "Good things take ink", type: "Flowers", ink: 0, second: 1 },
  { title: "Make room for play", type: "Shapes", ink: 1, second: 0 },
  { title: "Stay a little odd", type: "Words", ink: 0, second: 2 },
  { title: "A very good accident", type: "Shapes", ink: 2, second: 0 },
  { title: "Fresh eyes", type: "Words", ink: 3, second: 1 },
  { title: "Slow days", type: "Flowers", ink: 0, second: 3 },
];
export default function Studio() {
  const [motionPaused, setMotionPaused] = useState(false);
  const [filter, setFilter] = useState("All prints"),
    [ink, setInk] = useState(0),
    [second, setSecond] = useState(1),
    [offset, setOffset] = useState(5),
    [art, setArt] = useState(0),
    [workshop, setWorkshop] = useState(false),
    [menu, setMenu] = useState(false),
    [session, setSession] = useState("Two-colour taster"),
    [saved, setSaved] = useState(false);
  const lab = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    document.documentElement.classList.add("motion-ready");
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);
  function download() {
    const svg = lab.current?.querySelector("svg");
    if (!svg) return;
    const copy = svg.cloneNode(true) as SVGElement;
    copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    copy.setAttribute("width", "1260");
    copy.setAttribute("height", "1680");
    copy.setAttribute("style", "font-family:Arial,sans-serif");
    const url = URL.createObjectURL(
      new Blob([new XMLSerializer().serializeToString(copy)], {
        type: "image/svg+xml",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "oddpress-your-happy-accident.svg";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Fresh off your imaginary press.", {
      description: "Your original SVG poster is ready to keep.",
      icon: <Check size={18} />,
    });
  }
  function customize(i: number) {
    setArt(i);
    setInk(prints[i].ink);
    setSecond(prints[i].second);
    document.getElementById("ink-lab")?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  return (
    <main data-paused={motionPaused}>
      <a className="skip-link" href="#prints">
        Skip to the prints
      </a>
      <div className="top-strip">
        <span>A LITTLE INK. A HAPPY ACCIDENT.</span>
        <span>INDEPENDENT BY IMAGINATION.</span>
      </div>
      <header>
        <a className="logo" href="#" aria-label="Oddpress home">
          oddpress
          <span className="logo-dot" />
        </a>
        <nav aria-label="Main navigation">
          <a href="#prints">The print shelf</a>
          <a href="#ink-lab">The ink lab</a>
          <a href="#club">The club</a>
        </nav>
        <Button
          onClick={() => {
            setSaved(false);
            setWorkshop(true);
          }}
        >
          Get your hands inky <ArrowUpRight size={17} />
        </Button>
        <Sheet open={menu} onOpenChange={setMenu}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                className="mobile-menu"
                aria-label="Open menu"
              />
            }
          >
            <Menu size={24} />
          </SheetTrigger>
          <SheetContent>
            <SheetTitle>Come on in.</SheetTitle>
            <SheetDescription>
              Good things happen when you make things.
            </SheetDescription>
            <nav className="mobile-links">
              {[
                ["The print shelf", "prints"],
                ["The ink lab", "ink-lab"],
                ["The club", "club"],
              ].map(([label, id]) => (
                <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>
                  {label}
                  <ArrowUpRight />
                </a>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </header>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> NOT QUITE PERFECT. JUST RIGHT.
          </p>
          <h1>
            Good things
            <br />
            happen
            <br />
            <span>off-register.</span>
          </h1>
          <div className="hero-bottom">
            <p>
              We’re an imaginary print club for
              <br />
              real creative itches. Two inks.
              <br />
              Endless happy accidents.
            </p>
            <a
              href="#prints"
              className="circle-link"
              aria-label="Explore the print shelf"
            >
              <ArrowDown size={29} />
            </a>
          </div>
        </div>
        <div
          className="hero-art"
          aria-label="A stack of original Oddpress posters"
        >
          <div className="hero-poster back">
            <Poster variant={1} ink="#3345bb" second="#df482f" id="hero-back" />
          </div>
          <div className="hero-poster front">
            <Poster id="hero-front" offset={6} />
          </div>
          <div className="round-stamp">
            100%
            <br />
            <span>
              HAPPILY
              <br />
              IMPERFECT
            </span>
          </div>
          <span className="scribble">
            a little out of line.
            <ArrowDownLeft size={32} />
          </span>
        </div>
        <div className="hero-caption">
          <span>ODDPRESS®︎ / PRINT CLUB & PAPER PLAYGROUND</span>
          <span>
            SCROLL TO GET INTO IT <ArrowDown size={12} />
          </span>
        </div>
      </section>
      <div
        className="ticker"
        aria-label="Make a mess. Make something. Make it yours."
      >
        <Button
          variant="unstyled"
          className="ticker-pause"
          aria-label={
            motionPaused ? "Resume ambient motion" : "Pause ambient motion"
          }
          aria-pressed={motionPaused}
          onClick={() => {
            setMotionPaused(!motionPaused);
            toast(
              motionPaused
                ? "A little motion, back on."
                : "A quieter kind of odd.",
            );
          }}
        >
          {motionPaused ? <Play size={14} /> : <Pause size={14} />}
        </Button>
        <div className="ticker-track" aria-hidden="true">
          {[0, 1].map((i) => (
            <div className="ticker-copy" key={i}>
              <span>MAKE A MESS.</span>
              <Flower size={40} />
              <span>MAKE SOMETHING.</span>
              <Flower size={40} />
              <span>MAKE IT YOURS.</span>
              <Flower size={40} />
            </div>
          ))}
        </div>
      </div>
      <section className="manifesto reveal" id="club">
        <span className="section-no">01 / THE WAY WE SEE IT</span>
        <div>
          <h2>
            Life’s too short
            <br />
            for{" "}
            <span className="perfect">
              perfect
              <svg viewBox="0 0 400 30" aria-hidden="true">
                <path d="M3 22Q190 -4 397 9M7 9L390 24" />
              </svg>
            </span>
            <br />
            alignment.
          </h2>
          <div className="manifesto-bottom">
            <Flower color="#df482f" size={110} />
            <p>
              We like our colours loud, our paper tactile and our edges a little
              out of line. Inspired by risograph printing, every experiment
              layers simple things into something with a life of its own.
              <br />
              <strong>Less undo. More “oh, that’s nice.”</strong>
            </p>
          </div>
        </div>
      </section>
      <section className="print-section" id="prints">
        <div className="section-top reveal">
          <div>
            <p className="section-no">02 / FRESH FROM THE IMAGINARY PRESS</p>
            <h2>
              The print shelf
              <span>
                <ArrowDownLeft size={45} />
              </span>
            </h2>
          </div>
          <p>
            Original little experiments.
            <br />
            Pick one. Make it your own.
          </p>
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(String(v))}>
          <TabsList aria-label="Filter prints">
            {["All prints", "Flowers", "Shapes", "Words"].map((t) => (
              <TabsTrigger key={t} value={t}>
                {t}
                <span>{t === "All prints" ? "06" : "02"}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={filter}>
            <div className="print-grid">
              {prints.map(
                (p, i) =>
                  (filter === "All prints" || filter === p.type) && (
                    <article key={p.title} className="print-card">
                      <Button
                        variant="unstyled"
                        className={`print-preview print-bg-${i % 3}`}
                        onClick={() => customize(i)}
                        aria-label={`Customize ${p.title}`}
                      >
                        <div className="paper">
                          <Poster
                            variant={i}
                            ink={inks[p.ink].hex}
                            second={inks[p.second].hex}
                            id={`shelf-${i}`}
                          />
                        </div>
                        <span className="customize-badge">
                          Make it yours <ArrowUpRight size={17} />
                        </span>
                      </Button>
                      <div className="print-meta">
                        <div>
                          <h3>{p.title}</h3>
                          <span>EXPERIMENT 00{i + 1} / TWO INKS</span>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => customize(i)}
                          aria-label={`Open ${p.title} in the ink lab`}
                        >
                          <ArrowUpRight size={23} />
                        </Button>
                      </div>
                    </article>
                  ),
              )}
            </div>
          </TabsContent>
        </Tabs>
      </section>
      <section className="lab-section" id="ink-lab">
        <div className="lab-intro reveal">
          <p className="section-no">
            03 / A LITTLE LESS LOOKING. A LITTLE MORE MAKING.
          </p>
          <h2>
            Your turn
            <br />
            to <span>misbehave.</span>
          </h2>
          <p>
            Two colours walk into a print studio.
            <br />
            What happens next is up to you.
          </p>
        </div>
        <div className="lab-layout">
          <div className="lab-poster-stage">
            <div className="registration-mark top-left" />
            <div className="registration-mark bottom-right" />
            <div className="lab-poster" ref={lab}>
              <Poster
                variant={art}
                ink={inks[ink].hex}
                second={inks[second].hex}
                offset={offset}
                id="your-print"
              />
            </div>
            <span className="live-label">
              <i /> LIVE FROM YOUR IMAGINATION
            </span>
          </div>
          <div className="lab-controls">
            <div className="control-title">
              <span>THE INK LAB</span>
              <Button
                variant="ghost"
                onClick={() => {
                  setInk(0);
                  setSecond(1);
                  setOffset(5);
                  setArt(0);
                }}
                aria-label="Reset your print"
              >
                <RotateCcw size={16} />
              </Button>
            </div>
            <fieldset>
              <legend>
                <span>01</span>Pick your artwork
              </legend>
              <div className="art-options">
                {["Bloom", "Play", "Odd", "Accident", "Eyes", "Slow"].map(
                  (name, i) => (
                    <Button
                      variant="unstyled"
                      key={name}
                      aria-pressed={art === i}
                      onClick={() => setArt(i)}
                    >
                      {name}
                    </Button>
                  ),
                )}
              </div>
            </fieldset>
            {[
              { label: "First ink", value: ink, set: setInk },
              { label: "Second ink", value: second, set: setSecond },
            ].map((control, i) => (
              <fieldset key={control.label}>
                <legend>
                  <span>0{i + 2}</span>
                  {control.label}
                  <em>{inks[control.value].name}</em>
                </legend>
                <div className="ink-options">
                  {inks.map((color, index) => (
                    <Button
                      variant="unstyled"
                      key={color.name}
                      aria-label={`${color.name} for ${control.label.toLowerCase()}`}
                      aria-pressed={control.value === index}
                      style={{ background: color.hex }}
                      onClick={() => control.set(index)}
                    >
                      {control.value === index && <Check size={23} />}
                    </Button>
                  ))}
                </div>
              </fieldset>
            ))}
            <fieldset>
              <legend>
                <span>04</span>A little misregistration<em>{offset} mm*</em>
              </legend>
              <Slider
                min={0}
                max={18}
                step={1}
                value={offset}
                onValueChange={(v) => setOffset(Array.isArray(v) ? v[0] : v)}
                thumbLabel="Ink misregistration"
              />
              <div className="slider-labels">
                <span>Neat freak</span>
                <span>Happy accident</span>
              </div>
            </fieldset>
            <Button className="download-button" onClick={download}>
              That’s my kind of odd <Download size={18} />
            </Button>
            <p className="lab-small">
              Download your free SVG. No sign-up. No actual ink.
              <br />
              *An illustrative simulation, not a calibrated print proof.
            </p>
          </div>
        </div>
      </section>
      <section className="process-section">
        <div className="process-header reveal">
          <p className="section-no">
            04 / SIMPLE THINGS. LOVELY POSSIBILITIES.
          </p>
          <h2>
            One layer.
            <br />
            Another world.
          </h2>
          <p>
            Real risograph printing uses a stencil for each colour. We borrow
            its spirit: make something simple, layer it up, and leave a little
            room for surprise.
          </p>
        </div>
        <div className="process-steps">
          <article className="reveal">
            <div className="process-art art-one">
              <Flower color="#df482f" size={190} />
            </div>
            <span>01 / START WITH ONE THING</span>
            <h3>
              A shape. A thought.
              <br />A very good doodle.
            </h3>
          </article>
          <article className="reveal">
            <div className="process-art art-two">
              <div />
              <div />
            </div>
            <span>02 / ADD A LITTLE COMPANY</span>
            <h3>
              Two inks make
              <br />
              more than two colours.
            </h3>
          </article>
          <article className="reveal">
            <div className="process-art art-three">
              <span>
                oh,
                <br />
                nice.
              </span>
            </div>
            <span>03 / LET THE GOOD STUFF HAPPEN</span>
            <h3>
              The surprise
              <br />
              is part of the point.
            </h3>
          </article>
        </div>
      </section>
      <section className="workshop-section reveal">
        <div className="workshop-heading">
          <span className="section-no">05 / BETTER WITH INKY HANDS</span>
          <h2>
            Come for
            <br />
            the ink.
            <br />
            <span>
              Stay for
              <br />
              the “I made that”.
            </span>
          </h2>
          <Button
            onClick={() => {
              setSaved(false);
              setWorkshop(true);
            }}
          >
            Plan a little print session <ArrowUpRight size={18} />
          </Button>
          <p>A fictional workshop planner. Real creative encouragement.</p>
        </div>
        <div className="workshop-art">
          <div className="workshop-ticket">
            <span>ODDPRESS / PRINT CLUB</span>
            <Flower size={130} color="#493264" />
            <strong>
              MAKE
              <br />A LITTLE
              <br />
              MESS.
            </strong>
            <div>
              ADMIT ONE CURIOUS MIND
              <br />
              NO EXPERIENCE NECESSARY.
            </div>
            <i />
          </div>
          <span className="sticker">
            COME AS
            <br />
            YOU ARE.
          </span>
        </div>
      </section>
      <section className="faq-section">
        <div>
          <p className="section-no">06 / BEFORE YOU GET INKY</p>
          <h2>
            Good
            <br />
            questions.
          </h2>
          <Flower size={85} color="#df482f" />
        </div>
        <Accordion className="faq">
          {[
            [
              "Is Oddpress a real print studio?",
              "Not yet — and not a shop. Oddpress is a fictional creative concept in the open-source Landing Pages collection. The poster maker really works; no products or workshops are sold here.",
            ],
            [
              "What is risograph printing?",
              "A stencil-based printing process that lays down one spot colour at a time. Overlapping inks create new colours, and small registration shifts give each print its character. Our digital lab is a playful interpretation, not a print-proofing tool.",
            ],
            [
              "Can I keep the poster I make?",
              "Absolutely. Download an original SVG from the ink lab, open it in your favourite design tool, or print it at home. The artwork and site code are shared under the MIT license.",
            ],
            [
              "Do I need to know anything about design?",
              "Only what you like. Start with a poster, pick two inks and move the slider until it feels right. There is no correct amount of odd.",
            ],
            [
              "Does the workshop form book a session?",
              "No. It creates a local sample plan on your screen. It does not submit your details, reserve a date or contact anyone.",
            ],
          ].map(([q, a], i) => (
            <AccordionItem key={q} value={`q-${i}`}>
              <AccordionTrigger>{q}</AccordionTrigger>
              <AccordionContent>{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
      <footer>
        <div className="footer-top">
          <p>
            KEEP YOUR HANDS BUSY.
            <br />
            KEEP YOUR MIND OPEN.
          </p>
          <a href="#ink-lab">
            Make something odd.
            <ArrowUpRight size={30} />
          </a>
        </div>
        <a className="footer-word" href="#">
          oddpress
          <Flower size={120} />
        </a>
        <div className="footer-bottom">
          <span>An imaginary studio. A real love of making.</span>
          <a href="https://lndev.me" target="_blank" rel="noreferrer">
            Developed by LN
          </a>
          <a
            href="https://github.com/ln-dev7/landing-pages"
            target="_blank"
            rel="noreferrer"
          >
            Open source · MIT <ArrowUpRight size={13} />
          </a>
          <a
            href="https://lndev.mychariow.shop/prd_3cu1s0"
            target="_blank"
            rel="noreferrer"
          >
            Support the project <ArrowUpRight size={13} />
          </a>
        </div>
      </footer>
      <Sheet open={workshop} onOpenChange={setWorkshop}>
        <SheetContent>
          <SheetTitle>
            {saved ? "A lovely little plan." : "Let’s make a mess."}
          </SheetTitle>
          <SheetDescription>
            {saved
              ? "Your sample session is ready. This is a local demo, not a reservation."
              : "Build a sample print session. No booking, payment or data submission."}
          </SheetDescription>
          {saved ? (
            <div className="saved-plan">
              <Flower size={100} />
              <h3>{session}</h3>
              <p>One curious mind. Two inks. A whole lot of possibilities.</p>
              <ul>
                <li>Bring an idea, a sketch, or just yourself.</li>
                <li>Explore colour, layering and happy accidents.</li>
                <li>Leave with a small edition of your own.</li>
              </ul>
              <Button onClick={() => setSaved(false)}>
                Try another plan <RotateCcw size={16} />
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSaved(true);
              }}
              className="workshop-form"
            >
              <fieldset>
                <legend>Your kind of session</legend>
                {[
                  "Two-colour taster",
                  "Poster playground",
                  "A print party with friends",
                ].map((s) => (
                  <Button
                    type="button"
                    variant="unstyled"
                    className="session-option"
                    key={s}
                    aria-pressed={session === s}
                    onClick={() => setSession(s)}
                  >
                    {s}
                    {session === s ? <Check size={18} /> : <Plus size={18} />}
                  </Button>
                ))}
              </fieldset>
              <label htmlFor="name">What should we call you?</label>
              <Input
                id="name"
                name="name"
                placeholder="Your first name"
                autoComplete="given-name"
                required
                maxLength={60}
              />
              <Button type="submit">
                Make my sample plan <ArrowRight size={18} />
              </Button>
              <p>Nothing is sent or stored. This is a design demonstration.</p>
            </form>
          )}
        </SheetContent>
      </Sheet>
      <Toaster />
    </main>
  );
}
