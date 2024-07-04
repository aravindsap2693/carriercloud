import React, { Component } from "react";
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  Select,
  Upload,
  Spin,
  Breadcrumb,
} from "antd";
import jennifer from "../../assets/images/profile.jpg";
import { CameraFilled } from "@ant-design/icons";
import Env, { profileImageUrl } from "../../utilities/services/Env";
import ImgCrop from "antd-img-crop";
import StorageConfiguration from "../../utilities/services/StorageConfiguration";
import {
  currentPageRouting,
  profileImageUpdate,
  profileUpdate,
} from "../../reducers/action";
import { connect } from "react-redux";
import "../../assets/css/profile.css";
import { toast } from "react-toastify";
import GoogleAuthenticationBtn from "../../components/GoogleAuthenticationBtn";
import { GoogleOAuthProvider } from "@react-oauth/google";
import _ from "lodash";

class Profile extends Component {
  constructor() {
    super();
    this.state = {
      first_name: "",
      last_name: "",
      email_id: "",
      mobile_number: "",
      pincode: "",
      prefered_location_id: "",
      profile_image: null,
      loading: false,
      preference_count: 0,
      activeLoader: true,
      user_id: StorageConfiguration.sessionGetItem("user_id"),
    };
    this.locationOptions = [];
    this.handleImageUpload = this.handleImageUpload.bind(this);
    this.formData = React.createRef();
  }

  componentDidMount() {
    this.props.dispatch(currentPageRouting(null));
    this.getPSCLocations();
  }

  onFinish = async (values) => {
    // if (
    //   this.state.profile_image === "null" ||
    //   _.isNull(this.state.profile_image)
    // ) {
    //   toast("Please upload you profile image!");
    // } else {
    const updateData = Env.put(
      this.props.envendpoint +
        `customers?email_id=${values.email_id}&profile_image=${this.state.profile_image}&prefered_location_id=${this.state.prefered_location_id}&last_name=${values.last_name}&location=${values.pincode}&id=${this.state.user_id}&mobile_country_code=91&mobile_number=${values.mobile_number}&first_name=${values.first_name}`
    );
    await updateData.then(
      (response) => {
        const responseData = response.data.response.user;
        const payload = {
          first_name: responseData.first_name,
          last_name: responseData.last_name,
          user_name: responseData.first_name + " " + responseData.last_name,
          profile_image: responseData.profile_image,
          level_points: responseData.level_points,
          role_id: responseData.role_permission_id,
          email_id: responseData.email_id,
          user_id: responseData.id,
        };
        StorageConfiguration.sessionSetItem(
          "user_name",
          responseData.first_name + " " + responseData.last_name
        );
        StorageConfiguration.sessionSetItem(
          "first_name",
          responseData.first_name
        );
        StorageConfiguration.sessionSetItem("email_id", responseData.email_id);
        StorageConfiguration.sessionSetItem(
          "mobile_number",
          responseData.mobile_number
        );
        this.props.dispatch(profileUpdate(payload));
        this.props.dispatch(profileImageUpdate(payload.profile_image));
        toast("Profile updated successfully!");
        if (this.state.preference_count === 0) {
          this.props.navigate("/preference");
        } else {
          this.props.navigate("/home-feed");
        }
      },
      (error) => {
        let errorData = error.response.data.message;
        Object.values(errorData).forEach((element) => {
          toast(
            JSON.stringify(Object.values(element)).replace(/[\[\]'"]+/g, "")
          );
        });
      }
    );
    // }
  };

  handleLocationChange = (value, e) => {
    this.setState({ prefered_location_id: value });
  };

  onImageChange = (e) => {
    this.setState({ image_src: e.file.originFileObj, loading: true });
  };

  getUserDetails() {
    const getData = Env.get(this.props.envendpoint + `customers/view`);
    getData.then((response) => {
      const data = response.data.customer;
      this.setState({
        first_name: data.first_name,
        last_name: data.last_name,
        email_id: data.email_id,
        mobile_number: data.mobile_number,
        pincode: data.location,
        profile_image: data.profile_image,
        preference_count: data.preference_count,
        activeLoader: false,
        prefered_location_id: data.prefered_location_id,
      });
      this.formData.current.setFieldsValue({
        first_name: data.first_name,
        last_name: data.last_name,
        email_id: data.email_id,
        mobile_number: data.mobile_number,
        pincode: data.location,
        prefered_location_id: data.prefered_location_id,
        profile_image: data.profile_image,
      });
      StorageConfiguration.sessionSetItem(
        "profile_image",
        this.state.profile_image
      );
      this.props.dispatch(profileImageUpdate(this.state.profile_image));
    });
  }

  handleCancel = () => {
    if (this.state.preference_count === 0) {
      this.props.navigate("/login");
    } else {
      this.props.navigate(-1);
    }
  };

  onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  getPSCLocations() {
    const locationData = [];
    const getData = Env.get(this.props.envendpoint + `locations`);
    getData.then(
      (response) => {
        const data = response.data.response.locations;
        data.forEach((element) => {
          locationData.push({
            label: element.location,
            value: element.id,
          });
        });
        this.locationOptions = locationData;
        this.getUserDetails();
      },
      (error) => {
        console.error(error);
      }
    );
  }

  handleImageUpload(e) {
    const image_src = e.file;
    let formData = new FormData();
    formData.append("file", image_src);
    const UploadImage = Env.fileUpload(
      this.props.envendpoint + `images/upload/user`,
      formData
    );
    UploadImage.then(
      (response) => {
        const payload = response.data.response.image_name;
        this.setState({
          profile_image: payload,
          loading: false,
        });
        toast("Image uploaded successfully!");
      },
      (error) => {
        console.error(error);
      }
    );
  }

  responseGoogleOAuth = (response) => {
    if (_.isUndefined(response.error)) {
      fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${response.access_token}`
      )
        .then((response) => response.json())
        .then((data) => {
          this.formData.current.setFieldsValue({ email_id: data.email });
          this.setState({ email_id: data.email });
        })
        .catch((error) => console.error(error));
    } else {
      toast(response.details);
    }
  };

  render() {
    const uploadButton = (
      <div>
        <span
          style={{
            position: "absolute",
            background: "#fff",
            borderRadius: "90px",
            cursor: "pointer",
            left: "80px",
            top: "70px",
          }}
        >
          <CameraFilled
            style={{ color: "grey", padding: "5px", width: "25px" }}
          />
        </span>
      </div>
    );

    return (
      <div className="profile-main">
        <div className="container">
          <div className="breadcrumb-container">
            <Breadcrumb items={[{ title: "My Profile" }]} />
          </div>

          <div className="header-panel">
            <div className="background-image"></div>
            <div className="content">
              <div className="content-panel">
                <div className="profile-image">
                  <ImgCrop rotationSlider={true} cropShape="round">
                    <Upload
                      name="avatar"
                      listType="picture-circle"
                      showUploadList={false}
                      customRequest={this.handleImageUpload}
                      onChange={this.onImageChange}
                      accept="image/png,image/jpg,image/webp,image/jpeg"
                    >
                      {/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
                        this.state.profile_image
                      ) ? (
                        <span>
                          <img
                            alt="profile"
                            src={profileImageUrl + this.state.profile_image}
                            className="upload-image"
                          />
                          {uploadButton}
                        </span>
                      ) : (
                        <span>
                          <img
                            src={jennifer}
                            alt="profile"
                            className="upload-image"
                          />
                          {uploadButton}
                        </span>
                      )}
                    </Upload>
                  </ImgCrop>
                </div>
                <div className="content-panel-text">
                  <div className="username">
                    {this.state.first_name + " " + this.state.last_name}
                  </div>
                  <div className="email">{this.state.email_id}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="form-panel">
            <div className="form-header">
              <span className="header-text">PROFILE INFORMATION</span>
            </div>
            <div className="forms">
              <Form
                onFinish={this.onFinish}
                onFinishFailed={this.onFinishFailed}
                layout="vertical"
                initialValues={{ first_name: this.state.first_name }}
                ref={this.formData}
              >
                {this.state.activeLoader === false ? (
                  <Row>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                      <Form.Item
                        label="First Name"
                        name="first_name"
                        rules={[
                          {
                            required: true,
                            message: "Please input your first name!",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter you First Name"
                          maxLength={30}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                      <Form.Item
                        label="Last Name"
                        name="last_name"
                        rules={[
                          {
                            required: true,
                            message: "Please input your last name!",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter you Last Name"
                          maxLength={30}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={18} md={18} lg={18} xl={18} xxl={18}>
                      <Form.Item
                        label="Email ID"
                        name="email_id"
                        rules={[
                          {
                            type: "email",
                            required: true,
                            message: "Please input your email!",
                          },
                        ]}
                      >
                        <Input placeholder="Enter you Email ID" readOnly />
                      </Form.Item>
                    </Col>
                    <Col
                      xs={24}
                      sm={6}
                      md={6}
                      lg={6}
                      xl={6}
                      xxl={6}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <GoogleOAuthProvider
                        clientId={
                          this.props.envupdate.react_app_google_client_id
                        }
                      >
                        <GoogleAuthenticationBtn
                          responseGoogleOAuth={this.responseGoogleOAuth}
                          type={"Change"}
                        />
                      </GoogleOAuthProvider>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                      <Form.Item
                        label="Mobile No."
                        name="mobile_number"
                        rules={[
                          {
                            required: true,
                            message: "Please input your mobile number!",
                          },
                          () => ({
                            validator(_, value) {
                              if (!value) {
                                return Promise.reject();
                              }
                              if (isNaN(value)) {
                                return Promise.reject(
                                  "Mobile number has to be a number."
                                );
                              }
                              if (value.length < 10) {
                                return Promise.reject(
                                  "Mobile number can't be less than 10 digits"
                                );
                              }
                              if (value.length > 10) {
                                return Promise.reject(
                                  "Mobile number can't be more than 10 digits"
                                );
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <Input placeholder="Enter you Mobile Number" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                      <Form.Item
                        label="Pincode"
                        name="pincode"
                        rules={[
                          {
                            required: true,
                            message: "Please input your pincode!",
                          },
                          () => ({
                            validator(_, value) {
                              if (!value) {
                                return Promise.reject();
                              }
                              if (isNaN(value)) {
                                return Promise.reject(
                                  "Pin code has to be a number."
                                );
                              }
                              if (value.length < 6) {
                                return Promise.reject(
                                  "Pin code can't be less than 5 digits"
                                );
                              }
                              if (value.length > 6) {
                                return Promise.reject(
                                  "Pin code can't be more than 5 digits"
                                );
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <Input placeholder="Enter you Pincode" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                      <Form.Item
                        label="Preparing for State PSC"
                        name="prefered_location_id"
                        rules={[
                          {
                            required: true,
                            message: "Please input your psc!",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select a PSC"
                          onChange={this.handleLocationChange}
                          options={this.locationOptions}
                        ></Select>
                      </Form.Item>
                    </Col>

                    <Col
                      xs={24}
                      sm={24}
                      md={24}
                      lg={24}
                      xl={24}
                      xxl={24}
                      className="footer"
                    >
                      <Form.Item>
                        <Button
                          key="back"
                          shape="round"
                          onClick={this.handleCancel}
                          className="cancel"
                        >
                          Cancel
                        </Button>
                        <Button
                          shape="round"
                          htmlType="submit"
                          className="submit"
                        >
                          Save
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                ) : (
                  <Spin
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      minHeight: "500px",
                    }}
                    size="large"
                  />
                )}
              </Form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    envupdate: state.envupdate,
    envendpoint: state.envendpoint,
  };
})(Profile);
