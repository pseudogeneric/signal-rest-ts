import {
  ChangeGroupAdminsRequest,
  CreateGroupRequest,
  CreateGroupResponse,
  Group,
  UpdateGroupRequest,
} from "../types/Group";
import { RestService } from "./RestService";
import { SignalApiServiceError } from "../errors/SignalApiServiceError";

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
      throw new SignalApiServiceError(error, response.status);
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
      throw new SignalApiServiceError(error, response.status);
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
      throw new SignalApiServiceError(error, response.status);
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
      throw new SignalApiServiceError(error, response.status);
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
      throw new SignalApiServiceError(error, response.status);
    }
  };

  blockGroup = async (account: string, groupId: string): Promise<void> => {
    let response;
    try {
      response = await fetch(
        this.getAPI() + "/v1/groups/" + account + "/" + groupId + "/block",
        {
          method: "POST",
        },
      );
    } catch (e) {
      throw this.unknownError(e);
    }

    if (!response.ok) {
      const error = await response.text();
      throw new SignalApiServiceError(error, response.status);
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
      throw new SignalApiServiceError(error, response.status);
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
      throw new SignalApiServiceError(error, response.status);
    }
  };

  removeAdmins = async (
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
      throw new SignalApiServiceError(error, response.status);
    }
  };

  addMembers = async (
    account: string,
    groupId: string,
    members: string[],
  ): Promise<void> => {
    let response;
    try {
      response = await fetch(
        this.getAPI() + "/v1/groups/" + account + "/" + groupId + "/members",
        {
          method: "POST",
          body: JSON.stringify({ members: members }),
        },
      );
    } catch (e) {
      throw this.unknownError(e);
    }

    if (!response.ok) {
      const error = await response.text();
      throw new SignalApiServiceError(error, response.status);
    }
  };

  removeMembers = async (
    account: string,
    groupId: string,
    members: string[],
  ): Promise<void> => {
    let response;
    try {
      response = await fetch(
        this.getAPI() + "/v1/groups/" + account + "/" + groupId + "/members",
        {
          method: "DELETE",
          body: JSON.stringify({ members: members }),
        },
      );
    } catch (e) {
      throw this.unknownError(e);
    }

    if (!response.ok) {
      const error = await response.text();
      throw new SignalApiServiceError(error, response.status);
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
      throw new SignalApiServiceError(error, response.status);
    }
    return (await response.text()) as string;
  };
}

export { GroupService };
