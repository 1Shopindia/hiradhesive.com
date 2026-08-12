import { motion, useScroll, useSpring } from "framer-motion";

/** Thin brand progress bar that tracks page scroll (used on article pages). */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed left-0 top-0 z-50 h-[3px] w-full origin-left gradient-brand"
    />
  );
}
