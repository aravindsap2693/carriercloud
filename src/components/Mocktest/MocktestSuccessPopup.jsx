import React, { forwardRef, useState, useImperativeHandle } from "react";
import { Button, Modal, Space, Typography } from "antd";
import CloseCircle from "../../assets/svg-images/closer.svg";
import SuccessIcon from "../../assets/svg-icons/mock-success-icon.svg";
import { mocktestStatusUpdate } from "../../reducers/action";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";

const { Text } = Typography;

const MocktestSuccessPopup = forwardRef(function MocktestSuccessPopup(
  props,
  ref
) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useImperativeHandle(
    ref,
    () => {
      return {
        showSuccessModal() {
          setIsModalVisible(true);
        },
      };
    },
    []
  );

  const handleOk = (type) => {
    setIsModalVisible(false);
    if (type === "Analysis") {
      dispatch(mocktestStatusUpdate(false, ""));
      navigate.push(
        `/course-details/${props.match.params.id}/mocktest/${props.mockData.mock_id}/result`
      );
    } else {
      dispatch(mocktestStatusUpdate(true, "solution"));
      window.location.reload();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
      <Modal
        open={isModalVisible}
        footer={null}
        closable={false}
        closeIcon={
          <img src={CloseCircle} alt="CloseCircle" className="CloseButton" />
        }
        onCancel={handleCancel}
        centered={true}
        maskClosable={false}
        className="mock-success-popup"
      >
        <div style={{ padding: "25px" }}>
          <div className="mock-success-popup-modal-body-center">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Space style={{ paddingBottom: "20px" }}>
                <img
                  src={SuccessIcon}
                  alt="SuccessIcon"
                  style={{ width: "60px" }}
                />
              </Space>
              <Text className="mock-popup-modal-body-leave">
                Test Submitted Successfully
              </Text>
            </div>{" "}
          </div>
          <div className="mock-popup-modal-body-success-content">
            <Button
              className="mock-popup-modal-footer-next-button"
              size="large"
              onClick={() => handleOk("Solution")}
              style={{
                background: "#C2CFE0",
                color: "#3C4852",
                padding: "7px 32px",
                fontWeight: "600",
              }}
            >
              Solution
            </Button>

            <Button
              className="mock-popup-modal-footer-next-button"
              size="large"
              onClick={() => handleOk("Analysis")}
              style={{
                background: "#3C4852",
                color: "#FFFFFF",
                padding: "7px 32px",
                fontWeight: "600",
              }}
            >
              Analysis
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

export default MocktestSuccessPopup;
