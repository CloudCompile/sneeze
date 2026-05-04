"use client";

import { useState } from "react";
import { Info } from "lucide-react";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export function Tooltip({ text, children }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 left-0 top-full mt-1 w-48 px-3 py-2 bg-slate-950/95 text-slate-100 text-xs rounded border border-slate-600/50 pointer-events-none shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
}

export function HelpIcon({ text }: { text: string }) {
  const [show, setShow] = useState(false);

  return (
    <Tooltip text={text}>
      <Info
        size={14}
        className="inline-block ml-1 text-slate-400 hover:text-slate-300"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
    </Tooltip>
  );
}

export const HELP_TEXT = {
  commandName:
    "The command name users will type. Keep it lowercase with no spaces (e.g., 'ping', 'user_info')",
  commandType: {
    slash: "Modern Discord commands starting with / — recommended for most bots",
    text: "Classic prefix commands starting with ! or your custom prefix",
    component: "Buttons, select menus, and modals for interactive responses",
  },
  commandDescription:
    "A brief description shown in Discord's command list and help text. Keep it under 100 characters.",
  parameters:
    "Optional values users provide when running your command (e.g., a username, a number, a choice)",
  responseType: {
    text: "Plain text message — use for quick responses",
    embed: "Rich formatted message with title, description, color, and fields",
    image: "Message with an image URL",
  },
  permissions:
    "Who can run this command: Everyone, Server Admins, Bot Owner, or specific roles",
  cooldown:
    "Prevent spam by waiting X seconds between each user running this command",
  prefix:
    "The symbol that starts text commands. Most bots use ! but you can customize it",
  intents:
    "Permissions the bot needs to function. Check what your commands require.",
  filter: "Run the event only when specific conditions are met (e.g., only in a specific channel)",
  embed:
    "A formatted message card with color, title, fields, and footer. Better than plain text!",
};
