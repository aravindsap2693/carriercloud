import React, { Component } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Divider,
  Progress,
  Collapse,
  List,
  Spin,
  Breadcrumb,
} from "antd";
import collpase_minus from "../../../assets/svg-icons/collapse-minus.svg";
import collpase_add from "../../../assets/svg-icons/collapse-add.svg";
import "../../../assets/css/quiz-result.css";
import Env from "../../../utilities/services/Env";
import NoRecords from "../../../components/NoRecords";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import {
  quizReattempt,
  quizResume,
  quizSolution,
  quizStart,
  quizStartTimer,
} from "../../../reducers/action";
import _ from "lodash";
import rank from "../../../assets/svg-icons/rank.svg";
import mark_scored from "../../../assets/svg-icons/mark-scored.svg";
import average_score from "../../../assets/svg-icons/average-score.svg";
import high_score from "../../../assets/svg-icons/high-score.svg";
import spent_time from "../../../assets/svg-icons/spent-time.svg";
import quiz_correct from "../../../assets/svg-icons/result-correct.svg";
import quiz_wrong from "../../../assets/svg-icons/result-wrong.svg";
import quiz_info from "../../../assets/svg-icons/result-info.svg";
import {
  ArrowLeftOutlined,
  ExpandOutlined,
  CompressOutlined,
} from "@ant-design/icons";
import { CommonService } from "../../../utilities/services/Common";
import { toast } from "react-toastify";
import CommentsComponent from "../../../components/courseActions/CommentsComponent";
import QuizSharePopup from "../../../components/QuizSharePopup";
import liked from "../../../assets/svg-icons/home-liked.svg";
import chat from "../../../assets/svg-icons/home-comment.svg";
import share from "../../../assets/svg-icons/share.svg";
import article_author from "../../../assets/svg-icons/article-author.svg";
import moment from "moment";
import like from "../../../assets/svg-icons/home-like.svg";
import $ from "jquery";
import { analytics } from "../../../firebase-config";
import { logEvent } from "firebase/analytics";

const { Text } = Typography;
const { Panel } = Collapse;

class QuizResult extends Component {
  constructor() {
    super();
    this.state = {
      results: [],
      activeLoader: true,
      topicsAnalysis: [],
      totalMarks: 0,
      markObtained: 0,
      attendeesCount: 0,
      rank: 0,
      averageScore: 0,
      unAttemptedCount: 0,
      showfullscreen: true,
      visible: 5,
      isLiked: false,
      active_Show_more: false,
    };
    this.myscroll = React.createRef();
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.props.dispatch(quizSolution(false));
    this.props.dispatch(quizReattempt(false, ""));
    this.props.dispatch(quizStart(false));
    this.props.dispatch(quizResume(false));
    this.props.dispatch(quizStartTimer(false));
    setTimeout(() => {
      this.getQuizResults();
    }, 1000);
    logEvent(analytics, "select_content", {
      page_title: "Quiz Result",
    });
  }

  getQuizResults() {
    const quizId = this.props.match.params.quiz_id;
    const topicsData = [];
    let topics = [];
    const resultQuizData = Env.get(
      this.props.envendpoint + `quiz/resultweb/${quizId}`
    );
    resultQuizData.then(
      (response) => {
        const data = response.data.response.user_results;
        topics = _.uniqBy(data.topic_analysis, "subject");

        topics.forEach((element, index) => {
          let contents = [];
          data.topic_analysis.forEach((newElement, newIndex) => {
            let initialValue = 0;
            if (element.subject === newElement.subject) {
              contents.push({
                topic: newElement.topic,
                total_questions: newElement.total_questions,
                right_ans: newElement.right_ans,
                rightCount: newElement.right_ans + initialValue,
              });
            }
          });

          topicsData.push({
            title: element.subject,
            content: contents,
          });
        });
        this.setState({
          results: data,
          activeLoader: false,
          topicsAnalysis: topicsData,
          totalMarks: data.total_mark,
          markObtained: data.total_mark_obtained,
          total_topics: data.question_count,
          unAttemptedCount:
            data.quiz.questions_count -
            (data.correctly_answered_question_count +
              data.wrognly_answered_qustion_count),
          attendeesCount: data.attendees_count,
          rank: data.rank,
          averageScore: data.average_score,
          isLiked: response.data.response.user_results.quiz.is_upvote === 1,
        });
      },
      (error) => {
        CommonService.hendleError(error, this.props);
      }
    );
  }

  toggleFullScreen() {
    if (
      (document.fullScreenElement && document.fullScreenElement !== null) ||
      (!document.mozFullScreen && !document.webkitIsFullScreen)
    ) {
      if (document.documentElement.requestFullScreen) {
        document.documentElement.requestFullScreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullScreen) {
        document.documentElement.webkitRequestFullScreen(
          Element.ALLOW_KEYBOARD_INPUT
        );
      }
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
  }

  getTotalTopics(data) {
    let initialValue = 0;
    data.forEach((element) => {
      initialValue = element.total_questions + initialValue;
    });
    return initialValue;
  }

  getRightTopics(data) {
    let initialValue = 0;
    data.forEach((element) => {
      initialValue = element.rightCount + initialValue;
    });
    return initialValue;
  }

  handleLike = (isLiked) => {
    const quizid = this.props.match.params.quiz_id;
    const requestBody = {
      vote_type: "quiz",
      vote_type_id: quizid,
    };
    let results = this.state.results;
    results.quiz.total_votes = !isLiked
      ? results.quiz.total_votes + 1
      : results.quiz.total_votes - 1;
    this.setState({ isLiked: !isLiked, results: results });
    toast(!isLiked ? "Liked !" : "Unliked !");

    const likeData = Env.post(this.props.envendpoint + `votes`, requestBody);
    likeData.then(
      (response) => {
        // toast(!isLiked ? "Liked !" : "Unliked !");
        // this.getQuizResults();
      },
      (error) => {
        console.error(error);
      }
    );
  };

  handleChatIcon = () => {
    $("html, body").animate({
      scrollTop: $("#comments-block").position().top,
    });
  };

  render() {
    return (
      <div>
        {this.state.activeLoader === false ? (
          <div className="quiz-result-main">
            <div className="breadcrumb-container">
              <div
                style={{
                  display: "flex",
                  flexDirtion: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Breadcrumb
                  className="breadcrumb"
                  separator=""
                  onClick={() => this.props.navigate(-1)}
                  items={[
                    {
                      className: "link",
                      type: "separator",
                      separator: (
                        <ArrowLeftOutlined style={{ paddingRight: "5px" }} />
                      ),
                    },
                    {
                      title: "Back to Quiz",
                    },
                  ]}
                />
                {this.state.showfullscreen === true ? (
                  <ExpandOutlined
                    style={{
                      padding: "15px",
                      background: "#e4e5e7",
                      borderRadius: "90px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      this.setState({ showfullscreen: false });
                      this.toggleFullScreen();
                    }}
                  />
                ) : (
                  <CompressOutlined
                    style={{
                      padding: "15px",
                      background: "#e4e5e7",
                      borderRadius: "90px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      this.setState({ showfullscreen: true });
                      this.toggleFullScreen();
                    }}
                  />
                )}
              </div>
            </div>

            <div>
              <Row className="row" gutter={[30]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                  <div className="body-content">
                    <div className="main-layout">
                      <div className="inner-layout">
                        {this.state.activeLoader === false ? (
                          <div className="header">
                            <div className="title">
                              <Text className="text">
                                {this.state.results.quiz.title}
                              </Text>
                              <div className="title-secondline">
                                <div className="author">
                                  <Text className="text">Senthil Kumar</Text>
                                  <span className="image-span">
                                    <img
                                      src={article_author}
                                      alt="article_author"
                                      className="image"
                                    />
                                  </span>
                                  <span
                                    className="text"
                                    style={{ color: "#0B649D" }}
                                  >
                                    {moment(
                                      this.state.results.quiz.published_at
                                    ).format("MMMM DD YYYY")}
                                  </span>
                                </div>
                                <div style={{ flex: 1, textAlign: "end" }}>
                                  <div className="actionbar">
                                    <div className="actionbar-icons">
                                      {!this.state.isLiked ? (
                                        <img
                                          src={like}
                                          onClick={() =>
                                            this.handleLike(this.state.isLiked)
                                          }
                                          className="unlike"
                                          alt="like"
                                        />
                                      ) : (
                                        <img
                                          src={liked}
                                          onClick={() =>
                                            this.handleLike(this.state.isLiked)
                                          }
                                          className="like"
                                          alt="like"
                                        />
                                      )}
                                      <span
                                        style={{
                                          padding: "0px 10px",
                                          fontSize: "15px",
                                        }}
                                      >
                                        {this.state.results.quiz.total_votes}
                                        {"  "} Like
                                      </span>
                                    </div>
                                    <div className="actionbar-icons">
                                      <img
                                        src={chat}
                                        alt="chat"
                                        className="chat"
                                        id="comments-icon"
                                        onClick={() => this.handleChatIcon()}
                                      />
                                      <span
                                        style={{
                                          padding: "0px 10px",
                                          fontSize: "15px",
                                        }}
                                      >
                                        {this.state.results.quiz.total_comments}{" "}
                                        {"  "}
                                        Comment
                                      </span>
                                    </div>
                                    <div className="actionbar-icons">
                                      <img
                                        className="share"
                                        src={share}
                                        onClick={() =>
                                          this.quizSharePopup.showModal()
                                        }
                                        alt="share"
                                      />
                                      <span
                                        style={{
                                          padding: "0px 10px",
                                          fontSize: "15px",
                                        }}
                                      >
                                        {"  "} Share
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Spin className="app-spinner" size="large" />
                        )}
                      </div>

                      <QuizSharePopup
                        ref={(instance) => {
                          this.quizSharePopup = instance;
                        }}
                      />
                    </div>
                    <div
                      className="quiz-analysis-inner-content"
                      style={{ marginTop: "20px" }}
                    >
                      {report.map((item, index) => (
                        <div
                          className={
                            index === 0
                              ? "quiz-analysis-card-initial-container"
                              : index === 5
                              ? "quiz-analysis-card-final-container"
                              : "quiz-analysis-card-container"
                          }
                          key={index}
                        >
                          <Card className="quiz-analysis-card">
                            <div className="quiz-analysis-card-content">
                              <div className="quiz-analysis-card-image-block">
                                <img
                                  src={item.image}
                                  style={{
                                    background: item.color,
                                  }}
                                  alt="quiz"
                                  className="quiz-analysis-card-image"
                                />
                              </div>
                              <div className="quiz-analysis-card-text-block">
                                <div className="quiz-analysis-card-text">
                                  {item.label === "Rank" && (
                                    <span>
                                      {this.state.rank}
                                      <span className="quiz-analysis-text-bold">
                                        {" "}
                                        /{" "}
                                        {CommonService.convertIntoKiloPrefix(
                                          this.state.attendeesCount
                                        )}
                                      </span>
                                    </span>
                                  )}
                                  {item.label === "Mark Scored" && (
                                    <span>
                                      {this.state.results.total_mark_obtained}
                                      <span className="quiz-analysis-text-bold">
                                        {" "}
                                        / {this.state.results.total_mark}
                                      </span>
                                    </span>
                                  )}
                                  {item.label === "Average Score" && (
                                    <span>
                                      {this.state.averageScore}
                                      <span className="quiz-analysis-text-bold">
                                        {" "}
                                        / {this.state.results.total_mark}
                                      </span>
                                    </span>
                                  )}
                                  {item.label === "Highest Score" && (
                                    <span>
                                      {Math.round(
                                        this.state.results.high_score
                                      )}
                                    </span>
                                  )}
                                  {item.label === "Time Spent" && (
                                    <span>
                                      {Math.floor(
                                        this.state.results.quiz_completed_time /
                                          60
                                      ) +
                                        "." +
                                        Math.floor(
                                          this.state.results
                                            .quiz_completed_time % 60
                                        )}
                                      <span className="quiz-analysis-text-bold">
                                        {" "}
                                        /{" "}
                                        {this.state.results.quiz
                                          .time_duration_in_seconds / 60}
                                      </span>
                                    </span>
                                  )}
                                </div>
                                <div className="quiz-analysis-type-card-text--bold">
                                  {item.label}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="quiz-result-button-container">
                    <Row gutter={[30, 30]}>
                      <Col
                        xs={24}
                        sm={24}
                        md={12}
                        lg={12}
                        xl={12}
                        xxl={12}
                        className="column"
                      >
                        <Button
                          className="quiz-result-attempt-button"
                          type="primary"
                          block
                          size="large"
                          onClick={() => {
                            this.props.dispatch(
                              quizReattempt(
                                true,
                                this.props.match.params.quiz_id
                              )
                            );
                            this.props.navigate(
                              `/course-details/${this.props.match.params.id}/quiz/${this.state.results.quiz.id}`
                            );
                          }}
                        >
                          {" "}
                          Reattempt{" "}
                        </Button>
                      </Col>
                      <Col
                        xs={24}
                        sm={24}
                        md={12}
                        lg={12}
                        xl={12}
                        xxl={12}
                        className="column"
                      >
                        <NavLink
                          to={`/course-details/${this.props.match.params.id}/quiz/${this.state.results.quiz.id}`}
                        >
                          <Button
                            className="quiz-result-solution-button"
                            type="primary"
                            block
                            size="large"
                            onClick={() => {
                              this.props.dispatch(quizResume(false));
                              this.props.dispatch(quizSolution(true));
                            }}
                          >
                            {" "}
                            View Solution{" "}
                          </Button>
                        </NavLink>
                      </Col>
                    </Row>
                  </div>

                  <div>
                    <Card className="quiz-result-question-analysis-card">
                      <div className="quiz-result-question-analysis-card1-content">
                        <div className="quiz-analysis-text">
                          Question Analysis
                        </div>
                        <Row
                          gutter={[18, 18]}
                          className="quiz-analysis-statistic"
                        >
                          <Col
                            xs={24}
                            sm={24}
                            md={12}
                            lg={8}
                            xl={8}
                            xxl={8}
                            className="quiz-result-question-analysis-card1-content-col1"
                          >
                            <div className="quiz-result-question-analysis-card1-content-col1-inner-card-correct">
                              <div className="quiz-result-question-analysis-card1-content-col1-inner-card-content">
                                <div className="quiz-result-question-analysis-card1-content-col1-inner-card-correct">
                                  <Text className="quiz-result-question-analysis-card1-content-col1-inner-card-correct-text">
                                    Correct
                                  </Text>
                                  <img
                                    src={quiz_correct}
                                    alt="quiz_correct"
                                    className="quiz-statistic-image"
                                  />
                                  <span className="quiz-statistic-value-container">
                                    <div className="quiz-statistic-value">
                                      {" "}
                                      {
                                        this.state.results
                                          .correctly_answered_question_count
                                      }{" "}
                                      <span className="quiz-statistic-value2">
                                        /{" "}
                                        {
                                          this.state.results.quiz
                                            .questions_count
                                        }
                                      </span>
                                    </div>
                                  </span>
                                </div>
                                <div className="quiz-result-question-analysis-card1-content-col1-inner-card-correct-progress">
                                  <Progress
                                    percent={
                                      (this.state.results
                                        .correctly_answered_question_count *
                                        100) /
                                      this.state.results.quiz.questions_count
                                    }
                                    trailColor="rgba(94, 239, 202, 0.2)"
                                    strokeColor="#01A54E"
                                    showInfo={false}
                                    size="small"
                                  />
                                </div>
                              </div>
                            </div>
                          </Col>
                          <Col
                            xs={24}
                            sm={24}
                            md={12}
                            lg={8}
                            xl={8}
                            xxl={8}
                            className="quiz-result-question-analysis-card1-content-col1"
                          >
                            <div className="quiz-result-question-analysis-card1-content-col1-inner-card-wrong">
                              <div className="quiz-result-question-analysis-card1-content-col1-inner-card-content">
                                <div className="quiz-result-question-analysis-card1-content-col1-inner-card-wrong">
                                  <Text className="quiz-result-question-analysis-card1-content-col1-inner-card-wrong-text">
                                    Wrong
                                  </Text>
                                  <img
                                    src={quiz_wrong}
                                    alt="quiz_wrong"
                                    className="quiz-statistic-image"
                                  />
                                  <span className="quiz-statistic-value-container">
                                    <div className="quiz-statistic-value">
                                      {
                                        this.state.results
                                          .wrognly_answered_qustion_count
                                      }{" "}
                                      <span className="quiz-statistic-value2">
                                        /{" "}
                                        {
                                          this.state.results.quiz
                                            .questions_count
                                        }
                                      </span>
                                    </div>
                                  </span>
                                </div>
                                <div className="quiz-result-question-analysis-card1-content-col1-inner-card-correct-progress">
                                  <Progress
                                    percent={
                                      (this.state.results
                                        .wrognly_answered_qustion_count *
                                        100) /
                                      this.state.results.quiz.questions_count
                                    }
                                    strokeColor="#F04B57"
                                    showInfo={false}
                                    size="small"
                                    trailColor="#FBD7E1"
                                  />
                                </div>
                              </div>
                            </div>
                          </Col>
                          <Col
                            xs={24}
                            sm={24}
                            md={24}
                            lg={8}
                            xl={8}
                            xxl={8}
                            className="quiz-result-question-analysis-card1-content-col1"
                          >
                            <div className="quiz-result-question-analysis-card1-content-col1-inner-card-unattempt">
                              <div className="quiz-result-question-analysis-card1-content-col1-inner-card-content">
                                <div className="quiz-result-question-analysis-card1-content-col1-inner-card-unattempted">
                                  <Text className="quiz-result-question-analysis-card1-content-col1-inner-card-unattempt-text">
                                    Unattempted
                                  </Text>
                                  <img
                                    src={quiz_info}
                                    alt="quiz_info"
                                    className="quiz-statistic-image"
                                  />
                                  <span className="quiz-statistic-value-container">
                                    <div className="quiz-statistic-value">
                                      {this.state.unAttemptedCount}{" "}
                                      <span className="quiz-statistic-value2">
                                        /{" "}
                                        {
                                          this.state.results.quiz
                                            .questions_count
                                        }
                                      </span>
                                    </div>
                                  </span>
                                </div>
                                <div className="quiz-result-question-analysis-card1-content-col1-inner-card-correct-progress">
                                  <Progress
                                    percent={
                                      (this.state.unAttemptedCount * 100) /
                                      this.state.results.quiz.questions_count
                                    }
                                    strokeColor="#606060"
                                    showInfo={false}
                                    size="small"
                                    trailColor="#DCDEE7"
                                  />
                                </div>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Card>
                  </div>

                  <div className="quiz-result-topic-analysis-main">
                    <Card className="quiz-result-topic-analysis-main-card">
                      <div className="quiz-topic-analysis-text">
                        Topics Analysis
                      </div>
                      <div className="quiz-result-topic-analysis-main-card-content">
                        <Collapse
                          defaultActiveKey={[
                            "0",
                            "1",
                            "2",
                            "3",
                            "4",
                            "5",
                            "6",
                            "7",
                            "8",
                            "9",
                            "10",
                          ]}
                          ghost
                          expandIcon={({ isActive }) =>
                            isActive === true ? (
                              <img
                                className="course-details-tabs-tab-pane-collapse"
                                src={collpase_minus}
                                alt="collpase_minus"
                                id="quiz-result-topic-analysis-main-card-content-collapse-icon"
                              />
                            ) : (
                              <img
                                className="course-details-tabs-tab-pane-collapse"
                                src={collpase_add}
                                alt="collpase_add"
                                id="quiz-result-topic-analysis-main-card-content-collapse-icon"
                              />
                            )
                          }
                        >
                          {this.state.topicsAnalysis.map((item, index) => (
                            <Panel
                              header={
                                <span
                                  className="quiz-result-topic-analysis-main-card-content-collapse-header"
                                  key={index}
                                >
                                  {item.title}{" "}
                                  <span className="quiz-bull-icon">&bull;</span>{" "}
                                  <span className="quiz-result-topic-analysis-main-card-content-collapse-sub-header">
                                    {this.getRightTopics(item.content)}/
                                    {this.getTotalTopics(item.content)}
                                  </span>
                                  <Divider style={{ marginBottom: "0px" }} />
                                </span>
                              }
                            >
                              <List
                                size="large"
                                className="quiz-result-topic-analysis-main-card-content-collapse-list"
                                bordered={false}
                                dataSource={
                                  this.state.topicsAnalysis[index].content
                                }
                                renderItem={(item) => (
                                  <List.Item
                                    className="quiz-result-topic-analysis-main-card-content-collapse-list-item"
                                    actions={[
                                      <a key="list-loadmore-edit">
                                        {item.right_ans}/{item.total_questions}
                                      </a>,
                                    ]}
                                  >
                                    {item.topic}
                                  </List.Item>
                                )}
                              />
                            </Panel>
                          ))}
                        </Collapse>
                      </div>
                    </Card>
                  </div>

                  <QuizSharePopup
                    ref={(instance) => {
                      this.quizSharePopup = instance;
                    }}
                  />

                  <div className="main-layout">
                    <Row className="quiz-action-row">
                      <Col
                        xs={8}
                        sm={8}
                        md={8}
                        lg={8}
                        xl={8}
                        xxl={8}
                        className="actionbar-icons"
                      >
                        {!this.state.isLiked ? (
                          <img
                            src={like}
                            alt="like"
                            onClick={() => this.handleLike(this.state.isLiked)}
                            className="quiz-action-image"
                          />
                        ) : (
                          <img
                            src={liked}
                            alt="liked"
                            onClick={() => this.handleLike(this.state.isLiked)}
                            className="quiz-action-image"
                          />
                        )}
                        <span
                          className="quiz-action-label"
                          style={{
                            position: "relative",
                            top: "3px",
                            fontWeight: 600,
                          }}
                        >
                          Like ({this.state.results.quiz.total_votes})
                        </span>
                      </Col>
                      <Col
                        xs={8}
                        sm={8}
                        md={8}
                        lg={8}
                        xl={8}
                        xxl={8}
                        className="actionbar-icons"
                      >
                        <img
                          src={chat}
                          alt="chat"
                          className="quiz-action-image"
                        />
                        <span
                          className="quiz-action-label"
                          style={{
                            position: "relative",
                            top: "3px",
                            fontWeight: 600,
                          }}
                        >
                          Comment ({this.state.results.quiz.total_comments})
                        </span>
                      </Col>
                      <Col
                        xs={8}
                        sm={8}
                        md={8}
                        lg={8}
                        xl={8}
                        xxl={8}
                        className="actionbar-icons"
                      >
                        <img
                          className="quiz-action-share-image"
                          src={share}
                          alt="share"
                          onClick={() => this.quizSharePopup.showModal()}
                        />
                        <span
                          className="quiz-action-label"
                          style={{
                            position: "relative",
                            top: "3px",
                            fontWeight: 600,
                          }}
                        >
                          Share
                        </span>
                      </Col>
                    </Row>
                  </div>

                  <div id="comments-block">
                    <CommentsComponent
                      {...this.props}
                      types={"quiz"}
                      id={this.props.match.params.quiz_id}
                      visible={this.state.visible}
                      active_Show_more={this.state.active_Show_more}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        ) : (
          <Spin className="course-module-layout-spinner" size="large" />
        )}

        {this.state.activeLoader === false &&
          this.state.results.user_results &&
          !this.state.results.user_results.quiz && <NoRecords />}
      </div>
    );
  }
}

export default connect((state) => {
  return {
    quiz_solution: state.quiz_solution,
    current_course: state.current_course,
    envendpoint: state.envendpoint,
    profile_update: state.profile_update,
  };
})(QuizResult);

const report = [
  {
    id: 1,
    image: rank,
    label: "Rank",
    color: "rgba(255, 185, 70, 0.15)",
  },
  {
    id: 2,
    image: mark_scored,
    label: "Mark Scored",
    color: "rgba(46, 212, 122, 0.15)",
  },
  {
    id: 3,
    image: average_score,
    label: "Average Score",
    color: "rgba(0, 227, 255, 0.13)",
  },
  {
    id: 4,
    image: high_score,
    label: "Highest Score",
    color: "rgba(90, 114, 200, 0.1)",
  },
  {
    id: 5,
    image: spent_time,
    label: "Time Spent",
    color: "rgba(255, 245, 0, 0.15)",
  },
];
