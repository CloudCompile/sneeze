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
    | "on_message_edit"
    | "on_message_delete"
    | "on_bulk_message_delete"
    | "on_member_join"
    | "on_member_remove"
    | "on_member_update"
    | "on_user_update"
    | "on_presence_update"
    | "on_reaction_add"
    | "on_reaction_remove"
    | "on_reaction_clear"
    | "on_reaction_clear_emoji"
    | "on_raw_reaction_add"
    | "on_raw_reaction_remove"
    | "on_voice_state_update"
    | "on_guild_join"
    | "on_guild_remove"
    | "on_guild_update"
    | "on_guild_emojis_update"
    | "on_guild_available"
    | "on_guild_unavailable"
    | "on_guild_channel_create"
    | "on_guild_channel_delete"
    | "on_guild_channel_update"
    | "on_private_channel_create"
    | "on_private_channel_delete"
    | "on_guild_role_create"
    | "on_guild_role_delete"
    | "on_guild_role_update"
    | "on_typing"
    | "on_webhooks_update"
    | "on_automod_action"
    | "on_error"
    | "on_command_error"
    | "on_raw_message_edit"
    | "on_raw_message_delete";
  filter?: string;
  action: "send_message" | "add_role" | "remove_role" | "delete_message" | "ban_user" | "kick_user" | "mute_user" | "log" | "custom_code";
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
