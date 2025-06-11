(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/service/Service.ts
  var Service, API;
  var init_Service = __esm({
    "src/service/Service.ts"() {
      Service = class {
        getAPI = () => {
          return API;
        };
        unknownError = () => {
          return { message: "Unknown Error", statusCode: -1 };
        };
      };
      API = "http://192.168.1.50:8080";
    }
  });

  // src/service/AboutService.ts
  var AboutService;
  var init_AboutService = __esm({
    "src/service/AboutService.ts"() {
      init_Service();
      AboutService = class extends Service {
        aboutServer = async () => {
          try {
            const response = fetch(this.getAPI() + "/v1/about");
            return (await response).json();
          } catch (e) {
            return { message: "Unknown Error", statusCode: -1 };
          }
        };
      };
    }
  });

  // src/service/AccountService.ts
  var AccountService;
  var init_AccountService = __esm({
    "src/service/AccountService.ts"() {
      init_Service();
      AccountService = class extends Service {
        getAccounts = async () => {
          try {
            const response = await fetch(this.getAPI() + "/v1/accounts");
            if (response.status === 200) {
              return await response.json();
            } else {
              const errorMessage = await response.text();
              return {
                message: errorMessage,
                statusCode: response.status
              };
            }
          } catch (e) {
            return { message: "Unknown Error", statusCode: -1 };
          }
        };
        setUsername = async (number, newName) => {
          try {
            const response = await fetch(
              this.getAPI() + "/v1/accounts/" + number + "/username",
              {
                method: "POST",
                body: JSON.stringify({ username: newName })
              }
            );
            return await response.json();
          } catch (e) {
            return { message: "Unknown Error", statusCode: -1 };
          }
        };
        deleteUsername = async (number) => {
          try {
            fetch(this.getAPI() + "/v1/accounts/" + number + "/username", {
              method: "DELETE"
            });
          } catch (e) {
            return { message: "Unknown Error", statusCode: -1 };
          }
        };
      };
    }
  });

  // src/service/GroupService.ts
  var GroupService;
  var init_GroupService = __esm({
    "src/service/GroupService.ts"() {
      init_Service();
      GroupService = class extends Service {
        getGroup = async (num, groupId) => {
          try {
            const response = await fetch(
              this.getAPI() + "/v1/groups/" + num + "/" + groupId
            );
            if (response.status === 200) {
              return await response.json();
            } else {
              const error = await response.text();
              return { message: error, statusCode: response.status };
            }
          } catch (e) {
            return this.unknownError();
          }
        };
        getGroups = async (num) => {
          try {
            const response = await fetch(this.getAPI() + "/v1/groups/" + num);
            if (response.status === 200) {
              return await response.json();
            } else {
              const error = await response.text();
              return { message: error, statusCode: response.status };
            }
          } catch (e) {
            return this.unknownError();
          }
        };
        createGroup = async (number, groupDescriptor) => {
          try {
            const response = await fetch(this.getAPI() + "/v1/groups/" + number, {
              method: "POST",
              body: JSON.stringify(groupDescriptor)
            });
            if (response.status === 201) {
              return await response.json();
            } else {
              const error = await response.text();
              return { message: error, statusCode: response.status };
            }
          } catch (e) {
            return this.unknownError();
          }
        };
        quitGroup = async (number, groupId) => {
          try {
            const response = await fetch(
              this.getAPI() + "/v1/groups/" + number + "/" + groupId + "/quit",
              {
                method: "POST"
              }
            );
            if (response.status !== 204) {
              const error = await response.text();
              return { message: error, statusCode: response.status };
            }
          } catch (e) {
            return this.unknownError();
          }
        };
        deleteGroup = async (number, groupId) => {
          try {
            const response = await fetch(
              this.getAPI() + "/v1/groups/" + number + "/" + groupId,
              {
                method: "DELETE"
              }
            );
            if (response.status !== 200) {
              const error = await response.text();
              return { message: error, statusCode: response.status };
            }
          } catch (e) {
            return this.unknownError();
          }
        };
        updateGroup = async (number, groupId, groupUpdate) => {
          try {
            const response = await fetch(
              this.getAPI() + "/v1/groups/" + number + "/" + groupId,
              {
                method: "PUT",
                body: JSON.stringify(groupUpdate)
              }
            );
            if (response.status !== 204) {
              const error = await response.text();
              return { message: error, statusCode: response.status };
            }
          } catch (e) {
            return this.unknownError();
          }
        };
      };
    }
  });

  // src/service/ProfileService.ts
  var ProfileService;
  var init_ProfileService = __esm({
    "src/service/ProfileService.ts"() {
      init_Service();
      ProfileService = class extends Service {
        updateProfile = async (number, profileUpdate) => {
          try {
            const response = await fetch(this.getAPI() + "/v1/profiles" + number, {
              method: "PUT",
              body: JSON.stringify(profileUpdate)
            });
            if (response.status !== 204) {
              const error = await response.text();
              return { message: error, statusCode: response.status };
            }
          } catch (e) {
            this.unknownError();
          }
        };
      };
    }
  });

  // index.ts
  var require_index = __commonJS({
    "index.ts"() {
      init_AboutService();
      init_AccountService();
      init_GroupService();
      init_ProfileService();
      var run = async () => {
        const about = new AboutService();
        const account = new AccountService();
        const group = new GroupService();
        const accounts = await account.getAccounts();
        const groups = await group.getGroups(accounts[0]);
        console.log(groups.filter((g) => {
          return g.name === "woke";
        }).map((g) => g.name).join(" "));
        const wokeGroup = groups.filter((g) => {
          return g.name === "woke";
        })[0];
        const profile = new ProfileService();
        console.log("Setting group desc.. " + wokeGroup.id);
        await group.updateGroup(accounts[0], wokeGroup.id, { description: "This group is insanely woke" });
        console.log("OK.. I think I did it!");
      };
      run();
    }
  });
  require_index();
})();
