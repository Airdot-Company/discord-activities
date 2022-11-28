const Discord = require("discord.js");
const path = require("path");

const client = new Discord.Client({
    intents: [
        Discord.IntentsBitField.Flags.Guilds
    ]
});

client.commands = new Discord.Collection();

const { REST, Routes, OAuth2Scopes, Events } = require('discord.js');
const { client_id, guild_id, token } = require('../config.json');
const fs = require('node:fs');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
// Grab all the command files from the commands directory you created earlier
const commandFiles = fs.readdirSync('./tests/commands').filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token);

// and deploy your commands!
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationCommands(client_id, guild_id),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();

client.on("ready", async () => {
    console.log(
        "Ready"
    )
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        interaction.reply({
            content: `No command matching ${interaction.commandName} was found.`,
            ephemeral: true
        });
        return;
    }

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(token);
