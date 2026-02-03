import { initMarquee } from './marquee.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';

gsap.registerPlugin(ScrollTrigger, Draggable);

// Prevent image downloads and right-click helpers
const preventImageInteractions = () => {
  // Global context menu prevention
  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('[data-protect-image]')) {
      e.preventDefault();
      return false;
    }
  });

  // Prevent dragging images
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
      return false;
    }
  });
};

// 1. HERO ANIMATION (no per-letter animation)
const initHeroAnimation = () => {
  const heroTitle = document.querySelector('h1.font-monument');
  if (heroTitle) {
    gsap.fromTo(heroTitle,
      { opacity: 0, y: 30, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'back.out(1.7)' }
    );
  }

  // Animate subtitle after title
  gsap.to('#hero-subtitle', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    delay: 0.8,
    ease: 'power3.out'
  });

  // Animate CTA button
  gsap.to('#hero-cta', {
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 1.1,
    ease: 'power3.out'
  });
};

// 2. INTERACTIVE LOGO MARQUEE WITH DRAGGABLE (moved as-is)
const setupInteractiveMarquee = () => {
  const logoRows = [
    { id: 'logo-track-1', direction: -1, baseSpeed: 0.5 },
    { id: 'logo-track-2', direction: 1, baseSpeed: 0.5 }
  ];

  logoRows.forEach((row) => {
    const track = document.getElementById(row.id);
    if (!track) return;
    const items = track.querySelectorAll('.logo-item');
    if (!items.length) return;
    const itemWidth = items[0].offsetWidth + 64; // width + gap
    const totalWidth = items.length * itemWidth;
    track.style.width = `${totalWidth}px`;

    let isDragging = false;
    let dragStartX = 0;
    let trackStartX = 0;
    let currentX = 0;
    let autoScrollInterval = null;
    let scrollDirection = row.direction;

    currentX = 0;
    gsap.set(track, { x: currentX });

    const startAutoScroll = () => {
      if (autoScrollInterval) clearInterval(autoScrollInterval);
      autoScrollInterval = setInterval(() => {
        if (!isDragging) {
          currentX += scrollDirection * row.baseSpeed;
          if (scrollDirection === -1 && currentX <= -totalWidth / 2) {
            currentX = 0;
          } else if (scrollDirection === 1 && currentX >= 0) {
            currentX = -totalWidth / 2;
          }
          gsap.to(track, { x: currentX, duration: 0.1, ease: 'none' });
        }
      }, 16);
    };

    const onMouseDown = (e) => {
      isDragging = true;
      dragStartX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      trackStartX = currentX;
      track.classList.remove('cursor-grab');
      track.classList.add('cursor-grabbing');
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const currentXPos = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const deltaX = currentXPos - dragStartX;
      currentX = trackStartX + deltaX;
      gsap.to(track, { x: currentX, duration: 0.1, ease: 'none' });
    };

    const onMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        track.classList.remove('cursor-grabbing');
        track.classList.add('cursor-grab');
        setTimeout(() => {
          if (!autoScrollInterval) startAutoScroll();
        }, 1000);
      }
    };

    track.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    track.addEventListener('touchstart', (e) => { e.preventDefault(); onMouseDown(e); });
    document.addEventListener('touchmove', (e) => { e.preventDefault(); onMouseMove(e); });
    document.addEventListener('touchend', onMouseUp);

    startAutoScroll();
  });
};

// 3. SCROLL REVEALS
const initScrollReveals = () => {
  const elements = [
    { id: 'section-tag', delay: 0 },
    { id: 'section-title', delay: 0.1 },
    { id: 'section-desc', delay: 0.2 },
    { id: 'section-sub', delay: 0.3 },
    { id: 'section-cta', delay: 0.4 }
  ];

  elements.forEach(({ id, delay }) => {
    const element = document.getElementById(id);
    if (element) {
      gsap.fromTo(element,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1, delay, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 80%', toggleActions: 'play none none reverse' } }
      );
    }
  });

  const videoPlaceholder = document.querySelector('.relative.aspect-video');
  if (videoPlaceholder) {
    gsap.fromTo(videoPlaceholder,
      { opacity: 0, scale: 0.9, rotationY: -10 },
      { opacity: 1, scale: 1, rotationY: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: videoPlaceholder, start: 'top 85%', toggleActions: 'play none none reverse' } }
    );
  }
};

// 4. BUTTON EFFECT
const setupButton = () => {
  const btn = document.getElementById('cinematic-btn');
  if (!btn) return;
  const textSpan = btn.querySelector('.btn-text');
  const originalText = textSpan.innerText;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let interval = null;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const ripple = document.getElementById('btn-ripple');
    ripple.style.transform = 'scale(15)';
    ripple.style.opacity = '0';

    let iteration = 0;
    clearInterval(interval);
    interval = setInterval(() => {
      textSpan.innerText = originalText
        .split('')
        .map((letter, index) => (index < iteration ? originalText[index] : chars[Math.floor(Math.random() * chars.length)]))
        .join('');

      if (iteration >= originalText.length) {
        clearInterval(interval);
        setTimeout(() => { console.log('Navigating...'); }, 500);
      }
      iteration += 1 / 3;
    }, 30);
  });

  btn.addEventListener('mouseleave', () => {
    const ripple = document.getElementById('btn-ripple');
    ripple.style.transition = 'none';
    ripple.style.transform = 'scale(0)';
    ripple.style.opacity = '1';
    void ripple.offsetWidth;
    ripple.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
  });

  btn.addEventListener('mouseenter', () => {
    gsap.to(btn, { scale: 1.05, duration: 0.3, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { scale: 1, duration: 0.3, ease: 'power2.out' });
  });
};

// Initialize everything (single function export)
export const initPage = () => {
  preventImageInteractions();
  initHeroAnimation();
  setTimeout(() => { setupInteractiveMarquee(); }, 1000);
  setupButton();
  setTimeout(() => { initScrollReveals(); }, 800);
  if (typeof initMarquee === 'function') initMarquee();
};

// For astro client navigations we also export a helper to re-run animations
export const reinitPage = () => {
  initHeroAnimation();
  setTimeout(() => { setupInteractiveMarquee(); }, 1000);
  setupButton();
  initScrollReveals();
  if (typeof initMarquee === 'function') initMarquee();
};
