// src/scripts/marquee.js
import { gsap } from 'gsap';

export const initMarquee = () => {
  const columns = document.querySelectorAll('.marquee-col');

  columns.forEach((col) => {
    const inner = col.querySelector('.marquee-inner');
    if (!inner) return;

    // Reset position before starting
    gsap.set(inner, { y: 0 });

    const speed = parseFloat(col.dataset.speed || "1");
    // Calculate distance of exactly one set of images
    const distance = inner.scrollHeight / 2;

    const tween = gsap.to(inner, {
      y: -distance,
      duration: 25 / speed,
      ease: "none",
      repeat: -1,
      overwrite: true
    });

    // Pause interaction
    col.addEventListener('mouseenter', () => {
      gsap.to(tween, { timeScale: 0.2, duration: 0.5 }); // Slows down smoothly instead of hard pause
    });
    col.addEventListener('mouseleave', () => {
      gsap.to(tween, { timeScale: 1, duration: 0.5 });
    });
  });
};