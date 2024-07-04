import React, { Component } from "react";
import { Row, Col, Modal, Typography } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import "../assets/css/common.css";
import { quizStartTimer } from "../reducers/action";

const { Text } = Typography;

class QuizInstructionPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalVisible: false,
      questions: [],
      dispatchProps: {},
    };
  }

  showModal = (data, props) => {
    if (this.props && !this.props.quiz_start_timer && !this.props.quiz_resume) {
      this.props.dispatch(quizStartTimer(false));
    }
    this.setState({
      questions: data,
      isModalVisible: true,
      dispatchProps: props,
    });
  };

  handleOk = () => {
    this.setState({ isModalVisible: false });
  };

  handleClose = () => {
    this.setState({ isModalVisible: false });
    if (this.props && !this.props.quiz_start_timer && !this.props.quiz_resume) {
      this.props.dispatch(quizStartTimer(true));
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
          className="quiz-popup-instruction"
          closeIcon={<CloseOutlined onClick={this.handleClose} />}
          maskClosable={false}
        >
          <div style={{ padding: "25px" }}>
            <div className="quiz-popup-modal-body">
              <Text className="quiz-popup-modal-body-title" strong>
                {this.state.questions.title}
              </Text>
            </div>
            <div className="quiz-popup-modal-body-content">
              <Row className="quiz-popup-modal-body">
                <Col xs={20} sm={22} md={22} lg={22} xl={22} xxl={22}>
                  <Text className="quiz-popup-modal-content-text">
                    Number of Questions :{" "}
                  </Text>
                </Col>
                <Col xs={4} sm={2} md={2} lg={2} xl={2} xxl={2}>
                  <Text className="quiz-popup-modal-content-value">
                    {this.state.questions.questions_count}
                  </Text>
                </Col>
              </Row>
              <Row className="quiz-popup-modal-body">
                <Col xs={20} sm={22} md={22} lg={22} xl={22} xxl={22}>
                  <Text className="quiz-popup-modal-content-text">
                    Time (in minutes) :{" "}
                  </Text>
                </Col>
                <Col xs={4} sm={2} md={2} lg={2} xl={2} xxl={2}>
                  <Text className="quiz-popup-modal-content-value">
                    {this.state.questions.time_duration_in_seconds / 60}
                  </Text>
                </Col>
              </Row>
              <Row className="quiz-popup-modal-body">
                <Col xs={20} sm={22} md={22} lg={22} xl={22} xxl={22}>
                  <Text className="quiz-popup-modal-content-text">
                    Total Marks :{" "}
                  </Text>
                </Col>
                <Col xs={4} sm={2} md={2} lg={2} xl={2} xxl={2}>
                  <Text className="quiz-popup-modal-content-value">
                    {this.state.questions.questions_count *
                      this.state.questions.mark}
                  </Text>
                </Col>
              </Row>
            </div>
            <div className="quiz-popup-modal-body">
              <div
                className="quiz-popup-modal-body-content-instruction"
                dangerouslySetInnerHTML={{
                  __html: this.state.questions.instruction,
                }}
              ></div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default QuizInstructionPopup;
