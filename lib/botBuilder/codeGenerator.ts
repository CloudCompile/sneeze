import type { BotConfig, Command, EventHandler, BotState } from "./types";

export function generateBotCode(state: BotState): string {
  const { config, commands, events } = state;

  const intentsCode = generateIntents(config.intents);
  const commandsCode = commands.map((cmd) => generateCommand(cmd)).join("\n\n");
  const eventsCode = events.map((evt) => generateEventHandler(evt)).join("\n\n");

  return `import discord
from discord.ext import commands
import os
from dotenv import load_dotenv
import logging

load_dotenv()
TOKEN = os.getenv('DISCORD_TOKEN')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up intents
intents = discord.Intents.default()
${intentsCode}

# Create bot
bot = commands.Bot(command_prefix="${config.prefix}", intents=intents)

@bot.event
async def on_ready():
    """Called when the bot successfully connects to Discord."""
    logger.info(f'{bot.user} has connected to Discord!')
    await bot.change_presence(activity=discord.Game(name="${config.status || 'with slash commands'}"))

${commandsCode}

${eventsCode}

if __name__ == "__main__":
    bot.run(TOKEN)
`;
}

function generateIntents(intents: string[]): string {
  const intentsMap: { [key: string]: string } = {
    message_content: "intents.message_content = True",
    members: "intents.members = True",
    guilds: "intents.guilds = True",
    messages: "intents.messages = True",
    reactions: "intents.reactions = True",
    voice_states: "intents.voice_states = True",
    moderation: "intents.moderation = True",
    guild_messages: "intents.guild_messages = True",
  };

  return intents.map((intent) => intentsMap[intent] || "").filter(Boolean).join("\n");
}

function generateCommand(cmd: Command): string {
  const params = cmd.params
    .map((param) => {
      const typeMap: { [key: string]: string } = {
        string: "str",
        integer: "int",
        boolean: "bool",
        user: "discord.User",
        role: "discord.Role",
        channel: "discord.TextChannel",
      };
      return `${param.name}: ${typeMap[param.type] || "str"}`;
    })
    .join(", ");

  const paramsStr = params ? `, ${params}` : "";

  const responseCode = generateResponse(cmd.response);

  if (cmd.type === "slash") {
    return `@bot.slash_command(description="${cmd.description}")
async def ${cmd.name}(interaction: discord.Interaction${paramsStr}):
    """${cmd.description}"""
    try:
${responseCode}
    except Exception as e:
        logger.error(f"Error in /${cmd.name}: {e}")
        await interaction.response.send_message("An error occurred.", ephemeral=True)`;
  } else if (cmd.type === "text") {
    return `@bot.command(name="${cmd.name}", help="${cmd.description}")
async def ${cmd.name}(ctx${paramsStr}):
    """${cmd.description}"""
    try:
${responseCode}
    except Exception as e:
        logger.error(f"Error in !${cmd.name}: {e}")
        await ctx.send("An error occurred.")`;
  }

  return "";
}

function generateResponse(response: { type: string; content: string }): string {
  const content = response.content.replace(/"/g, '\\"');

  if (response.type === "text") {
    return `        await interaction.response.send_message("${content}")`;
  } else if (response.type === "embed") {
    return `        embed = discord.Embed(
            title="Title",
            description="${content}",
            color=discord.Color.blurple()
        )
        await interaction.response.send_message(embed=embed)`;
  }

  return `        await interaction.response.send_message("${content}")`;
}

function generateEventHandler(evt: EventHandler): string {
  const eventMap: { [key: string]: string } = {
    on_ready: "@bot.event\nasync def on_ready():",
    on_message:
      "@bot.event\nasync def on_message(message: discord.Message):\n    if message.author == bot.user:\n        return",
    on_member_join: "@bot.event\nasync def on_member_join(member: discord.Member):",
    on_member_remove: "@bot.event\nasync def on_member_remove(member: discord.Member):",
    on_reaction_add: "@bot.event\nasync def on_reaction_add(reaction: discord.Reaction, user: discord.User):",
    on_voice_state_update:
      "@bot.event\nasync def on_voice_state_update(member: discord.Member, before: discord.VoiceState, after: discord.VoiceState):",
  };

  let eventDef = eventMap[evt.type] || "";

  let actionCode = "";
  if (evt.action === "send_message") {
    if (evt.type === "on_message") {
      actionCode = `    await message.channel.send("${evt.content.replace(/"/g, '\\"')}")`;
    } else if (evt.type === "on_member_join") {
      actionCode = `    await member.send("${evt.content.replace(/"/g, '\\"')}")`;
    } else {
      actionCode = `    logger.info("Event triggered: ${evt.type}")`;
    }
  } else if (evt.action === "add_role") {
    actionCode = `    # Add role logic here\n    logger.info("Role action triggered")`;
  }

  return `${eventDef}
    """Handle ${evt.type} event."""
    try:
${actionCode}
    except Exception as e:
        logger.error(f"Error in ${evt.type}: {e}")`;
}

export function generateRequirementsTxt(): string {
  return `discord.py>=2.3.0
python-dotenv>=1.0.0
`;
}

export function generateEnvExample(): string {
  return `# Discord Bot Token
DISCORD_TOKEN=your_bot_token_here

# Optional: Server IDs for testing
GUILD_ID=your_guild_id_here
`;
}

export function generateReadme(botName: string): string {
  return `# ${botName}

A Discord bot generated by Discord Bot Builder.

## Setup

1. **Install dependencies:**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

2. **Create a \`.env\` file:**
   Copy \`.env.example\` to \`.env\` and add your Discord bot token.

3. **Run the bot:**
   \`\`\`bash
   python bot.py
   \`\`\`

## Creating a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and enter a name
3. Go to the "Bot" section and click "Add Bot"
4. Under TOKEN, click "Copy" to copy your bot token
5. Paste the token in your \`.env\` file

## Inviting the Bot

1. Go to "OAuth2" > "URL Generator"
2. Select scopes: \`bot\`
3. Select permissions: \`Send Messages\`, \`Embed Links\`, etc.
4. Copy the generated URL and open it in your browser

## Support

For more info on discord.py, visit: https://discordpy.readthedocs.io
`;
}
