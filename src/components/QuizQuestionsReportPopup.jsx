import React, { Component } from "react";
import { Radio, Divider, Modal, Space, Input } from "antd";
import quiz_solution from "../assets/svg-icons/quiz-solution.svg";
import "../assets/css/common.css";
import Env from "../utilities/services/Env";
import { toast } from "react-toastify";

const { TextArea } = Input;

class QuizQuestionsReportPopup extends Component {
  constructor() {
    super();
    this.state = {
      isModalVisible: false,
      reportTypes: [],
      contentProps: null,
      reportDescription: "",
      selectedReportType: 1,
    };
    this.showModal = this.showModal.bind(this);
    this.submitReport = this.submitReport.bind(this);
    this.handleReportType = this.handleReportType.bind(this);
  }

  componentDidMount() {
    this.getReportTypes();
  }

  getReportTypes() {
    const getReport = Env.get(this.props.envendpoint + `abuses/types?type=1`);
    getReport.then(
      (response) => {
        const reportTypes = [];
        const data = response.data.response.abuse_types;
        data.forEach((element) => {
          reportTypes.push({ id: element.id, name: element.content });
        });
        this.setState({ reportTypes: reportTypes });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  submitReport(e) {
    e.preventDefault();
    const requestBody = {
      report_type_id: this.state.contentProps.id,
      abuse_type_id: this.state.selectedReportType,
      description: this.state.reportDescription,
      report_type: "question",
    };
    const postReport = Env.post(this.props.envendpoint + `abuses`, requestBody);
    postReport.then(
      (response) => {
        this.setState({ isModalVisible: false });
        toast("Report added successfully !");
      },
      (error) => {
        toast(error.response.data.message.description[0]);
      }
    );
  }

  showModal = (props) => {
    this.setState({
      isModalVisible: true,
      contentProps: props,
      reportDescription: "",
    });
  };

  handleOk = () => {
    this.setState({ isModalVisible: false });
  };

  handleCancel = () => {
    this.setState({ isModalVisible: false });
  };

  handleReportType = (e) => {
    this.setState({ selectedReportType: e.target.value });
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
          className="quiz-popup-question-report"
        >
          <div className="quiz-popup-modal-body-report">
            <div className="quiz-popup-modal-body-report-container">
              <span className="quiz-popup-modal-body-report-container-icon">
                <img
                  style={{
                    width: "25px",
                    height: "25px",
                    marginBottom: "15px",
                  }}
                  alt="quiz_solution"
                  src={quiz_solution}
                />
              </span>
              <span className="quiz-popup-modal-body-report-container-title">
                Report
              </span>
            </div>
            <Divider className="quiz-popup-modal-body-report-divider" />
            {this.state.reportTypes.length > 0 && (
              <div className="quiz-popup-modal-inner-body-report">
                <div className="quiz-popup-modal-inner-body-report-content">
                  <Radio.Group defaultValue={this.state.reportTypes[0].id}>
                    <Space direction="vertical">
                      {this.state.reportTypes.map((item, index) => (
                        <Radio value={item.id} key={index}>
                          <span
                            style={{
                              color: "#192A3E",
                              fontSize: "16px",
                              fontWeight: 400,
                            }}
                          >
                            {item.name}
                          </span>
                        </Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                  <div className="quiz-popup-modal-inner-body-report">
                    <TextArea
                      autoFocus
                      rows={7}
                      placeholder="Enter Your Report"
                      name="reportDescription"
                      value={this.state.reportDescription}
                      onChange={(e) =>
                        this.setState({ reportDescription: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="quiz-popup-modal-body-report-footer">
                  <span
                    className="quiz-popup-modal-body-report-footer-buttons"
                    onClick={this.handleCancel}
                  >
                    CANCEL
                  </span>
                  <span
                    className="quiz-popup-modal-body-report-footer-buttons"
                    onClick={this.submitReport}
                  >
                    REPORT
                  </span>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    );
  }
}

export default QuizQuestionsReportPopup;
