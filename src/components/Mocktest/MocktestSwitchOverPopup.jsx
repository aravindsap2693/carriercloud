import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Button, Modal, Typography, Table, Spin } from "antd";
import moment from "moment";
import CloseCircle from "../../assets/svg-images/closer.svg";
import { useState } from "react";
import { CommonService } from "../../utilities/services/Common";

const { Text } = Typography;
const { Column } = Table;
let interval = 0;
let timeOut;

const MocktestSwitchOverPopup = forwardRef(function MocktestSwitchOverPopup(
  props,
  ref
) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);
  const [sectionData, setSectionData] = useState([]);
  const [sectionShowData, setSectionShowData] = useState([]);
  const [mockData, setmockData] = useState([]);
  const [remainingTime, setRemainingTime] = useState({});
  const [sectionTime, setSectionTime] = useState();
  const [closable, setClosable] = useState(false);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(
    ref,
    () => {
      return {
        showSectionModal(mockD, sectionDetails, sectionRemainingTime, status) {
          let tep = [sectionDetails];
          setSectionData(tep);
          setSectionShowData(tep);
          setmockData(mockD);
          setClosable(status);
          setIsModalVisible(true);
          let SectionT = {
            section_time_taken: 5,
          };
          if (status) {
            handleTimeOut("next", mockD, sectionDetails, sectionRemainingTime);
            setSectionTime(sectionRemainingTime);
          } else {
            handleTimeOutTwo("next", mockD, sectionDetails, SectionT);
            setSectionTime(SectionT);
          }
        },

        showSubmitModal(
          mockD,
          sectionDetails,
          sectionRemainingTime,
          activeTabIndex,
          status
        ) {
          mockD["mock_end_datetime"] = moment(new Date()).format(
            "YYYY-MM-DD hh:mm:ss"
          );
          let section = [];
          if (mockD.is_section_timer === 1) {
            section.push(sectionDetails[parseInt(activeTabIndex, 10) - 1]);
          } else {
            section = sectionDetails;
          }
          setIsSubmitModalVisible(true);
          setClosable(status);
          setSectionData(sectionDetails);
          setSectionShowData(section);
          setmockData(mockD);
          let SectionT = {
            section_time_taken: 5,
          };
          if (status) {
            handleTimeOut("submit", mockD, sectionDetails);
            setSectionTime(sectionRemainingTime);
          } else {
            handleTimeOutTwo("submits", mockD, sectionDetails, SectionT);
            setSectionTime(SectionT);
          }
        },
      };
    },
    []
  );
  const handleSubmit = () => {
    setLoading(true);
    props.postSaveNext("question_no");
    props.postMockQuestionSubmit(mockData, sectionData);
  };

  useEffect(() => {
    return () => {
      handleClearInterval(interval);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("offline", handleNetClose);
  }, []);

  const handleNetClose = () => {
    clearInterval(interval);
    timeOut && clearTimeout(timeOut);
  };

  const handleClearInterval = (interval) => {
    clearInterval(interval);
    timeOut && clearTimeout(timeOut);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    handleClearInterval(interval);
    props.postSectionSubmit();
  };

  const handleClose = () => {
    setIsSubmitModalVisible(false);
    handleClearInterval(interval);
    setRemainingTime({});
    setLoading(false);
    props.handlecloseTimer(remainingTime.total / 1000);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    handleClearInterval(interval);
    setRemainingTime({});
    closable && props.handlecloseTimer(remainingTime.total / 1000);
    !closable && props.handleNextSection("TimeOut");
  };

  const handleTimeOut = (type, mockData, sectionDetails, time) => {
    var time_given_sec;
    if (type !== "submit") {
      time_given_sec = time?.section_time_taken;
    } else {
      time_given_sec = props?.overall_time;
    }
    interval = setInterval(() => {
      time_given_sec = time_given_sec - 1;
      if (time_given_sec <= 0) {
        handleClearInterval(interval);
        if (type === "submit") {
          props.postSaveNext("question_no");
          handleTimeOutTwo(type, mockData, sectionDetails);
          setIsSubmitModalVisible(false);
        } else {
          setIsModalVisible(true);
        }
      }
    }, 1000);
  };

  const handleTimeOutTwo = (type, mockData, sectionDetails, time) => {
    var time_given_sec;
    if (type !== "submit") {
      time_given_sec = time?.section_time_taken;
    } else {
      time_given_sec = props?.overall_time;
    }
    let SectionT = {
      section_time_taken: time_given_sec === 0 ? 5 : time_given_sec,
    };
    clearInterval(interval);
    interval = setInterval(() => {
      SectionT.section_time_taken = SectionT.section_time_taken - 1;
      setSectionTime((prevState) => ({
        ...prevState,
        section_time_taken: SectionT.section_time_taken,
      }));
    }, 1000);
    timeOut = setTimeout(() => {
      handleClearInterval(interval);
      if (type === "submit" || type === "submits") {
        handleClearInterval(interval);
        setIsSubmitModalVisible(false);
        props.postMockQuestionSubmit(mockData, sectionDetails);
      } else {
        handleClearInterval(interval);
        setIsModalVisible(false);
        props.postSectionSubmit("Left");
      }
    }, 5000);
  };

  return (
    <div>
      <Modal
        open={isModalVisible}
        footer={null}
        closable={closable}
        closeIcon={
          <img src={CloseCircle} alt="CloseCircle" className="CloseButton" />
        }
        onCancel={handleCancel}
        centered={true}
        maskClosable={false}
        className="mock-popup-time-up"
      >
        <div style={{ padding: "25px" }}>
          <div className="mock-popup-modal-next-content">
            <Text
              className="mock-popup-modal-next-content-title"
              style={{ color: "#0B649D" }}
            >
              Section Completed
            </Text>
            <Text className="mock-popup-modal-share-content-title">
              Your Next Section Will be start in
              <Text
                style={{
                  color: closable ? "#109CF1" : "red",
                  width:
                    sectionTime?.section_time_taken > 3600 ? "145px" : "100px",
                  display: "inline-block",
                  padding: "0px 0px 0px 10px",
                  fontSize: "20px",
                }}
              >
                {CommonService.handleStartTimer(
                  sectionTime?.section_time_taken
                )}
              </Text>
            </Text>
          </div>
          <div className="mock-popup-modal-timer-content">
            <Table pagination={false} dataSource={sectionShowData}>
              <Column
                title="Section Name"
                dataIndex="sectionName"
                key="sectionName"
              />
              <Column
                title="No. of Questions"
                dataIndex="question"
                key="question"
              />
              <Column title="Answered" dataIndex="attempted" key="attempted" />
              <Column
                title="Unanswered"
                dataIndex="skipped_count"
                key="skipped_count"
              />
              <Column
                title="Not Visited"
                dataIndex="not_visted_count"
                key="not_visted_count"
              />
              <Column title="Marked" dataIndex="marked" key="marked" />
              <Column
                title="Ans & Marked"
                dataIndex="ansMarked"
                key="ansMarked"
              />
            </Table>
          </div>
          <div className="mock-popup-modal-body-next-content">
            {closable && (
              <Button
                className="mock-popup-modal-footer-cancel-button"
                size="large"
                onClick={() => handleCancel()}
                style={{ margin: "0px 30px 0px 0px" }}
              >
                Cancel
              </Button>
            )}
            <Button
              className="mock-popup-modal-footer-next-button"
              size="large"
              onClick={handleOk}
            >
              Go Next
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        open={isSubmitModalVisible}
        footer={null}
        closable={props.overall_time > 1}
        closeIcon={
          <img src={CloseCircle} alt="CloseCircle" className="CloseButton" />
        }
        onCancel={() => handleClose()}
        centered={true}
        className="mock-popup-time-up"
        maskClosable={false}
      >
        <Spin size="large" className="app-spinner" spinning={loading}>
          <div style={{ padding: "35px" }}>
            <div className="mock-popup-modal-share-content">
              <Text
                className="mock-popup-modal-share-content-title"
                style={{ color: "#0B649D" }}
              >
                Submit Section
              </Text>
              <Text className="mock-popup-modal-share-content-title">
                Time Left:
                <Text
                  style={{
                    color: props.overall_time <= 1 ? "red" : "#109CF1",
                    width: props.overall_time > 3600 ? "145px" : "100px",
                    display: "inline-block",
                    padding: "0px 0px 0px 10px",
                    fontSize: "20px",
                  }}
                >
                  {CommonService.handleStartTimer(
                    closable
                      ? props.overall_time
                      : sectionTime?.section_time_taken
                  )}
                </Text>
              </Text>
            </div>
            <div className="mock-popup-modal-timer-content">
              <Table pagination={false} dataSource={sectionShowData}>
                <Column
                  title="Section Name"
                  dataIndex="sectionName"
                  key="sectionName"
                />
                <Column
                  title="No. of Questions"
                  dataIndex="question"
                  key="question"
                />
                <Column
                  title="Answered"
                  dataIndex="attempted"
                  key="attempted"
                />
                <Column
                  title="Unanswered"
                  dataIndex="skipped_count"
                  key="skipped_count"
                />
                <Column
                  title="Not Visited"
                  dataIndex="not_visted_count"
                  key="not_visted_count"
                />
                <Column title="Marked" dataIndex="marked" key="marked" />
                <Column
                  title="Ans & Marked"
                  dataIndex="ansMarked"
                  key="ansMarked"
                />
              </Table>
            </div>

            <div className="mock-popup-modal-body-submit-content">
              <Text className="mock-popup-modal-submit-content-title">
                Are you Sure You Want to Submit This Test ?
              </Text>
              <div style={{ display: "flex" }}>
                {props.overall_time >= 1 && (
                  <Button
                    className="mock-popup-modal-footer-cancel-button"
                    size="large"
                    onClick={() => handleClose()}
                    style={{ margin: "0px 30px 0px 0px" }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  className="mock-popup-modal-footer-submit-button"
                  size="large"
                  onClick={handleSubmit}
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </Spin>
      </Modal>
    </div>
  );
});

export default MocktestSwitchOverPopup;
