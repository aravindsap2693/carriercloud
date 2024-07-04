import React, { Component } from "react";
import { Button, Modal, Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import "../assets/css/common.css";
import Env from "../utilities/services/Env";
import moment from "moment";

const { Text } = Typography;

class QuizTimeOverPopup extends Component {
  constructor() {
    super();
    this.state = {
      isModalVisible: false,
      quizData: [],
      attempted: 0,
      unattempted: 0,
    };
    this.showModal = this.showModal.bind(this);
    this.showModal2 = this.showModal2.bind(this);
  }

  showModal = (quizData, attempted, unattempted, previousTime) => {
    quizData["quiz_end_datetime"] = moment(new Date()).format(
      "YYYY-MM-DD hh:mm:ss"
    );
    let dateDifference =
      (new Date(quizData.quiz_end_datetime).getTime() -
        new Date(quizData.quiz_start_datetime).getTime()) /
      1000;
    quizData["time_taken_in_seconds"] = dateDifference + previousTime;
    this.setState(
      {
        isModalVisible: true,
        quizData: quizData,
        attempted: attempted.length,
        unattempted: unattempted.length,
      },
      () => this.submitQuizQuestions("pause")
    );
  };

  showModal2 = (quizData, attempted, unattempted, total_time) => {
    quizData["quiz_end_datetime"] = moment(new Date()).format(
      "YYYY-MM-DD hh:mm:ss"
    );
    quizData["time_taken_in_seconds"] =
      total_time.quiz_records[0].time_taken_in_seconds;
    this.setState({
      isModalVisible: true,
      quizData: quizData,
      attempted: attempted.length,
      unattempted: unattempted.length,
    });
  };

  handleOk = () => {
    this.setState({ isModalVisible: false });
    this.submitQuizQuestions("completed");
  };

  submitQuizQuestions(status) {
    let payload = this.state.quizData;
    payload["quiz_status"] = status;
    const postQuizData = Env.post(
      this.props.routingProps.envendpoint + `quiz`,
      JSON.stringify(payload)
    );
    postQuizData.then(
      (response) => {
        if (status === "completed") {
          window.opener
            ? window.close()
            : this.props.routingProps.navigate(
                `/course-details/${this.props.routingProps.match.params.id}/quiz/${payload.quiz_id}/result`
              );
        }
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
          className="quiz-popup-time-up"
        >
          <div style={{ padding: "25px" }}>
            <div className="quiz-popup-modal-share-content">
              <Text className="quiz-popup-modal-share-content-title">
                Time Over
              </Text>
            </div>
            <div className="quiz-popup-modal-timer-content">
              <p className="quiz-popup-modal-timer-content-description">
                The allotted time for this quiz has been completed. Please
                submit to check your results.
              </p>
            </div>
            <div className="quiz-popup-modal-body-submit-content">
              <Button
                className="quiz-popup-modal-footer-submit-button"
                size="large"
                onClick={this.handleOk}
              >
                {" "}
                Submit{" "}
                <RightOutlined className="quiz-popup-modal-footer-button-icon" />
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default QuizTimeOverPopup;
