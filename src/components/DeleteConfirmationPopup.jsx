import React, { Component } from "react";
import { Modal, Button, Spin } from "antd";

export default class DeleteConfirmationPopup extends Component {
  constructor() {
    super();
    this.state = {
      visible: false,
      type: null,
      delete_loader: false,
    };
  }

  toggleModal = (state, type, data) => {
    this.setState({
      visible: state,
      delete_loader: false,
      data: data,
      type: type,
    });
  };

  handleCancel = () => {
    this.setState({ visible: false });
  };

  handleYes = () => {
    this.setState({
      delete_loader: true,
    });
    this.props.dispachDelete(this.state.data, this.state.type);
  };

  render() {
    return (
      <div>
        <Modal
          open={this.state.visible}
          closable={false}
          footer={null}
          width={550}
        >
          <div
            style={{
              textAlign: "center",
              marginTop: "140px",
              padding: "25px 0px",
            }}
          >
            {this.state.delete_loader ? (
              <div style={{ padding: "45px", textAlign: "center" }}>
                <Spin size="large" />
              </div>
            ) : (
              <>
                <h2>Confirmation</h2>
                <div style={{ fontSize: "18px", padding: "15px 0px" }}>
                  Are you sure you want to{" "}
                  {this.state.data ? "Discard" : "Delete"} this{" "}
                  {this.state.type}!
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
                    onClick={() => this.handleYes()}
                  >
                    Delete
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
                    onClick={() => this.handleCancel(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      </div>
    );
  }
}
