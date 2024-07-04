import React, { Component } from "react";
import { Button, Modal, Spin, Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import "../assets/css/common.css";
import Env from "../utilities/services/Env";
import moment from "moment";
import { currentTabIndex } from "../reducers/action";

const { Text } = Typography;

class QuizLeavePopup extends Component {
  constructor() {
    super();
    this.state = {
      isModalVisible: false,
      quizData: [],
      attempted: 0,
      unattempted: 0,
      previousTimeInSeconds: 0,
    };
    this.showModal = this.showModal.bind(this);
  }

  showModal = (quizData, attempted, unattempted, previousTimeInSeconds) => {
    this.setState({
      isModalVisible: true,
      quizData: quizData,
      attempted: attempted.length,
      unattempted: unattempted.length,
      previousTimeInSeconds: previousTimeInSeconds,
    });
  };

  handleOk = () => {
    this.setState({ loading: true });
    this.submitQuizQuestions();
    this.props.dispatch(currentTabIndex(5));
  };

  handleCancel = () => {
    this.setState({ isModalVisible: false });
  };

  submitQuizQuestions() {
    let quizData = this.state.quizData;
    quizData["quiz_end_datetime"] = moment(new Date()).format(
      "YYYY-MM-DD hh:mm:ss"
    );
    let dateDifference =
      (new Date(quizData.quiz_end_datetime) -
        new Date(quizData.quiz_start_datetime)) /
      1000;
    quizData["time_taken_in_seconds"] =
      dateDifference + this.state.previousTimeInSeconds;
    quizData["quiz_status"] = "pause";
    const postQuizData = Env.post(this.props.envendpoint + `quiz`, quizData);
    postQuizData.then(
      (response) => {
        this.setState({ isModalVisible: false, loading: true });
        window.opener ? window.close() : this.props.navigate(-1);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  render() {
    const { isModalVisible } = this.state;

    return (
      <div>
        <Modal
          open={isModalVisible}
          footer={null}
          closable={false}
          centered={true}
          className="quiz-popup-leave"
        >
          {this.state.loading === true ? (
            <div style={{ padding: "45px", textAlign: "center" }}>
              <Spin size="large" />
            </div>
          ) : (
            <div style={{ padding: "25px" }}>
              <div className="quiz-popup-modal-body-center">
                <Text className="quiz-popup-modal-body-leave">Leave Quiz</Text>
              </div>
              <div className="quiz-popup-modal-body-center">
                <Text className="quiz-popup-modal-body-leave-content" strong>
                  You have {this.state.unattempted} questions left. This session
                  will be saved so that you can revisit and continue. Do you
                  want tot continue ?
                </Text>
              </div>
              <div className="quiz-popup-modal-leave-footer">
                <Button
                  block
                  className="quiz-popup-modal-leave-footer-cancel"
                  size="large"
                  onClick={this.handleCancel}
                >
                  {" "}
                  Cancel{" "}
                  <RightOutlined className="quiz-popup-modal-leave-footer-icon" />
                </Button>
                <Button
                  block
                  className="quiz-popup-modal-leave-footer-submit-icon"
                  size="large"
                  onClick={this.handleOk}
                >
                  {" "}
                  Leave{" "}
                  <RightOutlined className="quiz-popup-modal-leave-footer-icon" />
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  }
}

export default QuizLeavePopup;
