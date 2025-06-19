import {
  ChangeGroupAdminsRequest,
  CreateGroupRequest,
  CreateGroupResponse,
  Group,
  UpdateGroupRequest,
} from "../types/Group";
import { RestService } from "./RestService";
import { ApiServiceError } from "../errors/ApiServiceError";

class GroupService extends RestService {
  getGroup = async (account: string, groupId: string): Promise<Group> => {
    let response;
    try {
      response = await fetch(
        this.getAPI() + "/v1/groups/" + account + "/" + groupId,
      );
    } catch (e) {
      throw this.unknownError(e);
    }
    if (response.ok) {
      return (await response.json()) as Group;
    } else {
      const error = await response.text();
      throw new ApiServiceError(error, response.status);
    }
  };

  getGroups = async (account: string): Promise<Group[]> => {
    let response;
    try {
      response = await fetch(this.getAPI() + "/v1/groups/" + account);
    } catch (e) {
      throw this.unknownError(e);
    }
    if (response.ok) {
      return (await response.json()) as Group[];
    } else {
      const error = await response.text();
      throw new ApiServiceError(error, response.status);
    }
  };

  createGroup = async (
    account: string,
    groupDescriptor: CreateGroupRequest,
  ): Promise<CreateGroupResponse> => {
    let response;
    try {
      response = await fetch(this.getAPI() + "/v1/groups/" + account, {
        method: "POST",
        body: JSON.stringify(groupDescriptor),
      });
    } catch (e) {
      throw this.unknownError(e);
    }
    if (response.status === 201) {
      return (await response.json()) as CreateGroupResponse;
    } else {
      const error = await response.text();
      throw new ApiServiceError(error, response.status);
    }
  };

  quitGroup = async (account: string, groupId: string): Promise<void> => {
    let response;
    try {
      response = await fetch(
        this.getAPI() + "/v1/groups/" + account + "/" + groupId + "/quit",
        {
          method: "POST",
        },
      );
    } catch (e) {
      throw this.unknownError(e);
    }
    if (!response.ok) {
      const error = await response.text();
      throw new ApiServiceError(error, response.status);
    }
  };

  deleteGroup = async (account: string, groupId: string): Promise<void> => {
    let response;
    try {
      response = await fetch(
        this.getAPI() + "/v1/groups/" + account + "/" + groupId,
        {
          method: "DELETE",
        },
      );
    } catch (e) {
      throw this.unknownError(e);
    }
    if (!response.ok) {
      const error = await response.text();
      throw new ApiServiceError(error, response.status);
    }
  };

  updateGroup = async (
    account: string,
    groupId: string,
    groupUpdate: UpdateGroupRequest,
  ): Promise<void> => {
    let response;
    try {
      response = await fetch(
        this.getAPI() + "/v1/groups/" + account + "/" + groupId,
        {
          method: "PUT",
          body: JSON.stringify(groupUpdate),
        },
      );
    } catch (e) {
      throw this.unknownError(e);
    }
    if (!response.ok) {
      const error = await response.text();
      throw new ApiServiceError(error, response.status);
    }
  };

  addAdmins = async (
    account: string,
    groupId: string,
    admins: ChangeGroupAdminsRequest,
  ): Promise<void> => {
    let response;
    try {
      response = await fetch(
        this.getAPI() + "/v1/groups/" + account + "/" + groupId + "/admins",
        {
          method: "POST",
          body: JSON.stringify(admins),
        },
      );
    } catch (e) {
      throw this.unknownError(e);
    }
    if (response.status !== 204) {
      const error = await response.text();
      throw new ApiServiceError(error, response.status);
    }
  };

  deleteAdmins = async (
    number: string,
    groupId: string,
    admins: ChangeGroupAdminsRequest,
  ): Promise<void> => {
    let response;
    try {
      response = await fetch(
        this.getAPI() + "/v1/groups/" + number + "/" + groupId + "/admins",
        {
          method: "DELETE",
          body: JSON.stringify(admins),
        },
      );
    } catch (e) {
      throw this.unknownError(e);
    }

    if (!response.ok) {
      const error = await response.text();
      throw new ApiServiceError(error, response.status);
    }
  };

  getGroupAvatar = async (
    account: string,
    groupId: string,
  ): Promise<string> => {
    let response;
    try {
      response = await fetch(
        this.getAPI() + "/v1/groups/" + account + "/" + groupId + "/avatar",
      );
    } catch (e) {
      throw this.unknownError(e);
    }
    if (!response.ok) {
      const error = await response.text();
      throw new ApiServiceError(error, response.status);
    }
    return (await response.text()) as string;
  };
}

export { GroupService };
