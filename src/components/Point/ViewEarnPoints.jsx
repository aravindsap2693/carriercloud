import React, { Component } from "react";
import { Modal, Spin, Avatar } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import Env from "../../utilities/services/Env";
import StorageConfiguration from "../../utilities/services/StorageConfiguration";
import { CommonService } from "../../utilities/services/Common";
import NoRecords from "../NoRecords";
import "../../assets/css/view-earn-popup.css";

class ViewEarnPoints extends Component {
  constructor() {
    super();
    this.state = {
      isModalVisible: false,
      content: "",
      pointsData: [],
      type: "",
      activeLoader: true,
      userId: "",
    };
    this.showModal = this.showModal.bind(this);
  }

  getPointsDetails(userId) {
    const getPoints = Env.get(
      this.props.envendpoint +
        `users/points-transaction/${
          !userId ? StorageConfiguration.sessionGetItem("user_id") : userId
        }/earned`
    );
    getPoints.then(
      (response) => {
        const data = response.data.response.coins_transaction;
        this.setState({ pointsData: data, activeLoader: false });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getCoinsDetails(userId) {
    const getCoins = Env.get(
      this.props.envendpoint +
        `users/coins-transaction/${
          !userId ? StorageConfiguration.sessionGetItem("user_id") : userId
        }/earned`
    );
    getCoins.then(
      (response) => {
        const data = response.data.response.coins_transaction;
        this.setState({ pointsData: data, activeLoader: false });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  showModal = (type, userId) => {
    if (type === "getPoints") {
      this.setState(
        {
          type: type,
          isModalVisible: true,
          userId: userId,
        },
        () => this.getPointsDetails(userId)
      );
    } else {
      this.setState(
        {
          type: type,
          isModalVisible: true,
          userId: userId,
        },
        () => this.getCoinsDetails(userId)
      );
    }
  };

  handleCancel = (e) => {
    this.setState({ isModalVisible: false, queries: "" });
  };

  render() {
    const { isModalVisible } = this.state;
    return (
      <div>
        <Modal
          open={isModalVisible}
          footer={null}
          closable={true}
          width={1200}
          title={
            <span className="view-earn-popup-title">
              View Earn {this.state.type === "getPoints" ? "Points" : "Coins"}
            </span>
          }
          closeIcon={
            <CloseOutlined
              style={{ fontSize: "18px", cursor: "pointer" }}
              onClick={this.handleCancel}
            />
          }
        >
          <div className="view-earn-popup-body">
            {this.state.pointsData.length !== 0 ? (
              <>
                {this.state.pointsData.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      borderTop: index > 0 && "1px solid gainsboro",
                    }}
                    className="view-earn-popup-earned-flex"
                  >
                    <div>
                      <p
                        style={{
                          margin: "0",
                          fontSize: "16px",
                        }}
                      >
                        Earned by {item.action}
                      </p>
                      <p style={{ color: "gray", margin: "0" }}>
                        {CommonService.getDate(item.txn_date,'DD MMM Y')}
                      </p>
                    </div>
                    <div>
                      <div
                        style={{
                          margin: "0",
                          color: "green",
                          fontSize: "18px",
                        }}
                      >
                        <Avatar
                          className="view-earn-popup-earned-point"
                          size={45}
                        >
                          {this.state.type === "getPoints"
                            ? item.txn_value
                            : item.coin_value}
                        </Avatar>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {this.state.activeLoader ? (
                  <div
                    style={{
                      minHeight: "600px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "500",
                        fontSize: "20px",
                      }}
                    >
                      <Spin size="large" className="feed-ads-spinner" />
                    </span>
                  </div>
                ) : (
                  <div>
                    <NoRecords />
                  </div>
                )}
              </>
            )}
          </div>
        </Modal>
      </div>
    );
  }
}

export default ViewEarnPoints;
