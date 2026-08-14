import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { Counter, Magnetic } from "@/components/Reveal";

const TAGLINES = [
  { top: "We Manufacture", bottom: "Best quality products, engineered to last." },
  { top: "Secure Your Structure", bottom: "Tile adhesive solutions for solid foundations." },
  { top: "Grout With Confidence", bottom: "Epoxy systems built for lasting integrity." },
  { top: "Waterproofing Peace of Mind", bottom: "Defend your investment with trusted chemistry." },
];

const STATS = [
  { to: 50, suffix: "+", label: "Years of Experience" },
  { to: 500, suffix: "+", label: "Products Manufactured" },
  { to: 18, suffix: "+", label: "Countries Served" },
  { to: 9, suffix: "", label: "Product Categories" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

/** Cinematic, full-viewport hero with parallax, staged text reveal and animated stats. */
export function CinematicHero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.18]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "26%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setIdx(i => (i + 1) % TAGLINES.length), 4600);
    return () => clearInterval(id);
  }, [reduce]);

  // Pick the video variant that matches the viewport (mobile / tablet / desktop)
  const [videoSrc, setVideoSrc] = useState("/videos/hero.mp4");
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)");
    const tablet = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");
    const pick = () =>
      setVideoSrc(
        mobile.matches ? "/videos/hero-mobile-v2.mp4" : tablet.matches ? "/videos/hero-tablet.mp4" : "/videos/hero.mp4",
      );
    pick();
    mobile.addEventListener("change", pick);
    tablet.addEventListener("change", pick);
    return () => {
      mobile.removeEventListener("change", pick);
      tablet.removeEventListener("change", pick);
    };
  }, []);

  // Intro plays once per browser session with sound, then loops silently forever.
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const INTRO_KEY = "hir-hero-intro-played";
    let introDone = false;
    try {
      introDone = sessionStorage.getItem(INTRO_KEY) === "1";
    } catch {
      introDone = false;
    }

    const markIntroPlayed = () => {
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {
        /* storage blocked — intro simply won't be remembered */
      }
    };

    const toMutedLoop = () => {
      v.muted = true;
      v.loop = true;
      v.play().catch(() => {});
    };

    if (introDone) {
      // Already heard the intro this session — silent loop, no flicker, no restart.
      toMutedLoop();
      return;
    }

    let cleanupGestures = () => {};

    const startWithSound = () => {
      v.muted = false;
      v.volume = 1;
      v.loop = false;
      return v.play();
    };

    const onEnded = () => {
      markIntroPlayed();
      v.currentTime = 0;
      toMutedLoop();
    };
    v.addEventListener("ended", onEnded);

    startWithSound()
      .then(() => {
        // Video started playing with sound successfully
        markIntroPlayed();
      })
      .catch(() => {
        // Audible autoplay blocked — start muted and unmute on first user interaction
        toMutedLoop();

        const events = ["pointerdown", "click", "touchstart", "keydown"] as const;
        const onFirstGesture = () => {
          cleanupGestures();
          let already = false;
          try {
            already = sessionStorage.getItem(INTRO_KEY) === "1";
          } catch {
            already = false;
          }
          if (already) return;
          v.currentTime = 0;
          v.muted = false;
          v.volume = 1;
          v.loop = false;
          startWithSound()
            .then(() => markIntroPlayed())
            .catch(() => toMutedLoop());
        };
        cleanupGestures = () => {
          events.forEach(e => window.removeEventListener(e, onFirstGesture));
        };
        events.forEach(e => window.addEventListener(e, onFirstGesture, { once: true, passive: true }));
      });

    return () => {
      v.removeEventListener("ended", onEnded);
      cleanupGestures();
    };
  }, [videoSrc]);

  return (
    <>
    <section
      ref={ref}
      className="relative isolate min-h-[100svh] flex flex-col justify-start md:justify-center overflow-hidden bg-ink text-white"
    >
      {/* Parallax backdrop */}
      <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0 -z-10 will-change-transform">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          key={videoSrc}
          src={videoSrc}
          autoPlay
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        {/* Neutral readability scrims (no colour tint) — mobile keeps the bottom half clear */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent md:bg-gradient-to-r md:from-black/65 md:via-black/20 md:to-transparent" />
      </motion.div>



      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative max-w-7xl mx-auto px-0 w-full min-h-[42svh] md:min-h-0 flex items-start md:items-center pt-20 pb-6 md:pt-32 md:pb-40"
      >
        <div className="w-full md:w-[40%] lg:w-1/2">

        <motion.span
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="inline-flex items-center gap-2.5 rounded-full glass-dark px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/85"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
          Your Building Master · Since 1972
        </motion.span>

        <h1 className="sr-only">
          HIR Industries — global manufacturer of tile adhesives, epoxy grouts and waterproofing chemicals
        </h1>

        <div aria-hidden="true" className="mt-5 min-h-[8.5rem] sm:min-h-[13rem] md:mt-8 md:min-h-[15rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <span className="block font-display text-[2.1rem] leading-[1.05] sm:text-6xl md:text-[5.5rem] font-bold tracking-[-0.04em]">
                {TAGLINES[idx].top}
              </span>
              <span className="mt-3 block max-w-2xl font-display text-lg md:mt-4 sm:text-2xl md:text-[2rem] font-semibold leading-tight text-gradient-brand">
                {TAGLINES[idx].bottom}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className="mt-4 max-w-xl text-sm md:mt-7 md:text-lg leading-relaxed text-white/75"
        >
          Construction chemistry engineered with German–American–Japanese technology — tile adhesives, epoxy grouts,
          sealants and waterproofing systems trusted across 18+ countries.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.32, ease: EASE }}
          className="mt-6 md:mt-10 flex flex-wrap gap-3 md:gap-4"
        >
          <Magnetic>
            <Link to="/products" className="btn-luxe btn-luxe-primary">Explore Products</Link>
          </Magnetic>
          <Link
            to="/about"
            className="btn-luxe border border-white/25 bg-white/5 text-white backdrop-blur-md hover:border-brand hover:text-brand"
          >
            Our Story
          </Link>
        </motion.div>
        </div>
      </motion.div>


      {/* Scroll indicator */}
      <div aria-hidden="true" className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2">
        <span className="text-[0.62rem] uppercase tracking-[0.28em] text-white/45">Scroll</span>
        <span className="relative h-9 w-5 rounded-full border border-white/25">
          <span className="absolute left-1/2 top-1.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-brand animate-scroll-hint" />
        </span>
      </div>
    </section>

    {/* Stats bar */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
      className="relative w-full bg-ink text-white py-6 md:py-10"
    >
      <div className="max-w-7xl mx-auto px-0">
        <div className="glass-dark rounded-3xl grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10 overflow-hidden">
          {STATS.map(s => (
            <div key={s.label} className="px-6 py-7 text-center">
              <p className="font-display text-3xl md:text-4xl font-bold text-gradient-brand">
                <Counter to={s.to} suffix={s.suffix} />
              </p>
              <p className="mt-1.5 text-[0.7rem] md:text-xs uppercase tracking-[0.16em] text-white/55">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
    </>
  );
}

