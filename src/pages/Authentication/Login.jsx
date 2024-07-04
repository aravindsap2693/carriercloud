import React, { Component } from "react";
import { Button, Carousel, Divider, List, Spin } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import logo from "../../assets/images/full-logo.svg";
import apj from "../../assets/images/apj.svg";
import cloud from "../../assets/images/cloud.svg";
import playstore_icon from "../../assets/images/playstore_icon.svg";
import { connect } from "react-redux";
import StorageConfiguration from "../../utilities/services/StorageConfiguration";
import Env from "../../utilities/services/Env";
import "../../assets/css/login.css";
import $ from "jquery";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import {
  currentPageRouting,
  profileImageUpdate,
  profileUpdate,
  bannerUpdate,
} from "../../reducers/action";
import { isNewUser, envEndpoint, envUpdate } from "../../reducers/action";
import ConfirmationPopup from "../../components/ConfirmationPopup";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleAuthenticationBtn from "../../components/GoogleAuthenticationBtn";
import _ from "lodash";

class Loginpage extends Component {
  constructor() {
    super();
    this.state = {
      data: {
        email_id: "",
        social_token: "",
        profile_image: "",
        device_id: "",
        app_version: "web",
        login_type: "",
        device_token: "",
        social_user_auth_id: "",
        last_name: "",
        first_name: "",
        devices_name: null,
      },
      client_id: null,
      activeLoader: false,
    };
    this.submitForm = this.submitForm.bind(this);
    this.handleMenu = this.handleMenu.bind(this);
    this.responseGoogleOAuth = this.responseGoogleOAuth.bind(this);
  }

  componentDidMount() {
    let url = process.env.REACT_APP_API_URL;
    if (this.props.envendpoint === null) {
      if (process.env.REACT_APP_ENV === "dev") {
        url = "https://testapi.careerscloud.in/api/";
      } else {
        url = "https://api.careerscloud.in/api/";
      }
      this.props.dispatch(envEndpoint(url));
    }
    this.getGeneralSettings(url);
    if (navigator) {
      if (navigator.vendor === "Google Inc.") {
        navigator.userAgentData
          .getHighEntropyValues(["bitness", "platform"])
          .then((ua) => {
            let devices_name = `${ua.platform}-x${ua.bitness}`;
            this.setState({ devices_name: devices_name });
          });
      } else if (navigator.vendor === "Apple Computer, Inc.") {
        let bit =
          navigator.platform.includes("MacIntel") ||
          navigator.platform.includes("PPC")
            ? 64
            : 32;
        let devices_name = `${navigator.platform}-x${bit}`;
        this.setState({ devices_name: devices_name });
      } else {
        let user = navigator.oscpu.split(" ");
        let devices_name = `${user[0]}-${user[user.length - 1]}`;
        this.setState({ devices_name: devices_name });
      }
    }
  }

  getGeneralSettings = (url) => {
    const getEnv = Env.get(url + `settings/general_settings_web`);
    getEnv.then((response) => {
      let data = response.data.response.data;
      data = window.atob(window.atob(data));
      data = JSON.parse(data).settings;
      this.setState({ client_id: data[7].setting_value });
      this.props.dispatch(envUpdate(data));
    });
  };

  async submitForm() {
    this.setState({ activeLoader: true });
    let encryptedData = StorageConfiguration.encryptWithAES(
      JSON.stringify(this.state.data)
    );
    const requestBody = {
      mobile_login: null,
      login_type: this.state.data.login_type,
      encrypted_data: encryptedData,
      device_name: this.state.devices_name,
    };
    const postData = Env.post(
      this.props.envendpoint +
        `login?current_app_version=${this.state.data.app_version}&platform=web`,
      requestBody
    );
    await postData.then(
      (response) => {
        const data = response.data.response.user;
        StorageConfiguration.sessionSetItem("is_logged_in", true);
        StorageConfiguration.sessionSetItem("user_id", data.id);
        StorageConfiguration.sessionSetItem(
          "user_name",
          data.first_name + " " + data.last_name
        );
        StorageConfiguration.sessionSetItem("first_name", data.first_name);
        StorageConfiguration.sessionSetItem(
          "user_token",
          response.data.response.access_token
        );
        StorageConfiguration.sessionSetItem("email_id", data.email_id);
        StorageConfiguration.sessionSetItem(
          "profile_image",
          data.profile_image
        );
        StorageConfiguration.sessionSetItem(
          "mobile_number",
          data.mobile_number
        );
        StorageConfiguration.sessionSetItem("user_coins", data.coins_balance);
        if (data.is_mobile_verified === 0) {
          this.props.dispatch(isNewUser(true));
          this.props.navigate("/profile");
        } else {
          if (data.preference_count === 0) {
            this.props.dispatch(isNewUser(true));
            this.props.navigate("/profile");
          } else {
            this.props.dispatch(profileImageUpdate(data.profile_image));
            const payload = {
              first_name: data.first_name,
              last_name: data.last_name,
              user_name: data.first_name + " " + data.last_name,
              profile_image: data.profile_image,
              level_points: data.level_points,
              role_id: data.role_permission_id,
              email_id: data.email_id,
              user_id: data.id,
              device_name: response.data.response.device_name,
              session_id: response.data.response.session_id,
              comment_block: response.data.response.block_status,
            };
            this.props.dispatch(profileUpdate(payload));
            this.props.dispatch(
              bannerUpdate({
                doubts_banner: response.data.response.doubt_banner,
                support_banner: response.data.response.support_banner,
              })
            );
            this.setState({ activeLoader: true });
            this.props.navigate("/home-feed");
            this.props.dispatch(
              currentPageRouting({ path: "/home-feed", selectedKeys: "1" })
            );
            this.props.dispatch(isNewUser(false));
            toast("Logged In Successfully !");
          }
        }
      },
      (error) => {
        if (error.response !== undefined && error.response.status === 490) {
          toast(error.response.data.message);
          this.confirmationPopup.handleSessionVisible(
            true,
            this.state.data.email_id,
            error.response.data.message
          );
        } else {
          toast("Please enter the valid email ID");
          this.props.navigate("/home-feed");
        }
      }
    );
  }

  responseGoogleOAuth(response) {
    if (_.isUndefined(response.error)) {
      fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${response.access_token}`
      )
        .then((response) => response.json())
        .then((data) => {
          this.setState(
            {
              data: {
                email_id: data.email,
                social_token: data.sub,
                profile_image: data.picture,
                login_type: "google",
                app_version: "web",
                device_token: response.access_token,
                social_user_auth_id: data.email,
                last_name: data.family_name,
                first_name: data.given_name,
              },
            },
            () => this.submitForm()
          );
        })
        .catch((error) => console.error(error));
    } else {
      toast(response.details);
    }
  }

  handleMenu() {
    $(".responsive-menu").fadeToggle();
    $(".responsive-menu").css("display", "flex");
  }

  render() {
    return (
      <div className="login-container">
        {this.state.activeLoader === false ? (
          <GoogleOAuthProvider
            clientId={
              this.props.envupdate.react_app_google_client_id
                ? this.props.envupdate.react_app_google_client_id
                : this.state.client_id
            }
          >
            <div>
              <div className="login-container-bg">
                <div className="content">
                  <span>
                    <img
                      className="login-container-logo"
                      alt="logo"
                      src={logo}
                    />
                  </span>
                  <span className="login-container-header">
                    <span className="login-container-header-menu">Home</span>
                    <span className="login-container-header-menu">
                      Test Series
                    </span>
                    <span className="login-container-header-menu">Course</span>
                    <span className="login-container-header-menu">Doubts</span>
                    <span className="login-container-header-menu">Quizzes</span>
                  </span>
                  <span className="login-container-header-register">
                    <GoogleAuthenticationBtn
                      responseGoogleOAuth={this.responseGoogleOAuth}
                      type={"register"}
                    />
                  </span>
                  <span className="login-container-header-menu-icon">
                    <MenuOutlined
                      style={{ fontSize: "20px", color: "#0B649D" }}
                      onClick={this.handleMenu}
                    />
                  </span>
                </div>

                <div className="responsive-menu">
                  <List
                    style={{
                      width: "100%",
                      margin: "0px 60px",
                      padding: "10px",
                    }}
                    header={null}
                    footer={null}
                    bordered={false}
                    dataSource={data}
                    renderItem={(item) => (
                      <NavLink
                        to={item.path}
                        style={{
                          justifyContent: "center",
                          display: "flex",
                          padding: "10px",
                          borderBottom: "1px solid #e4e5e7",
                        }}
                        onClick={this.handleMenu}
                      >
                        {item.name}
                      </NavLink>
                    )}
                  />
                </div>

                <div className="login-container-content">
                  <div className="login-container-content-1">
                    <Carousel autoplay>
                      <div>
                        <div className="login-carousel-main">
                          <div className="login-carousel-image-1"></div>
                          <div className="login-carousel-main-description">
                            <div className="header">Learn</div>
                            <div className="content"> Anytime Anywhere</div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="login-carousel-main">
                          <div className="login-carousel-image-2"></div>
                          <div className="login-carousel-main-description">
                            <div className="header">Crack</div>
                            <div className="content">
                              {" "}
                              Way to Reach Your Goal
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="login-carousel-main">
                          <div className="login-carousel-image-3"></div>
                          <div className="login-carousel-main-description">
                            <div className="header">Lead </div>
                            <div className="content">Rule whatever You are</div>
                          </div>
                        </div>
                      </div>
                    </Carousel>
                  </div>

                  <div className="login-container-content-2">
                    <div className="card-form">
                      <div className="card-form-content">
                        <div className="card-form-header">
                          Get Learned with{" "}
                          <span className="text" style={{ fontSize: "18px" }}>
                            CareersCloud Exam Prep
                          </span>
                        </div>
                        <div className="key">
                          Boost your exam preparation with us
                        </div>
                        <div className="google-button-container">
                          <GoogleAuthenticationBtn
                            responseGoogleOAuth={this.responseGoogleOAuth}
                            type={"login"}
                          />
                        </div>
                        <div className="label">
                          Dedicated to APJ Abdul Kalam
                        </div>
                        <Divider />
                        <div>
                          <a className="footer">Terms</a> &
                          <a className="footer"> Privacy Policy</a>
                        </div>
                      </div>
                      <div className="footer-image"></div>
                    </div>
                    <div>
                      <div className="footer">Get the App</div>
                      <div>
                        <Button
                          href={this.props.envupdate.play_store_url}
                          target="blank"
                          icon={
                            <img
                              alt="playstore_icon"
                              src={playstore_icon}
                              className="login-card-footer"
                            />
                          }
                          type="primary"
                          className="login-card-google-play-button"
                        >
                          Google Play
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="login-container-footer">
                <div className="login-testimonal">
                  <img className="image" alt="apj" src={apj} />
                  <div className="image-header">LEARN TO LEAD</div>
                  <div className="image-sub-title">
                    Why Choose CareersCloud Exam Prep?
                  </div>
                </div>
                <div className="blocks">
                  <div className="block">
                    <img src={cloud} alt="cloud" className="image" />
                    <div className="text-content">
                      <div className="text">Online Classroom Program</div>
                      <div className="sub-text">By Top Faculty</div>
                    </div>
                  </div>
                  <div className="block">
                    <img src={cloud} className="image" alt="cloud" />
                    <div className="text-content">
                      <div className="text">Comprenhensive Study Material</div>
                      <div className="sub-text">By Top Faculty</div>
                    </div>
                  </div>
                  <div className="block">
                    <img src={cloud} alt="cloud" className="image" />
                    <div className="text-content">
                      <div className="text">Latest Pattern Test Series</div>
                      <div className="sub-text">By Top Faculty</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GoogleOAuthProvider>
        ) : (
          <Spin
            size="large"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          />
        )}
        <ConfirmationPopup
          ref={(instance) => {
            this.confirmationPopup = instance;
          }}
          submitForm={this.submitForm}
          {...this.props}
        />
      </div>
    );
  }
}

export default connect((state) => {
  return {
    preferences: state.preferences,
    envupdate: state.envupdate,
    envendpoint: state.envendpoint,
  };
})(Loginpage);

const data = [
  { name: "Home", path: "" },
  { name: "Test Series", path: "" },
  { name: "Course", path: "" },
  { name: "Doubts", path: "" },
  { name: "Quizzes", path: "" },
];
