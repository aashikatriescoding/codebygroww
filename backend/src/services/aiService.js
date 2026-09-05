




// const Groq = require("groq-sdk");
// const cache = require("./cache");

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// const AI_CACHE_TTL_MS = 60000;
// const MODEL = "openai/gpt-oss-20b";

// const FLAG_DESCRIPTIONS = {
//   moved_up: "price moved up beyond the user's alert threshold",
//   moved_down: "price moved down beyond the user's alert threshold",
//   "52_week_high": "price just hit a 52-week high",
//   "52_week_low": "price just hit a 52-week low",
//   volume_spike: "trading volume is unusually high compared to its normal average — a signal of unusual market interest, independent of price movement",
// };

// const explainMove = async (item) => {
//   if (!item.flags || item.flags.length === 0) return null;

//   const cacheKey = `ai-why:${item.ticker}:${item.flags.join(",")}`;
//   const cached = cache.get(cacheKey);
//   if (cached) return cached;

//   try {
//     const flagDetails = item.flags.map((f) => `- ${FLAG_DESCRIPTIONS[f] || f}`).join("\n");

//     const prompt = `Stock: ${item.ticker}
// Current price: ${item.currentPrice}
// Today's change: ${item.dayChangePercent?.toFixed(2)}%

// This stock was flagged as meaningful for these specific reasons (this IS the reason it needs attention, regardless of any price-change percentage):
// ${flagDetails}

// Write ONE short sentence (under 20 words) explaining why this deserves the user's attention right now, based on the flagged reasons above. Do not say nothing has changed — it was flagged for a reason. Plain English, no disclaimers, no preamble.`;

//     const completion = await groq.chat.completions.create({
//       messages: [{ role: "user", content: prompt }],
//       model: MODEL,
//       max_tokens: 300,
//       temperature: 0.4,
//       reasoning_effort: "low",
//     });

//     const summary = completion.choices[0]?.message?.content?.trim();
//     if (summary) cache.set(cacheKey, summary, AI_CACHE_TTL_MS);
//     return summary || null;
//   } catch (err) {
//     console.error("AI explain failed:", err.message);
//     return null;
//   }
// };

// const generateDigest = async (meaningfulItems) => {
//   if (!meaningfulItems || meaningfulItems.length === 0) return null;

//   const cacheKey = `ai-digest:${meaningfulItems.map((i) => i.ticker).sort().join(",")}`;
//   const cached = cache.get(cacheKey);
//   if (cached) return cached;

//   try {
//     const lines = meaningfulItems
//       .map((i) => {
//         const flagDetails = i.flags.map((f) => FLAG_DESCRIPTIONS[f] || f).join("; ");
//         return `${i.ticker}: flagged because ${flagDetails}. Today's change: ${i.dayChangePercent?.toFixed(2)}%.`;
//       })
//       .join("\n");

//     const prompt = `These stocks were flagged as meaningful for the user to check:
// ${lines}

// Write ONE short paragraph (max 2 sentences) summarizing what needs attention, based on the flagged reasons given. Do not say nothing has changed. Plain English, no preamble.`;

//     const completion = await groq.chat.completions.create({
//       messages: [{ role: "user", content: prompt }],
//       model: MODEL,
//       max_tokens: 300,
//       temperature: 0.4,
//       reasoning_effort: "low",
//     });

//     const summary = completion.choices[0]?.message?.content?.trim();
//     if (summary) cache.set(cacheKey, summary, AI_CACHE_TTL_MS);
//     return summary || null;
//   } catch (err) {
//     console.error("AI digest failed:", err.message);
//     return null;
//   }
// };

// module.exports = { explainMove, generateDigest };













const Groq = require("groq-sdk");
const cache = require("./cache");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const AI_CACHE_TTL_MS = 60000;
const MODEL = "openai/gpt-oss-20b";

const FLAG_DESCRIPTIONS = {
  moved_up: "price moved up beyond the user's alert threshold",
  moved_down: "price moved down beyond the user's alert threshold",
  "52_week_high": "price just hit a 52-week high",
  "52_week_low": "price just hit a 52-week low",
  volume_spike: "trading volume is unusually high compared to its normal average — a signal of unusual market interest, independent of price movement",
};

const explainMove = async (item) => {
  if (!item.flags || item.flags.length === 0) return null;

  const cacheKey = `ai-why:${item.ticker}:${item.flags.join(",")}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const flagDetails = item.flags.map((f) => `- ${FLAG_DESCRIPTIONS[f] || f}`).join("\n");

    const prompt = `Stock: ${item.ticker}
Current price: ${item.currentPrice}
Today's change: ${item.dayChangePercent?.toFixed(2)}%

This stock was flagged as meaningful for these specific reasons (this IS the reason it needs attention, regardless of any price-change percentage):
${flagDetails}

Write ONE short sentence (under 20 words) explaining why this deserves the user's attention right now, based on the flagged reasons above. Do not say nothing has changed — it was flagged for a reason. Plain English, no disclaimers, no preamble.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      max_tokens: 300,
      temperature: 0.4,
      reasoning_effort: "low",
    });

    const summary = completion.choices[0]?.message?.content?.trim();
    if (summary) cache.set(cacheKey, summary, AI_CACHE_TTL_MS);
    return summary || null;
  } catch (err) {
    console.error("AI explain failed:", err.message);
    return null;
  }
};

const generateDigest = async (meaningfulItems) => {
  if (!meaningfulItems || meaningfulItems.length === 0) return null;

  const cacheKey = `ai-digest:${meaningfulItems.map((i) => i.ticker).sort().join(",")}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const lines = meaningfulItems
      .map((i) => {
        const flagDetails = i.flags.map((f) => FLAG_DESCRIPTIONS[f] || f).join("; ");
        return `${i.ticker}: flagged because ${flagDetails}. Today's change: ${i.dayChangePercent?.toFixed(2)}%.`;
      })
      .join("\n");

    const prompt = `These stocks were flagged as meaningful for the user to check:
${lines}

Write ONE short paragraph (max 2 sentences) summarizing what needs attention, based on the flagged reasons given. Do not say nothing has changed. Plain English, no preamble.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      max_tokens: 300,
      temperature: 0.4,
      reasoning_effort: "low",
    });

    const summary = completion.choices[0]?.message?.content?.trim();
    if (summary) cache.set(cacheKey, summary, AI_CACHE_TTL_MS);
    return summary || null;
  } catch (err) {
    console.error("AI digest failed:", err.message);
    return null;
  }
};

// Answers a user's question strictly using their own watchlist data — no general
// financial advice, no facts outside what's provided.
// const answerWatchlistQuestion = async (question, watchlistItems) => {
//   try {
//     const context = watchlistItems
//       .map((item) => {
//         if (item.error) return `${item.ticker}: no data available right now.`;
//         const flagsText = item.flags?.length ? `Flags: ${item.flags.join(", ")}.` : "No flags.";
//         return `${item.companyName || item.ticker} (${item.ticker}): current price ₹${item.currentPrice?.toFixed(2)}, today's change ${item.dayChangePercent?.toFixed(2)}%, since last checked ${item.percentChangeSinceSeen != null ? item.percentChangeSinceSeen.toFixed(2) + "%" : "not yet tracked"}, alert setting: ${item.sensitivity}. ${flagsText} Checked ${item.timesChecked || 0} times.`;
//       })
//       .join("\n");

//     // const systemPrompt = `You are a watchlist assistant. You can ONLY answer using the data provided below about the user's own watchlist. Do not give general financial advice, predictions, or facts about stocks not listed here. If the question can't be answered from this data, say so plainly and suggest what the user could check instead. Keep answers short and conversational.
//     const systemPrompt = `You are a watchlist assistant. You can ONLY answer using the data provided below about the user's own watchlist. Do not give general financial advice, predictions, or facts about stocks not listed here. If the question can't be answered from this data, say so plainly and suggest what the user could check instead. Keep answers short and conversational. Do not use markdown formatting like asterisks or bullet points — plain sentences only.

// User's watchlist data:
// ${context}`;

//     const completion = await groq.chat.completions.create({
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: question },
//       ],
//       model: MODEL,
//       max_tokens: 400,
//       temperature: 0.3,
//       reasoning_effort: "low",
//     });

//     return completion.choices[0]?.message?.content?.trim() || "I couldn't generate a response — try rephrasing your question.";
//   } catch (err) {
//     console.error("AI chat failed:", err.message);
//     return "Something went wrong answering that — try again in a moment.";
//   }
// };





const answerWatchlistQuestion = async (question, watchlistItems) => {
  try {
    const context = watchlistItems.length === 0
      ? "The user's watchlist is currently empty."
      : watchlistItems
          .map((item) => {
            if (item.error) return `${item.ticker}: no data available right now.`;
            const flagsText = item.flags?.length ? `Flags: ${item.flags.join(", ")}.` : "No flags.";
            const rangeText = item.fiftyTwoWeekHigh && item.fiftyTwoWeekLow
              ? `52-week range: ₹${item.fiftyTwoWeekLow} to ₹${item.fiftyTwoWeekHigh}.`
              : "";
            const dayRangeText = item.dayHigh && item.dayLow
              ? `Today's range: ₹${item.dayLow} to ₹${item.dayHigh}.`
              : "";
            return `${item.companyName || item.ticker} (${item.ticker}): current price ₹${item.currentPrice?.toFixed(2)}, today's change ${item.dayChangePercent?.toFixed(2)}%, since last checked ${item.percentChangeSinceSeen != null ? item.percentChangeSinceSeen.toFixed(2) + "%" : "not yet tracked"}, alert setting: ${item.sensitivity}. ${flagsText} ${rangeText} ${dayRangeText} Checked ${item.timesChecked || 0} times.`;
          })
          .join("\n");

    const systemPrompt = `You are a watchlist assistant. Use the data below about the user's watchlist to answer their questions helpfully and specifically — reference exact numbers, ranges, and flags when relevant instead of generic statements. You do not give investment advice, predictions, or "should I buy/sell" recommendations — for those, say plainly that you don't give investment advice, and instead point out what specific data point from below is relevant to their question. You don't have historical price charts or news beyond what's given below — if asked for something not in this data, say clearly what you don't have, and answer with whatever adjacent data you DO have instead of just refusing. Keep answers conversational, a few sentences, no markdown formatting.

Watchlist data:
${context}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      model: MODEL,
      max_tokens: 400,
      temperature: 0.4,
      reasoning_effort: "low",
    });

    return completion.choices[0]?.message?.content?.trim() || "I couldn't generate a response — try rephrasing your question.";
  } catch (err) {
    console.error("AI chat failed:", err.message);
    return "Something went wrong answering that — try again in a moment.";
  }
};
module.exports = { explainMove, generateDigest, answerWatchlistQuestion };