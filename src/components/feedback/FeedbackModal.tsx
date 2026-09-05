"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Dog,
  ExternalLink,
  Loader2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  X,
} from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TelemetryData {
  routeUrl: string;
  viewport: {
    width: number;
    height: number;
  };
  timestamp: string;
  userAgent: string;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [dictatedText, setDictatedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ issueNumber: number; issueUrl: string } | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);

  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Capture telemetry whenever modal opens
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      setTelemetry({
        routeUrl: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });
      setErrorMessage(null);
      setSuccessData(null);
      setTimeout(() => textareaRef.current?.focus(), 150);
    } else {
      stopListening();
    }
  }, [isOpen]);

  // Setup Web Speech API
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setDictatedText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn("Speech recognition initialization failed:", e);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Error starting speech recognition:", err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dictatedText.trim() || isSubmitting) return;

    stopListening();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Refresh telemetry timestamp on actual submit
    const currentTelemetry: TelemetryData = {
      routeUrl: typeof window !== "undefined" ? window.location.href : "",
      viewport: {
        width: typeof window !== "undefined" ? window.innerWidth : 0,
        height: typeof window !== "undefined" ? window.innerHeight : 0,
      },
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    };

    try {
      const res = await fetch("/api/agent-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dictatedText: dictatedText.trim(),
          telemetry: currentTelemetry,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessData({
          issueNumber: data.issueNumber,
          issueUrl: data.issueUrl,
        });
        setDictatedText("");
      } else {
        setErrorMessage(data.error || "Failed to submit feedback to autonomous pipeline.");
      }
    } catch (err: any) {
      setErrorMessage(`Network error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl glass-card border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden bg-slate-900/95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl overflow-hidden border border-amber-500/50 bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <img
                src="/scout.png"
                alt="Scout"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Talk to the Beagle</h3>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              stopListening();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {successData ? (
            /* Success View */
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  Uploaded to the Beagle! 🐶
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Created GitHub Issue <span className="font-mono font-bold text-emerald-300">#{successData.issueNumber}</span> in the Beagle feedback inbox. It will be triaged and proposed for review!
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <a
                  href={successData.issueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-700"
                >
                  <span>View GitHub Issue</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => {
                    setSuccessData(null);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Input Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Textarea + Voice Microphone Trigger */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={dictatedText}
                  onChange={(e) => setDictatedText(e.target.value)}
                  placeholder={`Dictate directly what changes you want to be made.  Be explicit as possible.  Don't try to fix it, just point out what is wrong or what you want to see changed.\n\nEx: Benjamin's appointment on the 23rd for the Dentist is not appearing\n\nEx: I want Brighton's icon to be a picture of a Tuba`}
                  rows={7}
                  className="w-full p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 resize-none transition-all pr-12 font-sans leading-relaxed"
                  disabled={isSubmitting}
                />

                {/* Speech Dictation Mic Toggle Button */}
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={isSubmitting}
                    className={`absolute bottom-3 right-3 p-2.5 rounded-xl transition-all shadow-md active:scale-95 ${
                      isListening
                        ? "bg-rose-500 text-white animate-pulse shadow-rose-500/50"
                        : "bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300"
                    }`}
                    title={isListening ? "Stop dictation" : "Start voice dictation"}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Dictation Status Bar */}
              <div className="flex items-center justify-between text-xs px-1">
                <div className="flex items-center gap-2">
                  {isListening ? (
                    <span className="flex items-center gap-1.5 text-rose-400 font-bold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Listening... Speak clearly into your mic
                    </span>
                  ) : null}
                </div>
                <span className="text-slate-500 font-mono">
                  {dictatedText.length} chars
                </span>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    stopListening();
                    onClose();
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!dictatedText.trim() || isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send to Beagle</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
