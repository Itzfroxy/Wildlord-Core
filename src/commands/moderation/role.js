const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

async function manageRole(guild, target, moderator, role, action) {
  const executor = await guild.members.fetch(moderator.id);
  const member = await guild.members.fetch(target.id).catch(() => null);

  if (!executor.permissions.has(PermissionFlagsBits.ManageRoles)) {
    return "❌ तुम्हारे पास Manage Roles Permission नहीं है।";
  }

  if (!member) return "❌ Member Server में नहीं मिला।";

  if (role.id === guild.id || role.managed) {
    return "❌ इस Role को Add या Remove नहीं किया जा सकता।";
  }

  if (
    guild.ownerId !== moderator.id &&
    executor.roles.highest.comparePositionTo(role) <= 0
  ) {
    return "❌ तुम अपनी बराबर या ऊपर की Role Manage नहीं कर सकते।";
  }

  if (!role.editable) {
    return "❌ Bot की Role इस Role से ऊपर होनी चाहिए।";
  }

  try {
    if (action === "add") {
      if (member.roles.cache.has(role.id)) {
        return "❌ Member के पास यह Role पहले से है।";
      }

      await member.roles.add(role);
      return `✅ ${role} Role ${target.tag} को दे दी गई।`;
    }

    if (!member.roles.cache.has(role.id)) {
      return "❌ Member के पास यह Role नहीं है।";
    }

    await member.roles.remove(role);
    return `✅ ${target.tag} से ${role} Role हटा दी गई।`;

  } catch (error) {
    console.error("Role command error:", error);
    return "❌ Role Manage नहीं हो पाई। Permissions चेक करो।";
  }
}

module.exports = {
  name: "role",
  aliases: ["giverole", "removerole"],

  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Add or remove a role from a member")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Select member")
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName("role")
        .setDescription("Select role")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("action")
        .setDescription("Choose an action")
        .setRequired(true)
        .addChoices(
          { name: "Add Role", value: "add" },
          { name: "Remove Role", value: "remove" }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(message, args) {
    if (!message.mentions.users.first()) {
      return message.reply("Usage: `,role @user @role add/remove`");
    }

    const target = message.mentions.users.first();
    const role = message.mentions.roles.first();
    const action = args.find(arg =>
      ["add", "remove"].includes(arg.toLowerCase())
    )?.toLowerCase();

    if (!role || !action) {
      return message.reply("❌ Role Mention और `add` या `remove` लिखो।");
    }

    const result = await manageRole(
      message.guild, target, message.author, role, action
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");
    const role = interaction.options.getRole("role");
    const action = interaction.options.getString("action");

    const result = await manageRole(
      interaction.guild, target, interaction.user, role, action
    );

    return interaction.reply(result);
  }
};
