import React, { Component } from "react";
import { Button, Modal, Typography, Spin } from "antd";
import answered from "../assets/svg-icons/answered.svg";
import unanswered from "../assets/svg-icons/unanswered.svg";
import { RightOutlined } from "@ant-design/icons";
import "../assets/css/common.css";
import Env from "../utilities/services/Env";
import moment from "moment";

const { Text } = Typography;

class QuizSubmitPopup extends Component {
  constructor() {
    super();
    this.state = {
      isModalVisible: false,
      quizData: [],
      attempted: 0,
      unattempted: 0,
      loading: false,
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
  };

  handleCancel = () => {
    this.setState({ isModalVisible: false });
  };

  submitQuizQuestions() {
    this.state.quizData["quiz_end_datetime"] = moment(new Date()).format(
      "YYYY-MM-DD hh:mm:ss"
    );
    let dateDifference =
      (new Date(this.state.quizData.quiz_end_datetime) -
        new Date(this.state.quizData.quiz_start_datetime)) /
      1000;
    this.state.quizData["time_taken_in_seconds"] =
      dateDifference + this.state.previousTimeInSeconds;
    this.state.quizData["quiz_status"] = "completed";
    const postQuizData = Env.post(
      this.props.envendpoint + `quiz`,
      JSON.stringify(this.state.quizData)
    );
    postQuizData.then(
      (response) => {
        this.setState({ isModalVisible: false, loading: true });
        window.opener
          ? window.close()
          : this.props.navigate(
              `/course-details/${this.props.match.params.id}/quiz/${this.state.quizData.quiz_id}/result`
            );
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
          className="quiz-popup-submit"
        >
          {this.state.loading === true ? (
            <div style={{ padding: "45px", textAlign: "center" }}>
              <Spin size="large" />
            </div>
          ) : (
            <div style={{ padding: "25px" }}>
              <div className="quiz-popup-modal-body-center">
                <Text strong className="quiz-popup-modal-body-text">
                  Are you sure want to submit the Quiz?
                </Text>
              </div>
              <div className="quiz-popup-modal-body-submit-content">
                <div className="quiz-popup-modal-body-submit-content-image">
                  <img src={answered} alt="answered" />
                  <span className="quiz-popup-modal-body-submit-content-image-text">
                    Answered ({this.state.attempted})
                  </span>
                </div>
                <div className="quiz-popup-modal-body-submit-content-image">
                  <img src={unanswered} alt="unanswered" />
                  <span className="quiz-popup-modal-body-submit-content-image-text">
                    Unanswered ({this.state.unattempted})
                  </span>
                </div>
              </div>
              <div className="quiz-popup-modal-body-submit-content">
                <Button
                  block
                  className="quiz-popup-modal-footer-cancel-button"
                  size="large"
                  onClick={this.handleCancel}
                >
                  Cancel
                  <RightOutlined className="quiz-poup-modal-footer-button-icon" />{" "}
                </Button>

                <Button
                  block
                  className="quiz-popup-modal-footer-submit-button"
                  size="large"
                  onClick={this.handleOk}
                >
                  Submit
                  <RightOutlined className="quiz-poup-modal-footer-button-icon" />
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  }
}

export default QuizSubmitPopup;
