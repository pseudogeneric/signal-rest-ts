import { SignalClient } from './SignalClient';
import { AboutService } from './service/AboutService';
import { AccountService } from './service/AccountService';
import { GroupService } from './service/GroupService';
import { MessageService } from './service/MessageService';
import { ProfileService } from './service/ProfileService';

describe('SignalClient', () => {
  const mockApiPath = 'http://localhost:8080';
  let client: SignalClient;

  beforeEach(() => {
    client = new SignalClient(mockApiPath);
  });

  it('should create and return an instance of AboutService', () => {
    const aboutService = client.about();
    expect(aboutService).toBeInstanceOf(AboutService);
    // Test if it's a singleton (returns the same instance)
    const anotherAboutService = client.about();
    expect(anotherAboutService).toBe(aboutService);
  });

  it('should create and return an instance of AccountService', () => {
    const accountService = client.account();
    expect(accountService).toBeInstanceOf(AccountService);
    const anotherAccountService = client.account();
    expect(anotherAccountService).toBe(accountService);
  });

  it('should create and return an instance of GroupService', () => {
    const groupService = client.group();
    expect(groupService).toBeInstanceOf(GroupService);
    const anotherGroupService = client.group();
    expect(anotherGroupService).toBe(groupService);
  });

  it('should create and return an instance of MessageService', () => {
    const messageService = client.message();
    expect(messageService).toBeInstanceOf(MessageService);
    const anotherMessageService = client.message();
    expect(anotherMessageService).toBe(messageService);
  });

  it('should create and return an instance of ProfileService', () => {
    const profileService = client.profile();
    expect(profileService).toBeInstanceOf(ProfileService);
    const anotherProfileService = client.profile();
    expect(anotherProfileService).toBe(profileService);
  });
});
