import React, { Component } from "react";
import {
  Modal,
  Button,
  Row,
  Col,
  Form,
  Input,
  Select,
  Divider,
  Upload,
} from "antd";
import {
  PushpinTwoTone,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import Preference from "./Preference";
import ImgCrop from "antd-img-crop";
import Env, { profileImageUrl } from "../../utilities/services/Env";
import StorageConfiguration from "../../utilities/services/StorageConfiguration";
import { profileImageUpdate, profileUpdate } from "../../reducers/action";
import { toast } from "react-toastify";
import jennifer from "../../assets/images/profile.jpg";
import { connect } from "react-redux";

class EditProfile extends Component {
  constructor() {
    super();
    this.state = {
      isModalVisible: false,
      first_name: "",
      last_name: "",
      email_id: "",
      mobile_number: "",
      pincode: "",
      psc: "",
      profile_image: "",
      loading: false,
      preference_count: 0,
      locationOptions: [],
    };
    this.handleImageUpload = this.handleImageUpload.bind(this);
  }

  showModal = (data) => {
    this.setState({ isModalVisible: true });
  };

  handleOk = () => {
    this.setState({ isModalVisible: false });
  };

  handleCancel = () => {
    this.setState({ isModalVisible: false });
  };

  onFinish = async (values) => {
    if (this.state.preference_count === 0) {
      this.setState({ isModalVisible: false });
      this.preferencePopup.getAllPreferences();
    } else {
      const updateData = Env.put(
        this.props.envendpoint +
          `customers?email_id=${values.email_id}&profile_image=${this.state.profile_image}&prefered_location_id=24&last_name=${values.last_name}&location=${values.pincode}&id=331385&mobile_country_code=91&mobile_number=${values.mobile_number}&first_name=${values.first_name}`
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
          this.props.dispatch(profileUpdate(payload));
          this.setState({ isModalVisible: false });
          toast("Profile updated successfully!");
        },
        (error) => {
          console.error(error);
        }
      );
    }
  };

  onChange(value) {
    // console.log(`selected ${value}`);
  }

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
        psc: data.prefered_location_id,
        profile_image: data.profile_image,
        preference_count: data.preference_count,
        isModalVisible: true,
      });
      StorageConfiguration.sessionSetItem("profile_image", data.profile_image);
    });
  }

  onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  componentDidMount() {
    this.getPSCLocations();
  }

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
      },
      (error) => {
        console.error(error);
      }
    );
  }

  async handleImageUpload(e) {
    const image_src = e.file;
    const formData = new FormData();
    formData.append("file", image_src);
    const UploadImage = Env.fileUpload(
      this.props.envendpoint + `images/upload/user`,
      formData
    );
    await UploadImage.then(
      (response) => {
        this.setState({
          profile_image: response.data.response.image_name,
          loading: false,
        });
        const payload = response.data.response.image_name;
        this.props.dispatch(profileImageUpdate(payload));
        toast("Image uploaded successfully!");
      },
      (error) => {
        console.error(error);
      }
    );
  }

  render() {
    const uploadButton = (
      <div>
        {this.state.loading ? <LoadingOutlined /> : <PlusOutlined />}
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
    );

    return (
      <div>
        <Modal
          open={this.state.isModalVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          closable={false}
          width={900}
          centered
          maskClosable={false}
          footer={null}
        >
          <div style={{ textAlign: "center" }}>
            {/* <EditFilled style={{fontSize: '60px', color: 'gray'}} /> */}
            <div style={{ padding: "20px 0px" }}>
              <span
                style={{ fontSize: "22px", fontWeight: "bold", color: "grey" }}
              >
                Lets update your profile
              </span>
            </div>
          </div>

          <Form
            name="basic"
            onFinish={this.onFinish}
            onFinishFailed={this.onFinishFailed}
            autoComplete="off"
            layout="vertical"
            initialValues={{
              first_name: this.state.first_name,
              last_name: this.state.last_name,
              email_id: this.state.email_id,
              mobile_number: this.state.mobile_number,
              pincode: this.state.pincode,
              psc: this.state.psc,
            }}
          >
            <Row style={{ padding: "10px 0px" }}>
              <Col
                xs={24}
                sm={24}
                md={24}
                lg={24}
                xl={24}
                xxl={24}
                style={{ textAlign: "center" }}
              >
                <ImgCrop rotate shape="round">
                  <Upload
                    name="avatar"
                    listType="picture-circle"
                    showUploadList={false}
                    customRequest={this.handleImageUpload}
                    onChange={this.onImageChange}
                    style={{ textAlign: "center" }}
                    accept="image/png,image/jpg,image/webp,image/jpeg"
                  >
                    {/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
                      this.props.profile_image
                    ) ? (
                      <img
                        src={profileImageUrl + this.state.profile_image}
                        alt="ProfileImage"
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "90px",
                          padding: "5px",
                        }}
                      />
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
              </Col>
            </Row>
            <Row gutter={[20, 20]}>
              <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
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
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                <Form.Item
                  label="Last Name"
                  name="last_name"
                  value={this.state.last_name}
                  rules={[
                    { required: true, message: "Please input your last name!" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[20, 20]}>
              <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                <Form.Item
                  label="Email ID"
                  name="email_id"
                  value={this.state.email_id}
                  rules={[
                    { required: true, message: "Please input your email!" },
                  ]}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                <Form.Item
                  label="Mobile No."
                  name="mobile_number"
                  value={this.state.mobile_number}
                  rules={[
                    {
                      required: true,
                      message: "Please input your mobile number!",
                      min: 10,
                      max: 10,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[20, 20]}>
              <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                <Form.Item
                  label="Pincode"
                  name="pincode"
                  value={this.state.pincode}
                  rules={[
                    {
                      required: true,
                      message: "Please input your pincode!",
                      max: 10,
                    },
                  ]}
                  suffix={<PushpinTwoTone />}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                <Form.Item
                  label="Preparing for State PSC"
                  name="psc"
                  value={this.state.psc}
                  rules={[
                    { required: true, message: "Please input your psc!" },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder="Select a PSC"
                    onChange={this.onChange}
                    value={this.state.psc}
                    options={this.locationOptions}
                  ></Select>
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Row>
              <Col
                xs={24}
                sm={24}
                md={24}
                lg={24}
                xl={24}
                xxl={24}
                style={{ textAlign: "center" }}
              >
                <Form.Item>
                  <Button
                    key="back"
                    onClick={this.handleCancel}
                    style={{ margin: "0px 5px" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ margin: "0px 5px" }}
                  >
                    Save
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        <Preference
          ref={(instance) => {
            this.preferencePopup = instance;
          }}
          {...this.props}
        />
      </div>
    );
  }
}

export default connect((state) => {
  return {
    envupdate: state.envupdate,
    envendpoint: state.envendpoint,
  };
})(EditProfile);
