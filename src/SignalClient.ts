import { AboutService } from "./service/AboutService";
import { AccountService } from "./service/AccountService";
import { GroupService } from "./service/GroupService";
import { MessageService } from "./service/MessageService";
import { ProfileService } from "./service/ProfileService";

export class SignalClient {
  
  private apiPath: string;
  
  private accountService?: AccountService;
  private aboutService?: AboutService;
  private groupService?: GroupService;
  private messageService?: MessageService;
  private profileService?: ProfileService;

  constructor(api: string) {
    this.apiPath = api;
  }

  account = (): AccountService => {
    if (this.accountService === undefined) {
      this.accountService = new AccountService(this.apiPath);
    }
    return this.accountService;
  };

  about = (): AboutService => {
    if (this.aboutService === undefined) {
      this.aboutService = new AboutService(this.apiPath);
    }
    return this.aboutService;
  };

  group = (): GroupService => {
    if (this.groupService === undefined) {
      this.groupService = new GroupService(this.apiPath);
    }
    return this.groupService;
  };

  message = (): MessageService => {
    if (this.messageService === undefined) {
      this.messageService = new MessageService(this.apiPath);
    }
    return this.messageService;
  };

  profile = (): ProfileService => {
    if (this.profileService === undefined) {
      this.profileService = new ProfileService(this.apiPath);
    }
    return this.profileService;
  };
}
