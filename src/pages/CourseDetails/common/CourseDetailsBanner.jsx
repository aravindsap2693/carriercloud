import React, { Component } from "react";
import { Typography, Row, Col, Rate, Spin } from "antd";
import language_image from "../../../assets/svg-icons/course-language.svg";
import subscribed_bell from "../../../assets/svg-icons/subscribe-notification.svg";
import not_subscribed_bell from "../../../assets/svg-icons/subscribe-notification-off.svg";
import user_image from "../../../assets/svg-icons/subscribers.svg";
// import crack_current_affairs from '../../../assets/images/crack_prelims_level_puzzles.png';
import "../../../assets/css/course-detail.css";
import Env from "../../../utilities/services/Env";
import { CommonService } from "../../../utilities/services/Common";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import fearured_tag from "../../../assets/svg-images/fearured-tag.png";

const { Text } = Typography;

class CourseDetailsBanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeLoader: true,
      notification_status: this.props.courses.is_user_notify,
      courseRating: 4,
    };
    this.handleNotify = this.handleNotify.bind(this);
    this.handleRatingChange = this.handleRatingChange.bind(this);
  }

  async handleNotify() {
    this.setState({
      notification_status: this.state.notification_status === 0 ? 1 : 0,
    });
    const requestBody = {
      course_id: this.props.courses.id,
    };
    const postNotify = Env.post(
      this.props.envendpoint + `notifications/course/toggle`,
      requestBody
    );
    postNotify.then(
      (response) => {
        // this.props.dispatch(updateCourseDetails(true))
        const data = response.data.response.notificationToggle;
        toast(
          data.status === 0
            ? "Course notifications turned OFF"
            : "Course notifications turned ON"
        );
      },
      (error) => {
        console.error(error);
      }
    );
  }

  handleRatingChange(data) {
    this.setState({ courseRating: data });
  }

  render() {
    const banners = this.props.courses;
    return (
      <div className="container">
        {Object.keys(this.props.courses).length !== 0 ? (
          <div className="inner-container">
            <Row className="row">
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={10}
                xl={10}
                xxl={9}
                className="banner-column"
              >
                {banners.is_featured === 1 && (
                  <div className="IsFeartured-tag">
                    <img
                      src={fearured_tag}
                      style={{
                        width: "86px",
                        position: "absolute",
                        zIndex: "1",
                        left: "20px",
                      }}
                      alt="fearured"
                    />
                  </div>
                )}
                <img
                  src={
                    Env.getImageUrl(
                      `${this.props.envupdate.react_app_assets_url}course`
                    ) + banners.course_image
                  }
                  className="image"
                  alt='course'
                />
              </Col>
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={14}
                xl={14}
                xxl={15}
                className="content-column"
              >
                <div className="content">
                  <Row className="title-row">
                    <Text className="title">{banners.title}</Text>
                  </Row>

                  {/* {this.props.courses.is_subscribed === 0 && <Row align="bottom" className="preference-row" >
                                    <Col xs={24} sm={20} md={20} lg={20} xl={22} xxl={22} className="column">
                                        <Text className="text">{this.props.preferences.name}</Text><br />
                                        <span className="created-by">Created by AffairsCloud.com</span>
                                    </Col>
                                </Row>} */}

                  <Row className="content-row evenheight">
                    <Col
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={9}
                      xxl={8}
                      className="language-column"
                    >
                      <div className="row">
                        <div className="image-container">
                          <img src={language_image} alt='language' className="image" />
                        </div>
                        <div className="column">
                          <div className="content">
                            {banners.course_language.map((item, index) => (
                              <Text strong className="text" key={index}>
                                {item.language_select}{" "}
                                {banners.course_language[index + 1] && (
                                  <span>/</span>
                                )}{" "}
                              </Text>
                            ))}{" "}
                          </div>
                          <div className="label">
                            <span className="text">Course Language</span>
                          </div>
                        </div>
                      </div>
                    </Col>
                    {banners.subscription_type.name === "Free" && (
                      <Col
                        xs={12}
                        sm={12}
                        md={12}
                        lg={12}
                        xl={12}
                        xxl={8}
                        className="subscriber-column"
                      >
                        <div className="row">
                          <div className="image-container">
                            <img src={user_image}  alt='user'  className="image" />
                          </div>
                          <div className="column">
                            <div className="content">
                              <Text strong className="text">
                                {CommonService.convertIntoKiloPrefix(
                                  banners.subscibers_course_count
                                )}
                              </Text>
                            </div>
                            <div className="label">
                              <span className="text">Course Subscribers</span>
                            </div>
                          </div>
                        </div>
                      </Col>
                    )}
                    <Col
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                      xxl={8}
                      className="rating-column"
                    >
                      <div className="row">
                        <div className="content">
                          <div className="text">
                            <Text type="success" strong className="value">
                              {this.state.courseRating}
                            </Text>
                          </div>
                          <div className="inner-content">
                            <Rate
                              allowHalf
                              defaultValue={this.state.courseRating}
                              className="icon"
                              onChange={this.handleRatingChange}
                            />
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  {this.props.courses.is_subscribed === 1 ? (
                    <Row align="bottom" className="footer-row">
                      <Col
                        xs={20}
                        sm={20}
                        md={20}
                        lg={20}
                        xl={22}
                        xxl={22}
                        className="preference-column"
                      >
                        <Text className="text">
                          {this.props.preferences.name}
                        </Text>
                        <br />
                        <span className="created-by">
                          Created by {this.props.courses.created_by.name}
                        </span>
                      </Col>
                      <Col
                        xs={4}
                        sm={4}
                        md={4}
                        lg={4}
                        xl={2}
                        xxl={2}
                        className="notification-column"
                      >
                        {this.state.notification_status === 1 ? (
                          <span
                            className="notified"
                            onClick={this.handleNotify}
                          >
                            <img src={subscribed_bell} alt='subscribed' className="image" />
                          </span>
                        ) : null}
                        {this.state.notification_status === 0 ? (
                          <span className="notify" onClick={this.handleNotify}>
                            <img src={not_subscribed_bell} alt='subscribed' className="image" />
                          </span>
                        ) : null}
                      </Col>
                    </Row>
                  ) : (
                    <Row align="bottom" className="preference-row">
                      <Col
                        xs={24}
                        sm={20}
                        md={20}
                        lg={20}
                        xl={22}
                        xxl={22}
                        className="column"
                      >
                        <Text className="text">
                          {this.props.preferences.name}
                        </Text>
                        <br />
                        <span className="created-by">
                          Created by {this.props.courses.created_by.name}
                        </span>
                      </Col>
                    </Row>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        ) : (
          <Spin className="app-spinner" size="large" />
        )}
      </div>
    );
  }
}

export default connect((state) => {
  return {
    preferences: state.preferences,
    envupdate: state.envupdate,
    envendpoint: state.envendpoint,
  };
})(CourseDetailsBanner);
