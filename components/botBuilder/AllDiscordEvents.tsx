"use client";

export const DISCORD_EVENTS = [
  {
    category: "Bot Lifecycle",
    events: [
      { value: "on_ready", label: "Bot Ready", description: "Bot connects to Discord" },
      { value: "on_error", label: "Error", description: "Unhandled exception" },
      { value: "on_command_error", label: "Command Error", description: "Error in command execution" },
      { value: "on_resumed", label: "Resumed", description: "Bot resumes after disconnect" },
    ],
  },
  {
    category: "Messages",
    events: [
      { value: "on_message", label: "Message Sent", description: "Any message in server" },
      { value: "on_message_edit", label: "Message Edited", description: "User edits a message" },
      { value: "on_message_delete", label: "Message Deleted", description: "User deletes a message" },
      {
        value: "on_bulk_message_delete",
        label: "Bulk Delete",
        description: "Multiple messages deleted at once",
      },
      {
        value: "on_raw_message_edit",
        label: "Raw Message Edit",
        description: "Message edit without cache (advanced)",
      },
      {
        value: "on_raw_message_delete",
        label: "Raw Message Delete",
        description: "Message delete without cache (advanced)",
      },
    ],
  },
  {
    category: "Members",
    events: [
      {
        value: "on_member_join",
        label: "Member Joined",
        description: "User joins the server",
      },
      {
        value: "on_member_remove",
        label: "Member Left",
        description: "User leaves or is kicked",
      },
      {
        value: "on_member_update",
        label: "Member Updated",
        description: "User's roles/nickname/status changes",
      },
      {
        value: "on_user_update",
        label: "User Updated",
        description: "User's profile changes (username, avatar)",
      },
      {
        value: "on_presence_update",
        label: "Presence Updated",
        description: "User status or activity changes",
      },
    ],
  },
  {
    category: "Reactions",
    events: [
      {
        value: "on_reaction_add",
        label: "Reaction Added",
        description: "User adds reaction to message",
      },
      {
        value: "on_reaction_remove",
        label: "Reaction Removed",
        description: "User removes reaction from message",
      },
      {
        value: "on_reaction_clear",
        label: "Reactions Cleared",
        description: "All reactions removed from message",
      },
      {
        value: "on_reaction_clear_emoji",
        label: "Emoji Reactions Cleared",
        description: "All reactions of one emoji removed",
      },
      {
        value: "on_raw_reaction_add",
        label: "Raw Reaction Add",
        description: "Reaction added (without cache)",
      },
      {
        value: "on_raw_reaction_remove",
        label: "Raw Reaction Remove",
        description: "Reaction removed (without cache)",
      },
    ],
  },
  {
    category: "Voice",
    events: [
      {
        value: "on_voice_state_update",
        label: "Voice State Update",
        description: "User joins/leaves/mutes voice channel",
      },
    ],
  },
  {
    category: "Guilds",
    events: [
      {
        value: "on_guild_join",
        label: "Guild Joined",
        description: "Bot joins a new server",
      },
      {
        value: "on_guild_remove",
        label: "Guild Left",
        description: "Bot is removed from a server",
      },
      {
        value: "on_guild_update",
        label: "Guild Updated",
        description: "Server settings/name changes",
      },
      {
        value: "on_guild_emojis_update",
        label: "Emojis Updated",
        description: "Server emojis added/removed",
      },
      {
        value: "on_guild_available",
        label: "Guild Available",
        description: "Guild becomes available after outage",
      },
      {
        value: "on_guild_unavailable",
        label: "Guild Unavailable",
        description: "Guild becomes unavailable",
      },
    ],
  },
  {
    category: "Channels",
    events: [
      {
        value: "on_guild_channel_create",
        label: "Channel Created",
        description: "Channel added to server",
      },
      {
        value: "on_guild_channel_delete",
        label: "Channel Deleted",
        description: "Channel removed from server",
      },
      {
        value: "on_guild_channel_update",
        label: "Channel Updated",
        description: "Channel name/permissions change",
      },
      {
        value: "on_private_channel_create",
        label: "DM Created",
        description: "DM channel opened",
      },
      {
        value: "on_private_channel_delete",
        label: "DM Closed",description: "DM channel closed",
      },
    ],
  },
  {
    category: "Roles",
    events: [
      {
        value: "on_guild_role_create",
        label: "Role Created",
        description: "New role added to server",
      },
      {
        value: "on_guild_role_delete",
        label: "Role Deleted",
        description: "Role removed from server",
      },
      {
        value: "on_guild_role_update",
        label: "Role Updated",
        description: "Role permissions/color changes",
      },
    ],
  },
  {
    category: "Typing",
    events: [
      {
        value: "on_typing",
        label: "Typing",
        description: "User starts typing a message",
      },
    ],
  },
  {
    category: "Integrations",
    events: [
      {
        value: "on_webhooks_update",
        label: "Webhooks Updated",
        description: "Webhooks in channel updated",
      },
      {
        value: "on_automod_action",
        label: "AutoMod Action",
        description: "AutoMod blocks a message",
      },
    ],
  },
];
