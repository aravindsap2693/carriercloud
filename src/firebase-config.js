import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getRemoteConfig } from "firebase/remote-config";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAzIgyo0Ml5CGCBHIs9PNE41MMH-hEB2aM",
  authDomain: "web-app-login-d91da.firebaseapp.com",
  projectId: "web-app-login-d91da",
  storageBucket: "web-app-login-d91da.appspot.com",
  messagingSenderId: "366544583878",
  appId: "1:366544583878:web:c65fded87416141033abc7",
  measurementId: "G-7GK7P3K3GR"
};

export const firebase = initializeApp(firebaseConfig);
export const db = getFirestore(firebase);
export const analytics = getAnalytics(firebase);
export const remoteConfig = getRemoteConfig(firebase);
const auth = getAuth(firebase);
const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/contacts.readonly");

export { auth, provider };
