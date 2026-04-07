import { Identities } from "../types/Identity";
import { SignalApiServiceError } from "../errors/SignalApiServiceError";
import { RestService } from "./RestService";

class IdentityService extends RestService {
  getIdentities = async (account: string): Promise<Identities> => {
    let response;
    try {
      response = await fetch(this.getAPI() + "/v1/identities/" + account);
    } catch (e) {
      throw this.unknownError(e);
    }
    if (response.ok) {
      return (await response.json()) as Identities;
    } else {
      const error = await response.text();
      throw new SignalApiServiceError(error, response.status);
    }
  };

  trustNumber = async (
    account: string,
    numberToTrust: string,
    verifiedSafetyNumber?: string,
    trustAllKnownKeysUnsafe?: boolean,
  ): Promise<boolean> => {
    let response;

    try {
      response = await fetch(
        this.getAPI() + "/v1/identities/" + account + "/trust/" + numberToTrust,
        {
          method: "PUT",
          body: JSON.stringify({
            trust_all_known_keys: trustAllKnownKeysUnsafe,
            verified_safety_number: verifiedSafetyNumber,
          }),
        },
      );
    } catch (e) {
      throw this.unknownError(e);
    }
    if (response.ok) {
      return true;
    } else {
      const error = await response.text();
      throw new SignalApiServiceError(error, response.status);
    }
  };
}

export { IdentityService };
