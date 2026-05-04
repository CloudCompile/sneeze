export interface BotConfig {
  name: string;
  description: string;
  prefix: string;
  status: string;
  intents: string[];
}

export interface CommandParam {
  id: string;
  name: string;
  type: "string" | "integer" | "boolean" | "user" | "role" | "channel";
  required?: boolean;
}

export interface Command {
  id: string;
  name: string;
  description: string;
  type: "slash" | "text" | "component";
  params: CommandParam[];
  response: {
    type: "text" | "embed" | "image";
    content: string;
  };
}

export interface EventHandler {
  id: string;
  type:
    | "on_ready"
    | "on_message"
    | "on_member_join"
    | "on_member_remove"
    | "on_reaction_add"
    | "on_voice_state_update";
  filter?: string;
  action: "send_message" | "add_role" | "delete_message" | "log";
  content: string;
}

export interface BotState {
  config: BotConfig;
  commands: Command[];
  events: EventHandler[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  state: BotState;
}
