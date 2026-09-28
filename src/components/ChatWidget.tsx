"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { findCitedMenuItems, menuHref } from "@/lib/menu";

/**
 * Sylvia's Concierge chat widget: a floating launcher + slide-up panel, mounted
 * site-wide from the root layout. Talks to /api/chat (AI SDK default transport).
 *
 * All styling is scoped under #sylvias-concierge and applied via inline styles /
 * an id-prefixed <style> block so it can't collide with the vendored clone CSS
 * (which loads last and wins class/element ties).
 */

// Pulled from public/vendor/sylvias.css, not invented: #f15a24 is the site's
// actual CTA button fill (.reservations a, .email-subscription a); #EC5823 is
// its heading/hover accent. Panels are plain white — the site doesn't use tan.
const ORANGE = "#f15a24";
const ORANGE_ACCENT = "#EC5823";
// The site's real nav-toggle pair, from the per-domain custom.css override
// (loaded last in layout.tsx, above): #331F52 deep purple / #F5C552 gold,
// used as an alternating bg/text pair for active nav states.
const PURPLE = "#331F52";
const GOLD_ACCENT = "#F5C552";
const INK = "#1a1a1a";

const SUGGESTIONS = [
  "What's on special today?",
  "Do you have steak?",
  "Book a table for 4 this Friday at 7pm",
];

function messageText(parts: { type: string }[]): string {
  return parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = status === "submitted" || status === "streaming";
  const lastIsUser = messages[messages.length - 1]?.role === "user";
  const showTyping = busy && lastIsUser;

  // Keep the latest message in view as content streams in.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, showTyping]);

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <div id="sylvias-concierge">
      <style>{scopedCss}</style>

      {open && (
        <section className="sc-panel" role="dialog" aria-label="Sylvia's Concierge chat">
          <button
            type="button"
            className="sc-close"
            aria-label="Close chat"
            onClick={() => setOpen(false)}
          >
            ×
          </button>

          <div className="sc-messages" ref={scrollRef}>
            <div className="sc-heading">
              <div className="sc-title">Sylvia&apos;s Concierge</div>
              <div className="sc-subtitle">Menu, specials &amp; table booking</div>
            </div>
            {messages.length === 0 ? (
              <div className="sc-empty">
                <p className="sc-empty-lead">
                  Hi! I&apos;m your digital host. Ask me about the menu, drinks,
                  specials, or events — or book a table right here.
                </p>
                <div className="sc-suggests">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="sc-suggest"
                      onClick={() => submit(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const text = messageText(m.parts);
                if (!text) return null; // skip tool-only steps
                // Only card dishes that have a photo — every shown card has a pic + link.
                const cited =
                  m.role === "assistant" ? findCitedMenuItems(text).filter((i) => i.image) : [];
                return (
                  <div key={m.id} className="sc-msg">
                    <div className={`sc-row sc-${m.role}`}>
                      <div className="sc-bubble">{text}</div>
                    </div>
                    {cited.length > 0 && (
                      <div className="sc-cards">
                        {cited.map((item) => (
                          // Client-side nav (not a hard <a>) so this widget — mounted
                          // once in the root layout — never unmounts, and the
                          // conversation survives the trip to the menu page.
                          <Link
                            key={item.slug}
                            className="sc-card"
                            href={menuHref(item)}
                            title={`View ${item.name} on the menu`}
                          >
                            {item.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img className="sc-card-img" src={item.image} alt={item.name} />
                            ) : (
                              <span className="sc-card-img sc-card-noimg" aria-hidden="true">🍽️</span>
                            )}
                            <span className="sc-card-name">{item.name}</span>
                            {item.price > 0 && <span className="sc-card-price">${item.price}</span>}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {showTyping && (
              <div className="sc-row sc-assistant">
                <div className="sc-bubble sc-typing" aria-label="Concierge is typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            {status === "error" && (
              <div className="sc-row sc-assistant">
                <div className="sc-bubble sc-error">
                  Sorry — something went wrong. Please try again, or call us at
                  (212) 996-0660.
                </div>
              </div>
            )}
          </div>

          <form
            className="sc-inputbar"
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
          >
            <input
              ref={inputRef}
              className="sc-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question or book a table…"
              aria-label="Message Sylvia's Concierge"
              autoComplete="off"
            />
            <button
              type="submit"
              className="sc-send"
              disabled={busy || input.trim() === ""}
              aria-label="Send message"
            >
              Send
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="sc-launcher"
        aria-label={open ? "Close Sylvia's Concierge" : "Open Sylvia's Concierge"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <span>Chat</span>
        )}
      </button>
    </div>
  );
}

const scopedCss = `
#sylvias-concierge { position: fixed; z-index: 2147483000; }
#sylvias-concierge * { box-sizing: border-box; }

/* Purple/gold is the site's real nav-toggle pair (custom.css), not the
   sylvias.css orange — used here so the launcher reads as "site chrome",
   not a bolted-on widget. */
/* The launcher itself is the speech bubble: a circle with a small tail. */
#sylvias-concierge .sc-launcher {
  position: fixed; right: 20px; bottom: 20px;
  width: 60px; height: 60px; padding: 0;
  /* A full circle (border-radius: 50%) curves away from its bounding box
     near the corners, so a tail anchored there floats with a visible gap.
     A rounded square keeps flat edges near the corner for the tail to
     actually touch. */
  border: 1px solid ${GOLD_ACCENT}; border-radius: 14px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  background: ${PURPLE}; color: ${GOLD_ACCENT};
  font-size: 14px; font-weight: 700; font-family: inherit;
  box-shadow: 0 6px 20px rgba(0,0,0,.28);
}
#sylvias-concierge .sc-launcher svg { width: 22px; height: 22px; }
/* Tail is two stacked triangles: a larger gold one (the "border") behind a
   smaller purple one (the fill), offset by the circle's border width. */
#sylvias-concierge .sc-launcher::before {
  content: ""; position: absolute; left: 16px; bottom: -8px;
  width: 0; height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 9px solid ${GOLD_ACCENT};
}
#sylvias-concierge .sc-launcher::after {
  content: ""; position: absolute; left: 17px; bottom: -6px;
  width: 0; height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 8px solid ${PURPLE};
}
#sylvias-concierge .sc-launcher:hover { background: ${GOLD_ACCENT}; color: ${PURPLE}; }
#sylvias-concierge .sc-launcher:hover::after { border-top-color: ${GOLD_ACCENT}; }
#sylvias-concierge .sc-launcher:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }

#sylvias-concierge .sc-panel {
  position: fixed; right: 20px; bottom: 92px;
  width: min(380px, calc(100vw - 40px));
  height: min(560px, calc(100vh - 120px));
  display: flex; flex-direction: column;
  background: #fff; color: ${INK};
  border-radius: 14px; overflow: hidden;
  box-shadow: 0 12px 40px rgba(0,0,0,.35);
  font-family: inherit;
  animation: sc-rise .18s ease-out;
}
@keyframes sc-rise { from { transform: translateY(8px); opacity: 0; } to { transform: none; opacity: 1; } }

/* Transparent header: no colored bar. Close button floats over the top-right; the
   title/subtitle live at the top of the chat area (scroll with the conversation). */
#sylvias-concierge .sc-close {
  position: absolute; top: 8px; right: 8px; z-index: 5;
  width: 38px; height: 38px; border-radius: 50%; border: none; cursor: pointer;
  font-size: 22px; line-height: 38px; color: ${INK};
  background: rgba(255,255,255,.75); backdrop-filter: blur(3px);
}
#sylvias-concierge .sc-close:hover { background: rgba(240,240,240,.95); }
#sylvias-concierge .sc-heading {
  padding: 2px 44px 12px 2px; margin-bottom: 8px; border-bottom: 1px solid #eee;
}
#sylvias-concierge .sc-title { font-size: 17px; font-weight: 700; color: ${INK}; }
#sylvias-concierge .sc-subtitle { font-size: 12px; color: #666; margin-top: 2px; }

#sylvias-concierge .sc-messages {
  flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px;
}
#sylvias-concierge .sc-empty-lead { font-size: 14px; line-height: 1.5; margin: 0 0 14px; }
#sylvias-concierge .sc-suggests { display: flex; flex-direction: column; gap: 8px; }
#sylvias-concierge .sc-suggest {
  text-align: left; padding: 11px 13px; border: 1px solid ${ORANGE_ACCENT};
  background: #fff; color: ${INK}; border-radius: 10px; cursor: pointer;
  font-size: 13.5px; font-family: inherit; min-height: 44px;
}
#sylvias-concierge .sc-suggest:hover { background: #fdeee7; }

#sylvias-concierge .sc-msg { display: flex; flex-direction: column; gap: 8px; }
#sylvias-concierge .sc-row { display: flex; }
#sylvias-concierge .sc-user { justify-content: flex-end; }
#sylvias-concierge .sc-assistant { justify-content: flex-start; }

/* Menu-item thumbnail cards under a reply that names a dish. */
#sylvias-concierge .sc-cards { display: flex; gap: 8px; overflow-x: auto; padding: 2px 1px 4px; }
#sylvias-concierge .sc-card { flex: 0 0 auto; width: 128px; text-decoration: none; color: ${INK};
  border: 1px solid #eee; border-radius: 12px; background: #fff; overflow: hidden; }
#sylvias-concierge .sc-card:hover { border-color: ${ORANGE_ACCENT}; box-shadow: 0 2px 10px rgba(0,0,0,.12); }
#sylvias-concierge .sc-card-img { display: block; width: 100%; height: 76px; object-fit: cover; background: #f2f2f2; }
#sylvias-concierge .sc-card-noimg { display: flex; align-items: center; justify-content: center; font-size: 28px; }
#sylvias-concierge .sc-card-name { display: block; font-size: 12px; line-height: 1.3; padding: 6px 8px 0; font-weight: 600; }
#sylvias-concierge .sc-card-price { display: block; font-size: 12px; color: ${ORANGE_ACCENT}; font-weight: 700; padding: 2px 8px 8px; }
#sylvias-concierge .sc-bubble {
  max-width: 82%; padding: 10px 13px; border-radius: 14px;
  font-size: 14px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word;
}
#sylvias-concierge .sc-user .sc-bubble { background: ${ORANGE}; color: #fff; border-bottom-right-radius: 4px; }
#sylvias-concierge .sc-assistant .sc-bubble { background: #f2f2f2; color: ${INK}; border-bottom-left-radius: 4px; }
#sylvias-concierge .sc-error { background: #fbe3d8 !important; color: #7a2e12 !important; }

#sylvias-concierge .sc-typing { display: inline-flex; gap: 4px; align-items: center; }
#sylvias-concierge .sc-typing span {
  width: 7px; height: 7px; border-radius: 50%; background: ${ORANGE};
  animation: sc-blink 1.2s infinite ease-in-out;
}
#sylvias-concierge .sc-typing span:nth-child(2) { animation-delay: .2s; }
#sylvias-concierge .sc-typing span:nth-child(3) { animation-delay: .4s; }
@keyframes sc-blink { 0%, 80%, 100% { opacity: .3; } 40% { opacity: 1; } }

#sylvias-concierge .sc-inputbar {
  display: flex; gap: 8px; padding: 12px; border-top: 1px solid #eee; background: #fff;
}
#sylvias-concierge .sc-input {
  flex: 1; min-height: 44px; padding: 0 13px; border: 1px solid #ddd;
  border-radius: 10px; font-size: 14px; font-family: inherit; color: ${INK}; background: #fff;
}
#sylvias-concierge .sc-input:focus-visible { outline: 2px solid ${ORANGE_ACCENT}; outline-offset: 0; border-color: ${ORANGE_ACCENT}; }
#sylvias-concierge .sc-send {
  min-height: 44px; padding: 0 18px; border: none; border-radius: 10px; cursor: pointer;
  background: ${ORANGE}; color: #fff; font-size: 14px; font-weight: 700; font-family: inherit;
  text-transform: uppercase; letter-spacing: .04em;
}
#sylvias-concierge .sc-send:disabled { opacity: .5; cursor: not-allowed; }
#sylvias-concierge .sc-send:not(:disabled):hover { filter: brightness(1.08); }

@media (prefers-reduced-motion: reduce) {
  #sylvias-concierge .sc-panel { animation: none; }
  #sylvias-concierge .sc-typing span { animation: none; }
}
`;
