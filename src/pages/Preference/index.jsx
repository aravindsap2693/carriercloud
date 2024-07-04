import React, { Component } from "react";
import { Row, Col, Button, Spin, Breadcrumb } from "antd";
import { PlusCircleOutlined, CheckCircleFilled } from "@ant-design/icons";
import Env from "../../utilities/services/Env";
import { connect } from "react-redux";
import {
  currentPageRouting,
  isNewUser,
  preferences,
  preferenceUpdate,
  disablePreference,
} from "../../reducers/action";
import "../../assets/css/preference.css";
import { toast } from "react-toastify";

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

  componentDidMount() {
    this.props.dispatch(currentPageRouting(null));
    this.props.dispatch(disablePreference(true));
    this.getAllPreferences();
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
          data.map((item) => {
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
        this.props.dispatch &&
          this.props.dispatch(preferences(null, null)) &&
          this.props.dispatch(preferenceUpdate(true)) &&
          this.props.dispatch(isNewUser(false));
        this.props.navigate && this.props.navigate("/home-feed");
      },
      (error) => {
        let errorData = error.response.data.message;
        if (error.response.data.status === 422) {
          toast("Please Select your Exam Preference !");
        } else {
          Object.values(errorData).forEach((element) => {
            toast(
              JSON.stringify(Object.values(element)).replace(/[\[\]'"]+/g, "")
            );
          });
        }
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
      <div className="preference-main">
        <div className="preference-breadcrumb-container">
          <Breadcrumb items={[{ title: "My Preference" }]} />
        </div>
        <div className="background-gradient">
          <div className="image"></div>
          <div className="header">
            <div className="content">
              <div>
                <div className="text">Select your Exam Preference</div>
                <div className="sub-text">What your interested in?</div>
              </div>
            </div>
          </div>
        </div>

        {this.state.activeLoader === false ? (
          <div className="content">
            {this.state.allPreferenceData.map((item, index) => (
              <Row
                className="content-block"
                align="middle"
                onClick={() => this.handlePreferenceSelect(item.id)}
                key={index}
              >
                <Col xs={4} sm={4} md={4} lg={4} xl={4} xxl={4}>
                  <img
                    src={
                      this.props.envupdate.react_app_assets_url +
                      "category/images/" +
                      item.image
                    }
                    alt="category"
                    className="image"
                  />
                </Col>
                <Col xs={16} sm={16} md={18} lg={18} xl={18} xxl={18}>
                  <div className="title">{item.name}</div>
                </Col>
                <Col xs={4} sm={4} md={2} lg={2} xl={2} xxl={2}>
                  {item.selected === false ? (
                    <PlusCircleOutlined className="icon-add" />
                  ) : (
                    <CheckCircleFilled className="icon-check" />
                  )}
                </Col>
              </Row>
            ))}
          </div>
        ) : (
          <Spin className="app-spinner" size="large" />
        )}
        <div className="footer">
          <Button
            size="large"
            className="cancel"
            style={{ background: "transparent", margin: "10px" }}
            onClick={() => this.props.navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            onClick={this.updatePreferences}
            size="large"
            className="save"
          >
            Save Preference
          </Button>
        </div>
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
