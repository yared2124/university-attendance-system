import { Bot, InlineKeyboard, Keyboard } from "grammy";
import { dataStore } from "@/lib/db/store";
import { verifyContactOwnership } from "@/lib/auth/telegram";
import { verifyRollingCodeToken } from "@/lib/redis/token-service";

const token = process.env.TELEGRAM_BOT_TOKEN || "mock_bot_token_for_dev_mode";
export const bot = new Bot(token);

// 1. Command /start
bot.command("start", async (ctx) => {
  const from = ctx.from;
  if (!from) return;

  const telegramIdStr = from.id.toString();
  // Check if student or faculty is already registered and bound
  const existingUser = dataStore.users.find((u) => u.telegramId === telegramIdStr);

  if (existingUser) {
    const roleEmoji = existingUser.role === "STUDENT" ? "🎓" : "👨‍🏫";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const welcomeMsg =
      `👋 *እንኳን ደህና መጡ / Welcome back, ${existingUser.fullName}!* ${roleEmoji}\n\n` +
      `📌 *ID / ምዝገባ:* \`${existingUser.studentId || "Faculty Member"}\`\n` +
      `📚 *Department:* Software Engineering (Year ${existingUser.batchYear || "Staff"})\n` +
      `🛡️ *Status:* \`VERIFIED STUDENT (ቋሚ ምዝገባ)\`\n\n` +
      `የክፍል አቴንዳንስዎን ለመመዝገብ ከታች ያለውን *\"📸 Scan QR Code / ፎቶ አንሳ\"* ቁልፍ በመጫን የመምህሩን ስክሪን ስካን ያድርጉ ወይም የ 6-ዲጂት Rolling Code በቀጥታ በዚህ ቻት ይላኩ።`;

    const keyboard = new InlineKeyboard()
      .webApp("📸 Scan QR Code / ፎቶ አንሳ", `${appUrl}/mini-app`)
      .row()
      .text("📊 My Attendance Stats", "btn_stats")
      .text("ℹ️ Help / ድጋፍ", "btn_help");

    await ctx.reply(welcomeMsg, { parse_mode: "Markdown", reply_markup: keyboard });
    return;
  }

  // If user is not bound yet, prompt for secure contact verification
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const promptMsg =
    `🏛️ *Department of Software Engineering*\n` +
    `*Smart Class Attendance & Verification System*\n\n` +
    `ሰላም *${from.first_name}*! ይህን የዲፓርትመንት አቴንዳንስ ሲስተም ለመጠቀም የተማሪነት ማንነትዎን አንድ ጊዜ ማረጋገጥ (Single-Device Verification) ይኖርብዎታል:\n\n` +
    `🔒 *ደህንነት:* የተማሪ መታወቂያዎ በቀጥታ ከዚህ ቴሌግራም አካውንት ጋር በዲፓርትመንቱ ቋሚ ሪከርድነት ይመዘገባል (አንዴ ከተመዘገበ በቋሚነት አይቋረጥም)።\n\n` +
    `👉 ከታች ያለውን *\"📲 Share Contact\"* ይጫኑ ወይም *\"🔑 Enter ID Manually\"* በመምረጥ የተማሪ መታወቂያ ቁጥርዎን ያስገቡ።`;

  const inlineVerify = new InlineKeyboard()
    .webApp("🔑 Enter ID & Phone / መታወቂያ አስገባ", `${appUrl}/mini-app`);

  await ctx.reply(promptMsg, { parse_mode: "Markdown", reply_markup: inlineVerify });

  const requestContactKeyboard = new Keyboard()
    .requestContact("📲 Share Contact to Verify Identity / ስልክ ቁጥር አረጋግጥ")
    .resized()
    .oneTime();

  await ctx.reply(promptMsg, { parse_mode: "Markdown", reply_markup: requestContactKeyboard });
});

// 1.1 Command /scan (Instant Camera QR Scanner)
bot.command("scan", async (ctx) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const keyboard = new InlineKeyboard().webApp(
    "📸 Launch Camera QR Scanner / ፎቶ አንሳ",
    `${appUrl}/mini-app`
  );
  await ctx.reply(
    `📷 *Camera QR Scanner*\n\nየመምህሩን ፕሮጀክተር ስክሪን ስካን ለማድረግ ከታች ያለውን ቁልፍ ይጫኑ:`,
    { parse_mode: "Markdown", reply_markup: keyboard }
  );
});

// 2. Contact Verification Handler with Anti-Spoofing Rule FR-1.2
bot.on(":contact", async (ctx) => {
  const from = ctx.from;
  const contact = ctx.message?.contact;
  if (!from || !contact) return;

  // Anti-Spoofing: contact must belong to sender
  const isOwner = verifyContactOwnership(from.id, contact.user_id);
  if (!isOwner) {
    await ctx.reply(
      "⛔ *Security Violation Detected!*\n\n" +
        "ያስተላለፉት ስልክ ቁጥር የሌላ ሰው ነው። የራስዎን እውነተኛ ስልክ ቁጥር ብቻ ከታች ባለው ቁልፍ ይላኩ።",
      { parse_mode: "Markdown" }
    );
    return;
  }

  // Normalize phone number (ensure E.164 without leading zeros or with standard prefix)
  let rawPhone = contact.phone_number.trim();
  if (!rawPhone.startsWith("+")) {
    rawPhone = "+" + rawPhone;
  }

  // Search in pre-loaded whitelist
  const matchedUser = dataStore.users.find(
    (u) => u.phoneNumber.replace(/[\s+-]/g, "") === rawPhone.replace(/[\s+-]/g, "")
  );

  if (!matchedUser) {
    await ctx.reply(
      `❌ *Unregistered Phone Number (${rawPhone})*\n\n` +
        `ስልክ ቁጥርዎ በዲፓርትመንቱ የተማሪዎች መዝገብ (Whitelist) ውስጥ አልተገኘም።\n` +
        `እባክዎ የዲፓርትመንት ኃላፊዎን ወይም የትምህርት አስተባባሪዎን ያነጋግሩ።`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  // Bind telegram ID to student entity
  matchedUser.telegramId = from.id.toString();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const successKeyboard = new InlineKeyboard().webApp(
    "🚀 Open Attendance Mini App",
    `${appUrl}/mini-app`
  );

  await ctx.reply(
    `✅ *ማረጋገጫው ተሳክቷል! / Identity Verified!*\n\n` +
      `👤 *ስም:* ${matchedUser.fullName}\n` +
      `🎓 *ID:* \`${matchedUser.studentId || "N/A"}\`\n` +
      `📚 *Batch Year:* Year ${matchedUser.batchYear || "Staff"}\n\n` +
      `መለያዎ በዚህ መሳሪያ እና ቴሌግራም ላይ በቋሚነት ተቆልፏል። አሁን አቴንዳንስ መመዝገብ ይችላሉ!`,
    { parse_mode: "Markdown", reply_markup: successKeyboard }
  );
});

// 3. Direct Rolling Code message submission in chat (Outage Mode fallback)
bot.on("message:text", async (ctx) => {
  const text = ctx.message.text.trim();
  const from = ctx.from;
  if (!from) return;

  // Check if text looks like a 6-character rolling code (e.g. K7-94M or K794M)
  const codeRegex = /^[A-Za-z0-9]{3}[-\s]?[A-Za-z0-9]{3}$/;
  if (!codeRegex.test(text)) {
    return; // Ignore standard chat messages
  }

  const user = dataStore.users.find((u) => u.telegramId === from.id.toString());
  if (!user || user.role !== "STUDENT") {
    await ctx.reply("⚠️ አቴንዳንስ ለመመዝገብ አስቀድመው በስልክ ቁጥርዎ መረጋገጥ አለብዎት። /start ብለው ይላኩ።");
    return;
  }

  // Find active session for this student's batch
  const activeSession = dataStore.sessions.find((s) => {
    if (s.isClosed) return false;
    const course = dataStore.courses.find((c) => c.id === s.courseId);
    return course?.batchYear === user.batchYear;
  });

  if (!activeSession) {
    await ctx.reply("ℹ️ በአሁኑ ሰዓት ለክፍልዎ የተከፈተ የአቴንዳንስ ሰዓት (Active Session) የለም።");
    return;
  }

  // Check rolling code token
  const verifyResult = await verifyRollingCodeToken(activeSession.id, user.id, text);

  if (!verifyResult.valid) {
    if (verifyResult.lockedOutSeconds) {
      await ctx.reply(
        `🚨 *ደህንነት ማስጠንቀቂያ: ተቆልፏል! (Security Lockout)*\n\n` +
          `የተሳሳተ ኮድ 3 ጊዜ ስላስገቡ ለ ${verifyResult.lockedOutSeconds} ሰከንድ ታግደዋል። እባክዎ በትዕግስት ይጠብቁ።`,
        { parse_mode: "Markdown" }
      );
      return;
    }
    await ctx.reply("❌ *የተሳሳተ ወይም ያለፈበት ኮድ!* በመምህሩ ስክሪን ላይ የሚታየውን ወቅታዊ ኮድ በትክክል ያስገቡ።", {
      parse_mode: "Markdown",
    });
    return;
  }

  // Record check in
  const record = dataStore.recordCheckIn(activeSession.id, user.id);
  const course = dataStore.courses.find((c) => c.id === activeSession.courseId);

  await ctx.reply(
    `🎉 *አቴንዳንስዎ ተመዝግቧል! / Attendance Confirmed!*\n\n` +
      `📖 *ትምህርት:* ${course?.courseCode} - ${course?.title}\n` +
      `⏰ *ሰዓት:* ${new Date(record.markedAt).toLocaleTimeString("en-US")}\n` +
      `🟢 *ሁኔታ:* PRESENT (ተገኝቷል)\n\n` +
      `ጥሩ የትምህርት ክፍለ ጊዜ ይሁንልዎ!`,
    { parse_mode: "Markdown" }
  );
});

// 4. Action button: Stats
bot.callbackQuery("btn_stats", async (ctx) => {
  const from = ctx.from;
  const user = dataStore.users.find((u) => u.telegramId === from.id.toString());
  if (!user) {
    await ctx.answerCallbackQuery({ text: "User profile not found." });
    return;
  }

  const myRecords = dataStore.records.filter((r) => r.studentId === user.id);
  const present = myRecords.filter((r) => r.status === "PRESENT").length;
  const absent = myRecords.filter((r) => r.status === "ABSENT").length;
  const excused = myRecords.filter((r) => r.status === "EXCUSED").length;
  const total = present + absent;
  const rate = total > 0 ? Math.round((present / total) * 100) : 100;

  const statsMsg =
    `📊 *የአቴንዳንስ መረጃ / Attendance Record*\n` +
    `👤 *ተማሪ:* ${user.fullName}\n\n` +
    `🟢 ተገኝቷል (Present): *${present}*\n` +
    `🔴 አልተገኘም (Absent): *${absent}*\n` +
    `🟡 በፈቃድ (Excused): *${excused}*\n` +
    `📈 አጠቃላይ ምጣኔ (Rate): *${rate}%*\n\n` +
    `${rate < 75 ? "⚠️ *ማስጠንቀቂያ:* የአቴንዳንስ ምጣኔዎ ከ 75% በታች በመሆኑ ለፈተና እንዳይከለከሉ ትኩረት ይስጡ!" : "✅ *በጣም ጥሩ:* የአቴንዳንስ ምጣኔዎ በጥሩ ደረጃ ላይ ይገኛል።"}`;

  await ctx.answerCallbackQuery();
  await ctx.reply(statsMsg, { parse_mode: "Markdown" });
});

bot.callbackQuery("btn_help", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    `ℹ️ *እርዳታና መመሪያ (Help & Guidelines)*\n\n` +
      `1. *በ QR Code ለመመዝገብ:* 'Open Attendance Mini App' የሚለውን በመጫን የመምህሩን ፕሮጀክተር ስክሪን ስካን ያድርጉ።\n` +
      `2. *መብራት ወይም ፕሮጀክተር በማይኖርበት ጊዜ:* መምህሩ የሚያሳየውን ባለ 6 ፊደል Rolling Code በቀጥታ በቻቱ ይላኩ።\n` +
      `3. *ለህመም ወይም ለፈቃድ:* የህክምና ማስረጃዎን ለዲፓርትመንቱ በማሳየት 'EXCUSED' ማስደረግ ይችላሉ።\n\n` +
      `የቴክኒክ ችግር ካጋጠመዎት የዲፓርትመንት ቢሮውን ያነጋግሩ።`,
    { parse_mode: "Markdown" }
  );
});
