import { SignalClient } from "signal-rest-ts";
import type { MessageContext } from "signal-rest-ts";
import { parseFeedToJson } from "@sesamy/podcast-parser";
import { Buffer } from "buffer";

const NPR_NEWS = "https://feeds.npr.org/500005/podcast.xml";
const signal = new SignalClient("http://localhost:8080");

const b64encode = (i: Uint8Array): string => Buffer.from(i).toString("base64");

const app = async () => {
  const accounts = await signal.account().getAccounts();

  let lastBuild: string = "";
  let lastPod: string = "";
  let lastPodTitle: string = "";

  signal
    .receive()
    .registerHandler(
      accounts[0],
      /^!npr\s*$/,
      async (context: MessageContext) => {
        const feed = await (await fetch(NPR_NEWS)).text();
        const lastBuildMatch = feed.match(
          /<lastBuildDate>(.*?)<\/lastBuildDate>/,
        );
        const newBuild = lastBuildMatch ? lastBuildMatch[1] : "";

        if (lastBuild !== "" && newBuild === lastBuild) {
          context.reply(lastPodTitle, [lastPod]);
        } else {
          const podcast = await parseFeedToJson(feed);
          const latestEpisodePath: string =
            podcast.rss.channel.item[0].enclosure?.at(0)?.["@_url"] || "";
          const latestEpisode = await (await fetch(latestEpisodePath)).bytes();
          const title = podcast.rss.channel.item[0].title || "";
          const mediaType =
            podcast.rss.channel.item[0].enclosure?.at(0)?.["@_type"] || "";

          const attachment = `data:${mediaType};filename=episode.mp3;base64,${b64encode(
            latestEpisode,
          )}`;
          lastBuild = newBuild;
          lastPod = attachment;
          lastPodTitle = title;
          context.reply(title, [attachment]);
        }
      },
    );

  signal.receive().startReceiving(accounts[0]);
};

app();
