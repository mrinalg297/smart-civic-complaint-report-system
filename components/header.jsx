"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    sessionStorage.removeItem("user");
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    const storedUser = sessionStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-3xl transition-all duration-300 ${isScrolled ? "bg-background/80 backdrop-blur-md rounded-full" : "bg-transparent"}`}
      style={{
        boxShadow: isScrolled ? "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px" : "none"
      }}>

      <div className="flex items-center justify-between transition-all duration-300 px-2 pl-5 py-2">
        <Link href="/" className="text-lg font-medium tracking-tight transition-colors duration-300 text-foreground">
          CIVIC
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          <Link
            href="/"
            className="text-sm transition-colors text-muted-foreground hover:text-foreground">

            Home
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm transition-colors text-muted-foreground hover:text-foreground">

            Features
          </Link>
          <Link
            href="/dashboard"
            className="text-sm transition-colors text-muted-foreground hover:text-foreground">

            Dashboard
          </Link>
          <Link
            href="/#footer"
            className="text-sm transition-colors text-muted-foreground hover:text-foreground">

            Contact Us
          </Link>
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          {user ? (
            <span className="px-4 py-2 text-sm font-bold rounded-full bg-foreground text-background">
              Hi, {user.name}
            </span>
          ) : (
            <Link
              href="/login"
              className="px-6 py-2.5 text-sm font-bold transition-all rounded-full bg-foreground text-background hover:bg-amber-500 hover:text-black shadow-sm"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Sign In
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="transition-colors md:hidden text-foreground"
          aria-label="Toggle menu">

          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen &&
        <div className="border-t border-border bg-background px-6 py-8 md:hidden rounded-b-2xl">
          <nav className="flex flex-col gap-6">
            <Link
              href="/"
              className="text-lg text-foreground"
              onClick={() => setIsMenuOpen(false)}>

              Home
            </Link>
            <Link
              href="/#how-it-works"
              className="text-lg text-foreground"
              onClick={() => setIsMenuOpen(false)}>

              Features
            </Link>
            <Link
              href="/dashboard"
              className="text-lg text-foreground"
              onClick={() => setIsMenuOpen(false)}>

              Dashboard
            </Link>
            <Link
              href="/#footer"
              className="text-lg text-foreground"
              onClick={() => setIsMenuOpen(false)}>

              Contact Us
            </Link>
            {user ? (
              <span className="mt-4 text-center text-sm font-bold text-foreground">
                Hi, {user.name}
              </span>
            ) : (
              <Link
                href="/login"
                className="mt-4 bg-foreground px-5 py-3 text-center text-sm font-bold text-background rounded-full hover:bg-amber-500 hover:text-black transition-colors"
                style={{ fontFamily: "'Syne', sans-serif" }}
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      }
    </header>);

}