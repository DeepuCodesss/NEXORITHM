"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "nexorithm.mobile-banner-dismissed";

function isMobileOrTablet() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 1024px)").matches;
}

export default function MobileDesktopBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = window.sessionStorage.getItem(STORAGE_KEY) === "1";
    setVisible(!dismissed && isMobileOrTablet());
  }, []);

  if (!visible) return null;

  return (
    <div className="sticky top-0 z-[60] border-b border-amber-400/20 bg-[#16110A] px-4 py-3 text-amber-100 shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
      <div className="mx-auto flex max-w-7xl items-start gap-3 sm:items-center">
        <div className="flex-1 text-sm leading-6">
          <span className="font-semibold text-amber-300">For the best experience, please open Nexorithm on a desktop browser.</span>
        </div>
        <button
          type="button"
          onClick={() => {
            window.sessionStorage.setItem(STORAGE_KEY, "1");
            setVisible(false);
          }}
          className="rounded-md border border-amber-400/20 bg-amber-400/10 p-1.5 text-amber-200 transition-colors hover:bg-amber-400/20 hover:text-white"
          aria-label="Dismiss mobile warning"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
