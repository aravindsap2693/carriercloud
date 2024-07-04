import StorageConfiguration from "../utilities/services/StorageConfiguration";

class Authentication {

  isAuthenticated() {
    return JSON.parse(StorageConfiguration.sessionGetItem('is_logged_in'));
  }
}

const Auth = new Authentication()

export default Auth;
