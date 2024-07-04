import React, { Component } from "react";
import { Card, Row, Col, Typography, Divider, Spin, Avatar } from "antd";
import quiz_bookmark from "../../assets/svg-icons/quiz-bookmark.svg";
import quiz_bookmarked from "../../assets/svg-icons/quiz-bookmarked.svg";
import quiz_solution from "../../assets/svg-icons/quiz-solution.svg";
import {
  ArrowLeftOutlined,
  ExpandOutlined,
  CompressOutlined,
  MenuOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import quiz_level from "../../assets/svg-icons/quiz-level-easy.svg";
import quiz_check from "../../assets/svg-icons/quiz-check.svg";
import quiz_topics from "../../assets/svg-icons/quiz-topics.svg";
import share from "../../assets/svg-icons/share.svg";
import QuizSubmitPopup from "../../components/QuizSubmitPopup";
import QuizLeavePopup from "../../components/QuizLeavePopup";
import QuizInstructionPopup from "../../components/QuizInstructionPopup";
import QuizTimeOverPopup from "../../components/QuizTimeOverPopup";
import QuizQuestionsReportPopup from "../../components/QuizQuestionsReportPopup";
import QuizSharePopup from "../../components/QuizSharePopup";
import "../../assets/css/quiz-question.css";
import Env, { profileImageUrl } from "../../utilities/services/Env";
import Choices from "../../utilities/Choices.json";
import { connect } from "react-redux";
import { currentPageRouting } from "../../reducers/action";
import { CommonService } from "../../utilities/services/Common";
import StorageConfiguration from "../../utilities/services/StorageConfiguration";
import { toast } from "react-toastify";
import $ from "jquery";
import logo from "../../assets/svg-images/waterMark.svg";
import CreateDoubts from "../../components/Doubt/CreateDoubts";
import * as htmlToImage from "html-to-image";
import { analytics } from "../../firebase-config";
import { logEvent } from "firebase/analytics";

const { Text } = Typography;

class MyQuestionDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      quiz: {},
      activeLoader: true,
      selectedIndex: 0,
      quizQuestionSet: [],
      attempted: [],
      unattempted: [],
      wrong: 0,
      correct: 0,
      quizRequestPayload: {},
      myQuestion: false,
      reattemptQuiz: true,
      remainingTime: {
        minutes: 0,
        seconds: 0,
      },
      currentDate: new Date(),
      previousTime: 0,
      showMore: true,
      showfullscreen: true,
      course_id: "",
      is_doubt: {
        is_doubt: 0,
        is_doubt_share: 0,
      },
    };
    this.userId = StorageConfiguration.sessionGetItem("user_id");
    this.answers = [];
    this.handleChoice = this.handleChoice.bind(this);
    this.handleBookmarkQuestion = this.handleBookmarkQuestion.bind(this);
  }

  handleChoice(e, choiceId, choiceIndex) {
    let nextIndex = this.state.selectedIndex + 1;
    let quizQuestionSet = this.state.quizQuestionSet;
    let isRightChoice = quizQuestionSet[
      this.state.selectedIndex
    ].choices.filter((item) => item.is_right_choice === 1);
    if (
      this.state.reattemptQuiz === false ||
      quizQuestionSet[this.state.selectedIndex].isAttempted === false
    ) {
      this.answers.length === 0 && this.setState({ quizStartTime: new Date() });
      if (
        quizQuestionSet[this.state.selectedIndex].choices[choiceIndex]
          .selected_choice === 1
      ) {
        quizQuestionSet[this.state.selectedIndex].choices.forEach((element) => {
          element.selected_choice = 0;
        });
        quizQuestionSet[this.state.selectedIndex].isAttempted = false;
        this.answers[this.state.selectedIndex] = null;
      } else {
        quizQuestionSet[this.state.selectedIndex].choices.forEach((element) => {
          element.selected_choice = 0;
        });
        quizQuestionSet[this.state.selectedIndex].choices[
          choiceIndex
        ].selected_choice = 1;
        quizQuestionSet[this.state.selectedIndex].isAttempted = true;
        this.answers[this.state.selectedIndex] = {
          quiz_question_id: quizQuestionSet[this.state.selectedIndex].id,
          quiz_question_choice_id: choiceId,
          sort_order: this.state.selectedIndex + 1,
        };
      }
      quizQuestionSet[this.state.selectedIndex].isRight === choiceIndex
        ? (quizQuestionSet[this.state.selectedIndex].userPicked = 1)
        : (quizQuestionSet[this.state.selectedIndex].userPicked = 0);
      let attempted = quizQuestionSet.filter(
        (item) => item.isAttempted === true
      );
      let unattempted = quizQuestionSet.filter(
        (item) => item.isAttempted === false
      );
      let removedNull = this.answers.filter((element) => element !== null);
      this.setState({
        quizRequestPayload: {
          quiz_id: this.state.quiz.id,
          id: this.userId,
          is_reattempt: this.props.quiz_reattempt.state === false ? 0 : 1,
          skipped_questions_count: unattempted.length,
          user_answers: JSON.stringify(removedNull),
          quiz_start_datetime:
            this.state.quizRequestPayload.quiz_start_datetime,
        },
        quizQuestions: quizQuestionSet,
        attempted: attempted,
        unattempted: unattempted,
      });

      if (nextIndex !== this.state.quizQuestionSet.length) {
        setTimeout(() => {
          // window.scrollBy(0, document.body.scrollHeight);
          this.setState({ selectedIndex: this.state.selectedIndex });
          if (isRightChoice[0].id === choiceId) {
            this.setState({ correct: this.state.correct + 1 });
          } else {
            this.setState({ wrong: this.state.wrong + 1 });
          }
        }, 1000);
      }
    }
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.props.dispatch(currentPageRouting(null));
    this.getQuizReattempted();
    logEvent(analytics, "select_content", {
      page_title: "My Question Details",
    });
  }

  componentWillReceiveProps(newProps) {
    if (newProps.quiz_start_timer === true) {
      this.handleTimer();
    }
  }

  componentDidUpdate() {
    var modal = document.getElementById("myModal");
    var modalImg = document.getElementById("img01");
    var captionText = document.getElementById("caption");
    $(function () {
      $(window).resize(function () {
        if (window.outerWidth === 1024) {
          $(".questions-count-column").css("display", "block");
        }
        if (window.outerWidth === 768) {
          $(".questions-count-column").css("display", "none");
        }
        if (window.outerWidth === 425) {
          $(".questions-count-column").css("padding-left", "0px");
        }
      });
      $(".question img").click(function () {
        modal.style.display = "block";
        modalImg.src = this.src;
        captionText.innerHTML = this.alt;
      });
      $(".question img").hover(function () {
        $(this).css("cursor", "pointer");
      });
      $("#myModal span").click(function () {
        modal.style.display = "none";
      });
    });
  }

  handleBookmarkQuestion() {
    // if(this.state.bookmarked === false) {
    let quizQuestionSet = this.state.quizQuestionSet[this.state.selectedIndex];
    const requestBody = {
      quiz_question_id: quizQuestionSet.id,
    };
    const bookmarkData = Env.post(
      this.props.envendpoint + `myquestions`,
      requestBody
    );
    bookmarkData.then(
      (response) => {
        if (quizQuestionSet.isBookmarked === 0) {
          toast("Bookmark removed successfully !");
        } else {
          toast("Bookmark added successfully !");
        }
      },
      (error) => {
        console.error(error);
      }
    );
    // this.setState({[this.state.quizQuestionSet[this.state.selectedIndex].isBookmarked]: !this.state.quizQuestionSet[this.state.selectedIndex].isBookmarked })
    quizQuestionSet.isBookmarked === 1
      ? (quizQuestionSet.isBookmarked = 0)
      : (quizQuestionSet.isBookmarked = 1);
    this.setState({ quizQuestionSet: this.state.quizQuestionSet });
    // }
  }

  handleTimer() {
    var twentyMinutesLater = new Date();
    twentyMinutesLater.setMinutes(
      twentyMinutesLater.getMinutes() +
        (this.state.quiz.time_duration_in_seconds % 3600) / 60
    );
    let interval = setInterval(() => {
      this.setState({
        remainingTime: CommonService.getTimeRemaining(twentyMinutesLater),
      });
      if (
        this.state.remainingTime.hours === 0 &&
        this.state.remainingTime.minutes === 0 &&
        this.state.remainingTime.seconds === 0
      ) {
        clearInterval(interval);
        this.timeoverPopup.showModal(
          this.state.quizRequestPayload,
          this.state.attempted,
          this.state.unattempted
        );
      }
    }, 1000);
  }

  async getQuizReattempted() {
    const getQuizData = Env.get(this.props.envendpoint + `myquestions_data`);
    const solutionData = [];
    await getQuizData.then(
      (response) => {
        const data = response.data.response.myQuestions.data;
        data.forEach((element) => {
          var choices = [];
          element.questions.choices.forEach((item) => {
            choices.push({
              id: item.id,
              choice: item.choice,
              is_right_choice: item.is_right_choice,
              user_choices: item.user_choices,
            });
          });
          let isRight = choices.findIndex((item) => item.is_right_choice === 1);
          let userPicked = choices.find(
            (item) => item.is_right_choice === 1 && item.user_choices !== null
          );
          solutionData.push({
            id: element.questions.id,
            question: element.questions.question,
            solution: element.questions.solution,
            choices: choices,
            isAttempted: false,
            isBookmarked: element.questions.is_favourite,
            is_skipped: element.questions.is_skipped,
            userPicked: userPicked,
            isRight: isRight,
            difficult_level: element.questions.difficult_level,
            question_overall_percentage:
              element.questions.question_overall_percentage,
            topics_name:
              element.questions.topics && element.questions.topics.name,
            question_group: element.questions.question_group,
          });
        });
        this.setState({
          quizQuestionSet: solutionData,
          // quiz: {
          //   id: response.data.response.myQuestions.id,
          //   title: response.data.response.myQuestions.title,
          //   time_duration_in_seconds:
          //     response.data.response.myQuestions.time_duration_in_seconds,
          //   quiz_records_count:
          //     response.data.response.myQuestions.quiz_records_count,
          //   questions_count:
          //     response.data.response.myQuestions.questions_count,
          // },
          // unattempted: solutionData,
          activeLoader: false,
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  handleScreenCapture = (course_id) => {
    var node = document.getElementById("snap-area");
    node.style.background = `#fff url(${logo}) no-repeat center center`;
    node.style.backgroundSize = "auto 65px";
    node.style.margin = "10px";
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    htmlToImage
      .toPng(node)
      .then(async (dataUrl) => {
        await this.urltoFile(dataUrl, `${result}.png`).then((file) => {
          this.CreateDoubts.toggleModal(
            file,
            course_id.id,
            this.state.is_doubt
          );
          node.style.background = `#fff`;
          node.style.margin = "0px -20px";
        });
      })
      .catch(function (error) {
        console.error("oops, something went wrong!", error);
        node.style.background = `#fff`;
        node.style.margin = "0px -20px";
      });
  };

  urltoFile = (url, filename) => {
    return fetch(url)
      .then(function (res) {
        return res.arrayBuffer();
      })
      .then(function (buf) {
        return new File([buf], filename);
      });
  };

  handleMenu() {
    $(".questions-count-column").fadeToggle();
    $(".questions-count-column").css({ display: "flex" });
  }

  handlecloser() {
    $(".questions-count-column").css("display", "none");
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

  render() {
    return (
      <div
        className="quiz-question-container"
        style={{
          width: "100%",
          padding: "0px",
          margin: "0px",
        }}
      >
        <div className="main-layout">
          {this.state.activeLoader === false ? (
            <Row
              gutter={[30, 0]}
              className="row"
              style={{
                padding: "0px 10px",
              }}
            >
              <Col
                xs={24}
                sm={24}
                md={24}
                lg={16}
                xl={18}
                xxl={18}
                className="question-column"
                style={{
                  paddingLeft: "0px",
                }}
              >
                <div className="inner-layout">
                  <Card className="card">
                    <Row align="middle" className="row-header">
                      <Col
                        xs={22}
                        sm={22}
                        md={22}
                        lg={22}
                        xl={22}
                        xxl={22}
                        className="title-column"
                      >
                        <span className="title">{"My Questions"}</span>
                      </Col>
                      <Col
                        xs={2}
                        sm={2}
                        md={2}
                        lg={2}
                        xl={2}
                        xxl={2}
                        className="icon-column"
                      >
                        <ArrowLeftOutlined
                          className="back-icon"
                          onClick={() => this.props.navigate(-1)}
                        />
                      </Col>
                    </Row>
                  </Card>
                </div>

                <div
                  className="body-layout"
                  style={{
                    marginTop: "0px",
                  }}
                >
                  {/* <QueueAnim type={['right', 'left']} className="demo-page" key="page" delay={0}> */}
                  <div className="inner-layout" id="inner-layout">
                    <Card className="card">
                      <Row className="row">
                        <Col
                          xs={10}
                          sm={10}
                          md={12}
                          lg={12}
                          xl={12}
                          xxl={12}
                          className="question-column"
                        >
                          <div className="text">
                            Question {this.state.selectedIndex + 1}
                          </div>
                        </Col>
                        <Col
                          xs={14}
                          sm={14}
                          md={12}
                          lg={12}
                          xl={12}
                          xxl={12}
                          className="question-stat"
                        >
                          <div className="content">
                            <span className="box-1">1.00</span>
                            <span className="box-2">0.25</span>
                            {this.state.quizQuestionSet.length !== 0 &&
                            this.state.quizQuestionSet[this.state.selectedIndex]
                              .isBookmarked === 0 ? (
                              <span
                                onClick={this.handleBookmarkQuestion}
                                className="bookmark-span"
                              >
                                <img
                                  src={quiz_bookmark}
                                  alt="quiz_bookmark"
                                  className="bookmark-icon"
                                />
                              </span>
                            ) : (
                              <span
                                onClick={this.handleBookmarkQuestion}
                                className="bookmarked-span"
                              >
                                <img
                                  alt="quiz_bookmarked"
                                  src={quiz_bookmarked}
                                  className="bookmarked-icon"
                                />
                              </span>
                            )}
                            <span
                              onClick={() =>
                                this.quizSharePopup.showModal(
                                  "QuizQuestions",
                                  "",
                                  "",
                                  this.state.is_doubt
                                )
                              }
                              className="share-span"
                            >
                              <img
                                src={share}
                                alt="share"
                                className="share-icon"
                              />
                            </span>
                            <span className="container-header-menu-icon">
                              <MenuOutlined
                                style={{ fontSize: "20px", color: "#0B649D" }}
                                onClick={this.handleMenu}
                              />
                            </span>
                          </div>
                        </Col>
                      </Row>

                      <Row gutter={[40, 10]} id="snap-area">
                        {this.state.quizQuestionSet[this.state.selectedIndex]
                          .question_group !== null && (
                          <Col
                            xs={24}
                            sm={24}
                            md={12}
                            lg={12}
                            xl={12}
                            xxl={12}
                            id="fixed-content"
                          >
                            <div className="group-question">
                              <div
                                className="question"
                                dangerouslySetInnerHTML={{
                                  __html:
                                    this.state.quizQuestionSet[
                                      this.state.selectedIndex
                                    ].question_group !== null
                                      ? this.state.quizQuestionSet[
                                          this.state.selectedIndex
                                        ].question_group.content
                                      : "",
                                }}
                                style={{
                                  // height:
                                  //   this.state.showMore === true &&
                                  //   this.state.quizQuestionSet[
                                  //     this.state.selectedIndex
                                  //   ].question_group !== null
                                  //     ? "100%"
                                  //     : "100%",
                                  // height: "450px",
                                  // overflow: "hidden",
                                  // overflowY: "scroll",
                                  background: "transparent",
                                }}
                              ></div>
                              {/* <div className="show-content">
                                {this.state.showMore === true ? (
                                  <span
                                    onClick={() =>
                                      this.setState({
                                        showMore: !this.state.showMore,
                                      })
                                    }
                                    className="show-more"
                                  >
                                    Show More <CaretDownOutlined />
                                  </span>
                                ) : (
                                  <span
                                    onClick={() =>
                                      this.setState({
                                        showMore: !this.state.showMore,
                                      })
                                    }
                                    className="show-less"
                                  >
                                    Show Less <CaretUpOutlined />
                                  </span>
                                )}
                              </div> */}
                            </div>
                          </Col>
                        )}
                        <Col
                          xs={
                            this.state.quizQuestionSet[this.state.selectedIndex]
                              .question_group !== null
                              ? 24
                              : 24
                          }
                          sm={
                            this.state.quizQuestionSet[this.state.selectedIndex]
                              .question_group !== null
                              ? 24
                              : 24
                          }
                          md={
                            this.state.quizQuestionSet[this.state.selectedIndex]
                              .question_group !== null
                              ? 12
                              : 24
                          }
                          lg={
                            this.state.quizQuestionSet[this.state.selectedIndex]
                              .question_group !== null
                              ? 12
                              : 24
                          }
                          xl={
                            this.state.quizQuestionSet[this.state.selectedIndex]
                              .question_group !== null
                              ? 12
                              : 24
                          }
                          xxl={
                            this.state.quizQuestionSet[this.state.selectedIndex]
                              .question_group !== null
                              ? 12
                              : 24
                          }
                          id={
                            this.state.quizQuestionSet[this.state.selectedIndex]
                              .isAttempted === true &&
                            (this.state.viewQuizSolution === true ||
                              this.state.reattemptQuiz === true)
                              ? "attempted-fixed-content"
                              : this.state.startQuiz === true ||
                                this.state.resumeQuiz === true
                              ? "startresume-fixed-content"
                              : "unattempted-fixed-content"
                          }
                        >
                          <div>
                            <div className="question">
                              <div
                                className="question-name"
                                dangerouslySetInnerHTML={{
                                  __html:
                                    this.state.quizQuestionSet.length !== 0 &&
                                    this.state.quizQuestionSet[
                                      this.state.selectedIndex
                                    ].question,
                                }}
                              ></div>
                            </div>
                            {this.state.viewQuizSolution === true && (
                              <div className="solution-choices">
                                {this.state.quizQuestionSet.length !== 0 &&
                                  this.state.quizQuestionSet[
                                    this.state.selectedIndex
                                  ].choices.length !== 0 &&
                                  this.state.quizQuestionSet[
                                    this.state.selectedIndex
                                  ].choices.map((item, index) => (
                                    <div
                                      className={
                                        item.is_right_choice === 1
                                          ? "right"
                                          : item.is_right_choice === 0 &&
                                            item.user_choices === null
                                          ? "not-choosen"
                                          : "wrong"
                                      }
                                      key={index}
                                    >
                                      {/* <Row className='row' >
                                                                <Col xs={2} sm={2} md={2} lg={2} xl={2} xxl={2} className='option-column'>
                                                                    <span className={item.is_right_choice === 1 ? "quiz-questions-main2-card2-choice-isright" : (item.is_right_choice === 0 && item.user_choices === null) ? "quiz-questions-main2-card2-choice-not-choosen" : "quiz-questions-main2-card2-choice-iswrong"}> {Choices[index]}</span>
                                                                </Col>
                                                                <Col xs={22} sm={22} md={22} lg={22} xl={22} xxl={22} className='option-value-column'>
                                                                    <span dangerouslySetInnerHTML={{ __html: item.choice }}></span>
                                                                </Col>
                                                            </Row> */}
                                      <div className="quiz-question-choices-container">
                                        <div>
                                          <div
                                            className={
                                              item.is_right_choice === 1
                                                ? "quiz-questions-main2-card2-choice-isright"
                                                : item.is_right_choice === 0 &&
                                                  item.user_choices === null
                                                ? "quiz-questions-main2-card2-choice-not-choosen"
                                                : "quiz-questions-main2-card2-choice-iswrong"
                                            }
                                          >
                                            {" "}
                                            {Choices[index]}
                                          </div>
                                        </div>
                                        <div
                                          // className="quiz-question-choices-value"
                                          className={
                                            item.selected_choice === 1
                                              ? "quiz-question-choices-value-choosen"
                                              : "quiz-question-choices-value-not-choosen"
                                          }
                                        >
                                          <div
                                            dangerouslySetInnerHTML={{
                                              __html: item.choice,
                                            }}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>

                          {this.state.reattemptQuiz === true && (
                            <div className="reattempt-choices">
                              {this.state.quizQuestionSet.length !== 0 &&
                                this.state.quizQuestionSet[
                                  this.state.selectedIndex
                                ].choices.length !== 0 &&
                                this.state.quizQuestionSet[
                                  this.state.selectedIndex
                                ].choices.map((item, index) => (
                                  <div
                                    className={
                                      this.state.quizQuestionSet[
                                        this.state.selectedIndex
                                      ].isAttempted === true &&
                                      item.is_right_choice === 1
                                        ? "right"
                                        : this.state.quizQuestionSet[
                                            this.state.selectedIndex
                                          ].isAttempted === true &&
                                          item.is_right_choice === 0 &&
                                          item.selected_choice === 1
                                        ? "wrong"
                                        : item.selected_choice === 1 &&
                                          this.state.quizQuestionSet[
                                            this.state.selectedIndex
                                          ].isAttempted === true
                                        ? "choosen"
                                        : "not-choosen"
                                    }
                                    key={index}
                                    onClick={(e) =>
                                      this.handleChoice(e, item.id, index)
                                    }
                                  >
                                    {/* <Row className='row' >
                                                                <Col xs={2} sm={2} md={2} lg={2} xl={2} xxl={2} className='option-column'>
                                                                    <span className={(this.state.quizQuestionSet[this.state.selectedIndex].isAttempted === true && item.is_right_choice === 1) ? "quiz-questions-main2-card2-choice-isright" : (this.state.quizQuestionSet[this.state.selectedIndex].isAttempted === true && item.is_right_choice === 0 && item.selected_choice === 1) ? "quiz-questions-main2-card2-choice-iswrong" : (item.selected_choice === 1 && this.state.quizQuestionSet[this.state.selectedIndex].isAttempted === true) ? "quiz-questions-main2-card2-choice-choosen" : "quiz-questions-main2-card2-choice-not-choosen"}> {Choices[index]}</span>
                                                                </Col>
                                                                <Col xs={22} sm={22} md={22} lg={22} xl={22} xxl={22} className='option-value-column'>
                                                                    <span dangerouslySetInnerHTML={{ __html: item.choice }}></span>
                                                                </Col>
                                                            </Row> */}
                                    <div className="quiz-question-choices-container">
                                      <div>
                                        <div
                                          className={
                                            this.state.quizQuestionSet[
                                              this.state.selectedIndex
                                            ].isAttempted === true &&
                                            item.is_right_choice === 1
                                              ? "quiz-questions-main2-card2-choice-isright"
                                              : this.state.quizQuestionSet[
                                                  this.state.selectedIndex
                                                ].isAttempted === true &&
                                                item.is_right_choice === 0 &&
                                                item.selected_choice === 1
                                              ? "quiz-questions-main2-card2-choice-iswrong"
                                              : item.selected_choice === 1 &&
                                                this.state.quizQuestionSet[
                                                  this.state.selectedIndex
                                                ].isAttempted === true
                                              ? "quiz-questions-main2-card2-choice-choosen"
                                              : "quiz-questions-main2-card2-choice-not-choosen"
                                          }
                                        >
                                          {" "}
                                          {Choices[index]}
                                        </div>
                                      </div>
                                      <div className="quiz-question-choices-value">
                                        <div
                                          dangerouslySetInnerHTML={{
                                            __html: item.choice,
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                          {this.state.startQuiz === true && (
                            <div className="start-choices">
                              {this.state.quizQuestionSet.length !== 0 &&
                                this.state.quizQuestionSet[
                                  this.state.selectedIndex
                                ].choices.length !== 0 &&
                                this.state.quizQuestionSet[
                                  this.state.selectedIndex
                                ].choices.map((item, index) => (
                                  <div
                                    className={
                                      item.selected_choice === 1
                                        ? "choosen"
                                        : "not-choosen"
                                    }
                                    key={index}
                                    onClick={(e) =>
                                      this.handleChoice(e, item.id, index)
                                    }
                                  >
                                    {/* <Row className='row'>
                                                            <Col xs={2} sm={2} md={2} lg={2} xl={2} xxl={3} className='option-column'>
                                                                <span className={item.selected_choice === 1 ? "quiz-questions-main2-card2-choice-choosen" : "quiz-questions-main2-card2-choice-not-choosen"}> {Choices[index]}</span>
                                                            </Col>
                                                            <Col xs={22} sm={22} md={22} lg={22} xl={22} xxl={21} className='option-value-column'>
                                                                <span dangerouslySetInnerHTML={{ __html: item.choice }}></span>
                                                            </Col>
                                                        </Row> */}
                                    <div className="quiz-question-choices-container">
                                      <div>
                                        <div
                                          className={
                                            item.selected_choice === 1
                                              ? "quiz-questions-main2-card2-choice-choosen"
                                              : "quiz-questions-main2-card2-choice-not-choosen"
                                          }
                                        >
                                          {" "}
                                          {Choices[index]}
                                        </div>
                                      </div>
                                      <div
                                        className={
                                          item.selected_choice === 1
                                            ? "quiz-question-choices-value-choosen"
                                            : "quiz-question-choices-value-not-choosen"
                                        }
                                      >
                                        <div
                                          dangerouslySetInnerHTML={{
                                            __html: item.choice,
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                          {this.state.resumeQuiz === true && (
                            <div className="resume-choices">
                              {this.state.quizQuestionSet.length !== 0 &&
                                this.state.quizQuestionSet[
                                  this.state.selectedIndex
                                ].choices.length !== 0 &&
                                this.state.quizQuestionSet[
                                  this.state.selectedIndex
                                ].choices.map((item, index) => (
                                  <div
                                    className={
                                      item.user_choices !== null
                                        ? "choosen"
                                        : "not-choosen"
                                    }
                                    key={index}
                                    onClick={(e) =>
                                      this.handleResumeChoice(e, item.id, index)
                                    }
                                  >
                                    {/* <Row className='row' >
                                                            <Col xs={2} sm={2} md={2} lg={2} xl={2} xxl={2} className='option-column'>
                                                                <span className={item.user_choices !== null ? "quiz-questions-main2-card2-choice-choosen" : "quiz-questions-main2-card2-choice-not-choosen"}> {Choices[index]}</span>
                                                            </Col>
                                                            <Col xs={22} sm={22} md={22} lg={22} xl={22} xxl={22} className='option-value-column'>
                                                                <span dangerouslySetInnerHTML={{ __html: item.choice }}></span>
                                                            </Col>
                                                        </Row> */}
                                    <div className="quiz-question-choices-container">
                                      <div>
                                        <div
                                          className={
                                            item.user_choices !== null
                                              ? "quiz-questions-main2-card2-choice-choosen"
                                              : "quiz-questions-main2-card2-choice-not-choosen"
                                          }
                                        >
                                          {" "}
                                          {Choices[index]}
                                        </div>
                                      </div>
                                      <div className="quiz-question-choices-value">
                                        <div
                                          dangerouslySetInnerHTML={{
                                            __html: item.choice,
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </Col>
                      </Row>

                      <div>
                        {(this.state.viewQuizSolution === true ||
                          this.state.reattemptQuiz === true) &&
                          this.state.quizQuestionSet.length > 0 &&
                          this.state.quizQuestionSet[this.state.selectedIndex]
                            .isAttempted === true && (
                            <div className="solution-layout">
                              <Divider />
                              <Card className="card">
                                <Row className="row">
                                  <Col
                                    xs={22}
                                    sm={22}
                                    md={22}
                                    lg={22}
                                    xl={22}
                                    xxl={22}
                                    className="title-column"
                                  >
                                    <Text className="text">Solution: </Text>
                                  </Col>
                                  <Col
                                    xs={2}
                                    sm={2}
                                    md={2}
                                    lg={2}
                                    xl={2}
                                    xxl={2}
                                    className="report-column"
                                  >
                                    <span
                                      className="report"
                                      onClick={() =>
                                        this.quizQuestionsReportPopup.showModal(
                                          this.state.quizQuestionSet[
                                            this.state.selectedIndex
                                          ]
                                        )
                                      }
                                    >
                                      <img
                                        className="report-image"
                                        src={quiz_solution}
                                        alt="quiz_solution"
                                      />
                                    </span>
                                  </Col>
                                </Row>

                                <Divider className="divider" />

                                <div className="solution-body">
                                  <Row className="row">
                                    <span className="label">
                                      Answer :{" "}
                                      <span className="option-value">
                                        Option{" "}
                                        {
                                          Choices[
                                            this.state.quizQuestionSet[
                                              this.state.selectedIndex
                                            ].isRight
                                          ]
                                        }
                                      </span>
                                    </span>
                                  </Row>
                                  <div
                                    className="content"
                                    dangerouslySetInnerHTML={{
                                      __html:
                                        this.state.quizQuestionSet.length !==
                                          0 &&
                                        this.state.quizQuestionSet[
                                          this.state.selectedIndex
                                        ].solution,
                                    }}
                                  >
                                    {/* <p>Collective nouns (group, jury, crowd, team, etc.) may be singular or plural, depending on meaning. In this sentence, the jury is acting as a collection of individuals ; therefore, the referent pronoun is singular.</p>
                                        <p>Therefore, ‘its’ must be replaced with ‘their’ to form a grammatically correct answer.</p>
                                        <p>Therefore, <span className="quiz-questions-solution-answer-option">option B</span> is the correct answer.</p> */}
                                  </div>
                                </div>

                                {(this.state.viewQuizSolution === true ||
                                  this.state.reattemptQuiz === true) &&
                                  this.state.quizQuestionSet.length > 0 &&
                                  this.state.quizQuestionSet[
                                    this.state.selectedIndex
                                  ].isAttempted === true && (
                                    <div className="footer-layout">
                                      <div className="inner-layout">
                                        <Row align="middle" className="row">
                                          <Col
                                            xs={12}
                                            sm={12}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                            xxl={12}
                                            className="difficult-column"
                                          >
                                            <span className="image-span">
                                              <img
                                                className="image"
                                                src={quiz_level}
                                                alt="quiz_level"
                                              />
                                            </span>
                                            <span className="text-span">
                                              Difficulty Level -{" "}
                                              <span
                                                className={
                                                  this.state.quizQuestionSet[
                                                    this.state.selectedIndex
                                                  ].difficult_level.name ===
                                                  "Easy"
                                                    ? "easy-text"
                                                    : this.state
                                                        .quizQuestionSet[
                                                        this.state.selectedIndex
                                                      ].difficult_level.name ===
                                                      "Hard"
                                                    ? "hard-text"
                                                    : "medium-text"
                                                }
                                              >
                                                {" "}
                                                {
                                                  this.state.quizQuestionSet[
                                                    this.state.selectedIndex
                                                  ].difficult_level.name
                                                }{" "}
                                              </span>
                                            </span>
                                          </Col>
                                          <Col
                                            xs={12}
                                            sm={12}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                            xxl={12}
                                            className="attempt-column"
                                          >
                                            <span className="image-span">
                                              <img
                                                className="image"
                                                alt="quiz_check"
                                                src={quiz_check}
                                              />
                                            </span>
                                            <span className="text-span">
                                              Correct Attempts -{" "}
                                              <span className="text">
                                                {" "}
                                                {this.state.quizQuestionSet[
                                                  this.state.selectedIndex
                                                ]
                                                  .question_overall_percentage ===
                                                undefined
                                                  ? 0
                                                  : Math.round(
                                                      this.state
                                                        .quizQuestionSet[
                                                        this.state.selectedIndex
                                                      ]
                                                        .question_overall_percentage
                                                    )}
                                                %{" "}
                                              </span>
                                            </span>
                                          </Col>
                                        </Row>
                                      </div>
                                      <Divider className="divider" />
                                      <div className="topic">
                                        <div className="content">
                                          <span className="image-span">
                                            <img
                                              src={quiz_topics}
                                              alt="quiz_topics"
                                              className="image"
                                            />
                                          </span>
                                          <span className="text-span">
                                            Topics -{" "}
                                            <span className="text">
                                              {
                                                this.state.quizQuestionSet[
                                                  this.state.selectedIndex
                                                ].topics_name
                                              }
                                            </span>
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                              </Card>
                            </div>
                          )}
                      </div>
                    </Card>
                  </div>
                </div>

                <div className="quiz-footer">
                  <Card
                    style={{
                      padding: "20px",
                      boxShadow: "0px 2px 10px rgb(0 0 0 / 8%)",
                    }}
                  >
                    {this.state.selectedIndex > 0 && (
                      <div
                        style={{
                          float: "left",
                          color: "#0B649D",
                          fontSize: "18px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          this.setState({
                            selectedIndex: this.state.selectedIndex - 1,
                          })
                        }
                      >
                        Previous
                      </div>
                    )}
                    {this.state.selectedIndex !==
                      this.state.quizQuestionSet.length - 1 && (
                      <div
                        onClick={() =>
                          this.setState({
                            selectedIndex: this.state.selectedIndex + 1,
                          })
                        }
                        style={{
                          float: "right",
                          color: "#0B649D",
                          fontSize: "18px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Next
                      </div>
                    )}
                  </Card>
                </div>
              </Col>

              {this.state.myQuestion === false && (
                <Col
                  xs={24}
                  sm={24}
                  md={24}
                  lg={8}
                  xl={6}
                  xxl={6}
                  className="questions-count-column"
                >
                  <Card className="card" style={{ marginBottom: "10px" }}>
                    <div className="my-question-profile-flex">
                      <div style={{ textAlign: "center" }}>
                        <ArrowRightOutlined
                          className="close-circle-outlined back-icon"
                          onClick={() => this.handlecloser()}
                        />
                      </div>
                      <div style={{ textAlign: "center" }}>
                        {/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
                          this.props.profile_image
                        ) &&
                        !this.props.profile_image.includes("data") &&
                        !this.props.profile_image.includes("prtner") ? (
                          <Avatar
                            size={45}
                            src={
                              profileImageUrl +
                              (this.props.profile_image === null
                                ? StorageConfiguration.sessionGetItem(
                                    "profile_image"
                                  )
                                : this.props.profile_image)
                            }
                            style={{
                              width: "50px",
                              borderRadius: "90px",
                            }}
                          />
                        ) : (
                          <Avatar
                            style={{
                              color: "#E0F3FF",
                              background: "#0B649D",
                            }}
                            size={45}
                          >
                            {this.props.profile_update.first_name !==
                              undefined &&
                              this.props.profile_update.first_name
                                .charAt(0)
                                .toUpperCase()}
                          </Avatar>
                        )}
                      </div>
                      <div className="my-question-profile-flex-item">
                        <div style={{ color: "#0B649D", fontWeight: 600 }}>
                          {this.props.profile_update.user_name === null
                            ? StorageConfiguration.sessionGetItem("user_name")
                            : this.props.profile_update.user_name}
                        </div>
                        <div style={{ color: "#90A0B7", fontSize: "12px" }}>
                          {StorageConfiguration.sessionGetItem("email_id")}
                        </div>
                      </div>
                      <div className="my-question-profile-full-icon">
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
                    <Divider style={{ margin: 0 }} />
                    <div className="layout">
                      <div className="header">
                        <div
                          className="text"
                          style={{ textAlign: "center", fontSize: "16px" }}
                        >
                          Question Status
                        </div>
                      </div>

                      <div
                        className="content"
                        id={
                          this.state.viewQuizSolution === true ||
                          this.state.reattemptQuiz === true
                            ? "attempted-fixed-status"
                            : "fixed-content"
                        }
                        style={{ margin: "28px" }}
                      >
                        <Row gutter={[30, 30]} className="row">
                          {this.state.quizQuestionSet.map((item, index) => (
                            <Col
                              xs={4.5}
                              sm={4.5}
                              md={4.5}
                              lg={4.5}
                              xl={4.5}
                              xxl={4.5}
                              key={index}
                              className="column"
                            >
                              <span
                                onClick={() =>
                                  this.setState({ selectedIndex: index })
                                }
                                className={
                                  item.isAttempted === false
                                    ? "not-answered"
                                    : item.userPicked === 1
                                    ? "correct"
                                    : "wrong-answer"
                                }
                              >
                                {this.state.selectedIndex === index && (
                                  <span className="reattempt-status-icon">
                                    &bull;
                                  </span>
                                )}
                                <span className="value">{index + 1}</span>
                              </span>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    </div>
                  </Card>
                </Col>
              )}
            </Row>
          ) : (
            <Spin className="app-spinner" size="large" />
          )}
        </div>

        <div id="myModal" className="modal">
          <span className="close">&times;</span>
          <img className="modal-content" alt="content" id="img01" />
          <div id="caption"></div>
        </div>

        <QuizSubmitPopup
          ref={(instance) => {
            this.submitPopup = instance;
          }}
          routingProps={this.props}
        />

        <QuizLeavePopup
          ref={(instance) => {
            this.leavePopup = instance;
          }}
          {...this.props}
        />

        <QuizInstructionPopup
          ref={(instance) => {
            this.instructionPopup = instance;
          }}
        />

        <QuizTimeOverPopup
          ref={(instance) => {
            this.timeoverPopup = instance;
          }}
          routingProps={this.props}
        />

        <CreateDoubts
          ref={(instance) => {
            this.CreateDoubts = instance;
          }}
          {...this.props}
        />

        <QuizQuestionsReportPopup
          ref={(instance) => {
            this.quizQuestionsReportPopup = instance;
          }}
          {...this.props}
        />

        <QuizSharePopup
          ref={(instance) => {
            this.quizSharePopup = instance;
          }}
          {...this.props}
          handleScreenCapture={this.handleScreenCapture}
        />
      </div>
    );
  }
}

export default connect((state) => {
  return {
    preferences: state.preferences,
    quiz_solution: state.quiz_solution,
    quiz_reattempt: state.quiz_reattempt,
    current_course: state.current_course,
    profile_image: state.profile_image,
    profile_update: state.profile_update,
    envendpoint: state.envendpoint,
    envupdate: state.envupdate,
  };
})(MyQuestionDetails);
