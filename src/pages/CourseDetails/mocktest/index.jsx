import React, { Component } from "react";
import { Card, Radio, Row, Col, Button, Tooltip, FloatButton } from "antd";
import language_label from "../../../assets/svg-images/language-icon.svg";
import language_label_upcoming from "../../../assets/svg-images/language-icon-upcoming.svg";
import validity_calendar from "../../../assets/svg-images/calendar-icon.svg";
import validity_calendar_upcoming from "../../../assets/svg-images/calendar-icon-upcoming.svg";
import attend from "../../../assets/svg-images/attempted-icon.svg";
import attend_upcoming from "../../../assets/svg-images/attempted-icon-upcoming.svg";
import mock_start from "../../../assets/svg-images/quiz-start-new.svg";
import mock_resume from "../../../assets/svg-images/quiz-resume-new.svg";
import mock_complete from "../../../assets/svg-images/quiz-solution-new.svg";
import mocktest_upcoming from "../../../assets/svg-images/mocktest_upcoming.svg";
import Env from "../../../utilities/services/Env";
import "../../../assets/css/quiz.css";
import moment from "moment";
import { RightOutlined } from "@ant-design/icons";
import NoRecords from "../../../components/NoRecords";
import CourseModulesMenu from "../../../components/CourseModulesMenu";
import { connect } from "react-redux";
import {
  mocktestStatusUpdate,
  mocktestReattempt,
} from "../../../reducers/action";
import { CommonService } from "../../../utilities/services/Common";
import { toast } from "react-toastify";
import InfiniteScroll from "react-infinite-scroll-component";
import Skeletons from "../../../components/SkeletonsComponent";
import { analytics } from "../../../firebase-config";
import { logEvent } from "firebase/analytics";
import CCTitle from "../../../components/Antd/CCTitle";
import $ from "jquery";

const mocktestFilter = [
  {
    value: "all",
    key: "1",
    name: "All Mocktest",
  },
  {
    value: "pause",
    key: "2",
    name: "Paused",
  },

  {
    value: "start",
    key: "3",
    name: "Unattempted",
  },
  {
    value: "completed",
    key: "4",
    name: "Attempted",
  },
  {
    value: "upcoming",
    key: "5",
    name: "Upcoming",
  },
];

class MockTest extends Component {
  constructor() {
    super();
    this.state = {
      mocktest: [],
      selectedTag: "all",
      activeLoader: true,
      activePage: 1,
      totalRecords: 0,
      
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.props.dispatch(mocktestStatusUpdate(false, ""));
    this.getMocktestList("preference", this.props.extraParams);
    logEvent(analytics, "select_content", {
      page_title: "MockTest Details",
    });
    window.addEventListener('message', this.handleMessage);
  
  }

  componentWillReceiveProps(newProps) {
    if (newProps.extraParams !== null) {
      if (newProps.activeTabIndex.toString() === "11") {
        this.setState({ activeLoader: true, activePage: 1 }, () =>
          this.getMocktestList("preference", newProps.extraParams)
        );
      }
    }
  
  }

 componentWillUnmount() {
    window.removeEventListener('message', this.handleMessage);
}

  handleMessage = (event) => {
    if (event.data.type === 'navigateToResult' && event.data.isAPISubmit ) {
        const resultUrl = event.data.url;
        window.location.href = resultUrl;
       // this.props.navigate(resultUrl);
    }
};

  // Function to handle page change
  loadMore = () => {
    if (this.props.activeTabIndex.toString() === "11") {
      this.setState(
        (prev) => {
          return { activePage: prev.activePage + 1 };
        },
        () => this.getMocktestList("paginate", this.props.extraParams)
      );
    }
  };

  // Function to handle tag selection
  handleTagSelection = (e) => {
    this.setState(
      {
        [e.target.name]: e.target.value,
        activeLoader: true,
        mocktest: [],
        activePage: 1,
      },
      () => this.getMocktestList()
    );
  };

  // Function to get mock test list
  async getMocktestList(type, extraParams) {
    const courseId = this.props.courseId;
    const getMocktestData = Env.get(
      this.props.envendpoint +
        `mocktest/attempt/list?course_id[]=${courseId}&page=${
          this.state.activePage
        }${!extraParams ? "" : extraParams}&mock_test_status=${
          this.state.selectedTag
        }`
    );
    await getMocktestData.then(
      (response) => {
        const data = response.data.response.mock_test.data;
        this.setState({
          mocktest:
            type !== "paginate" ? data : this.state.mocktest.concat(data),
          activeLoader: false,
          totalRecords: response.data.response.mock_test.total,
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  // Function to navigate mock test
  triggedMockButton(event, status, id) {
    event.preventDefault();
    const { dispatch, current_course, courseId, navigate } = this.props;
    dispatch(mocktestStatusUpdate(false, ""));
    let parent_window = {};
    if (current_course.is_subscribed === 1) {
      switch (status) {
        case "start":
          dispatch(mocktestStatusUpdate(true, "start"));
          parent_window = window.open(
            `${process.env.PUBLIC_URL}/course-details/${courseId}/mocktest/${id}`,
            "_blank",
            `toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=${window.screen.width},height=${window.screen.height}`
          );
          parent_window.focus();
          parent_window.addEventListener(
            "unload",
            function (event) {
              if (parent_window.closed) {
                this.setState(
                  (prev) => {
                    return { activePage: 1 };
                  },
                  () =>
                    this.getMocktestList("preference", this.props.extraParams)
                );
              }

              $("#root").toggle();
            }.bind(this)
          );
           this.monitorChildWindow(parent_window);
          break;
        case "resume":
          dispatch(mocktestStatusUpdate(true, "resume"));
          dispatch(mocktestReattempt(false, ""));
          parent_window = window.open(
            `${process.env.PUBLIC_URL}/course-details/${courseId}/mocktest/${id}`,
            "_blank",
            `toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=${window.screen.width},height=${window.screen.height}`
          );
          parent_window.focus();
          parent_window.addEventListener(
            "unload",
            function (event) {
              if (parent_window.closed) {
                this.setState(
                  (prev) => {
                    return { activePage: 1 };
                  },
                  () =>
                    this.getMocktestList("preference", this.props.extraParams)
                );
              }

              $("#root").toggle();
            }.bind(this)
          );
          this.monitorChildWindow(parent_window);
          break;
        case "solution":
          dispatch(mocktestStatusUpdate(true, "solution"));
          dispatch(mocktestReattempt(false, ""));
          navigate(`/course-details/${courseId}/mocktest/${id}`);
          break;
        case "result":
          navigate(`/course-details/${courseId}/mocktest/${id}/result`);
          break;
        default:
          break;
      }
    } else {
      toast("Please subscribe to the course!");
    }
  }

  monitorChildWindow(childWindow) {
    const checkChildClosed = setInterval(() => {
      if (childWindow.closed) {
        clearInterval(checkChildClosed);
        // Notify the child window to handle leave
        window.postMessage('handleLeaveMocktest', '*');
        this.setState(
          (prev) => {
            return { activePage: 1 };
          },
          () =>
            this.getMocktestList("preference", this.props.extraParams)
        );
      
      }
    }, 1000); // Check every second if the child window is closed
  }
 
  getLanguageLabel = (item) => {
    const languageNames = item.languages
      ? item.languages.map((e) => e.name.toLowerCase())
      : [];

    if (languageNames.includes("english")) {
      if (languageNames.includes("hindi") && !languageNames.includes("tamil")) {
        return "English/Hindi";
      } else if (
        languageNames.includes("tamil") &&
        !languageNames.includes("hindi")
      ) {
        return "English/Tamil";
      } else if (
        languageNames.includes("tamil") &&
        languageNames.includes("hindi")
      ) {
        return "English/Tamil/Hindi";
      } else {
        return "English";
      }
    } else {
      if (languageNames.includes("hindi") && !languageNames.includes("tamil")) {
        return "Hindi";
      } else if (
        languageNames.includes("tamil") &&
        !languageNames.includes("hindi")
      ) {
        return "Tamil";
      } else if (
        languageNames.includes("tamil") &&
        languageNames.includes("hindi")
      ) {
        return "Tamil/Hindi";
      }
    }
    return "English";
  };

  render() {
    const { mocktest } = this.state;
    return (
      <div
        className="quiz-container"
        // style={{
        //   height:
        //     this.state.mocktest.length !== 0
        //       ? "auto"
        //       : this.state.mocktest.length === 0 && !this.state.activeLoader
        //       ? "100vh"
        //       : "140vh",
        // }}
        style={{ height: "auto" }}
      >
        <div className="course-modules-quiz-group-buttons">
          <Radio.Group
            defaultValue="2"
            onChange={this.handleTagSelection}
            value={this.state.selectedTag}
            name="selectedTag"
          >
            {mocktestFilter.map((item) => (
              <Radio.Button
                className="all-courses-quiz-toggle-buttons"
                value={item.value}
                key={item.key}
              >
                {item.name}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>
        {this.state.mocktest.length !== 0 && (
          <InfiniteScroll
            dataLength={this.state.mocktest.length}
            next={this.loadMore}
            hasMore={this.state.mocktest.length < this.state.totalRecords}
            loader={<Skeletons type={"course"} />}
            scrollableTarget="scrollableDiv"
          >
            <Row className="row">
              {mocktest.map((item, index) => (
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  lg={8}
                  xl={8}
                  xxl={8}
                  key={index}
                  className="column"
                >
                  <div className="main-container">
                    <Card className="card">
                      <div className="card-content">
                        {item.is_active === 2 ? (
                          <div className="all-courses-card-image-attempt-upcoming-content">
                            <div>
                              <img alt="upcoming" src={mocktest_upcoming} />
                              <div className="all-courses-card-image-upcoming-content">
                                upcoming
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={
                              item.is_attempted === 1
                                ? item.is_attempted === 2
                                  ? "all-courses-card-image-attempt-resume"
                                  : "all-courses-card-image-attempt-solution"
                                : item.is_attempted === 2
                                ? "all-courses-card-image-attempt-resume"
                                : "all-courses-card-image-attempt-start"
                            }
                          >
                            {item.is_attempted === 0 && (
                              <div
                                onClick={(e) =>
                                  this.triggedMockButton(e, "start", item.id)
                                }
                              >
                                <img alt="start" src={mock_start} />
                                <div className="all-courses-card-image-attempt-content">
                                  <span className="quiz-start-content-text">
                                    {CommonService.getMockCountandtime(item)}
                                  </span>
                                </div>
                              </div>
                            )}
                            {item.is_attempted === 1 && (
                              <div>
                                <img alt="Mock_complete" src={mock_complete} />
                                <div className="all-courses-card-image-attempt-content">
                                  <span className="quiz-attempted-content-text">
                                    {CommonService.getMockCountandtime(item)}
                                  </span>
                                </div>
                              </div>
                            )}
                            {item.is_attempted === 2 && (
                              <div
                                onClick={(e) =>
                                  this.triggedMockButton(e, "resume", item.id)
                                }
                              >
                                <img alt="resume" src={mock_resume} />
                                <div className="all-courses-card-image-attempt-content">
                                  <span className="quiz-resume-content-text">
                                    {CommonService.getMockCountandtime(item)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="body-content">
                          <div className="inner-content">
                            <Row align="center" className="nowrap-content">
                              <Col
                                xs={23}
                                sm={23}
                                md={23}
                                lg={23}
                                xl={23}
                                xxl={23}
                                className="column"
                              >
                                <CCTitle
                                  title={item.title}
                                  is_pin={item.is_pin}
                                />
                              </Col>
                              <Col
                                xs={1}
                                sm={1}
                                md={1}
                                lg={1}
                                xl={1}
                                xxl={1}
                                className="column"
                              >
                                {item.is_active === 2 ? null : (
                                  <CourseModulesMenu
                                    {...this.props}
                                    type="mocktest"
                                    id={item.id}
                                    is_favourite={item.is_favourite}
                                    course_id={item.course_id}
                                  />
                                )}
                              </Col>
                            </Row>
                          </div>
                          <div className="body-footer">
                            {item.is_active === 2 ? (
                              <Row className="nowrap-content">
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={9}
                                  lg={12}
                                  xl={10}
                                  xxl={9}
                                  className="column"
                                >
                                  <img
                                    src={language_label_upcoming}
                                    alt="language_label_upcoming"
                                    className="language-image"
                                  />
                                  <span className="image-label-upcoming">
                                    {item.title.toLowerCase().includes("hindi")
                                      ? "Hindi"
                                      : "English"}
                                  </span>
                                </Col>
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={7}
                                  lg={12}
                                  xl={6}
                                  xxl={9}
                                  className="column"
                                >
                                  <img
                                    src={attend_upcoming}
                                    alt="attend_upcoming"
                                    className="view-image"
                                  />
                                  <span className="image-label-upcoming">
                                    {CommonService.convertIntoKiloPrefix(
                                      item.attendees_count
                                    )}
                                  </span>
                                </Col>
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={8}
                                  lg={12}
                                  xl={8}
                                  xxl={6}
                                  className="column"
                                >
                                  <img
                                    src={validity_calendar_upcoming}
                                    alt="validity_calendar_upcoming"
                                    className="calendar-image"
                                  />
                                  <span className="image-label-upcoming">
                                    {moment(item.schedule_to_publish).format(
                                      "MMM DD"
                                    )}
                                  </span>
                                </Col>
                              </Row>
                            ) : (
                              <Row className="nowrap-content">
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={9}
                                  lg={12}
                                  xl={8}
                                  xxl={8}
                                  className="column"
                                >
                                  <img
                                    src={language_label}
                                    alt="language_label"
                                    className="language-image"
                                  />
                                  <Tooltip
                                    title={this.getLanguageLabel(item)}
                                    placement="bottom"
                                  >
                                    <span className="image-label">
                                      {this.getLanguageLabel(item)}
                                    </span>
                                  </Tooltip>
                                </Col>
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={7}
                                  lg={12}
                                  xl={8}
                                  xxl={8}
                                  className="column center-text"
                                >
                                  <img
                                    src={attend}
                                    alt="attend"
                                    className="view-image"
                                  />
                                  <span className="image-label">
                                    {CommonService.convertIntoKiloPrefix(
                                      item.attendees_count
                                    )}
                                  </span>
                                </Col>
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={8}
                                  lg={12}
                                  xl={8}
                                  xxl={8}
                                  className="column right-text"
                                >
                                  <img
                                    src={validity_calendar}
                                    alt="validity_calendar"
                                    className="calendar-image"
                                  />
                                  <span className="image-label">
                                    {moment(item.published_at).format("MMM DD")}
                                  </span>
                                </Col>
                              </Row>
                            )}
                          </div>
                          {item.is_active === 2 ? (
                            <div className="course-details-quiz-button-container">
                              <Button danger className="quiz-upcoming-button">
                                Live on{" "}
                                {moment(item.schedule_to_publish).format(
                                  "DD MMMM YYYY"
                                )}
                                <RightOutlined className="course-details-quiz-attempt-button-icon" />{" "}
                              </Button>
                            </div>
                          ) : (
                            <div className="course-details-quiz-button-container">
                              {item.is_attempted === 0 && (
                                <Button
                                  block
                                  type="ghost"
                                  className="quiz-attempt0-button"
                                  onClick={(e) =>
                                    this.triggedMockButton(e, "start", item.id)
                                  }
                                >
                                  Start MockTest{" "}
                                  <RightOutlined className="course-details-quiz-attempt-button-icon" />{" "}
                                </Button>
                              )}
                              {item.is_attempted === 2 && (
                                <Button
                                  block
                                  ghost
                                  className="quiz-attempt2-button"
                                  onClick={(e) =>
                                    this.triggedMockButton(e, "resume", item.id)
                                  }
                                >
                                  Resume{" "}
                                  <RightOutlined className="course-details-quiz-attempt-button-icon" />{" "}
                                </Button>
                              )}
                              {item.is_attempted === 1 && (
                                <Row gutter={[20, 20]}>
                                  <Col
                                    xs={24}
                                    sm={12}
                                    md={12}
                                    lg={12}
                                    xl={12}
                                    xxl={12}
                                  >
                                    <Button
                                      block
                                      ghost
                                      className="quiz-attempt1-solution-button"
                                      onClick={(e) =>
                                        this.triggedMockButton(
                                          e,
                                          "solution",
                                          item.id
                                        )
                                      }
                                    >
                                      Solution{" "}
                                      <RightOutlined className="course-details-quiz-attempt-button-icon" />{" "}
                                    </Button>
                                  </Col>
                                  <Col
                                    xs={24}
                                    sm={12}
                                    md={12}
                                    lg={12}
                                    xl={12}
                                    xxl={12}
                                  >
                                    <Button
                                      block
                                      ghost
                                      className="quiz-attempt1-solution-button"
                                      onClick={(e) =>
                                        this.triggedMockButton(
                                          e,
                                          "result",
                                          item.id
                                        )
                                      }
                                    >
                                      {" "}
                                      Analysis{" "}
                                      <RightOutlined className="course-details-quiz-attempt-button-icon" />{" "}
                                    </Button>
                                  </Col>
                                </Row>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                </Col>
              ))}
            </Row>
          </InfiniteScroll>
        )}

        <div>{this.state.activeLoader && <Skeletons type={"course"} />}</div>

        {this.state.activePage > 1 && <FloatButton.BackTop />}

        {this.state.activeLoader === false && mocktest.length === 0 && (
          <NoRecords />
        )}
      </div>
    );
  }
}

export default connect((state) => {
  return {
    preferences: state.preferences,
    mocktest_solution: state.mocktest_solution,
    current_course: state.current_course,
    envendpoint: state.envendpoint,
    isAPISubmitted: state.isAPISubmitted,
  };
})(MockTest);
