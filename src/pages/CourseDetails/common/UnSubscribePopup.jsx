import React, { Component } from "react";
import { Modal, Button, Input, Spin } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import "../../../assets/css/common.css";
import Env from "../../../utilities/services/Env";
import { toast } from "react-toastify";

const { TextArea } = Input;

class UnSubscribePopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalVisible: false,
      comments: "",
      preference: "",
      activeLoader: false,
      props: null,
    };
  }

  showUnsubscribeModal = (state, course_id, props) => {
    this.setState({
      isModalVisible: state,
      course_id: course_id,
      props: props,
    });
  };

  handleCancel = (e) => {
    this.setState({ isModalVisible: false, comments: "" });
  };

  submitComment = (event) => {
    this.setState({ activeLoader: true });
    const requestBody = {
      product_type: "course",
      product_id: this.state.course_id,
      description: this.state.comments,
    };
    const courseSubscription = Env.post(
      this.state.props.envendpoint + `unsubscribe`,
      requestBody
    );
    courseSubscription.then(
      (response) => {
        toast("Course unsubscription successfull !");
        this.setState({ isModalVisible: false, activeLoader: false });
        this.state.props.navigate("/all-courses");
      },
      (error) => {
        console.error(error);
      }
    );
  };

  render() {
    const { isModalVisible } = this.state;
    return (
      <div>
        <Modal
          open={isModalVisible}
          footer={null}
          closable={!this.state.activeLoader}
          centered={true}
          className="quiz-popup-report"
          closeIcon={
            <CloseCircleOutlined
              style={{ fontSize: "20px", cursor: "pointer", color: "grey" }}
              onClick={() => {
                this.handleCancel();
              }}
            />
          }
        >
          <div
            className="quiz-popup-modal-body-content-instruction"
            style={{ padding: "25px" }}
          >
            <div className="quiz-popup-modal-body-report-container">
              <span style={{ fontSize: "20px" }}>Unsubscribe</span>
            </div>

            {!this.state.activeLoader ? (
              <div>
                <div className="quiz-popup-modal-body-report-content">
                  <p style={{ fontSize: "16px" }}>
                    Please note that the unsubscribe action will delete all
                    course related contents including paid ebooks, My Notes, My
                    Post...
                  </p>
                  <TextArea
                    rows={6}
                    placeholder="Enter Your Comment"
                    name="comments"
                    value={this.state.comments}
                    onChange={(e) =>
                      this.setState({ comments: e.target.value })
                    }
                    autoFocus
                    maxLength={15}
                    rules={[
                      {
                        required: true,
                        min: 15,
                        max: 15,
                      },
                    ]}
                  />
                </div>
                <div className="quiz-popup-modal-body-report-container">
                  <Button
                    className="cancel-btn"
                    onClick={(e) => this.handleCancel(e)}
                    size="large"
                    style={{ margin: "5px", borderRadius: "5px" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    onClick={(e) => this.submitComment(e)}
                    size="large"
                    style={{ margin: "5px", borderRadius: "5px" }}
                  >
                    Unsubscribe
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ padding: "45px", textAlign: "center" }}>
                <Spin size="large" />
              </div>
            )}
          </div>
        </Modal>
      </div>
    );
  }
}

export default UnSubscribePopup;
