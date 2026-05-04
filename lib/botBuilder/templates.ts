import type { Template, BotState } from "./types";

const blankTemplate: BotState = {
  config: {
    name: "MyBot",
    description: "A cool Discord bot",
    prefix: "!",
    status: "with slash commands",
    intents: ["message_content", "members", "guilds", "messages"],
  },
  commands: [],
  events: [],
};

const moderationTemplate: BotState = {
  config: {
    name: "ModerationBot",
    description: "A bot for server moderation",
    prefix: "!",
    status: "over the server",
    intents: ["message_content", "members", "guilds", "messages", "moderation"],
  },
  commands: [
    {
      id: "1",
      name: "kick",
      description: "Kick a user from the server",
      type: "slash",
      params: [
        { id: "1", name: "user", type: "user", required: true },
        { id: "2", name: "reason", type: "string", required: false },
      ],
      response: {
        type: "text",
        content: "User has been kicked from the server.",
      },
    },
    {
      id: "2",
      name: "ban",
      description: "Ban a user from the server",
      type: "slash",
      params: [
        { id: "1", name: "user", type: "user", required: true },
        { id: "2", name: "reason", type: "string", required: false },
      ],
      response: {
        type: "text",
        content: "User has been banned from the server.",
      },
    },
    {
      id: "3",
      name: "warn",
      description: "Warn a user",
      type: "slash",
      params: [
        { id: "1", name: "user", type: "user", required: true },
        { id: "2", name: "reason", type: "string", required: true },
      ],
      response: {
        type: "text",
        content: "User has been warned.",
      },
    },
    {
      id: "4",
      name: "mute",
      description: "Mute a user",
      type: "slash",
      params: [
        { id: "1", name: "user", type: "user", required: true },
        { id: "2", name: "duration", type: "integer", required: true },
      ],
      response: {
        type: "text",
        content: "User has been muted.",
      },
    },
  ],
  events: [
    {
      id: "1",
      type: "on_member_join",
      action: "send_message",
      content: "Welcome to the server! Please read the rules.",
      filter: "all",
    },
  ],
};

const funTemplate: BotState = {
  config: {
    name: "FunBot",
    description: "A fun bot with games and utilities",
    prefix: "!",
    status: "for fun!",
    intents: ["message_content", "members", "guilds", "messages"],
  },
  commands: [
    {
      id: "1",
      name: "joke",
      description: "Tell a random joke",
      type: "slash",
      params: [],
      response: {
        type: "text",
        content: "Why don't scientists trust atoms? Because they make up everything!",
      },
    },
    {
      id: "2",
      name: "roll",
      description: "Roll a dice",
      type: "slash",
      params: [
        { id: "1", name: "sides", type: "integer", required: false },
      ],
      response: {
        type: "text",
        content: "You rolled a 6!",
      },
    },
    {
      id: "3",
      name: "8ball",
      description: "Ask the magic 8 ball",
      type: "slash",
      params: [
        { id: "1", name: "question", type: "string", required: true },
      ],
      response: {
        type: "text",
        content: "The magic 8 ball says: Yes, definitely!",
      },
    },
  ],
  events: [
    {
      id: "1",
      type: "on_message",
      action: "log",
      content: "Message received",
      filter: "all",
    },
  ],
};

const utilityTemplate: BotState = {
  config: {
    name: "UtilityBot",
    description: "A bot with useful utilities",
    prefix: "!",
    status: "helpful commands",
    intents: ["message_content", "members", "guilds", "messages"],
  },
  commands: [
    {
      id: "1",
      name: "ping",
      description: "Check bot latency",
      type: "slash",
      params: [],
      response: {
        type: "text",
        content: "Pong! 🏓",
      },
    },
    {
      id: "2",
      name: "serverinfo",
      description: "Get server information",
      type: "slash",
      params: [],
      response: {
        type: "embed",
        content: "Server information retrieved.",
      },
    },
    {
      id: "3",
      name: "userinfo",
      description: "Get user information",
      type: "slash",
      params: [
        { id: "1", name: "user", type: "user", required: false },
      ],
      response: {
        type: "embed",
        content: "User information displayed.",
      },
    },
  ],
  events: [],
};

const musicTemplate: BotState = {
  config: {
    name: "MusicBot",
    description: "A bot that plays music",
    prefix: "!",
    status: "music",
    intents: ["message_content", "members", "guilds", "messages", "voice_states"],
  },
  commands: [
    {
      id: "1",
      name: "play",
      description: "Play a song",
      type: "slash",
      params: [
        { id: "1", name: "song", type: "string", required: true },
      ],
      response: {
        type: "text",
        content: "Now playing: [Song Name]",
      },
    },
    {
      id: "2",
      name: "pause",
      description: "Pause the music",
      type: "slash",
      params: [],
      response: {
        type: "text",
        content: "Music paused.",
      },
    },
    {
      id: "3",
      name: "resume",
      description: "Resume the music",
      type: "slash",
      params: [],
      response: {
        type: "text",
        content: "Music resumed.",
      },
    },
    {
      id: "4",
      name: "queue",
      description: "Show the music queue",
      type: "slash",
      params: [],
      response: {
        type: "embed",
        content: "Queue displayed.",
      },
    },
  ],
  events: [
    {
      id: "1",
      type: "on_voice_state_update",
      action: "log",
      content: "Voice state updated",
      filter: "all",
    },
  ],
};

export const templates: Template[] = [
  {
    id: "blank",
    name: "Blank Bot",
    description: "Start from scratch with a minimal template",
    state: blankTemplate,
  },
  {
    id: "moderation",
    name: "Moderation Bot",
    description: "Pre-configured with moderation commands (kick, ban, warn, mute)",
    state: moderationTemplate,
  },
  {
    id: "fun",
    name: "Fun Bot",
    description: "Games and fun commands (jokes, dice roll, magic 8 ball)",
    state: funTemplate,
  },
  {
    id: "utility",
    name: "Utility Bot",
    description: "Useful commands (ping, server info, user info)",
    state: utilityTemplate,
  },
  {
    id: "music",
    name: "Music Bot",
    description: "Music player with queue and playback controls",
    state: musicTemplate,
  },
];

export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}
