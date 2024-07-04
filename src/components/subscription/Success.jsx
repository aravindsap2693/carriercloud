import React, { Component } from "react";
import { Modal, Spin } from "antd";
import success_icon from "../../assets/images/success-icon.svg";
import success_coin from "../../assets/images/success-coin.svg";
import success_bg from "../../assets/images/success-bg.svg";
import { updateCourseDetails } from "../../reducers/action";
import Confetti from "react-confetti";

class Success extends Component {
  constructor() {
    super();
    this.state = {
      visible: false,
      props: {},
      response: {},
    };
    this.openModal = this.openModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  openModal(data, props) {
    this.setState({ visible: true, props: props, response: data });
    setTimeout(() => {
      this.state.props.dispatch(updateCourseDetails(true));
      this.handleCancel();
    }, 5000);
  }

  handleOk() {
    this.setState({ visible: false });
  }

  handleCancel() {
    this.setState({ visible: false });
  }

  render() {
    return (
      <div>
        <Modal
          centered
          open={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width={500}
          footer={null}
          closeIcon={null}
          closable={false}
        >
          <div
            style={{
              textAlign: "center",
              backgroundImage: `url(${success_bg})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          >
            <Confetti width={500} height={window.innerHeight} />
            <div style={{ padding: "20px" }}>
              <div style={{ padding: "200px 0px 60px" }}>
                <img
                  src={success_icon}
                  alt="Success Icon"
                  style={{
                    borderRadius: "90px",
                    boxShadow:
                      "#D3F4E5 0px 0px 0px 15px, rgba(232, 249, 241, 0.64) 0px 0px 0px 30px",
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#20BE79",
                    fontSize: "28px",
                    letterSpacing: "1px",
                  }}
                >
                  Payment Successful
                </div>
                <div
                  style={{
                    color: "#109CF1",
                    fontSize: "18px",
                    letterSpacing: "0px",
                    padding: "0px",
                  }}
                >
                  Thank you for you purchase
                </div>
              </div>
              <div
                style={{
                  backgroundImage: `url(${success_coin})`,
                  height: "100px",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "cover",
                  backgroundSize: "center",
                  margin: "30px 50px",
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    position: "relative",
                    top: "50px",
                  }}
                >
                  You have earned{" "}
                  <span style={{ fontWeight: "bold", fontSize: "18px" }}>
                    {this.state.response.original_price -
                      this.state.response.discount_amount -
                      this.state.response.payable_coins_amount -
                      this.state.response.coupon_code_discount_amount}
                  </span>{" "}
                  Coins
                </div>
              </div>
              <div style={{ fontSize: "16px", padding: "0px 50px " }}>
                Redirecting to{" "}
                {this.state.response.courses &&
                  this.state.response.courses.title}
                <Spin
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                  size="large"
                />
              </div>
              <div
                style={{
                  background: "#F0FBF6",
                  borderRadius: "20px",
                  padding: "15px",
                  margin: "20px 30px",
                }}
              >
                <div style={{ color: "#01A54E", fontSize: "16px" }}>
                  Payment Details send to Your Mail Id
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default Success;
