import React, { Component } from "react";
import { Divider, Modal, Spin, Button, Input, Upload } from "antd";
import { CloseCircleOutlined, UploadOutlined } from "@ant-design/icons";
import CloseCircle from "../assets/svg-icons/Image_upload_cancel.svg";
import "../assets/css/common.css";
import Env from "../utilities/services/Env";
import { toast } from "react-toastify";
import ImagePreview from "./ImagePreview";
import _ from "lodash";

const { TextArea } = Input;

class SupportContactPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalVisible: false,
      queries: "",
      preference: "",
      type: null,
      data: props,
      img_src: null,
      course_id: null,
      originalName: null,
      supportimage: null,
    };
    this.handleImageUpload = this.handleImageUpload.bind(this);
  }

  onImageChange = (e) => {
    this.setState({
      img_src: e.file.originFileObj,
      loading: true,
      originalName: e.file.name,
    });
  };

  // This function handles the image upload.
  async handleImageUpload(e) {
    const image_src = e.file;
    const formData = new FormData();
    formData.append("file", image_src);
    formData.append("field_name", "support_box");
    formData.append("originalName", this.state.originalName);
    formData.append("ebookId", "");
    const UploadImage = Env.fileUpload(
      this.props.envendpoint + `images/upload/Common`,
      formData
    );
    await UploadImage.then(
      (response) => {
        this.setState({
          supportimage: response.data.response.image_name,
          loading: false,
        });
        toast("Image uploaded successfully!");
      },
      (error) => {
        console.error(error);
      }
    );
  }

  showSupportModal = (state, type, preference, props) => {
    this.setState({
      isModalVisible: state,
      preference: preference,
      type: type,
      data: props,
      course_id: props.id,
    });
  };

  showContactModal = (state, type, preferences) => {
    this.setState({
      isModalVisible: state,
      type: type,
      preference: preferences,
    });
  };

  handleOk = () => {
    this.setState({ isModalVisible: false });
  };

  handleCancel = (e) => {
    const newState = this.state;
    newState["isModalVisible"] = false;
    newState["queries"] = "";
    newState["supportimage"] = null;
    delete newState["loading"];
    this.setState(newState);
  };

  // This function submits the support mail.
  submitSupportMail = (event) => {
    event.preventDefault();
    let requestBody = {};
    let url = "";
    const formData = new FormData();
    formData.append("support_image", this.state.img_src);
    if (this.state.type === "Contact") {
      requestBody = {
        preference_id: this.state.preference.id,
        description: this.state.queries,
      };
      url = "enquiries";
    } else {
      requestBody = {
        isSub: this.state.data.is_subscribed,
        comments: this.state.queries,
        preference_name: this.state.preference.name,
        course_name: this.state.data.title,
        support_image: this.state.supportimage,
        course_id: this.state.course_id,
        originalName: this.state.originalName,
      };
      url = `support/email`;
    }
    if (this.state.queries !== "") {
      const supportMailData = Env.post(
        this.props.envendpoint + url,
        requestBody
      );
      supportMailData.then(
        (response) => {
          toast(`${this.state.type} Query Sent successfully !`);
          this.handleCancel();
        },
        (error) => {
          toast.error(`${error.response.data.message.description[0]}`);
          console.error(JSON.stringify(error));
        }
      );
    } else {
      toast(`${this.state.type} Query Field is Empty !`);
    }
  };

  render() {
    const { isModalVisible } = this.state;
    return (
      <div>
        <Modal
          open={isModalVisible}
          footer={null}
          closable={true}
          centered={true}
          className="quiz-popup-report"
          closeIcon={
            <CloseCircleOutlined
              style={{ fontSize: "20px", cursor: "pointer", color: "grey" }}
              onClick={this.handleCancel}
            />
          }
        >
          <div
            className="quiz-popup-modal-body-content-instruction"
            style={{ padding: "25px" }}
          >
            <div className="quiz-popup-modal-body-report-container">
              <span style={{ fontSize: "20px" }}>
                {this.state.type} Support
              </span>
            </div>
            {this.state.type === "Call" ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "30px",
                  alignItems: "center",
                }}
              >
                Contact:{" "}
                <span
                  style={{
                    fontSize: "22px",
                    fontWeight: 900,
                    padding: "0px 10px",
                  }}
                >
                  {this.state.data.mobile_number}
                </span>
              </div>
            ) : (
              <div>
                <div className="quiz-popup-modal-body-report-content">
                  <TextArea
                    rows={6}
                    placeholder="Enter Your Queries"
                    name="queries"
                    value={this.state.queries}
                    onChange={(e) => this.setState({ queries: e.target.value })}
                    autoFocus
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {!_.isUndefined(this.state.loading) && !this.state.loading ? (
                    <div
                      style={{
                        verticalAlign: "top",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "border-color 0.3s",
                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                        border: "1px dashed #d9d9d9",
                        width: "102px",
                        height: "102px",
                        marginInlineEnd: "8px",
                        marginBottom: "8px",
                        textAlign: "center",
                      }}
                    >
                      <ImagePreview
                        data={
                          "https://assets.careerscloud.in/Common/images/" +
                          this.state.supportimage
                        }
                        width={"96px"}
                        height={"96px"}
                      />
                      <span
                        style={{
                          position: "absolute",
                          top: "230px",
                          left: "300px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          const newState = this.state;
                          newState["supportimage"] = null;
                          delete newState["loading"];
                          this.setState(newState);
                        }}
                      >
                        <img src={CloseCircle} alt="CloseCircle" />
                      </span>
                    </div>
                  ) : (
                    this.state.loading && (
                      <div
                        style={{
                          verticalAlign: "top",
                          borderRadius: "8px",
                          cursor: "pointer",
                          transition: "border-color 0.3s",
                          backgroundColor: "rgba(0, 0, 0, 0.02)",
                          border: "1px dashed #d9d9d9",
                          width: "102px",
                          height: "102px",
                          marginInlineEnd: "8px",
                          marginBottom: "8px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            padding: "35px",
                          }}
                        >
                          <Spin />
                        </div>
                      </div>
                    )
                  )}
                  <Upload
                    customRequest={(e) => this.handleImageUpload(e)}
                    onChange={this.onImageChange}
                    listType="text"
                    showUploadList={false}
                    accept="image/png,image/jpg,image/webp"
                  >
                    <Button
                      type="dashed"
                      className="upload-btn"
                      icon={<UploadOutlined />}
                    >
                      Upload
                    </Button>
                  </Upload>
                </div>
                <Divider />
                <div className="quiz-popup-modal-body-report-container">
                  <Button
                    className="mail-popup-btn"
                    type="primary"
                    onClick={(e) => this.submitSupportMail(e)}
                    size="large"
                  >
                    Send
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    );
  }
}

export default SupportContactPopup;
