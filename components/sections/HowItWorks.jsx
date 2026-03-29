"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .hiw-section {
    padding: 120px 20px;
    background: #FAF7F2;
    overflow: hidden;
  }

  .hiw-header {
    text-align: center;
    margin-bottom: 72px;
  }

  .hiw-eyebrow {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #F5A623;
    margin-bottom: 14px;
    display: block;
  }

  .hiw-heading {
    font-family: 'Syne', sans-serif;
    font-size: clamp(36px, 5vw, 56px);
    font-weight: 800;
    color: #1C1C1E;
    letter-spacing: -0.03em;
    line-height: 1.05;
  }

  .hiw-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .hiw-card {
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid #E8E0D4;
    transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1),
                box-shadow 0.5s cubic-bezier(0.23, 1, 0.32, 1),
                opacity 0.5s ease;
    cursor: default;
  }

  .hiw-card:hover {
    transform: translateY(-6px) !important;
    box-shadow: 0 20px 50px rgba(0,0,0,0.12);
  }

  .hiw-img-wrap {
    position: relative;
    height: 200px;
    background: #1C1C1E;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hiw-step-icon {
    font-size: 64px;
    filter: grayscale(0.1);
  }

  .hiw-step-num {
    position: absolute;
    top: 14px;
    left: 16px;
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #F5A623;
    background: rgba(245,166,35,0.15);
    border: 1px solid rgba(245,166,35,0.3);
    padding: 3px 10px;
    border-radius: 20px;
  }

  .hiw-card:nth-child(1) .hiw-img-wrap { background: linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%); }
  .hiw-card:nth-child(2) .hiw-img-wrap { background: linear-gradient(135deg, #2C1810 0%, #3A2318 100%); }
  .hiw-card:nth-child(3) .hiw-img-wrap { background: linear-gradient(135deg, #1A2410 0%, #253418 100%); }

  .hiw-body {
    padding: 24px 22px 26px;
  }

  .hiw-title {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #1C1C1E;
    margin-bottom: 8px;
    letter-spacing: -0.01em;
  }

  .hiw-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    color: #6B6B6B;
    line-height: 1.6;
    margin-bottom: 16px;
  }

  .hiw-action {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: #F5A623;
    letter-spacing: 0.02em;
  }

  .hiw-action::after {
    content: '→';
    transition: transform 0.2s ease;
  }

  .hiw-card:hover .hiw-action::after {
    transform: translateX(4px);
  }

  .hiw-card::after {
    content: '';
    display: block;
    height: 3px;
    background: linear-gradient(90deg, #F5A623, #FFBE5C);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .hiw-card:hover::after {
    transform: scaleX(1);
  }

  @media (max-width: 768px) {
    .hiw-cards {
      grid-template-columns: 1fr;
      max-width: 400px;
    }
  }
`;

const steps = [
  {
    num: "01",
    title: "Report an Issue",
    description: "Snap a photo, drop your location, and describe the problem. Takes under 30 seconds.",
    action: "Submit a report",
    icon: "📱",
  },
  {
    num: "02",
    title: "Track Progress",
    description: "Watch your complaint move from pending to resolved with live status updates.",
    action: "View dashboard",
    icon: "📊",
  },
  {
    num: "03",
    title: "See Resolution",
    description: "Get notified when the issue is fixed. Your community, visibly improved.",
    action: "See impact",
    icon: "✅",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / window.innerHeight));
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{css}</style>
      <section id="how-it-works" ref={sectionRef} className="hiw-section">
        <div
          className="hiw-header"
          style={{
            opacity: scrollProgress,
            transform: `translateY(${(1 - scrollProgress) * 30}px)`,
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <span className="hiw-eyebrow">The Process</span>
          <h2 className="hiw-heading">How It Works</h2>
        </div>

        <div className="hiw-cards">
          {steps.map((step, i) => {
            const delay = i * 0.15;
            const visible = scrollProgress > delay;
            return (
              <div
                key={i}
                className="hiw-card"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(50px)",
                  transition: `opacity 0.6s ease ${delay}s, transform 0.6s cubic-bezier(0.23, 1, 0.32, 1) ${delay}s`,
                }}
              >
                <div className="hiw-img-wrap">
                  <span className="hiw-step-num">{step.num}</span>
                  <span className="hiw-step-icon">{step.icon}</span>
                </div>
                <div className="hiw-body">
                  <div className="hiw-title">{step.title}</div>
                  <div className="hiw-desc">{step.description}</div>
                  <Link href="/login" className="hiw-action" style={{ textDecoration: 'none' }}>{step.action}</Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}