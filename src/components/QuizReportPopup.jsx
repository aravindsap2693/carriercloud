import React, { Component } from "react";
import { Divider, Modal, Input, Spin } from "antd";
import warning from "../assets/images/warning.png";
import "../assets/css/common.css";
import Env from "../utilities/services/Env";
import { toast } from "react-toastify";
import CCRadio from "./Antd/CCRadio";

const { TextArea } = Input;

class QuizReportPopup extends Component {
  constructor() {
    super();
    this.state = {
      isModalVisible: false,
      selectedReportType: 1,
      reportDescription: "",
      contentProps: null,
      reportTypes: [],
      activeLoader: true,
    };
    this.submitReport = this.submitReport.bind(this);
  }

  getReportTypes() {
    const getReport = Env.get(this.props.envendpoint + `abuses/types`);
    getReport.then(
      (response) => {
        const reportTypes = [];
        const data = response.data.response.abuse_types;
        data.forEach((element) => {
          reportTypes.push({ id: element.id, name: element.content });
        });
        this.setState({ reportTypes: reportTypes, activeLoader: false });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  showModal = (props) => {
    this.setState(
      { isModalVisible: true, selectedReportType: 1, reportDescription: "" },
      () => this.getReportTypes()
    );
  };

  handleCancel = (e) => {
    e.preventDefault();
    this.setState({
      selectedReportType: 1,
      reportDescription: "",
      isModalVisible: false,
    });
  };

  handleReportType = (e) => {
    this.setState({ selectedReportType: e.target.value });
  };

  submitReport(e) {
    const requestBody = {
      report_type_id: this.props.id,
      abuse_type_id: this.state.selectedReportType,
      description: this.state.reportDescription,
      report_type: this.props.type,
    };
    const postReport = Env.post(this.props.envendpoint + `abuses`, requestBody);
    postReport.then(
      (response) => {
        this.setState({ isModalVisible: false });
        toast("Report added successfully !");
      },
      (error) => {
        console.error(error);
        // this.setState({ isModalVisible: false });
        error.response.data.message &&
          toast(error.response.data.message.description[0]);
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
          className="quiz-popup-report"
        >
          {!this.state.activeLoader ? (
            <div
              className="quiz-popup-modal-body-content-instruction"
              style={{ padding: "25px 40px" }}
            >
              <div className="quiz-popup-modal-body-report-container">
                <span className="quiz-popup-modal-body-report-container-icon">
                  <img
                    src={warning}
                    alt="warning"
                    className="quiz-popup-modal-body-report-icon"
                  />
                </span>
                <span className="quiz-popup-modal-body-report-container-title">
                  Report
                </span>
              </div>
              <Divider className="quiz-popup-modal-body-report-divider" />
              <div className="quiz-popup-modal-body-report-content">
                <CCRadio
                  list={this.state.reportTypes}
                  value={this.state.selectedReportType}
                  handleonChange={this.handleReportType}
                />
                <div className="popupTextContent">
                  <TextArea
                    rows={7}
                    placeholder="Enter Your Report"
                    value={this.statereportDescription}
                    onChange={(e) =>
                      this.setState({ reportDescription: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="quiz-popup-modal-body-report-footer">
                <span
                  className="quiz-popup-modal-body-report-footer-buttons popupFooterBtn-cancel"
                  onClick={this.handleCancel}
                >
                  CANCEL
                </span>
                <span
                  className="quiz-popup-modal-body-report-footer-buttons popupFooterBtn-report"
                  onClick={this.submitReport}
                >
                  REPORT
                </span>
              </div>
            </div>
          ) : (
            <Spin
              size="large"
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "40px",
              }}
            />
          )}
        </Modal>
      </div>
    );
  }
}

export default QuizReportPopup;
