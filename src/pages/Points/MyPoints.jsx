import React, { Component } from "react";
import AppSidebar from "../../components/layouts/AppSidebar";
import { Content } from "antd/lib/layout/layout";
import {
  currentCourse,
  currentPageRouting,
  currentTabIndex,
  disablePreference,
} from "../../reducers/action";
import { Col, Layout, Row, Button, Collapse, Spin } from "antd";
import points_small from "../../assets/svg-images/noto_trophy_small.svg";
import points from "../../assets/svg-images/noto_trophy.svg";
import question from "../../assets/svg-images/question.svg";
import best_answer from "../../assets/svg-images/best-answer.svg";
import test_passed from "../../assets/svg-images/Test Passed.svg";
import Group from "../../assets/svg-images/Group.svg";
import vector from "../../assets/svg-images/Vector.svg";
import star from "../../assets/svg-images/star.svg";
import dots from "../../assets/svg-images/leve-background-dots.svg";
import "../../assets/css/points.css";
import { Slider } from "antd";
import StorageConfiguration from "../../utilities/services/StorageConfiguration";
import Env from "../../utilities/services/Env";
import $ from "jquery";
import ViewEarnPoints from "../../components/Point/ViewEarnPoints";
import { connect } from "react-redux";

const { Panel } = Collapse;

class MyPoints extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pointsData: [],
      points: null,
      value: null,
      radius: "290",
      activeloader: true,
    };
    this.getPointsDetails = this.getPointsDetails.bind(this);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.props.dispatch(
      disablePreference(false),
      currentTabIndex(null),
      currentPageRouting(null),
      currentCourse(null)
    );
    this.getPointsDetails();
  }

  getPointsDetails() {
    const getPoints = Env.get(
      this.props.envendpoint +
        `user/pointsdetailsget/${StorageConfiguration.sessionGetItem(
          "user_id"
        )}`
    );
    getPoints.then(
      (response) => {
        const data = response.data.response;
        this.setState({
          pointsData: data,
          total_points: response.data.response.user_details.total_points,
          level_points: response.data.response.user_details.level_points,
          activeloader: false,
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getLevelPoints = (level, div) => {
    let points;
    if (div) {
      points = level > 100 ? level.toString().slice(-3) / div : level;
      return points;
    } else {
      points = 101 < level ? 1001 - level.toString().slice(-3) : 101 - level;
      return points;
    }
  };

  display() {
    return (
      <>
        {this.state.activeloader === false ? (
          <div className="mypoints-doubts-sec">
            <Row gutter={[20]}>
              <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={12}>
                <div className="circle-bar-sec bg-white">
                  <div className="circle-bar-txt">
                    <h3>
                      <span className="txt-blue title-txt">Level</span>
                    </h3>
                    <h5>
                      <span> Levels Archieved</span>
                    </h5>
                  </div>
                  <div>
                    <div className="star-circle-sec abs-cen">
                      <div className="circle circle-postion abs-cen">
                        <div className="test circle2 circle-postion2 "></div>
                      </div>
                      <div>
                        <img
                          src={star}
                          alt="star"
                          className="star-img abs-cen"
                        />
                      </div>
                      <div>
                        <img
                          src={dots}
                          alt="points"
                          className="starpoint-img  abs-cen"
                        />
                      </div>
                      <div className="circle-txt flex-row-cen abs-cen">
                        <h2 className="txt-white">
                          {this.state.level_points === "No star"
                            ? 0
                            : this.state.level_points}
                        </h2>{" "}
                        <h3
                          style={{ letterSpacing: "9px", marginLeft: "10px" }}
                        >
                          LEVEL
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="line-div"></div>
                </div>
              </Col>
              <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={12}>
                <div className="progress-bar-sec  circle-bar-sec bg-white">
                  <div className="level-bar">
                    <h3>
                      <span className="count">{this.state.total_points}</span>
                      <span
                        style={{ float: "Right" }}
                        className="title-txt txt-blue"
                      >
                        Points
                      </span>
                    </h3>
                    <div className="total_points">
                      <Slider
                        value={this.getLevelPoints(this.state.total_points, 10)}
                        disabled
                        tooltip={{ open: false }}
                      />{" "}
                    </div>
                    <p>
                      {this.getLevelPoints(this.state.total_points)} points
                      remaining to move up{" "}
                      {this.state.level_points === "No star"
                        ? 1
                        : parseInt(this.state.level_points) + 1}{" "}
                      level
                    </p>
                  </div>
                </div>
                <Button
                  className="btn-blue abs-cen level-bar-btn"
                  onClick={() => {
                    this.viewpoints.showModal("getPoints");
                  }}
                >
                  View Earn Points
                </Button>
              </Col>
            </Row>
            <Row gutter={[20]}>
              <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={12}>
                <div className="mypoints-cards-sec bg-white flex-row-cen">
                  <div>
                    <img
                      className="point-card-icon icon1-clr"
                      src={points_small}
                      alt="points_small"
                    />
                    <h3 className="points-card-txt">
                      <span className="count">
                        {this.state.pointsData.best_answer}{" "}
                      </span>{" "}
                      <span className="count-txt">
                        No.of your best answers on doubts
                      </span>{" "}
                    </h3>

                    <Button className="btn-orange abs-cen">
                      <span>Best Answer</span>
                    </Button>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={12}>
                <div className="mypoints-cards-sec bg-white flex-row-cen">
                  <div>
                    <img
                      className="point-card-icon icon2-clr"
                      src={test_passed}
                      alt="test_passed"
                    />
                    <h3 className="points-card-txt">
                      <span className="count">
                        {" "}
                        {this.state.pointsData.answer}{" "}
                      </span>{" "}
                      <span className="count-txt">
                        {" "}
                        No.of answers on doubts
                      </span>{" "}
                    </h3>

                    <Button className="btn-orange abs-cen">
                      <span>Answer</span>
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
            <Row gutter={[20]}>
              <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={12}>
                <div className="mypoints-cards-sec bg-white flex-row-cen">
                  <div>
                    <img
                      className="point-card-icon icon3-clr"
                      src={question}
                      alt="question"
                    />
                    <h3 className="points-card-txt">
                      <span className="count">
                        {" "}
                        {this.state.pointsData.doubts_count}{" "}
                      </span>{" "}
                      <span className="count-txt"> Doubts Asked</span>{" "}
                    </h3>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={12}>
                <div className="mypoints-cards-sec bg-white flex-row-cen">
                  <div>
                    <img
                      className="point-card-icon icon4-clr"
                      src={best_answer}
                      alt="best_answer"
                    />
                    <h3 className="points-card-txt">
                      <span className="count">
                        {this.state.pointsData.choosing_best_answer_count}{" "}
                      </span>{" "}
                      <span className="count-txt">Best Answer choosen</span>{" "}
                    </h3>
                  </div>
                </div>
              </Col>
            </Row>
            <Row gutter={[20]}>
              <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <div className="level-benefit-sec bg-white">
                  <div className="points-border">
                    <img
                      className="cup-img abs-cen"
                      src={points}
                      alt="points"
                    />
                    <div className="cup-img-content">
                      <div className="ant-collapse-header">
                        Help others and Get Benefits
                      </div>
                      <div className="cleardoubts">
                        Clear the Doubt and Earn Coins & Points
                      </div>
                    </div>

                    <div className="list-item-cont">
                      {this.state.pointsData.help_other &&
                        this.state.pointsData.help_other.length > 0 && (
                          <ul>
                            {this.state.pointsData.help_other.map(
                              (item, index) => (
                                <li
                                  className="pointslevellist-cont"
                                  key={index}
                                >
                                  <div style={{ display: "flex" }}>
                                    <span className="list-no">{index + 1}</span>
                                  </div>
                                  <div style={{ marginRight: "10px" }}>
                                    <span className="pointslevellist-text list-text">
                                      {item.value}
                                    </span>
                                  </div>
                                </li>
                              )
                            )}
                          </ul>
                        )}
                    </div>
                  </div>
                  <div className="pointsleveldiv points-border ">
                    <Collapse
                      defaultActiveKey={["1"]}
                      ghost
                      expandIconPosition="end"
                      expandIcon={({ isActive }) => (
                        <div className="icon-vector">
                          {isActive === true ? (
                            <img
                              className="pointslevelimg"
                              src={vector}
                              alt="points"
                            />
                          ) : (
                            <img
                              className="pointslevelimg"
                              src={vector}
                              style={{ transform: "rotate(180deg)" }}
                              alt="points"
                            />
                          )}
                        </div>
                      )}
                    >
                      <Panel
                        header=" Points Level Benefits"
                        className="pointslevelhead"
                        key="1"
                      >
                        <div className="pointslevel-details-list list-item-cont">
                          {this.state.pointsData.points_level_benefits &&
                            this.state.pointsData.points_level_benefits.length >
                              0 && (
                              <ul>
                                {this.state.pointsData.points_level_benefits.map(
                                  (item, index) => (
                                    <li
                                      className=" pointslevellist-cont"
                                      key={index}
                                    >
                                      <span className="list-no">
                                        {index + 1}
                                      </span>
                                      <div style={{ marginRight: "10px" }}>
                                        <span className="list-text">
                                          {item.value}
                                        </span>
                                      </div>
                                    </li>
                                  )
                                )}
                              </ul>
                            )}
                        </div>
                      </Panel>
                    </Collapse>
                  </div>
                  <div className="points-border ">
                    <Collapse
                      defaultActiveKey={["1"]}
                      ghost
                      expandIconPosition={"end"}
                      expandIcon={({ isActive }) => (
                        <div className="icon-vector">
                          {isActive === true ? (
                            <img
                              className="pointslevelimg"
                              src={vector}
                              alt="points"
                            />
                          ) : (
                            <img
                              className="pointslevelimg"
                              src={vector}
                              style={{ transform: "rotate(180deg)" }}
                              alt="points"
                            />
                          )}
                        </div>
                      )}
                    >
                      <Panel header="Doubts Points Level" key="1">
                        <div className="doubtspointstot abs-cen">
                          <div>
                            {this.state.pointsData.doubts_points_level &&
                              this.state.pointsData.doubts_points_level.length >
                                0 && (
                                <div className=" doubts-point-lev-sec flex-row-cen">
                                  <div className="range-col range-sec">
                                    <ul className="range-ul">
                                      {this.state.pointsData.doubts_points_level.map(
                                        (item, index) => (
                                          <li
                                            key={index}
                                            className="txt-orange"
                                          >
                                            {item.value}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                  <div className="level-col range-sec">
                                    <ul className="range-ul">
                                      {this.state.pointsData.doubts_points_level.map(
                                        (item, index) => (
                                          <li key={index} className="txt-blue">
                                            {item.range}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                  <img
                                    src={Group}
                                    alt="points"
                                    className="abs-cen man-img"
                                  />
                                </div>
                              )}
                          </div>
                        </div>
                      </Panel>
                    </Collapse>
                  </div>
                </div>
              </Col>
            </Row>
            <ViewEarnPoints
              ref={(instance) => {
                this.viewpoints = instance;
              }}
              {...this.props}
            />
          </div>
        ) : (
          <div
            style={{
              minHeight: "825px",
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
              <Spin size="large" />
            </span>
          </div>
        )}
      </>
    );
  }

  render() {
    // var $bar = $(this).find(".test");
    // var $val = $(this).find("span");
    var perc = parseInt(20);
    var level =
      this.state.level_points === "No star" ? 0 : this.state.level_points;
    Slider(level, perc);
    // setTimeout(this.state.total_points,5000)
    // let input = this.state.total_points;

    function Slider(input, perc) {
      $({
        input: 0,
      }).animate(
        {
          input: perc,
        },
        {
          step: function (p) {
            $(".test").css({
              transform: "rotate(" + (-55 + input * 18.19) + "deg)", // 100%=145° so: ° = % * 2.1
              // 45 is to add the needed rotation to have the green borders at the bottom
            });
            if (input <= 5) {
              $(".circle2").css({
                "border-right": "15px solid #E0F3FF",
                "border-bottom": "15px solid #E0F3FF",
              });
              return false;
            } else if (input > 5 && input <= 9) {
              $(".circle2").css({
                "border-right": "15px solid #E0F3FF",
                "border-bottom": "15px solid #0B649D ",
              });
              return false;
            } else if (input > 9) {
              $(".circle2").css({
                "border-right": "15px solid #0B649D",
                "border-bottom": "15px solid #0B649D ",
              });
              return false;
            }
          },
        }
      );
    }
    return (
      <>
        <Layout>
          <AppSidebar {...this.props} />
          <Layout>
            <Content>
              <div className="my-points-details-container">
                {this.display()}
              </div>
            </Content>
          </Layout>
        </Layout>
      </>
    );
  }
}

export default connect((state) => {
  return {
    envendpoint: state.envendpoint,
  };
})(MyPoints);
