// ─── Voice Command Registry ─────────────────────────────────────────────────
// Maps spoken phrases to portfolio navigation actions.
// Uses fuzzy matching so exact phrasing isn't required.

import { TOGGLE_COMMAND_PALETTE } from "#src/hooks/use-command-palette";

export interface VoiceAction {
  /** What to display when the command is matched */
  label: string;
  /** Category for visual feedback */
  category: "navigate" | "action" | "theme" | "secret";
  /** Execute the command */
  execute: (helpers: VoiceActionHelpers) => void;
}

export interface VoiceActionHelpers {
  navigate: (path: string) => void;
  scrollToSection: (id: string) => void;
  toggleTheme: () => void;
  scrollToTop: () => void;
}

interface VoiceCommandEntry {
  /** Phrases that trigger this command (lowercased) */
  phrases: string[];
  action: VoiceAction;
}

// ─── Command Definitions ────────────────────────────────────────────────────

const COMMANDS: VoiceCommandEntry[] = [
  // Navigation — Sections
  {
    phrases: ["go home", "home", "go to home", "homepage", "main page"],
    action: {
      label: "Going Home",
      category: "navigate",
      execute: ({ navigate }) => navigate("/"),
    },
  },
  {
    phrases: ["go to about", "about me", "about", "show about", "who are you"],
    action: {
      label: "Scrolling to About",
      category: "navigate",
      execute: ({ scrollToSection }) => scrollToSection("about"),
    },
  },
  {
    phrases: ["go to skills", "skills", "show skills", "what can you do", "technologies"],
    action: {
      label: "Scrolling to Skills",
      category: "navigate",
      execute: ({ scrollToSection }) => scrollToSection("skills"),
    },
  },
  {
    phrases: ["go to projects", "projects", "show projects", "portfolio", "show portfolio", "your work"],
    action: {
      label: "Scrolling to Projects",
      category: "navigate",
      execute: ({ scrollToSection }) => scrollToSection("projects"),
    },
  },
  {
    phrases: ["go to experience", "experience", "show experience", "work history", "career"],
    action: {
      label: "Scrolling to Experience",
      category: "navigate",
      execute: ({ scrollToSection }) => scrollToSection("experience"),
    },
  },
  {
    phrases: ["go to contact", "contact", "show contact", "get in touch", "reach out", "contact me"],
    action: {
      label: "Scrolling to Contact",
      category: "navigate",
      execute: ({ scrollToSection }) => scrollToSection("contact"),
    },
  },
  {
    phrases: ["go to services", "services", "show services", "what do you offer"],
    action: {
      label: "Scrolling to Services",
      category: "navigate",
      execute: ({ scrollToSection }) => scrollToSection("services"),
    },
  },
  {
    phrases: ["go to testimonials", "testimonials", "reviews", "show testimonials", "what people say"],
    action: {
      label: "Scrolling to Testimonials",
      category: "navigate",
      execute: ({ scrollToSection }) => scrollToSection("testimonials"),
    },
  },
  {
    phrases: ["go to guestbook", "guestbook", "sign guestbook", "guest book"],
    action: {
      label: "Scrolling to Guestbook",
      category: "navigate",
      execute: ({ scrollToSection }) => scrollToSection("guestbook"),
    },
  },
  {
    phrases: ["why hire me", "hire me", "go to hire", "why should i hire you"],
    action: {
      label: "Scrolling to Why Hire Me",
      category: "navigate",
      execute: ({ scrollToSection }) => scrollToSection("why-hire-me"),
    },
  },
  {
    phrases: ["engineering mindset", "mindset", "go to mindset"],
    action: {
      label: "Scrolling to Engineering Mindset",
      category: "navigate",
      execute: ({ scrollToSection }) => scrollToSection("mindset"),
    },
  },

  // Navigation — Pages
  {
    phrases: ["open resume", "show resume", "resume", "cv", "download resume"],
    action: {
      label: "Opening Resume",
      category: "navigate",
      execute: ({ navigate }) => navigate("/resume"),
    },
  },
  {
    phrases: ["open blog", "show blog", "blog", "articles", "read blog"],
    action: {
      label: "Opening Blog",
      category: "navigate",
      execute: ({ navigate }) => navigate("/blog"),
    },
  },
  {
    phrases: ["all projects", "projects page", "browse projects"],
    action: {
      label: "Opening Projects Page",
      category: "navigate",
      execute: ({ navigate }) => navigate("/projects"),
    },
  },
  {
    phrases: ["case studies", "case study", "show case studies"],
    action: {
      label: "Opening Case Studies",
      category: "navigate",
      execute: ({ navigate }) => navigate("/case-studies"),
    },
  },

  // Actions
  {
    phrases: ["search", "find", "open search", "command palette", "open command", "command"],
    action: {
      label: "Opening Command Palette",
      category: "action",
      execute: () => {
        window.dispatchEvent(new CustomEvent(TOGGLE_COMMAND_PALETTE, { detail: { open: true } }));
      },
    },
  },
  {
    phrases: ["scroll to top", "go to top", "top", "back to top", "scroll up"],
    action: {
      label: "Scrolling to Top",
      category: "action",
      execute: ({ scrollToTop }) => scrollToTop(),
    },
  },

  // Theme
  {
    phrases: ["dark mode", "switch to dark", "enable dark mode", "go dark"],
    action: {
      label: "Switching to Dark Mode",
      category: "theme",
      execute: ({ toggleTheme }) => toggleTheme(),
    },
  },
  {
    phrases: ["light mode", "switch to light", "enable light mode", "go light"],
    action: {
      label: "Switching to Light Mode",
      category: "theme",
      execute: ({ toggleTheme }) => toggleTheme(),
    },
  },
  {
    phrases: ["toggle theme", "change theme", "switch theme"],
    action: {
      label: "Toggling Theme",
      category: "theme",
      execute: ({ toggleTheme }) => toggleTheme(),
    },
  },

  // Secret
  {
    phrases: ["dev mode", "developer mode", "hack", "sudo dev mode", "activate dev mode"],
    action: {
      label: "Activating Dev Mode",
      category: "secret",
      execute: () => {
        window.dispatchEvent(new CustomEvent("activate-dev-mode"));
      },
    },
  },
];

// ─── Fuzzy Matching ─────────────────────────────────────────────────────────

/**
 * Calculates word-overlap score between the spoken transcript and a phrase.
 * Returns a score between 0 and 1.
 */
function wordOverlapScore(spoken: string, phrase: string): number {
  const spokenWords = spoken.toLowerCase().split(/\s+/).filter(Boolean);
  const phraseWords = phrase.split(/\s+/).filter(Boolean);

  if (phraseWords.length === 0 || spokenWords.length === 0) return 0;

  let matchCount = 0;
  for (const pw of phraseWords) {
    if (spokenWords.some((sw) => sw === pw || sw.includes(pw) || pw.includes(sw))) {
      matchCount++;
    }
  }

  // Weight by how much of the phrase was covered
  return matchCount / phraseWords.length;
}

/**
 * Find the best-matching voice command for a given transcript.
 * Returns null if no command exceeds the confidence threshold.
 */
export function matchVoiceCommand(
  transcript: string,
  threshold = 0.6
): VoiceAction | null {
  const cleaned = transcript.toLowerCase().trim();
  if (!cleaned) return null;

  let bestAction: VoiceAction | null = null;
  let bestScore = 0;

  for (const cmd of COMMANDS) {
    for (const phrase of cmd.phrases) {
      // Exact match — highest priority
      if (cleaned === phrase) {
        return cmd.action;
      }

      // Check if the spoken text contains the full phrase
      if (cleaned.includes(phrase)) {
        const score = 0.95; // Very high score for substring match
        if (score > bestScore) {
          bestScore = score;
          bestAction = cmd.action;
        }
        continue;
      }

      // Fuzzy word overlap
      const score = wordOverlapScore(cleaned, phrase);
      if (score > bestScore) {
        bestScore = score;
        bestAction = cmd.action;
      }
    }
  }

  return bestScore >= threshold ? bestAction : null;
}

/**
 * Get all available commands grouped by category (for help display).
 */
export function getAvailableCommands(): { category: string; commands: string[] }[] {
  const groups = new Map<string, string[]>();

  for (const cmd of COMMANDS) {
    const cat = cmd.action.category;
    if (!groups.has(cat)) groups.set(cat, []);
    // Use the first phrase as the representative
    groups.get(cat)!.push(cmd.phrases[0]);
  }

  return Array.from(groups.entries()).map(([category, commands]) => ({
    category,
    commands,
  }));
}
