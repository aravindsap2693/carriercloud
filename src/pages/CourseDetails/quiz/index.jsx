import React, { Component } from "react";
import { Card, Radio, Row, Col, Button, FloatButton } from "antd";
import language_label from "../../../assets/svg-images/language-icon.svg";
import validity_calendar from "../../../assets/svg-images/calendar-icon.svg";
import attend from "../../../assets/svg-images/attempted-icon.svg";
import likes from "../../../assets/svg-images/like-icon.svg";
import quiz_start from "../../../assets/svg-images/quiz-start-new.svg";
import quiz_resume from "../../../assets/svg-images/quiz-resume-new.svg";
import quiz_complete from "../../../assets/svg-images/quiz-solution-new.svg";
import Env from "../../../utilities/services/Env";
import "../../../assets/css/quiz.css";
import QuizReportPopup from "../../../components/QuizReportPopup";
import moment from "moment";
import { RightOutlined } from "@ant-design/icons";
import NoRecords from "../../../components/NoRecords";
import CourseModulesMenu from "../../../components/CourseModulesMenu";
import { connect } from "react-redux";
import {
  quizReattempt,
  quizSolution,
  quizResume,
  quizStart,
  quizStartTimer,
} from "../../../reducers/action";
import { CommonService } from "../../../utilities/services/Common";
import { toast } from "react-toastify";
import $ from "jquery";
import InfiniteScroll from "react-infinite-scroll-component";
import Skeletons from "../../../components/SkeletonsComponent";
import { analytics } from "../../../firebase-config";
import { logEvent } from "firebase/analytics";
import CCTitle from "../../../components/Antd/CCTitle";

class Quiz extends Component {
  constructor() {
    super();
    this.state = {
      quizzes: [],
      selectedTag: "all",
      activeLoader: true,
      activePage: 1,
      totalRecords: 0,
    };
    this.handleTagChange = this.handleTagChange.bind(this);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.getQuizList("preference", this.props.extraParams);
    logEvent(analytics, "select_content", {
      page_title: "Quiz Details",
    });
  }

  loadMore = () => {
    if (this.props.activeTabIndex.toString() === "5") {
      this.setState(
        (prev) => {
          return { activePage: prev.activePage + 1 };
        },
        () => this.getQuizList("paginate", this.props.extraParams)
      );
    }
  };

  handleTagChange(e) {
    this.setState(
      {
        [e.target.name]: e.target.value,
        activeLoader: true,
        quizzes: [],
        activePage: 1,
      },
      () => this.getQuizList()
    );
  }

  componentWillReceiveProps(props) {
    if (props.extraParams !== null) {
      if (props.activeTabIndex.toString() === "5") {
        this.setState({ activeLoader: true, activePage: 1 }, () =>
          this.getQuizList("preference", props.extraParams)
        );
      }
    }
  }

  async getQuizList(type, extraParams) {
    const courseId = this.props.courseId;
    const getQuizData = Env.get(
      this.props.envendpoint +
        this.getDominantApi() +
        `?course_id[]=${courseId}&page=${this.state.activePage}${
          !extraParams ? "" : extraParams
        }`
    );
    await getQuizData.then(
      (response) => {
        const data = response.data.response.quizzes.data;
        this.setState({
          quizzes: type !== "paginate" ? data : this.state.quizzes.concat(data),
          activeLoader: false,
          totalRecords: response.data.response.quizzes.total,
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getDominantApi() {
    var tag = this.state.selectedTag;
    var api = "";
    switch (tag) {
      case "pause":
        api = "get/pause";
        break;
      case "completed":
        api = "get/completed";
        break;
      case "start":
        api = "get/start";
        break;
      default:
        api = "quiz";
        break;
    }
    return api;
  }

  triggedQuizButton(event, status, id) {
    event.preventDefault();
    this.props.dispatch(quizSolution(false));
    this.props.dispatch(quizReattempt(false, ""));
    this.props.dispatch(quizStart(false));
    this.props.dispatch(quizResume(false));
    this.props.dispatch(quizStartTimer(false));
    let parent_window = {};
    if (this.props.current_course.is_subscribed === 1) {
      switch (status) {
        case "start":
          this.props.dispatch(quizStart(true));
          parent_window = window.open(
            `${process.env.PUBLIC_URL}/course-details/${this.props.courseId}/quiz/${id}`,
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
                  () => this.getQuizList("preference", this.props.extraParams)
                );
              }
              $("#root").toggle();
            }.bind(this)
          );
          break;
        case "resume":
          this.props.dispatch(quizResume(true));
          parent_window = window.open(
            `${process.env.PUBLIC_URL}/course-details/${this.props.courseId}/quiz/${id}`,
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
                  () => this.getQuizList("preference", this.props.extraParams)
                );
              }
              $("#root").toggle();
            }.bind(this)
          );
          break;
        case "solution":
          this.props.dispatch(quizSolution(true));
          this.props.navigate(
            `/course-details/${this.props.courseId}/quiz/${id}`
          );
          break;
        case "result":
          this.props.navigate(
            `/course-details/${this.props.courseId}/quiz/${id}/result`
          );
          break;
        default:
          this.props.dispatch(quizStart(true));
          this.props.navigate(
            `/course-details/${this.props.courseId}/quiz/${id}`
          );
          break;
      }
    } else {
      toast("Please subscribe the course!");
    }
  }

  render() {
    const { quizzes } = this.state;

    return (
      <div
        className="quiz-container"
        style={{
          height:
            this.state.quizzes.length !== 0
              ? "auto"
              : this.state.quizzes.length === 0 && !this.state.activeLoader
              ? "100vh"
              : "140vh",
        }}
      >
        <div className="course-modules-quiz-group-buttons">
          <Radio.Group
            defaultValue="2"
            onChange={this.handleTagChange}
            value={this.state.selectedTag}
            name="selectedTag"
          >
            <Radio.Button
              className="all-courses-quiz-toggle-buttons"
              value="all"
              key="1"
            >
              All Quizzes
            </Radio.Button>
            <Radio.Button
              className="all-courses-quiz-toggle-buttons"
              value="pause"
              key="2"
            >
              Paused
            </Radio.Button>
            <Radio.Button
              className="all-courses-quiz-toggle-buttons"
              value="start"
              key="3"
            >
              Unattempted
            </Radio.Button>
            <Radio.Button
              className="all-courses-quiz-toggle-buttons"
              value="completed"
              key="4"
            >
              Attempted
            </Radio.Button>
          </Radio.Group>
        </div>
        {this.state.quizzes.length !== 0 && (
          <InfiniteScroll
            dataLength={this.state.quizzes.length}
            next={this.loadMore}
            hasMore={this.state.quizzes.length < this.state.totalRecords}
            loader={<Skeletons type={"course"} />}
            scrollableTarget="scrollableDiv"
          >
            <Row className="row">
              {quizzes.map((item, index) => (
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
                                  src={language_label}
                                  alt="language_label"
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
                                  src={likes}
                                  alt="likes"
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
                                  src={attend}
                                  alt="attend"
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
                                  src={validity_calendar}
                                  alt="validity_calendar"
                                  className="calendar-image"
                                />
                                <span className="image-label">
                                  {moment(item.published_at).format(
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
                                {" "}
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
                                {" "}
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
                                    {" "}
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
                                    {" "}
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
                </Col>
              ))}
            </Row>
          </InfiniteScroll>
        )}

        <div>{this.state.activeLoader && <Skeletons type={"course"} />}</div>

        {this.state.activePage > 1 && <FloatButton.BackTop />}

        {this.state.activeLoader === false && quizzes.length === 0 && (
          <NoRecords />
        )}

        <QuizReportPopup
          ref={(instance) => {
            this.reportPopup = instance;
          }}
          {...this.props}
        />
      </div>
    );
  }
}

export default connect((state) => {
  return {
    preferences: state.preferences,
    quiz_solution: state.quiz_solution,
    current_course: state.current_course,
    envendpoint: state.envendpoint,
  };
})(Quiz);
