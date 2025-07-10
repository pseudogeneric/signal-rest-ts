import { RestService } from "./RestService";
import { SignalApiServiceError } from "../errors/SignalApiServiceError";
import { InstalledStickerPacksResponse } from "../types/Sticker";

class StickerService extends RestService {
  getStickerPacks = async (
    account: string,
  ): Promise<InstalledStickerPacksResponse[]> => {
    let response;
    try {
      response = await fetch(this.getAPI() + "/v1/sticker-packs/" + account);
    } catch (e) {
      return this.unknownError(e);
    }
    if (!response.ok) {
      const error = await response.text();
      throw new SignalApiServiceError(error, response.status);
    }
    return (await response.json()) as InstalledStickerPacksResponse[];
  };

  addStickerPack = async (
    account: string,
    pack_id: string,
    pack_key: string,
  ): Promise<void> => {
    let response;
    try {
      response = await fetch(this.getAPI() + "/v1/sticker-packs/" + account, {
        method: "POST",
        body: JSON.stringify({ pack_id: pack_id, pack_key: pack_key }),
      });
    } catch (e) {
      return this.unknownError(e);
    }
    if (!response.ok) {
      const error = await response.text();
      throw new SignalApiServiceError(error, response.status);
    }
  };
}

export { StickerService };
