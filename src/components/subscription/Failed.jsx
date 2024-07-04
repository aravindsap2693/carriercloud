import React, { Component } from "react";
import { Modal, Button } from "antd";
import failed_bg from "../../assets/images/failed-bg.svg";
import failed_icon from "../../assets/images/failed-icon.svg";

class Failed extends Component {
  constructor() {
    super();
    this.state = {
      visible: false,
    };
  }

  openModal = (state) => {
    this.setState({ visible: true });
  };

  handleOk = () => {
    this.setState({ visible: false });
  };

  handleCancel = () => {
    this.setState({ visible: false });
  };

  render() {
    return (
      <div>
        <Modal
          centered
          open={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width={450}
          footer={null}
          closeIcon={null}
          closable={false}
          maskClosable={false}
        >
          <div
            style={{
              textAlign: "center",
              backgroundImage: `url(${failed_bg})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          >
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ padding: "200px 0px 60px" }}>
                <img
                  src={failed_icon}
                  alt="failed_icon"
                  style={{
                    borderRadius: "90px",
                    boxShadow:
                      "rgba(239, 61, 86, 0.21) 0px 0px 0px 15px, rgba(238, 45, 59, 0.09) 0px 0px 0px 30px",
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#EF3D56",
                    fontSize: "26px",
                    letterSpacing: "1px",
                  }}
                >
                  Payment Cancelled
                </div>
                <div
                  style={{
                    color: "#192A3E",
                    fontSize: "20px",
                    letterSpacing: "1px",
                    padding: "5px 0px 60px 0px",
                  }}
                >
                  This payment was not completed successfully!!
                </div>
              </div>
              <div>
                <Button
                  style={{
                    background: "#109CF1",
                    color: "#fff",
                    fontSize: "18px",
                    height: "45px",
                    padding: "0px 40px",
                    borderRadius: "4px",
                  }}
                  onClick={() => this.setState({ visible: false })}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default Failed;
