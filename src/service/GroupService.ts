import { CreateGroupRequest, CreateGroupResponse, Group, UpdateGroupRequest } from "../types/Group";
import { Service } from "./Service";

class GroupService extends Service {
  getGroup = async (
    num: string,
    groupId: string
  ): Promise<Group | APIError> => {
    try {
      const response = await fetch(
        this.getAPI() + "/v1/groups/" + num + "/" + groupId
      );
      if (response.status === 200) {
        return (await response.json()) as Group;
      } else {
        const error = await response.text();
        return { message: error, statusCode: response.status } as APIError;
      }
    } catch (e) {
      return this.unknownError();
    }
  };

  getGroups = async (num: string): Promise<Group[] | APIError> => {
    try {
      const response = await fetch(this.getAPI() + "/v1/groups/" + num);
      if (response.status === 200) {
        return (await response.json()) as Group[];
      } else {
        const error = await response.text();
        return { message: error, statusCode: response.status } as APIError;
      }
    } catch (e) {
      return this.unknownError();
    }
  };

  createGroup = async (
    number: string,
    groupDescriptor: CreateGroupRequest
  ): Promise<CreateGroupResponse | APIError> => {
    try {
      const response = await fetch(this.getAPI() + "/v1/groups/" + number, {
        method: "POST",
        body: JSON.stringify(groupDescriptor),
      });
      if (response.status === 201) {
        return (await response.json()) as CreateGroupResponse;
      } else {
        const error = await response.text();
        return { message: error, statusCode: response.status } as APIError;
      }
    } catch (e) {
      return this.unknownError();
    }
  };

  quitGroup = async (
    number: string,
    groupId: string
  ): Promise<void | APIError> => {
    try {
      const response = await fetch(
        this.getAPI() + "/v1/groups/" + number + "/" + groupId + "/quit",
        {
          method: "POST",
        }
      );
      if (response.status !== 204) {
        const error = await response.text();
        return { message: error, statusCode: response.status } as APIError;
      }
    } catch (e) {
      return this.unknownError();
    }
  };

  deleteGroup = async (
    number: string,
    groupId: string
  ): Promise<void | APIError> => {
    try {
      const response = await fetch(
        this.getAPI() + "/v1/groups/" + number + "/" + groupId,
        {
          method: "DELETE",
        }
      );
      if (response.status !== 200) {
        const error = await response.text();
        return { message: error, statusCode: response.status } as APIError;
      }
    } catch (e) {
      return this.unknownError();
    }
  };

  updateGroup = async (
    number: string,
    groupId: string,
    groupUpdate: UpdateGroupRequest
  ) => {
    try {
      const response = await fetch(
        this.getAPI() + "/v1/groups/" + number + "/" + groupId,
        {
          method: "PUT",
          body: JSON.stringify(groupUpdate),
        }
      );
      if (response.status !== 204) {
        const error = await response.text();
        return { message: error, statusCode: response.status } as APIError;
      }
    } catch (e) {
      return this.unknownError();
    }
  };
}

export { GroupService };
