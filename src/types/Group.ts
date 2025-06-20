interface Group {
  admins?: string[];
  blocked?: boolean;
  description?: string;
  id?: string;
  internal_id?: string;
  invite_link?: string;
  members?: string[];
  name?: string;
  pending_invites?: string[];
  pending_requests?: string[];
}

interface GroupPermissions {
  add_members: "only-admins" | "every-member";
  edit_group: "only-admins" | "every-member";
}

interface CreateGroupRequest {
  description?: string;
  expiration_time?: number;
  group_link: "disabled" | "enabled" | "enabled-with-approval";
  members: string[];
  name: string;
  permissions?: GroupPermissions;
}

interface CreateGroupResponse {
  id: string;
}

interface UpdateGroupRequest {
  base64_avatar?: string;
  description?: string;
  expiration_time?: number;
  name?: string;
}

interface ChangeGroupAdminsRequest {
  admins: string[];
}

type GroupList = Group[];

export {
  Group,
  GroupList,
  CreateGroupRequest,
  CreateGroupResponse,
  UpdateGroupRequest,
  ChangeGroupAdminsRequest,
};
