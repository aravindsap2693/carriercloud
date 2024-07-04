import React from "react";
import { Modal, Button, Space, Radio, Spin } from "antd";
import Env from "../utilities/services/Env";
import { toast } from "react-toastify";
import StorageConfiguration from "../utilities/services/StorageConfiguration";
import { userLogOut } from "../reducers/action";

export default class ConfirmationPopup extends React.Component {
  constructor() {
    super();
    this.state = {
      visible: false,
      props: null,
      visibleLoader: false,
      SessionVisibleLoader: false,
      SessionVisible: false,
      deviceslist: [],
      session_id: null,
      email_id: null,
      Text: "",
    };
    this.toggleModal = this.toggleModal.bind(this);
    this.handleYes = this.handleYes.bind(this);
    this.handleSessionVisible = this.handleSessionVisible.bind(this);
  }

  toggleModal(state, props) {
    this.setState({ visible: state, props: props });
  }

  handleSessionVisible = (state, email, text) => {
    this.setState({ SessionVisible: state, email_id: email, Text: text }, () =>
      this.getDeviceslist(email)
    );
  };

  getDeviceslist = (email) => {
    const getEnv = Env.get(
      this.props.envendpoint + `get/alreadyloggeddevice?email_id=${email}`
    );
    getEnv.then((response) => {
      const deviceslist = response.data.response.data;
      this.setState({ deviceslist: deviceslist });
    });
  };

  handleYes() {
    const requestBody = {
      device_token: "",
    };
    const logoutData = Env.put(
      this.state.props.envendpoint + "users/update/devicetokens",
      requestBody
    );
    logoutData.then((response) => {
      let data = response.data.response;
      if (data) {
        this.setState({ visible: false }, () =>
          this.state.props.dispatch(userLogOut(undefined))
        );
        StorageConfiguration.sessionRemoveAllItem();
        sessionStorage.clear();
        this.state.props.navigate("/login");
        toast("Logged out successfully ");
      }
    });
  }

  handleClear = () => {
    const requestBody = {
      device_token: "",
      session_id: this.state.session_id,
      email_id: this.state.email_id,
    };
    const logoutData = Env.put(
      this.props.envendpoint + `get/alreadydevicelogout`,
      requestBody
    );
    logoutData.then((response) => {
      let data = response.data.response;
      if (data) {
        this.setState(
          { SessionVisible: false, SessionVisibleLoader: false },
          () => this.props.dispatch(userLogOut(undefined))
        );
        StorageConfiguration.sessionRemoveAllItem();
        sessionStorage.clear();
        this.props.navigate("/login");
        toast("Logged out successfully ");
      }
    });
  };

  render() {
    return (
      <div>
        <Modal
          open={this.state.visible}
          closable={false}
          footer={null}
          width={450}
        >
          <div
            style={{
              textAlign: "center",
              marginTop: "140px",
              padding: "25px 0px",
            }}
          >
            {this.state.visibleLoader ? (
              <div style={{ padding: "45px", textAlign: "center" }}>
                <Spin size="large" />
              </div>
            ) : (
              <>
                <h2>Confirmation</h2>
                <div style={{ fontSize: "18px", padding: "15px 0px" }}>
                  Are you sure you want to logout !
                </div>
                <div style={{ textAlign: "center", padding: "15px 0px" }}>
                  <Button
                    size="large"
                    style={{
                      margin: "0px 10px",
                      background: "#0b649d",
                      color: "#fff",
                      borderRadius: "6px",
                      width: "100px",
                      border: "0px solid",
                      fontSize: "14px",
                    }}
                    onClick={() => {
                      this.setState({ visibleLoader: true }, () =>
                        this.handleYes()
                      );
                    }}
                  >
                    Yes
                  </Button>
                  <Button
                    size="large"
                    style={{
                      margin: "0px 10px",
                      background: "#f0f2f5",
                      color: "#000",
                      borderRadius: "6px",
                      width: "100px",
                      border: "0px solid",
                      fontSize: "14px",
                    }}
                    onClick={() => this.toggleModal(false)}
                  >
                    No
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
        <Modal
          open={this.state.SessionVisible}
          closable={false}
          footer={null}
          width={450}
        >
          <div
            style={{
              textAlign: "center",
              marginTop: "140px",
              padding: "20px 0px",
            }}
          >
            {this.state.SessionVisibleLoader ? (
              <div style={{ padding: "45px", textAlign: "center" }}>
                <Spin size="large" />
              </div>
            ) : (
              <>
                <h2>Confirmation</h2>
                <div style={{ fontSize: "18px", padding: "15px 0px 10px 0px" }}>
                  {this.state.Text}
                </div>
                <div
                  style={{ textAlign: "center", padding: "5px 0px 10px 0px" }}
                >
                  <div style={{ textAlign: "center", padding: "10px 0px" }}>
                    <Radio.Group
                      onChange={(event) => {
                        this.setState({
                          session_id: event.target.value,
                        });
                      }}
                      value={this.state.session_id}
                    >
                      <Space direction="vertical">
                        {this.state.deviceslist.map((item, index) => (
                          <Radio
                            value={item.session_id}
                            key={index}
                            className="sub-dropdown-menu"
                          >
                            {item.device_name}
                          </Radio>
                        ))}
                      </Space>
                    </Radio.Group>
                  </div>
                  <Button
                    size="large"
                    style={{
                      margin: "0px 10px",
                      background: "#0b649d",
                      color: "#fff",
                      borderRadius: "6px",
                      width: "100px",
                      border: "0px solid",
                      fontSize: "14px",
                    }}
                    onClick={() => {
                      if (this.state.session_id) {
                        this.setState(
                          { SessionVisibleLoader: true },
                          () => this.handleClear(),
                          this.props.submitForm()
                        );
                      } else {
                        toast("Please select the session id");
                      }
                    }}
                  >
                    Logout
                  </Button>
                  <Button
                    size="large"
                    style={{
                      margin: "0px 10px",
                      background: "#f0f2f5",
                      color: "#000",
                      borderRadius: "6px",
                      width: "100px",
                      border: "0px solid",
                      fontSize: "14px",
                    }}
                    onClick={() => {
                      this.setState({ SessionVisible: false });
                      this.props.navigate("/home-feed");
                    }}
                  >
                    No
                  </Button>
                </div>{" "}
              </>
            )}{" "}
          </div>
        </Modal>
      </div>
    );
  }
}
