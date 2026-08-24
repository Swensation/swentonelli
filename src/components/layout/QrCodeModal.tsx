"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, QrCode, Smartphone, X } from "lucide-react";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QrCodeModal({ isOpen, onClose }: QrCodeModalProps) {
  const [currentUrl, setCurrentUrl] = useState<string>("http://192.168.86.236:3000");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : "";
      
      // If browsing via localhost on the kitchen computer, point QR code to the LAN IP so phones can connect!
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        setCurrentUrl(`http://192.168.86.236${port || ":3000"}`);
      } else {
        setCurrentUrl(`${window.location.protocol}//${hostname}${port}`);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy URL:", e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="glass-card max-w-sm w-full p-6 text-center shadow-2xl border border-slate-700 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          title="Close"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black text-white">Scan for Mobile</h3>
        </div>

        <p className="text-xs text-slate-400 mb-5">
          Open your iPhone or iPad camera and scan this code to load Scouty Planner on your phone!
        </p>

        {/* Big High-Contrast QR Code Card */}
        <div className="p-5 bg-white rounded-2xl inline-block shadow-lg border border-slate-200">
          <QRCodeSVG
            value={currentUrl}
            size={200}
            level="M"
            includeMargin={false}
          />
        </div>

        {/* URL Pill & Copy Button */}
        <div className="mt-5 flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
          <span className="truncate pl-1">{currentUrl}</span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex-shrink-0 transition-all flex items-center gap-1"
            title="Copy URL"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[10px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
