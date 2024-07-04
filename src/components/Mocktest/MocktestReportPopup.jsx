import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Divider, Modal, Input, Spin } from "antd";
import warning from "../../assets/images/warning.png";
import "../../assets/css/common.css";
import Env from "../../utilities/services/Env";
import { toast } from "react-toastify";
import CCRadio from "../Antd/CCRadio";

const { TextArea } = Input;

const MocktestReportPopup = forwardRef((props, ref) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeLoader, setActiveLoader] = useState(false);
  const [reportTypes, setReportTypes] = useState([]);
  const [reportDescription, setReportDescription] = useState("");
  const [selectedReportType, setSelectedReportType] = useState();
  const [contentProps, setContentProps] = useState(null);

  useImperativeHandle(ref, () => ({
    showModal(contentProps) {
      setReportDescription("");
      setContentProps(contentProps);
      getReportTypes();
    },
    closeModal() {
      setIsModalVisible(false);
    },
  }));

  const getReportTypes = () => {
    const getReport = Env.get(props.envendpoint + `abuses/types?type=1`);
    getReport.then(
      (response) => {
        const reportTypes = response.data.response.abuse_types.map(
          (element) => ({
            id: element.id,
            name: element.content,
          })
        );
        setActiveLoader(false);
        setIsModalVisible(true);
        setReportTypes(reportTypes);
        setSelectedReportType(reportTypes[0].id);
      },
      (error) => {
        console.error(error);
      }
    );
  };

  const handleCancel = () => setIsModalVisible(false);

  const handleReportType = (e) => setSelectedReportType(e.target.value);

  // useEffect(() => {
  //   if (props.overall_time <= 6 && isModalVisible) {
  //     setIsModalVisible(false);
  //   }
  // }, [props.overall_time, isModalVisible]);

  const submitReport = () => {
    const requestBody = {
      report_type_id: contentProps.id,
      abuse_type_id: selectedReportType,
      description: reportDescription,
      report_type: `App\\Models\\MockTestQuestions`,
    };
    Env.post(props.envendpoint + `abuses`, requestBody)
      .then(() => setIsModalVisible(false))
      .catch((error) => {
        console.error(error);
        error.response.data.message &&
          toast(error.response.data.message.description[0]);
      });
  };

  return (
    <Modal
      open={isModalVisible}
      footer={null}
      closable={false}
      centered={true}
      className="quiz-popup-report"
      onCancel={handleCancel}
      maskClosable={false}
    >
      {!activeLoader ? (
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
              list={reportTypes}
              value={selectedReportType}
              handleonChange={handleReportType}
            />
            <div className="popupTextContent">
              <TextArea
                rows={7}
                placeholder="Enter Your Report"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="quiz-popup-modal-body-report-footer">
            <span
              className="quiz-popup-modal-body-report-footer-buttons popupFooterBtn-cancel"
              onClick={handleCancel}
            >
              CANCEL
            </span>
            <span
              className="quiz-popup-modal-body-report-footer-buttons popupFooterBtn-report"
              onClick={submitReport}
            >
              REPORT
            </span>
          </div>
        </div>
      ) : (
        <Spin
          size="large"
          style={{ display: "flex", justifyContent: "center", padding: "40px" }}
        />
      )}
    </Modal>
  );
});

export default MocktestReportPopup;
