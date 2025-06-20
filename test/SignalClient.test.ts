import { SignalClient } from "../src/SignalClient";
import { AboutService } from "../src/service/AboutService";
import { AccountService } from "../src/service/AccountService";
import { GroupService } from "../src/service/GroupService";
import { MessageService } from "../src/service/MessageService";
import { ProfileService } from "../src/service/ProfileService";
import { ReceiveService } from "../src/service/ReceiveService";
import { StickerService } from "../src/service/StickerService";

describe("SignalClient", () => {
  const mockApiPath = "http://localhost:8080";
  let client: SignalClient;

  beforeEach(() => {
    client = new SignalClient(mockApiPath);
  });

  it("should create and return an instance of AboutService", () => {
    const aboutService = client.about();
    expect(aboutService).toBeInstanceOf(AboutService);

    const anotherAboutService = client.about();
    expect(anotherAboutService).toBe(aboutService);
  });

  it("should create and return an instance of AccountService", () => {
    const accountService = client.account();
    expect(accountService).toBeInstanceOf(AccountService);
    const anotherAccountService = client.account();
    expect(anotherAccountService).toBe(accountService);
  });

  it("should create and return an instance of GroupService", () => {
    const groupService = client.group();
    expect(groupService).toBeInstanceOf(GroupService);
    const anotherGroupService = client.group();
    expect(anotherGroupService).toBe(groupService);
  });

  it("should create and return an instance of MessageService", () => {
    const messageService = client.message();
    expect(messageService).toBeInstanceOf(MessageService);
    const anotherMessageService = client.message();
    expect(anotherMessageService).toBe(messageService);
  });

  it("should create and return an instance of ProfileService", () => {
    const profileService = client.profile();
    expect(profileService).toBeInstanceOf(ProfileService);
    const anotherProfileService = client.profile();
    expect(anotherProfileService).toBe(profileService);
  });

  it("should create and return an instance of ReceiveService", () => {
    const receiveService = client.receive();
    expect(receiveService).toBeInstanceOf(ReceiveService);
    const anotherReceiveService = client.receive();
    expect(anotherReceiveService).toBe(receiveService);
  });

  it("should create and return an instance of StickerService", () => {
    const stickerService = client.sticker();
    expect(stickerService).toBeInstanceOf(StickerService);
    const anotherStickerService = client.sticker();
    expect(anotherStickerService).toBe(stickerService);
  });
});
