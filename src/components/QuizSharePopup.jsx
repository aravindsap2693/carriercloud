import React, { Component } from "react";
import { Button, Modal, Typography, Input } from "antd";
import instagram from "../assets/svg-icons/instagram.svg";
import { CopyOutlined } from "@ant-design/icons";
import "../assets/css/common.css";
import { toast } from "react-toastify";
import {
  WhatsappIcon,
  WhatsappShareButton,
  TelegramIcon,
  TwitterIcon,
  TwitterShareButton,
  TelegramShareButton,
  LinkedinShareButton,
  LinkedinIcon,
} from "react-share";
import doubts from "../assets/svg-icons/ShareDoubts.svg";
import DoubtsCoures from "./Doubt/DoubtsCoures";

const { Text } = Typography;

class QuizSharePopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalVisible: false,
      copyText: "COPY LINK",
      location: "",
      id: "",
      type: "",
      course_id: "",
      is_doubt: {},
    };
  }

  handleCopyUrl() {
    this.textArea.select();
    document.execCommand("copy");
    toast("Url is Successfully copied!");
    this.setState({ copyText: "COPIED" });
  }

  closeDoubts = () => {
    this.setState({
      course_id: "",
      isModalVisible: !false,
    });
  };

  showModal = (type, id, course_id, is_doubt) => {
    this.setState({
      location: this.getUrl(type, id, course_id),
      course_id: course_id,
      isModalVisible: true,
      id: id,
      type: type,
      is_doubt: is_doubt,
    });
  };

  getUrl = (type, id, course_id) => {
    let url = "";
    switch (type) {
      case "post":
        url = window.location.origin + `/doubts/${id}`;
        break;
      case "quiz":
        url =
          window.location.origin + `/course-details/${course_id}/${type}/${id}`;
        break;
      case "App\\Models\\MockTest":
        url =
        window.location.origin + `/course-details/${course_id}/mocktest/${id}`;
        break;
      case "mocktest":  
        url =
          window.location.origin + `/course-details/${course_id}/${type}/${id}`;
        break;
      case "article":
        url =
          window.location.origin + `/course-details/${course_id}/${type}/${id}`;
        break;
      case "ebook":
        url =
          window.location.origin + `/course-details/${course_id}/${type}/${id}`;
        break;
      case "video":
        url =
          window.location.origin + `/course-details/${course_id}/${type}/${id}`;
        break;
      case "course":
        url = window.location.origin + `/course-details/${id}`;
        break;
      default:
        url = window.location.href;
    }
    return url;
  };

  handleCancel = () => {
    this.setState({
      isModalVisible: false,
      copyText: "COPY LINK",
    });
  };

  render() {
    const { isModalVisible } = this.state;
    return (
      <div>
        <Modal
          open={isModalVisible}
          footer={null}
          closable={false}
          centered={true}
          className="quiz-popup-share"
        >
          <div style={{ padding: "25px" }}>
            <div className="quiz-popup-modal-share-content">
              <Text className="quiz-popup-modal-share-content-title">
                Choose app to share
              </Text>
            </div>
            <div className="quiz-popup-modal-share-body-content quiz-popup-modal-share-body-content-flex">
              {this.state.type === "QuizQuestions" && (
                <div
                  className="quiz-popup-modal-share-content-flex"
                  onClick={(e) => {
                    if (
                      this.state.is_doubt.is_doubt == 1 &&
                      this.state.is_doubt.is_doubt_share == 1
                    ) {
                      this.props.handleScreenCapture();
                    } else {
                      this.DoubtsCoures.showModal(
                        "Add QDoubts",
                        this.props.preferences.id,
                        ""
                      );
                    }
                    this.handleCancel();
                  }}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={doubts}
                    alt="doubts"
                    style={{
                      width: "64px",
                      border: "1px solid rgb(11, 100, 157)",
                      background: "rgb(226, 242, 255)",
                      cursor: "pointer",
                    }}
                  />
                  <div className="quiz-popup-modal-share-icons-text" style={{marginTop:'0.5em'}}>
                    Share Doubts
                  </div>
                </div>
              )}
              <div className="quiz-popup-modal-share-content-flex">
                <TwitterShareButton url={this.state.location}>
                  <TwitterIcon />
                </TwitterShareButton>
                <div className="quiz-popup-modal-share-icons-text">Twitter</div>
              </div>
              <div className="quiz-popup-modal-share-content-flex">
                <WhatsappShareButton url={this.state.location}>
                  <WhatsappIcon />
                </WhatsappShareButton>
                <div className="quiz-popup-modal-share-icons-text">
                  Whatsapp
                </div>
              </div>
              <div className="quiz-popup-modal-share-content-flex">
                <TelegramShareButton url={this.state.location}>
                  <TelegramIcon />
                </TelegramShareButton>
                <div className="quiz-popup-modal-share-icons-text">
                  Telegram
                </div>
              </div>

              <div className="quiz-popup-modal-share-content-flex">
                <LinkedinShareButton url={this.state.location}>
                  <LinkedinIcon />
                </LinkedinShareButton>
                <div className="quiz-popup-modal-share-icons-text">
                  Linkedin
                </div>
              </div>

              <div
                className="quiz-popup-modal-share-content-flex"
                style={{ cursor: "pointer" }}
              >
                <span
                  onClick={() => {
                    window.open(
                      "https://www.instagram.com/create/story",
                      "hello",
                      "width=1200,height=700"
                    );
                    this.handleCancel();
                  }}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={instagram}
                    style={{ width: "72px" }}
                    alt="instagram"
                  />
                </span>
                <div className="quiz-popup-modal-share-icons-text">
                  Instagram
                </div>
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
              }}
            >
              <Input.Group compact>
                <Input
                  value={this.state.location}
                  id="copy-field"
                  className="quiz-popup-modal-share-copy-url-input"
                  readOnly
                  ref={(textarea) => (this.textArea = textarea)}
                />
                <Button
                  onClick={() => this.handleCopyUrl()}
                  className="quiz-popup-modal-share-copy-url-button"
                  type="link"
                >
                  {this.state.copyText}
                </Button>
                <div className="quiz-popup-modal-share-copy-url-icon">
                  <span onClick={() => this.handleCopyUrl()}>
                    <CopyOutlined />
                  </span>
                </div>
              </Input.Group>
            </div>

            <div className="quiz-popup-modal-share-footer-content">
              <Button
                block
                className="quiz-popup-modal-share-footer-button"
                size="large"
                onClick={this.handleCancel}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
        <DoubtsCoures
          ref={(instance) => {
            this.DoubtsCoures = instance;
          }}
          doubtsCourse={this.props.handleScreenCapture}
          closeDoubts={this.closeDoubts}
          togglecloseDoubtsPopup={this.togglecloseDoubtsPopup}
          {...this.props}
        />
      </div>
    );
  }
}

export default QuizSharePopup;
