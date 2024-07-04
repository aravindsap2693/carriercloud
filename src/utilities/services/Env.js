import axios from "axios";
import AxiosInstance from "./Interceptor";
import StorageConfiguration from "./StorageConfiguration";

export const appUrl =
  "https://play.google.com/store/apps/details?id=com.affairscloud";

export const preferenceImageUrl =
  process.env.REACT_APP_ASSETS_URL + "category/images/";

export const profileImageUrl =
  process.env.REACT_APP_ASSETS_URL + "users/images/";

export const googleAnalyticsId = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;
let token = StorageConfiguration.sessionGetItem("user_token");

const Env = {
  async get(path, params) {
    let api = await AxiosInstance.get(path, params);
    return api;
  },

  async post(path, payload) {
    let api = await AxiosInstance.post(path, payload);
    return api;
  },

  async fileUpload(path, payload) {
    let api = await axios.post(path, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return api;
  },

  async put(path, payload) {
    let api = await AxiosInstance.put(path, payload);
    return api;
  },

  getImageUrl(type) {
    let url = type + "/images/";
    return url;
  },
};

export default Env;

// M9jnv5IEMG848CtM0Iqsjg==

// M9jnv5IEMG848CtM0Iqsjg==
