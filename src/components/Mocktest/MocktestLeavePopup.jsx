import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button, Modal, Spin, Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import "../../assets/css/mocktest-common.css";

const { Text } = Typography;

const MocktestLeavePopup = forwardRef(function MocktestLeavePopup(props, ref) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => {
    return {
      showModal() {
        setIsModalVisible(true);
        setLoading(false);
      },
      closeModal() {
        setIsModalVisible(false);
      },
    };
  });

  const handleOk = () => {
    setLoading(true);
    props.submitLeaveMocktest("question_no");
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen || document.mozFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen || document.webkitIsFullScreen) {
      document.webkitCancelFullScreen();
    }
  };

  const handleCancel = () => {
    props.handlecloseTimer();
    setIsModalVisible(false);
  };

  useEffect(() => {
    if (props.overall_time <= 1 && isModalVisible) {
      handleCancel();
    }
  }, [props]);
  return (
    <div>
      <Modal
        open={isModalVisible}
        footer={null}
        closable={false}
        centered={true}
        maskClosable={false}
        className="mock-popup-leave"
      >
        {loading === true ? (
          <div style={{ padding: "45px", textAlign: "center" }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ padding: "25px" }}>
            <div className="mock-popup-modal-body-center">
              <Text className="mock-popup-modal-body-leave">
                Leave Mocktest
              </Text>
            </div>
            <div className="mock-popup-modal-body-center">
              <Text className="mock-popup-modal-body-leave-content" strong>
                You have questions left. This session will be saved so that you
                can revisit and continue. Do you want to continue ?
              </Text>
            </div>

            <div className="mock-popup-modal-leave-footer">
              <Button
                block
                className="mock-popup-modal-leave-footer-cancel"
                size="large"
                onClick={handleCancel}
              >
                Cancel{" "}
              </Button>
              <Button
                block
                className="mock-popup-modal-leave-footer-submit"
                size="large"
                onClick={handleOk}
              >
                Leave{" "}
                <RightOutlined className="mock-popup-modal-leave-footer-icon" />
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
});

export default MocktestLeavePopup;
