"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { clamp, ease } from "./journey";
export function useJourney() {
  const progress = useRef(0),
    root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0),
    [paused, setPaused] = useState(false),
    [ready, setReady] = useState(false),
    [fallback, setFallback] = useState(false);
  const [fonts, setFonts] = useState(false),
    [world, setWorld] = useState(false);
  const onReady = useCallback((ok: boolean) => {
    setWorld(true);
    setFallback((current) => current || !ok);
  }, []);
  useEffect(() => {
    document.fonts.ready.then(() => setFonts(true));
  }, []);
  useEffect(() => {
    if (world) return;
    const fail = setTimeout(() => {
      setFallback(true);
      setWorld(true);
    }, 15000);
    return () => clearTimeout(fail);
  }, [world]);
  useEffect(() => {
    if (fonts && world) {
      const timer = setTimeout(() => setReady(true), 450);
      return () => clearTimeout(timer);
    }
  }, [fonts, world]);
  useEffect(() => {
    let frame = 0;
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>(".chapter"),
    );
    const update = () => {
      frame = 0;
      const h = sections[0]?.offsetHeight || innerHeight * 2.1;
      const p = scrollY / h;
      progress.current = clamp(p / 9) * 9;
      setActive(Math.min(9, Math.max(0, Math.floor(p + 0.12))));
      root.current?.style.setProperty("--journey", String(clamp(p / 9)));
      sections.forEach((s, i) => {
        const local = (scrollY - s.offsetTop) / h;
        const enter = i === 0 ? 1 : ease((local + 0.35) / 0.32);
        const leave =
          i === sections.length - 1 ? 1 : 1 - ease((local - 0.28) / 0.38);
        const reveal = enter * leave;
        s.style.setProperty("--reveal", String(reveal));
        const copy = s.querySelector<HTMLElement>(".chapter-copy");
        if (copy) copy.inert = reveal < 0.01;
        s.style.setProperty("--lift", `${(1 - enter) * 30}px`);
      });
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, []);
  const go = (i: number) =>
    document.getElementById(`chapter-${i}`)?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  return {
    progress,
    root,
    active,
    paused,
    setPaused,
    ready,
    fallback,
    onReady,
    go,
  };
}
