export interface UpdateAccountSettingsRequest {
  discoverable_by_number?: boolean;
  share_number?: boolean;
}

export interface SetPinRequest {
  pin: string;
}

export interface UsernameInfo {
  username?: string;
  username_link?: string;
}
