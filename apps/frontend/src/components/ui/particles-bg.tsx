"use client";

import { useEffect, useCallback } from "react";

interface ParticlesComponentProps {
  className?: string;
  id?: string;
}

export default function ParticlesComponent({ className, id = "particles-js" }: ParticlesComponentProps) {
  const initParticles = useCallback((isDark: boolean) => {
    // cleanup old canvas
    const oldCanvas = document.querySelector(`#${id} canvas`);
    if (oldCanvas) oldCanvas.remove();

    // @ts-ignore
    if (window.pJSDom?.length > 0) {
      // @ts-ignore
      window.pJSDom.forEach((p: any) => p.pJS?.fn?.vendors?.destroypJS?.());
      // @ts-ignore
      window.pJSDom = [];
    }

    const colors = isDark
      ? {
          particles: "#00f5ff",
          lines: "#00d9ff",
          accent: "#0096c7",
        }
      : {
          particles: "#0277bd",
          lines: "#0288d1",
          accent: "#039be5",
        };

    // @ts-ignore
    if (window.particlesJS) {
      // @ts-ignore
      window.particlesJS(id, {
        particles: {
          number: { value: 75, density: { enable: true, value_area: 800 } },
          color: { value: colors.particles },
          shape: { type: "circle", stroke: { width: 0.5, color: colors.accent } },
          opacity: {
            value: 0.6,
            random: true,
            anim: { enable: true, speed: 1, opacity_min: 0.2 },
          },
          size: {
            value: 2.5,
            random: true,
            anim: { enable: true, speed: 1.5, size_min: 1 },
          },
          line_linked: {
            enable: true,
            distance: 140,
            color: colors.lines,
            opacity: 0.35,
            width: 1.1,
          },
          move: { enable: true, speed: 1.8, random: true, out_mode: "bounce" },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: { enable: false, mode: "grab" },
            onclick: { enable: false, mode: "push" },
            resize: true,
          },
          modes: {
            grab: { distance: 180, line_linked: { opacity: 0.6 } },
            push: { particles_nb: 3 },
            repulse: { distance: 140, duration: 0.4 },
          },
        },
        retina_detect: true,
      });
    }
  }, [id]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let script = document.querySelector('script[src*="particles.min.js"]') as HTMLScriptElement;
    
    const loadScriptAndInit = () => {
      const html = document.documentElement;
      const detectDark = () => true; // Toujours dark mode pour notre thème épuré
      
      initParticles(detectDark());

      const observer = new MutationObserver(() =>
        initParticles(detectDark())
      );
      observer.observe(html, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      });
      return observer;
    };

    let observer: MutationObserver | null = null;

    if (!script) {
      script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js";
      script.async = true;
      document.body.appendChild(script);
      script.onload = () => {
        observer = loadScriptAndInit();
      };
    } else {
      // @ts-ignore
      if (window.particlesJS) {
        observer = loadScriptAndInit();
      } else {
        script.onload = () => {
          observer = loadScriptAndInit();
        };
      }
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [initParticles]);

  return (
    <div
      id={id}
      className={
        className ||
        `w-full h-full absolute inset-0 pointer-events-none transition-colors duration-500 bg-gradient-to-tr from-[#000814]/80 via-[#001d3d]/60 to-[#003566]/40 transform-gpu`
      }
    />
  );
}
