import React, { Component } from "react";
import { Modal } from "antd";
import { CloseOutlined } from "@ant-design/icons";

class GeneralPopup extends Component {
  constructor() {
    super();
    this.state = {
      isModalVisible: false,
      content: "",
    };
    this.showModal = this.showModal.bind(this);
  }

  showModal = (state, data) => {
    this.setState({ isModalVisible: state, content: data });
  };

  handleOk = () => {
    this.setState({ isModalVisible: false });
  };

  handleCancel = (e) => {
    this.setState({ isModalVisible: false, queries: "" });
  };

  render() {
    const { isModalVisible } = this.state;
    return (
      <div className="general-modal-popup">
        <Modal
          open={isModalVisible}
          footer={null}
          closable={true}
          //   centered={true}
          width={1200}
          closeIcon={
            <CloseOutlined
              style={{ fontSize: "18px", cursor: "pointer" }}
              onClick={this.handleCancel}
            />
          }
        >
          <div className="general-modal-popup-header">General Promotions</div>
          <div
            className="general-modal-popup-content"
            dangerouslySetInnerHTML={{ __html: this.state.content }}
          ></div>
        </Modal>
      </div>
    );
  }
}

export default GeneralPopup;
