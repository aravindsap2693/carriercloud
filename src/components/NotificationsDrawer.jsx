import React, { Component } from "react";
import { Drawer, Tabs, Space, Avatar, Spin, Card } from "antd";
import Env from "../utilities/services/Env";
import user from "../assets/images/profile.jpg";
import NoRecords from "./NoRecords";
import { CloseOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

class NotificationsDrawer extends Component {
  constructor() {
    super();
    this.state = {
      visible: false,
      selectedIndex: "General",
      activePage: 1,
      notificationData: [],
      activeLoader: true,
    };
    this.handleDrawer = this.handleDrawer.bind(this);
  }

  handleDrawer(data) {
    this.setState({ visible: !data });
  }

  onClose = () => {
    this.setState({ visible: false, selectedIndex: "General" });
  };

  componentDidMount() {
    this.getNotifications();
  }

  async getNotifications() {
    const getData = Env.get(
      this.props.envendpoint +
        `notifications?filters[type]=${this.state.selectedIndex}&page=${this.state.activePage}`
    );
    await getData.then(
      (response) => {
        let data = response.data.response.notifications.data;
        this.setState(
          { notificationData: data, activeLoader: false },
          this.props.handleResponseCallback(
            response.data.response.notification_unread_count
          )
        );
      },
      (error) => {
        console.error(error);
      }
    );
  }

  render() {
    return (
      <Drawer
        title={`Notifications`}
        placement="right"
        onClose={this.onClose}
        open={this.state.visible}
        closeIcon={false}
        extra={
          <Space
            style={{
              cursor: "pointer",
            }}
            onClick={() => {
              this.onClose();
            }}
          >
            <CloseOutlined />{" "}
          </Space>
        }
      >
        {this.state.activeLoader === false ? (
          <Tabs
            defaultActiveKey={this.state.selectedIndex}
            type="card"
            onChange={(index) =>
              this.setState({ selectedIndex: index, activeLoader: true }, () =>
                this.getNotifications()
              )
            }
          >
            <TabPane tab="General" key={"General"}>
              {this.state.notificationData.length !== 0 ? (
                <div>
                  {this.state.notificationData.map((item, index) => (
                    <Card
                      style={{
                        width: "100%",
                        margin: "10px 0px",
                        borderRadius: "6px",
                        boxShadow: "0px 2px 8px #e4e5e7",
                        cursor: "pointer",
                      }}
                      key={index}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          padding: "15px",
                        }}
                        onClick={() => {
                          window.location.replace(
                            `/course-details/${item.item_data.course_id}/${item.item_type}/${item.item_id}`
                          );
                        }}
                      >
                        <div style={{ padding: "10px" }}>
                          <Avatar size={40} src={user} />
                        </div>
                        <div style={{ padding: "10px" }}>
                          {item.item_data !== null ? (
                            <div>{item.item_data.title}</div>
                          ) : (
                            <div>{item.title}</div>
                          )}
                          <div style={{ fontSize: "12px", color: "grey" }}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div>
                  <NoRecords />
                </div>
              )}
            </TabPane>
            <TabPane tab="Promotions" key={"custom_type"}>
              {this.state.notificationData.length !== 0 ? (
                <div>
                  {this.state.notificationData.map((item, index) => (
                    <Card
                      style={{
                        width: "100%",
                        margin: "10px 0px",
                        borderRadius: "6px",
                        boxShadow: "0px 2px 8px #e4e5e7",
                        cursor: "pointer",
                      }}
                      key={index}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          padding: "15px",
                        }}
                      >
                        <div style={{ padding: "10px" }}>
                          <Avatar size={40} src={user} />
                        </div>
                        <div style={{ padding: "10px" }}>
                          {item.item_data !== null ? (
                            <div>{item.item_data.title}</div>
                          ) : (
                            <div>{item.title}</div>
                          )}
                          <div style={{ fontSize: "12px", color: "grey" }}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div>
                  <NoRecords />
                </div>
              )}
            </TabPane>
          </Tabs>
        ) : (
          <Spin
            size="large"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
            }}
          />
        )}
      </Drawer>
    );
  }
}

export default NotificationsDrawer;
