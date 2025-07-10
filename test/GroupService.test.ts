// src/service/tests/GroupService.test.ts
import { GroupService } from "../src/service/GroupService";
import { SignalApiServiceError } from "../src/errors/SignalApiServiceError";
import {
  Group,
  CreateGroupRequest,
  CreateGroupResponse,
  UpdateGroupRequest,
  ChangeGroupAdminsRequest,
} from "../src/types/Group";
import { SignalClient } from "../src/SignalClient";

describe("GroupService", () => {
  let service: GroupService;
  let client: SignalClient;
  const mockApiUrl = "http://fake-api.com";
  const mockNumber = "user123";
  const mockGroupId = "groupABC";

  beforeEach(() => {
    client = new SignalClient("");
    service = new GroupService(mockApiUrl, client);
    (global.fetch as jest.Mock).mockClear();
  });

  // --- getGroup ---
  describe("getGroup", () => {
    it("should return group details on successful fetch", async () => {
      const mockGroup: Group = {
        id: mockGroupId,
        name: "Test Group",
        members: ["member1"],
        blocked: false,
        pending_invites: [],
        pending_requests: [],
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockGroup,
      });

      const result = await service.getGroup(mockNumber, mockGroupId);
      expect(result).toEqual(mockGroup);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}`,
      );
    });

    it("should throw SignalApiServiceError on API error", async () => {
      const errorMessage = "Group not found";
      const errorStatus = 404;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(service.getGroup(mockNumber, mockGroupId)).rejects.toThrow(
        new SignalApiServiceError(errorMessage, errorStatus),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}`,
      );
    });

    it("should throw SignalApiServiceError on network error", async () => {
      const networkError = new Error("Connection timeout");
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(service.getGroup(mockNumber, mockGroupId)).rejects.toThrow(
        new SignalApiServiceError(networkError.message, -1),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}`,
      );
    });
  });

  // --- getGroups ---
  describe("getGroups", () => {
    it("should return list of groups on successful fetch", async () => {
      const mockGroups: Group[] = [
        {
          id: "group1",
          name: "Group One",
          members: [],
          blocked: false,
          pending_invites: [],
          pending_requests: [],
        },
        {
          id: "group2",
          name: "Group Two",
          members: [],
          blocked: false,
          pending_invites: [],
          pending_requests: [],
        },
      ];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockGroups,
      });

      const result = await service.getGroups(mockNumber);
      expect(result).toEqual(mockGroups);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}`,
      );
    });

    it("should throw SignalApiServiceError on API error", async () => {
      const errorMessage = "Failed to fetch groups";
      const errorStatus = 500;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(service.getGroups(mockNumber)).rejects.toThrow(
        new SignalApiServiceError(errorMessage, errorStatus),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}`,
      );
    });

    it("should throw SignalApiServiceError on network error", async () => {
      const networkError = new Error("Network unavailable");
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(service.getGroups(mockNumber)).rejects.toThrow(
        new SignalApiServiceError(networkError.message, -1),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}`,
      );
    });
  });

  // --- createGroup ---
  describe("createGroup", () => {
    const groupRequest: CreateGroupRequest = {
      name: "New Group",
      members: ["member1"],
      group_link: "disabled",
    };
    const groupResponse: CreateGroupResponse = { id: "newGroupId" };

    it("should return created group info on successful POST (201)", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => groupResponse,
      });

      const result = await service.createGroup(mockNumber, groupRequest);
      expect(result).toEqual(groupResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}`,
        {
          method: "POST",
          body: JSON.stringify(groupRequest),
        },
      );
    });

    it("should throw SignalApiServiceError on API error (e.g., 400 bad request)", async () => {
      const errorMessage = "Invalid group data";
      const errorStatus = 400;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(
        service.createGroup(mockNumber, groupRequest),
      ).rejects.toThrow(new SignalApiServiceError(errorMessage, errorStatus));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}`,
        {
          method: "POST",
          body: JSON.stringify(groupRequest),
        },
      );
    });

    it("should throw SignalApiServiceError on network error", async () => {
      const networkError = new Error("Failed to connect");
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(
        service.createGroup(mockNumber, groupRequest),
      ).rejects.toThrow(new SignalApiServiceError(networkError.message, -1));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}`,
        {
          method: "POST",
          body: JSON.stringify(groupRequest),
        },
      );
    });
  });

  // --- quitGroup ---
  describe("quitGroup", () => {
    it("should resolve on successful POST (204)", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(
        service.quitGroup(mockNumber, mockGroupId),
      ).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/quit`,
        {
          method: "POST",
        },
      );
    });

    it("should throw SignalApiServiceError if status is not 204", async () => {
      const errorMessage = "Failed to quit group";
      const errorStatus = 403; // e.g. forbidden
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(service.quitGroup(mockNumber, mockGroupId)).rejects.toThrow(
        new SignalApiServiceError(errorMessage, errorStatus),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/quit`,
        {
          method: "POST",
        },
      );
    });

    it("should throw SignalApiServiceError on other API error", async () => {
      const errorMessage = "Group not found to quit";
      const errorStatus = 404;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(service.quitGroup(mockNumber, mockGroupId)).rejects.toThrow(
        new SignalApiServiceError(errorMessage, errorStatus),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/quit`,
        {
          method: "POST",
        },
      );
    });

    it("should throw SignalApiServiceError on network error", async () => {
      const networkError = new Error("Network issue");
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(service.quitGroup(mockNumber, mockGroupId)).rejects.toThrow(
        new SignalApiServiceError(networkError.message, -1),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/quit`,
        {
          method: "POST",
        },
      );
    });
  });

  // --- deleteGroup ---
  describe("deleteGroup", () => {
    it("should resolve on successful DELETE (204)", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(
        service.deleteGroup(mockNumber, mockGroupId),
      ).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}`,
        {
          method: "DELETE",
        },
      );
    });

    it("should throw SignalApiServiceError if status is not 204", async () => {
      const errorMessage = "Failed to delete";
      const errorStatus = 403;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(
        service.deleteGroup(mockNumber, mockGroupId),
      ).rejects.toThrow(new SignalApiServiceError(errorMessage, errorStatus));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}`,
        {
          method: "DELETE",
        },
      );
    });

    it("should throw SignalApiServiceError on API error (e.g. 404 not found)", async () => {
      const errorMessage = "Group to delete not found";
      const errorStatus = 404;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(
        service.deleteGroup(mockNumber, mockGroupId),
      ).rejects.toThrow(new SignalApiServiceError(errorMessage, errorStatus));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}`,
        {
          method: "DELETE",
        },
      );
    });

    it("should throw SignalApiServiceError on network error", async () => {
      const networkError = new Error("Server unreachable");
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(
        service.deleteGroup(mockNumber, mockGroupId),
      ).rejects.toThrow(new SignalApiServiceError(networkError.message, -1));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}`,
        {
          method: "DELETE",
        },
      );
    });
  });

  // --- updateGroup ---
  describe("updateGroup", () => {
    const updateRequest: UpdateGroupRequest = { name: "Updated Group Name" };

    it("should resolve on successful PUT (204)", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(
        service.updateGroup(mockNumber, mockGroupId, updateRequest),
      ).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}`,
        {
          method: "PUT",
          body: JSON.stringify(updateRequest),
        },
      );
    });

    it("should throw SignalApiServiceError if status is not 204", async () => {
      const errorMessage = "Update failed";
      const errorStatus = 400;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(
        service.updateGroup(mockNumber, mockGroupId, updateRequest),
      ).rejects.toThrow(new SignalApiServiceError(errorMessage, errorStatus));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}`,
        {
          method: "PUT",
          body: JSON.stringify(updateRequest),
        },
      );
    });

    it("should throw SignalApiServiceError on API error (e.g. 403 forbidden)", async () => {
      const errorMessage = "Permission denied for update";
      const errorStatus = 403;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(
        service.updateGroup(mockNumber, mockGroupId, updateRequest),
      ).rejects.toThrow(new SignalApiServiceError(errorMessage, errorStatus));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}`,
        {
          method: "PUT",
          body: JSON.stringify(updateRequest),
        },
      );
    });

    it("should throw SignalApiServiceError on network error", async () => {
      const networkError = new Error("Update request failed");
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(
        service.updateGroup(mockNumber, mockGroupId, updateRequest),
      ).rejects.toThrow(new SignalApiServiceError(networkError.message, -1));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}`,
        {
          method: "PUT",
          body: JSON.stringify(updateRequest),
        },
      );
    });
  });

  // --- addAdmins ---
  describe("addAdmins", () => {
    const adminRequest: ChangeGroupAdminsRequest = { admins: ["newAdmin1"] };

    it("should resolve on successful POST (204)", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(
        service.addAdmins(mockNumber, mockGroupId, adminRequest),
      ).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/admins`,
        {
          method: "POST",
          body: JSON.stringify(adminRequest),
        },
      );
    });

    it("should throw SignalApiServiceError if status is not 204", async () => {
      const errorMessage = "Failed to add admin";
      const errorStatus = 400;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(
        service.addAdmins(mockNumber, mockGroupId, adminRequest),
      ).rejects.toThrow(new SignalApiServiceError(errorMessage, errorStatus));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/admins`,
        {
          method: "POST",
          body: JSON.stringify(adminRequest),
        },
      );
    });

    it("should throw SignalApiServiceError on API error (e.g. 409 conflict)", async () => {
      const errorMessage = "Admin already exists or user not member";
      const errorStatus = 409;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(
        service.addAdmins(mockNumber, mockGroupId, adminRequest),
      ).rejects.toThrow(new SignalApiServiceError(errorMessage, errorStatus));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/admins`,
        {
          method: "POST",
          body: JSON.stringify(adminRequest),
        },
      );
    });

    it("should throw SignalApiServiceError on network error", async () => {
      const networkError = new Error("Could not reach server to add admin");
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(
        service.addAdmins(mockNumber, mockGroupId, adminRequest),
      ).rejects.toThrow(new SignalApiServiceError(networkError.message, -1));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/admins`,
        {
          method: "POST",
          body: JSON.stringify(adminRequest),
        },
      );
    });
  });

  // --- deleteAdmins ---
  describe("deleteAdmins", () => {
    const adminRequest: ChangeGroupAdminsRequest = {
      admins: ["adminToRemove"],
    };

    it("should resolve on successful DELETE (204)", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(
        service.removeAdmins(mockNumber, mockGroupId, adminRequest),
      ).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/admins`,
        {
          method: "DELETE",
          body: JSON.stringify(adminRequest),
        },
      );
    });

    it("should throw SignalApiServiceError if status is not 204", async () => {
      const errorMessage = "Failed to delete admin";
      const errorStatus = 400;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(
        service.removeAdmins(mockNumber, mockGroupId, adminRequest),
      ).rejects.toThrow(new SignalApiServiceError(errorMessage, errorStatus));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/admins`,
        {
          method: "DELETE",
          body: JSON.stringify(adminRequest),
        },
      );
    });

    it("should throw SignalApiServiceError on API error (e.g. 404 admin not found)", async () => {
      const errorMessage = "Admin to delete not found in group";
      const errorStatus = 404;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(
        service.removeAdmins(mockNumber, mockGroupId, adminRequest),
      ).rejects.toThrow(new SignalApiServiceError(errorMessage, errorStatus));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/admins`,
        {
          method: "DELETE",
          body: JSON.stringify(adminRequest),
        },
      );
    });

    it("should throw SignalApiServiceError on network error", async () => {
      const networkError = new Error(
        "Server connection lost while deleting admin",
      );
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(
        service.removeAdmins(mockNumber, mockGroupId, adminRequest),
      ).rejects.toThrow(new SignalApiServiceError(networkError.message, -1));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/admins`,
        {
          method: "DELETE",
          body: JSON.stringify(adminRequest),
        },
      );
    });
  });

  describe("blockGroup", () => {
    it("should resolve on successful POST (204)", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(
        service.blockGroup(mockNumber, mockGroupId),
      ).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/block`,
        {
          method: "POST",
        },
      );
    });

    it("should throw SignalApiServiceError on network error", async () => {
      const networkError = new Error(
        "Server connection lost while blocking group",
      );
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(service.blockGroup(mockNumber, mockGroupId)).rejects.toThrow(
        new SignalApiServiceError(networkError.message, -1),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/block`,
        {
          method: "POST",
        },
      );
    });

    it("should throw SignalApiServiceError on API error (e.g. 404 admin not found)", async () => {
      const errorMessage = "Group to block not found";
      const errorStatus = 404;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(service.blockGroup(mockNumber, mockGroupId)).rejects.toThrow(
        new SignalApiServiceError(errorMessage, errorStatus),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/block`,
        {
          method: "POST",
        },
      );
    });
  });

  describe("getGroupAvatar", () => {
    it("should resolve and return avatar string on successful GET (200)", async () => {
      const groupAvatar = "aVaTaRbasE64=";
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => groupAvatar,
      });

      await expect(
        service.getGroupAvatar(mockNumber, mockGroupId),
      ).resolves.toBe(groupAvatar);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/avatar`,
      );
    });

    it("should throw SignalApiServiceError on network error", async () => {
      const networkError = new Error(
        "Server connection lost while blocking group",
      );
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(
        service.getGroupAvatar(mockNumber, mockGroupId),
      ).rejects.toThrow(new SignalApiServiceError(networkError.message, -1));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/avatar`,
      );
    });

    it("should throw SignalApiServiceError on API error (e.g. 404 admin not found)", async () => {
      const errorMessage = "Group to block not found";
      const errorStatus = 404;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(
        service.getGroupAvatar(mockNumber, mockGroupId),
      ).rejects.toThrow(new SignalApiServiceError(errorMessage, errorStatus));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/avatar`,
      );
    });
  });

  describe("addMembers", () => {
    const members = ["+12345", "userId=="];

    it("should resolve on successful POST (204)", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(
        service.addMembers(mockNumber, mockGroupId, members),
      ).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/members`,
        {
          method: "POST",
          body: JSON.stringify({ members: members }),
        },
      );
    });

    it("should throw SignalApiServiceError on network error", async () => {
      const networkError = new Error(
        "Server connection lost while blocking group",
      );
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(
        service.addMembers(mockNumber, mockGroupId, members),
      ).rejects.toThrow(new SignalApiServiceError(networkError.message, -1));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/members`,
        {
          method: "POST",
          body: JSON.stringify({ members: members }),
        },
      );
    });

    it("should throw SignalApiServiceError on API error (e.g. 404 admin not found)", async () => {
      const errorMessage = "Group to block not found";
      const errorStatus = 404;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(
        service.addMembers(mockNumber, mockGroupId, members),
      ).rejects.toThrow(new SignalApiServiceError(errorMessage, errorStatus));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/members`,
        {
          method: "POST",
          body: JSON.stringify({ members: members }),
        },
      );
    });
  });

  describe("removeMembers", () => {
    const members = ["+12345", "userId=="];

    it("should resolve on successful DELETE (204)", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(
        service.removeMembers(mockNumber, mockGroupId, members),
      ).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/members`,
        {
          method: "DELETE",
          body: JSON.stringify({ members: members }),
        },
      );
    });

    it("should throw SignalApiServiceError on network error", async () => {
      const networkError = new Error(
        "Server connection lost while blocking group",
      );
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(
        service.removeMembers(mockNumber, mockGroupId, members),
      ).rejects.toThrow(new SignalApiServiceError(networkError.message, -1));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/members`,
        {
          method: "DELETE",
          body: JSON.stringify({ members: members }),
        },
      );
    });

    it("should throw SignalApiServiceError on API error (e.g. 404 admin not found)", async () => {
      const errorMessage = "Group to block not found";
      const errorStatus = 404;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
        text: async () => errorMessage,
      });

      await expect(
        service.removeMembers(mockNumber, mockGroupId, members),
      ).rejects.toThrow(new SignalApiServiceError(errorMessage, errorStatus));
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/v1/groups/${mockNumber}/${mockGroupId}/members`,
        {
          method: "DELETE",
          body: JSON.stringify({ members: members }),
        },
      );
    });
  });
});
