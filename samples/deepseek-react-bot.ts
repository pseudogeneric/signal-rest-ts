import { SignalClient } from "signal-rest-ts";

/**
 * This sample shows how we can utilize an LLM exposed by an API
 * to summarize a message with a single emoji, then react to the
 * message with this emoji.
 */

const API_KEY = "YOUR_API_KEY_HERE";
const API_URL = "https://api.deepseek.com/v1/chat/completions";

const emojiLength = (s: string) => {
  // adapted from https://blog.jonnew.com/posts/poo-dot-length-equals-two
  const joiner = "\u{200D}";
  const split = s.split(joiner);
  let count = 0;

  for (const s of split) {
    const num = Array.from(s.split(/[\ufe00-\ufe0f]/).join("")).length;
    count += num;
  }

  return Math.floor(count / split.length);
};

const getEmojiForString = async (s: string): Promise<string> => {
  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: `Return exactly ONE emoji that best represents the following text: "${s}". Only respond with the emoji, no other text.`,
          },
        ],
        max_tokens: 4,
        temperature: 0.7,
      }),
    });
  } catch (e) {
    return "🤔";
  }
  if (!response.ok) return "🤔";
  const data = await response.json();
  const emoji = data.choices?.[0]?.message?.content?.trim();

  if (!emoji || emojiLength(emoji) !== 1) return "🤔";
  return emoji;
};

const perhaps = (probability: number) => {
  if (probability < 0) return false;
  if (probability >= 1) return true;
  return Math.random() < probability;
};

const reactWithEmojis = async () => {
  const signal = new SignalClient("http://127.0.0.1:8080");
  const accounts = await signal.account().getAccounts();

  accounts.forEach((account) => {
    signal.receive().registerHandler(account, /.*/, async (context) => {
      if (!perhaps(0.02)) return; // only react to 2% of messages
      context.react(await getEmojiForString(context.message));
    });
    signal.receive().startReceiving(account);
  });

  process.on("SIGINT", () => {
    signal.receive().stopAllReceiving();
  });
};

reactWithEmojis().catch(console.error);
