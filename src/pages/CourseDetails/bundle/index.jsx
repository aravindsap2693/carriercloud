import React, { Component } from "react";
import { Row, Col, Card, Typography, Rate, Spin, FloatButton } from "antd";
import "../../../assets/css/course-list.css";
import Env from "../../../utilities/services/Env";
import { CommonService } from "../../../utilities/services/Common";
import language_image from "../../../assets/svg-icons/course-languages.svg";
import calendar from "../../../assets/svg-icons/course-calendar.svg";
import discount_image from "../../../assets/svg-icons/coin-discount.svg";
import NoRecords from "../../../components/NoRecords";
import { connect } from "react-redux";
import {
  currentCourse,
  currentTabIndex,
  disablePreference,
} from "../../../reducers/action";
import moment from "moment";
import fearured_tag from "../../../assets/svg-images/fearured-tag.png";
import InfiniteScroll from "react-infinite-scroll-component";
import Skeletons from "../../../components/SkeletonsComponent";
import { analytics } from "../../../firebase-config";
import { logEvent } from "firebase/analytics";

const { Text } = Typography;

class BundleCourse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      courses: [],
      activeLoader: true,
      activePage: 1,
      catergoryId: props.preferences.id,
      totalRecords: 0,
      subscription_type: null,
      featured_course: null,
      subjects: "",
      coinDiscount: null,
      exams: "",
      showFilters: false,
    };
  }

  componentDidMount() {
    this.props.dispatch(
      disablePreference(true),
      currentTabIndex(null),
      currentCourse(null)
    );
    this.getBundleCourses("preference");
    logEvent(analytics, "select_content", {
      page_title: "Bundle Course",
    });
  }

  loadMore = () => {
    this.setState(
      (prev) => {
        return { activePage: prev.activePage + 5 };
      },
      () => this.getBundleCourses("paginate")
    );
  };

  getBundleCourses(type) {
    const getBundleCourses = Env.get(
      this.props.envendpoint +
        `bundleproductsublist/${this.props.match.params.id}?rowPerPage=${this.state.activePage}`
    );
    getBundleCourses.then(
      (response) => {
        let data = response.data.response.courses.data;
        this.setState({
          courses:
            type === "preference" ? data : this.state.courses.concat(data),
          activeLoader: false,
          totalRecords: response.data.response.courses.total,
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  componentWillReceiveProps(newProps) {
    if (this.props.preferences.id !== newProps.preferences.id) {
      this.setState(
        { catergoryId: newProps.preferences.id, activePage: 1 },
        () => this.getBundleCourses("preference")
      );
    }
  }

  detailPageRedirection(props, type, item) {
    CommonService.contentRedirectionFunction(props, type, item);
  }

  render() {
    const { courses } = this.state;
    return (
      <div style={{ minHeight: "100vh", height: "100%" }}>
        {this.state.courses.length > 0 ? (
          <InfiniteScroll
            dataLength={this.state.courses.length}
            next={this.loadMore}
            hasMore={this.state.totalRecords > this.state.courses.length}
            loader={<Skeletons type={"course"} />}
            scrollableTarget="scrollableDiv"
          >
            <Row className="all-courses-row">
              {courses.map((item, index) => (
                <Col key={index} xs={24} sm={24} md={10} lg={8} xl={8} xxl={8}>
                  <div
                    className="all-courses-main"
                    onClick={() =>
                      this.detailPageRedirection(
                        this.props,

                        "Bundle",
                        item
                      )
                    }
                  >
                    {item.is_featured === 1 && (
                      <div className="IsFeartured-tag">
                        <img
                          alt="fearured_tag"
                          src={fearured_tag}
                          style={{
                            width: "90px",
                            position: "absolute",
                            zIndex: "1",
                            left: "16px",
                          }}
                        />
                      </div>
                    )}
                    <Card className="all-courses-card">
                      <div className="all-courses-card-inner">
                        <div>
                          <img
                            alt="course_image"
                            src={
                              Env.getImageUrl(
                                `${this.props.envupdate.react_app_assets_url}course`
                              ) + item.course_image
                            }
                            className="all-courses-banner-image"
                          />
                        </div>
                        <div className="all-course-card-content-main">
                          <div className="all-courses-card-header1">
                            <div>
                              <Text
                                className="all-courses-card-title"
                                style={{ fontWeight: 600 }}
                              >
                                {item.title}
                              </Text>
                            </div>
                            <div>
                              <Text
                                className="all-courses-card-created-by"
                                style={{ fontSize: "14px" }}
                              >
                                by {item.created_by && item.created_by.name}
                              </Text>
                            </div>
                          </div>
                          <div className="all-courses-card-contents">
                            <div className="all-courses-icon-container">
                              <img
                                alt="language_image"
                                src={language_image}
                                className="all-courses-language-icon"
                              />
                              {item.course_language.map((element, key) => (
                                <span
                                  className="all-courses-language-name"
                                  key={key}
                                >
                                  {element.language_select}
                                  {item.course_language[key + 1] ===
                                  undefined ? null : (
                                    <span> / </span>
                                  )}
                                </span>
                              ))}
                            </div>
                            <div>
                              <span className="all-courses-rating-label">
                                4
                              </span>
                              <Rate
                                className="all-course-rating"
                                allowHalf
                                defaultValue="4.0"
                                disabled
                              />
                            </div>
                          </div>
                          <div>
                            <div className="all-courses-card-contents">
                              <div className="all-courses-icon-container">
                                <img
                                  src={calendar}
                                  alt="calendar"
                                  className="all-courses-calendar-icon"
                                />
                                <span className="all-course-card-content-text">
                                  {item.course_validity.length !== 0
                                    ? item.course_validity[0].months +
                                      " M validity"
                                    : "Expires on " +
                                      moment(item.validity_end_date).format(
                                        "DD MMM YYYY"
                                      )}
                                </span>
                              </div>
                              {item.course_validity.length !== 0 &&
                                item.coin_percentage !== 0 &&
                                item.is_subscribed !== 1 && (
                                  <div className="all-courses-discount-icon-container">
                                    <img
                                      alt="discount_image"
                                      className="all-courses-discount-icon"
                                      src={discount_image}
                                    />
                                    <span className="all-course-card-content-text">
                                      {item.coin_percentage} % Coin Discount
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>
                          {item.is_subscribed === 1 && (
                            <div className="all-courses-subscribe">
                              <Text
                                className="all-courses-subscribed-text"
                                style={{ letterSpacing: "1px" }}
                              >
                                Subscribed
                              </Text>
                            </div>
                          )}

                          {item.is_subscribed !== 1 &&
                          item.subscription_type_id !== 1 &&
                          item.course_validity.length !== 0 ? (
                            <div className="all-courses-card-contents">
                              <div className="all-courses-price-container">
                                {item.special_price_valid === 1 ? (
                                  <span>
                                    <span style={{ padding: "10px" }}>
                                      <Text className="all-courses-special-price price-symbol">
                                        ₹{item.course_validity[0].special_price}
                                      </Text>
                                    </span>
                                    <span className="all-courses-prices">
                                      <span className="all-courses-prices-text">
                                        ₹{item.course_validity[0].offer_price}
                                      </span>
                                    </span>
                                  </span>
                                ) : (
                                  <span className="all-courses-prices">
                                    <span style={{ padding: "0px" }}>
                                      <Text className="all-courses-special-price price-symbol">
                                        ₹{item.course_validity[0].offer_price}
                                      </Text>
                                    </span>
                                  </span>
                                )}
                                <span className="all-courses-prices">
                                  <span className="all-courses-prices-text">
                                    ₹{item.course_validity[0].cost_price}
                                  </span>
                                </span>
                              </div>
                              {item.special_price_valid === 0 ? (
                                <div className="all-courses-savings">
                                  Save{" "}
                                  {CommonService.getProductPercentage(
                                    item.course_validity[0].cost_price,
                                    item.course_validity[0].offer_price
                                  )}
                                  %
                                </div>
                              ) : (
                                <div className="all-courses-savings">
                                  Save{" "}
                                  {CommonService.getProductPercentage(
                                    item.course_validity[0].cost_price,
                                    item.course_validity[0].special_price
                                  )}
                                  %
                                </div>
                              )}
                            </div>
                          ) : (
                            item.course_validity.length === 0 &&
                            item.subscription_type.name === "Free" &&
                            item.is_subscribed === 0 && (
                              <div className="all-courses-subscribe">
                                <Text
                                  className="all-courses-free-text"
                                  style={{
                                    letterSpacing: "1px",
                                    color: "#000",
                                    textTransform: "capitalize",
                                    fontWeight: 900,
                                  }}
                                >
                                  Free
                                </Text>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                </Col>
              ))}
            </Row>
          </InfiniteScroll>
        ) : (
          this.state.activeLoader === true && (
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
          )
        )}

        {this.state.activePage > 1 && <FloatButton.BackTop />}

        <div>
          {this.state.activeLoader === true &&
            this.state.courses.length !== 0 && (
              <Spin
                size="large"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  paddingTop: "40px",
                }}
              />
            )}
        </div>

        {this.state.activeLoader === false &&
          this.state.courses.length === 0 && <NoRecords />}
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
})(BundleCourse);
