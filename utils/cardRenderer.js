
const { createCanvas, loadImage } = require("@napi-rs/canvas");

async function renderStatsCard(member, data, rank = 1) {
  const canvas = createCanvas(900, 300);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, 900, 300);

  // Decorative background
  ctx.fillStyle = "#1f2937";
  ctx.beginPath();
  ctx.roundRect(20, 20, 860, 260, 24);
  ctx.fill();

  // Accent
  ctx.fillStyle = "#8b5cf6";
  ctx.beginPath();
  ctx.roundRect(20, 20, 12, 260, 6);
  ctx.fill();

  // Avatar
  const avatar = await loadImage(
    member.user.displayAvatarURL({ extension: "png", size: 256 })
  );

  ctx.save();
  ctx.beginPath();
  ctx.arc(145, 140, 72, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(avatar, 73, 68, 144, 144);
  ctx.restore();

  // Username
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 34px sans-serif";
  ctx.fillText(member.user.username, 250, 85);

  // Level
  ctx.fillStyle = "#c4b5fd";
  ctx.font = "bold 25px sans-serif";
  ctx.fillText(`LEVEL ${data.level}`, 250, 130);

  // Stats
  ctx.fillStyle = "#e5e7eb";
  ctx.font = "22px sans-serif";
  ctx.fillText(`XP: ${data.xp}`, 250, 175);
  ctx.fillText(`Messages: ${data.messages}`, 480, 175);
  ctx.fillText(`Voice: ${Math.floor(data.voiceTime / 60)} min`, 250, 215);
  ctx.fillText(`Rank: #${rank}`, 480, 215);

  // Progress bar
  const progress = data.xp % 100;

  ctx.fillStyle = "#374151";
  ctx.beginPath();
  ctx.roundRect(250, 235, 550, 20, 10);
  ctx.fill();

  ctx.fillStyle = "#8b5cf6";
  ctx.beginPath();
  ctx.roundRect(250, 235, Math.max(10, 550 * progress / 100), 20, 10);
  ctx.fill();

  ctx.fillStyle = "#9ca3af";
  ctx.font = "16px sans-serif";
  ctx.fillText(`${progress}/100 XP`, 810, 250);

  return canvas.toBuffer("image/png");
}

module.exports = { renderStatsCard };
  
