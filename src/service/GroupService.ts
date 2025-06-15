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
  getGroup = async (num: string, groupId: string): Promise<Group> => {
    try {
      const response = await fetch(
        this.getAPI() + "/v1/groups/" + num + "/" + groupId,
      );
      if (response.status === 200) {
        return (await response.json()) as Group;
      } else {
        const error = await response.text();
        throw new ApiServiceError(error, response.status);
      }
    } catch (e) {
      throw this.unknownError(e);
    }
  };

  getGroups = async (num: string): Promise<Group[]> => {
    try {
      const response = await fetch(this.getAPI() + "/v1/groups/" + num);
      if (response.status === 200) {
        return (await response.json()) as Group[];
      } else {
        const error = await response.text();
        throw new ApiServiceError(error, response.status);
      }
    } catch (e) {
      throw this.unknownError(e);
    }
  };

  createGroup = async (
    number: string,
    groupDescriptor: CreateGroupRequest,
  ): Promise<CreateGroupResponse> => {
    try {
      const response = await fetch(this.getAPI() + "/v1/groups/" + number, {
        method: "POST",
        body: JSON.stringify(groupDescriptor),
      });
      if (response.status === 201) {
        return (await response.json()) as CreateGroupResponse;
      } else {
        const error = await response.text();
        throw new ApiServiceError(error, response.status);
      }
    } catch (e) {
      throw this.unknownError(e);
    }
  };

  quitGroup = async (number: string, groupId: string): Promise<void> => {
    try {
      const response = await fetch(
        this.getAPI() + "/v1/groups/" + number + "/" + groupId + "/quit",
        {
          method: "POST",
        },
      );
      if (!response.ok) {
        const error = await response.text();
        throw new ApiServiceError(error, response.status);
      }
    } catch (e) {
      throw this.unknownError(e);
    }
  };

  deleteGroup = async (number: string, groupId: string): Promise<void> => {
    try {
      const response = await fetch(
        this.getAPI() + "/v1/groups/" + number + "/" + groupId,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) {
        const error = await response.text();
        throw new ApiServiceError(error, response.status);
      }
    } catch (e) {
      throw this.unknownError(e);
    }
  };

  updateGroup = async (
    number: string,
    groupId: string,
    groupUpdate: UpdateGroupRequest,
  ): Promise<void> => {
    try {
      const response = await fetch(
        this.getAPI() + "/v1/groups/" + number + "/" + groupId,
        {
          method: "PUT",
          body: JSON.stringify(groupUpdate),
        },
      );
      if (response.status !== 204) {
        const error = await response.text();
        throw new ApiServiceError(error, response.status);
      }
    } catch (e) {
      throw this.unknownError(e);
    }
  };

  addAdmins = async (
    number: string,
    groupId: string,
    admins: ChangeGroupAdminsRequest,
  ): Promise<void> => {
    try {
      const response = await fetch(
        this.getAPI() + "/v1/groups/" + number + "/" + groupId + "/admins",
        {
          method: "POST",
          body: JSON.stringify(admins),
        },
      );
      if (response.status !== 204) {
        const error = await response.text();
        throw new ApiServiceError(error, response.status);
      }
    } catch (e) {
      throw this.unknownError(e);
    }
  };

  deleteAdmins = async (
    number: string,
    groupId: string,
    admins: ChangeGroupAdminsRequest,
  ): Promise<void> => {
    try {
      const response = await fetch(
        this.getAPI() + "/v1/groups/" + number + "/" + groupId + "/admins",
        {
          method: "DELETE",
          body: JSON.stringify(admins),
        },
      );
      if (response.status !== 204) {
        const error = await response.text();
        throw new ApiServiceError(error, response.status);
      }
    } catch (e) {
      throw this.unknownError(e);
    }
  };
}

export { GroupService };
