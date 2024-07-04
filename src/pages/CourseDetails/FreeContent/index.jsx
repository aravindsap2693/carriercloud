import React, { Component } from "react";
import "../../../assets/css/common.css";
import { Row, Col, Button, Card, FloatButton, Typography, Tooltip } from "antd";
import Env from "../../../utilities/services/Env";
import language_label from "../../../assets/svg-images/language-icon.svg";
import quiz_start from "../../../assets/svg-images/quiz-start-new.svg";
import { RightOutlined } from "@ant-design/icons";
import validity_calendar from "../../../assets/svg-images/calendar-icon.svg";
import views from "../../../assets/svg-images/attempted-icon.svg";
import attend from "../../../assets/svg-images/attempted-icon.svg";
import likes from "../../../assets/svg-images/like-icon.svg";
import quiz_resume from "../../../assets/svg-images/quiz-resume-new.svg";
import quiz_complete from "../../../assets/svg-images/quiz-solution-new.svg";
import language_image from "../../../assets/svg-images/language-icon.svg";
import CourseModulesMenu from "../../../components/CourseModulesMenu";
import QuizSharePopup from "../../../components/QuizSharePopup";
import { CommonService } from "../../../utilities/services/Common";
import {
  currentPageRouting,
  currentTabIndex,
  disablePreference,
  quizReattempt,
  quizResume,
  quizSolution,
  quizStart,
  quizStartTimer,
} from "../../../reducers/action";
import NoRecords from "../../../components/NoRecords";
import { connect } from "react-redux";
import GeneralPopup from "../../../components/GeneralPopup";
import "../../../assets/css/home-feed.css";
import $ from "jquery";
import InfiniteScroll from "react-infinite-scroll-component";
import Skeletons from "../../../components/SkeletonsComponent";
import { analytics } from "../../../firebase-config";
import { logEvent } from "firebase/analytics";

const { Text } = Typography;

class FreeContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      freeContent: [],
      totalNotes: 0,
      activeLoader: true,
      activePage: 1,
      catergoryId: props.preferences.id,
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.props.dispatch(disablePreference(false), currentPageRouting(null));
    this.getFreeContent("preference", this.props.extraParams);
    logEvent(analytics, "select_content", {
      page_title: "Free Content",
    });
  }

  componentWillReceiveProps(props) {
    if (props.extraParams !== null) {
      if (props.activeTabIndex === "10") {
        this.setState({ activeLoader: true, activePage: 1 }, () =>
          this.getFreeContent("preference", props.extraParams)
        );
      }
    }
  }

  urlDecode(url) {
    return url.replace("watch?v=", "embed/");
  }

  async getFreeContent(type, extraParams) {
    const courseId = this.props.match.params.id;
    const getData = Env.get(
      this.props.envendpoint +
        `get_freecontent/free_contents?course_id=${courseId}&page=${
          this.state.activePage
        }${!extraParams ? "" : extraParams}`
    );
    await getData.then(
      (response) => {
        const data = response.data.response.freeContent.data;
        setTimeout(() => {
          this.setState({
            freeContent:
              type !== "paginate" ? data : this.state.freeContent.concat(data),
            totalNotes: response.data.response.freeContent.total,
            activeLoader: false,
          });
        }, 1500);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  triggedQuizButton(event, status, id) {
    event.preventDefault();
    this.props.dispatch(quizSolution(false));
    this.props.dispatch(quizReattempt(false, ""));
    this.props.dispatch(quizStart(false));
    this.props.dispatch(quizResume(false));
    this.props.dispatch(quizStartTimer(false));
    let parent_window = {};
    switch (status) {
      case "start":
        this.props.dispatch(quizStart(true));
        parent_window = window.open(
          `${process.env.PUBLIC_URL}/course-details/${this.props.courses.id}/quiz/${id}`,
          "_blank",
          `toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=${window.screen.width},height=${window.screen.height}`
        );
        parent_window.focus();
        parent_window.addEventListener(
          "unload",
          function (event) {
            if (parent_window.closed) {
              this.setState({ activeLoader: true, activePage: 1 }, () =>
                this.getFreeContent("preference", this.props.extraParams)
              );
            }
            $("#root").toggle();
          }.bind(this)
        );
        break;
      case "resume":
        this.props.dispatch(quizResume(true));
        parent_window = window.open(
          `${process.env.PUBLIC_URL}/course-details/${this.props.courses.id}/quiz/${id}`,
          "_blank",
          `toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=${window.screen.width},height=${window.screen.height}`
        );
        parent_window.focus();
        parent_window.addEventListener(
          "unload",
          function (event) {
            if (parent_window.closed) {
              this.setState({ activeLoader: true, activePage: 1 }, () =>
                this.getFreeContent("preference", this.props.extraParams)
              );
            }
            $("#root").toggle();
          }.bind(this)
        );
        break;
      case "solution":
        this.props.dispatch(quizSolution(true));
        this.props.navigate(
          `/course-details/${this.props.courses.id}/quiz/${id}`
        );
        break;
      case "result":
        this.props.navigate(
          `/course-details/${this.props.courses.id}/quiz/${id}/result`
        );
        break;
      default:
        this.props.dispatch(quizStart(true));
        this.props.navigate(
          `/course-details/${this.props.courses.id}/quiz/${id}`
        );
        break;
    }
  }

  loadMore = () => {
    if (this.props.activeTabIndex.toString() === "10") {
      this.setState(
        (prev) => {
          return { activePage: prev.activePage + 1 };
        },
        () => this.getFreeContent("paginate")
      );
    }
  };

  detailPageRedirection(props, type, item) {
    CommonService.contentRedirectionFunction(props, type, item);
  }

  render() {
    return (
      <div
        style={{
          // height: this.state.freeContent.length !== 0 ? "auto" : "100vh",
          margin: "10px",
        }}
      >
        {this.state.freeContent.length > 0 ? (
          <InfiniteScroll
            dataLength={this.state.freeContent.length}
            next={this.loadMore}
            hasMore={this.state.freeContent.length < this.state.totalNotes}
            loader={<Skeletons type={"course"} />}
            scrollableTarget="scrollableDiv"
          >
            <Row className="row video-container-row">
              {this.state.freeContent.map((item, index) => (
                <Col
                  key={index}
                  xs={24}
                  sm={24}
                  md={12}
                  lg={8}
                  xl={8}
                  xxl={8}
                  className={
                    item.content_type === "Video"
                      ? "video-container-column"
                      : "column"
                  }
                >
                  {item.content_type === "ebook" ? (
                    <div className="ebook-main-container">
                      <Card className="card">
                        <div className="card-content">
                          <div
                            onClick={() =>
                              this.detailPageRedirection(
                                this.props,

                                "Ebook",
                                item
                              )
                            }
                            className="image-container"
                          >
                            <div className="content">
                              <img
                                alt="ebook"
                                src={
                                  Env.getImageUrl(
                                    `${this.props.envupdate.react_app_assets_url}course/ebook`
                                  ) + item.image
                                }
                                className="image1"
                              />
                            </div>
                            <img
                              alt="ebook"
                              src={
                                Env.getImageUrl(
                                  `${this.props.envupdate.react_app_assets_url}course/ebook`
                                ) + item.image
                              }
                              className="image2"
                            />
                          </div>
                          <div className="body-content">
                            <div className="inner-content">
                              <Row align="middle" className="nowrap-content">
                                <Col
                                  xs={23}
                                  sm={23}
                                  md={23}
                                  lg={23}
                                  xl={23}
                                  xxl={23}
                                  className="column"
                                >
                                  <Tooltip
                                    title={item.title}
                                    placement="bottom"
                                  >
                                    <Text className="title">{item.title}</Text>
                                  </Tooltip>
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
                                  <CourseModulesMenu
                                    {...this.props}
                                    type="ebook"
                                    id={item.id}
                                    is_favourite={item.is_favourite}
                                    course_id={item.course_id}
                                  />
                                </Col>
                              </Row>
                            </div>
                            <div className="body-footer">
                              <Row className="nowrap-content">
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={6}
                                  lg={12}
                                  xl={7}
                                  xxl={7}
                                  className="column"
                                >
                                  <img
                                    src={language_image}
                                    alt="language_image"
                                    className="language-image"
                                  />
                                  <span className="image-label">English</span>
                                </Col>
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={6}
                                  lg={12}
                                  xl={5}
                                  xxl={5}
                                  className="column"
                                >
                                  <img
                                    alt="likes"
                                    src={likes}
                                    className="like-image"
                                  />
                                  <span className="image-label">
                                    {CommonService.convertIntoKiloPrefix(
                                      item.total_votes
                                    )}
                                  </span>
                                </Col>
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={6}
                                  lg={12}
                                  xl={5}
                                  xxl={5}
                                  className="column"
                                >
                                  <img
                                    alt="views"
                                    src={views}
                                    className="view-image"
                                  />
                                  <span className="image-label">
                                    {CommonService.convertIntoKiloPrefix(
                                      item.total_views
                                    )}
                                  </span>
                                </Col>
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={6}
                                  lg={12}
                                  xl={7}
                                  xxl={7}
                                  className="column"
                                >
                                  <img
                                    alt="validity_calendar"
                                    src={validity_calendar}
                                    className="calendar-image"
                                  />
                                  <span className="image-label">
                                    {CommonService.getDate(
                                      item.published_at,
                                      "MMM DD YYYY"
                                    )}
                                  </span>
                                </Col>
                              </Row>
                            </div>
                            <div>
                              <Button
                                block
                                type="ghost"
                                className="card-view-button"
                                onClick={() =>
                                  this.detailPageRedirection(
                                    this.props,

                                    "Ebook",
                                    item
                                  )
                                }
                              >
                                VIEW {">"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ) : item.content_type === "video" ? (
                    <div className="video-main-container">
                      <Card className="video-card">
                        <div className="video-card-content">
                          <div className="video-card-inner-content">
                            <span
                              onClick={() =>
                                this.detailPageRedirection(
                                  this.props,

                                  "Video",
                                  item
                                )
                              }
                              className="video-iframe-span"
                            >
                              <iframe
                                src={this.urlDecode(item.video_url)}
                                frameborder="0"
                                title="video"
                                className="video-iframe"
                              />
                              <div className="video-overlay"></div>
                            </span>
                          </div>
                          <div className="video-body-content">
                            <div className="video-body-inner-content">
                              <Row className="video-body-content-row">
                                <Col
                                  xs={23}
                                  sm={23}
                                  md={23}
                                  lg={23}
                                  xl={23}
                                  xxl={23}
                                  className="video-title-column"
                                >
                                  <Tooltip
                                    title={item.title}
                                    placement="bottom"
                                  >
                                    <Text className="video-title">
                                      {item.title}
                                    </Text>
                                  </Tooltip>
                                </Col>
                                <Col
                                  xs={1}
                                  sm={1}
                                  md={1}
                                  lg={1}
                                  xl={1}
                                  xxl={1}
                                  className="video-menu-column"
                                >
                                  <CourseModulesMenu
                                    {...this.props}
                                    type="video"
                                    id={item.id}
                                    course_id={item.course_id}
                                    is_favourite={item.is_favourite}
                                  />
                                </Col>
                              </Row>
                            </div>
                            <div className="video-actions">
                              <Row className="video-actions-row">
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={6}
                                  lg={12}
                                  xl={7}
                                  xxl={7}
                                  className="video-language-column"
                                >
                                  <img
                                    alt="language_image"
                                    src={language_image}
                                    className="video-language-image"
                                  />
                                  <span className="video-language-text">
                                    English
                                  </span>
                                </Col>
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={6}
                                  lg={12}
                                  xl={5}
                                  xxl={5}
                                  className="video-votes-column"
                                >
                                  <img
                                    src={likes}
                                    alt="likes"
                                    className="video-votes-image"
                                  />
                                  <span className="video-votes-value">
                                    {CommonService.convertIntoKiloPrefix(
                                      item.total_votes
                                    )}
                                  </span>
                                </Col>
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={6}
                                  lg={12}
                                  xl={5}
                                  xxl={5}
                                  className="video-view-column"
                                >
                                  <img
                                    src={views}
                                    alt="views"
                                    className="video-view-image"
                                  />
                                  <span className="video-view-value">
                                    {CommonService.convertIntoKiloPrefix(
                                      item.total_views
                                    )}
                                  </span>
                                </Col>
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={6}
                                  lg={12}
                                  xl={7}
                                  xxl={7}
                                  className="video-valitity-column"
                                >
                                  <img
                                    alt="validity_calendar"
                                    src={validity_calendar}
                                    className="video-calendar-image"
                                  />
                                  <span className="video-validity-date">
                                    {CommonService.getDate(
                                      item.published_at,
                                      "MMM DD YYYY"
                                    )}
                                  </span>
                                </Col>
                              </Row>
                            </div>
                            <div>
                              <Button
                                block
                                type="ghost"
                                className="card-view-button"
                                onClick={() =>
                                  this.detailPageRedirection(
                                    this.props,
                                    "Video",
                                    item
                                  )
                                }
                              >
                                VIEW {">"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ) : item.content_type === "quiz" ? (
                    <div className="quiz-main-container">
                      <Card className="card">
                        <div className="card-content">
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
                                  this.triggedQuizButton(e, "start", item.id)
                                }
                              >
                                <img alt="quiz_start" src={quiz_start} />
                                <div className="all-courses-card-image-attempt-content">
                                  <span className="quiz-start-content-text">
                                    {item.questions_count} - Question &{" "}
                                    {item.time_duration_in_seconds / 60} mins
                                  </span>
                                </div>
                              </div>
                            )}
                            {item.is_attempted === 1 && (
                              <div>
                                <img alt="quiz_complete" src={quiz_complete} />
                                <div className="all-courses-card-image-attempt-content">
                                  <span className="quiz-attempted-content-text">
                                    {item.questions_count} - Question &{" "}
                                    {item.time_duration_in_seconds / 60} mins
                                  </span>
                                </div>
                              </div>
                            )}
                            {item.is_attempted === 2 && (
                              <div
                                onClick={(e) =>
                                  this.triggedQuizButton(e, "resume", item.id)
                                }
                              >
                                <img alt="quiz_resume" src={quiz_resume} />
                                <div className="all-courses-card-image-attempt-content">
                                  <span className="quiz-resume-content-text">
                                    {item.questions_count} - Question &{" "}
                                    {item.time_duration_in_seconds / 60} mins
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
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
                                  <Tooltip
                                    title={item.title}
                                    placement="bottom"
                                  >
                                    <p className="title">{item.title}</p>
                                  </Tooltip>
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
                                  <CourseModulesMenu
                                    {...this.props}
                                    type="quiz"
                                    id={item.id}
                                    is_favourite={item.is_favourite}
                                    course_id={item.course_id}
                                  />
                                </Col>
                              </Row>
                            </div>
                            <div className="body-footer">
                              <Row className="nowrap-content">
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={6}
                                  lg={12}
                                  xl={7}
                                  xxl={7}
                                  className="column"
                                >
                                  <img
                                    alt="language_label"
                                    src={language_label}
                                    className="language-image"
                                  />
                                  <span className="image-label">
                                    {item.title.toLowerCase().includes("hindi")
                                      ? "Hindi"
                                      : "English"}
                                  </span>
                                </Col>
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={6}
                                  lg={12}
                                  xl={5}
                                  xxl={5}
                                  className="column"
                                >
                                  <img
                                    alt="likes"
                                    src={likes}
                                    className="like-image"
                                  />
                                  <span className="image-label">
                                    {item.total_votes}
                                  </span>
                                </Col>
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={6}
                                  lg={12}
                                  xl={5}
                                  xxl={5}
                                  className="column"
                                >
                                  <img
                                    alt="attend"
                                    src={attend}
                                    className="view-image"
                                  />
                                  <span className="image-label">
                                    {CommonService.convertIntoKiloPrefix(
                                      item.quiz_records_count
                                    )}
                                  </span>
                                </Col>
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={6}
                                  lg={12}
                                  xl={7}
                                  xxl={7}
                                  className="column"
                                >
                                  <img
                                    alt="validity_calendar"
                                    src={validity_calendar}
                                    className="calendar-image"
                                  />
                                  <span className="image-label">
                                    {CommonService.getDate(
                                      item.published_at,
                                      "MMM DD YYYY"
                                    )}
                                  </span>
                                </Col>
                              </Row>
                            </div>
                            <div className="course-details-quiz-button-container">
                              {item.is_attempted === 0 && (
                                <Button
                                  block
                                  type="ghost"
                                  className="quiz-attempt0-button"
                                  onClick={(e) =>
                                    this.triggedQuizButton(e, "start", item.id)
                                  }
                                >
                                  Start Quiz{" "}
                                  <RightOutlined className="course-details-quiz-attempt-button-icon" />{" "}
                                </Button>
                              )}
                              {item.is_attempted === 2 && (
                                <Button
                                  block
                                  ghost
                                  className="quiz-attempt2-button"
                                  onClick={(e) =>
                                    this.triggedQuizButton(e, "resume", item.id)
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
                                        this.triggedQuizButton(
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
                                        this.triggedQuizButton(
                                          e,
                                          "result",
                                          item.id
                                        )
                                      }
                                    >
                                      Analysis{" "}
                                      <RightOutlined className="course-details-quiz-attempt-button-icon" />{" "}
                                    </Button>
                                  </Col>
                                </Row>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ) : (
                    <div className="article-main-container">
                      <Card className="card">
                        <div className="card-content">
                          <div className="image-container">
                            <span
                              onClick={() =>
                                this.detailPageRedirection(
                                  this.props,
                                  "Article",
                                  item
                                )
                              }
                              className="content"
                            >
                              <img
                                alt="article_image"
                                src={
                                  Env.getImageUrl(
                                    `${this.props.envupdate.react_app_assets_url}course/article`
                                  ) + item.article_image
                                }
                                className="image1"
                              />
                            </span>
                          </div>
                          <div className="body-content">
                            <div className="inner-content">
                              <Row align="middle" className="nowrap-content">
                                <Col
                                  xs={23}
                                  sm={23}
                                  md={23}
                                  lg={23}
                                  xl={23}
                                  xxl={23}
                                  className="column"
                                >
                                  <Tooltip
                                    title={item.title}
                                    placement="bottom"
                                  >
                                    <Text className="title">{item.title}</Text>
                                  </Tooltip>
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
                                  <CourseModulesMenu
                                    {...this.props}
                                    type="article"
                                    id={item.id}
                                    is_favourite={item.is_favourite}
                                    course_id={item.course_id}
                                  />
                                </Col>
                              </Row>
                            </div>
                            <div className="body-footer">
                              <Row className="nowrap-content">
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={6}
                                  lg={12}
                                  xl={7}
                                  xxl={7}
                                  className="column"
                                >
                                  <img
                                    alt="language_label"
                                    src={language_label}
                                    className="language-image"
                                  />
                                  <span className="image-label">English</span>
                                </Col>
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={6}
                                  lg={12}
                                  xl={5}
                                  xxl={5}
                                  className="column"
                                >
                                  <img
                                    alt="likes"
                                    src={likes}
                                    className="like-image"
                                  />
                                  <span className="image-label">
                                    {CommonService.convertIntoKiloPrefix(
                                      item.total_votes
                                    )}
                                  </span>
                                </Col>
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={6}
                                  lg={12}
                                  xl={5}
                                  xxl={5}
                                  className="column"
                                >
                                  <img
                                    alt="views"
                                    src={views}
                                    className="view-image"
                                  />
                                  <span className="image-label">
                                    {CommonService.convertIntoKiloPrefix(
                                      item.total_views
                                    )}
                                  </span>
                                </Col>
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={6}
                                  lg={12}
                                  xl={7}
                                  xxl={7}
                                  className="column"
                                >
                                  <img
                                    alt="validity_calendar"
                                    src={validity_calendar}
                                    className="calendar-image"
                                  />
                                  <span className="image-label">
                                    {CommonService.getDate(
                                      item.published_at,
                                      "MMM DD YYYY"
                                    )}
                                  </span>
                                </Col>
                              </Row>
                            </div>
                            <div>
                              <Button
                                block
                                type="ghost"
                                className="card-view-button"
                                onClick={() =>
                                  this.detailPageRedirection(
                                    this.props,
                                    "Article",
                                    item
                                  )
                                }
                              >
                                VIEW {">"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}
                </Col>
              ))}
            </Row>
          </InfiniteScroll>
        ) : this.state.activeLoader ? (
          <Skeletons type={"course"} />
        ) : (
          this.state.freeContent.length === 0 && <NoRecords />
        )}

        {this.state.activePage > 1 && <FloatButton.BackTop />}

        <QuizSharePopup
          ref={(instance) => {
            this.quizSharePopup = instance;
          }}
        />
        <GeneralPopup
          ref={(instance) => {
            this.generalPopup = instance;
          }}
        />
      </div>
    );
  }
}

export default connect((state) => {
  return {
    preferences: state.preferences,
    envupdate: state.envupdate,
    envendpoint: state.envendpoint,
    current_course: state.current_course,
  };
})(FreeContent);
