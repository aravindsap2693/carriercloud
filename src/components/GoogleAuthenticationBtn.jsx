import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "antd";
import google_icon from "../assets/images/google_icon.svg";

function GoogleAuthenticationBtn(props) {
  const loginHandler = useGoogleLogin({
    onSuccess: (response) => {
      props.responseGoogleOAuth(response);
    },
    responseType: "id_token",
    accessType: "offline",
    prompt: "consent",
    cookiePolicy: "single_host_origin",
    isSignedIn: true,
    fetchBasicProfile: true,
    flow: "implicit",
  });
  return (
    <>
      {props.type === "login" ? (
        <Button
          onClick={loginHandler}
          icon={
            <img
              src={google_icon}
              alt="google_icon"
              className="login-google-props-button-image"
            />
          }
          type="primary"
          className="login-google-props-button"
        >
          Log in with Google
        </Button>
      ) : props.type === "register" ? (
        <Button
          type="primary"
          className="login-container-header-register-button"
          onClick={loginHandler}
        >
          REGISTER
        </Button>
      ) : (
        <Button
          onClick={loginHandler}
          type="primary"
          className="login-google-props-button"
        >
          Change Email{" "}
        </Button>
      )}
    </>
  );
}

export default GoogleAuthenticationBtn;
