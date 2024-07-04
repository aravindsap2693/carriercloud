import React, { Component } from "react";
import { Modal, Button, Row, Col, Spin, Avatar, Divider, Card } from "antd";
import Env from "../../utilities/services/Env";
import { preferenceUpdate } from "../../reducers/action";
import { toast } from "react-toastify";
import { connect } from "react-redux";

class Preference extends Component {
  constructor() {
    super();
    this.state = {
      isModalVisible: false,
      allPreferenceData: [],
      activeLoader: true,
    };
    this.updatePreferences = this.updatePreferences.bind(this);
  }

  getAllPreferences() {
    const preferenceData = [];
    const getData = Env.get(this.props.envendpoint + `categories`);
    getData.then(
      (response) => {
        const data = response.data.response.categories.data;
        data.forEach((element) => {
          preferenceData.push({
            id: element.id,
            name: element.name,
            image: element.category_image,
            selected: false,
          });
        });
        this.setState(
          { allPreferenceData: preferenceData, isModalVisible: true },
          () => this.getUserPreferences()
        );
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getUserPreferences() {
    const getData = Env.get(this.props.envendpoint + `preferences`);
    getData.then(
      (response) => {
        const data = response.data.response.preferences.data;
        this.state.allPreferenceData.forEach((element) => {
          data.filter((item) => {
            if (item.category.id === element.id) {
              return (element.selected = true);
            }
          });
        });
        this.setState({ ...this.state.allPreferenceData, activeLoader: false });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  handleOk = () => {
    this.setState({ isModalVisible: false });
  };

  handleCancel = () => {
    this.setState({ isModalVisible: false });
  };

  updatePreferences() {
    const selectedData = this.state.allPreferenceData.filter(
      (item) => item.selected === true
    );
    const selectedDataId = [];
    selectedData.forEach((element) => {
      selectedDataId.push(element.id);
    });
    const requestBody = {
      preference_id: selectedDataId,
    };
    const postData = Env.post(
      this.props.envendpoint + `preferences`,
      requestBody
    );
    postData.then(
      (response) => {
        this.setState({ isModalVisible: false });
        toast("Preference updated successfully!");
        this.props.dispatch && this.props.dispatch(preferenceUpdate(true));
        this.props && this.props.navigate("/my-courses");
      },
      (error) => {
        console.error(error);
      }
    );
  }

  handlePreferenceSelect(id) {
    this.state.allPreferenceData.filter((item) => {
      if (item.id === id) {
        if (item.selected === true) {
          item.selected = false;
        } else {
          item.selected = true;
        }
        this.setState({ allPreferenceData: this.state.allPreferenceData });
      }
    });
  }

  render() {
    return (
      <div>
        <Modal
          open={this.state.isModalVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          // closable={true}
          width={700}
          // centered
          maskClosable={false}
          // closeIcon={true}
          footer={null}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ padding: "20px 0px" }}>
              <span
                style={{ fontSize: "22px", fontWeight: "bold", color: "grey" }}
              >
                What you're intereted in...
              </span>
            </div>
          </div>

          <div>
            {this.state.activeLoader === false ? (
              <Row gutter={[20, 20]}>
                {this.state.allPreferenceData.map((item, index) => (
                  <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                    <Card
                      style={{
                        width: "100%",
                        cursor: "pointer",
                        border: item.selected === true && "2px solid #0B649D",
                        color: item.selected === true && "#0B649D",
                        borderRadius: "5px",
                      }}
                      className="preference-list-item"
                      onClick={() => this.handlePreferenceSelect(item.id)}
                    >
                      <div style={{ textAlign: "center", padding: "10px" }}>
                        <div style={{ padding: "5px" }}>
                          <Avatar
                            shape="square"
                            size={70}
                            src={
                              this.props.envupdate.react_app_assets_url +
                              "category/images/" +
                              item.image
                            }
                          ></Avatar>
                        </div>
                        <div>
                          <span style={{ fontWeight: "bold" }}>
                            {item.name}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Spin
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  minHeight: "300px",
                }}
                size="large"
              />
            )}
          </div>

          <Divider />

          <div style={{ textAlign: "center" }}>
            <Button type="primary" onClick={this.updatePreferences}>
              Save Preference
            </Button>
          </div>
        </Modal>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    envupdate: state.envupdate,
    envendpoint: state.envendpoint,
  };
})(Preference);
