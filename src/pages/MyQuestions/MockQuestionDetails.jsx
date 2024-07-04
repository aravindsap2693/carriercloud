import React, { Component } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Avatar,
  Button,
  Radio,
} from "antd";
import {
  ExpandOutlined,
  CompressOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import share from "../../assets/svg-icons/share.svg";
import QuizSharePopup from "../../components/QuizSharePopup";
import MocktestReportPopup from "../../components/Mocktest/MocktestReportPopup";
import _ from "lodash";
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
import logos from "../../assets/images/full-logo.svg";
//import "../../assets/css/mocktest-analysis.css";
import "../../assets/css/myquestions.css";
import report from "../../assets/svg-icons/report.svg";
import mockaside from "../../assets/svg-icons/mock-aside-icon.svg";
//import mockTestData from "../../utilities/mock-data/MyQuestionsMocktest.json";
import bookmark from "../../assets/svg-icons/mock-bookmark.svg";
import bookmarked from "../../assets/svg-icons/mock-bookmarked.svg";
import MockNotvisited from "../../assets/js-icons/MockNotvisited";
import SolutionCorrect from "../../assets/js-icons/SolutionCorrect";
import SolutionWrong from "../../assets/js-icons/SolutionWrong";
import { renderToStaticMarkup } from "react-dom/server";
const { Text } = Typography;

const mockNotvisited = encodeURIComponent(
  renderToStaticMarkup(<MockNotvisited />)
);

const solutionCorrect = encodeURIComponent(
  renderToStaticMarkup(<SolutionCorrect />)
);
const solutionWrong = encodeURIComponent(
  renderToStaticMarkup(<SolutionWrong />)
);

class MockQuestionDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      quiz: {},
      activeLoader: true,
      selectedIndex: 0,
      quizQuestionSet: [],
      mockQuestionSet: [],
      mocktestData: [],
      activeTabIndex: 0,
      attempted: [],
      isAttempted: false,
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

      language_id: "language1",
      showFullview: true,
    };
    this.userId = StorageConfiguration.sessionGetItem("user_id");
    this.answers = [];
   // this.handleChoice = this.handleChoice.bind(this);
    this.handleBookmarkQuestion = this.handleBookmarkQuestion.bind(this);
  }

 

  handleReattemptChoice = (e, item, choiceIndex) => {
    let choiceId = item.id;
    let CurrentQuestion = this.state.mockQuestionSet[this.state.selectedIndex];

    if (!CurrentQuestion.isAttempted) {
      if (CurrentQuestion.selected_answer === null) {
        CurrentQuestion.selected_answer = choiceIndex;
        CurrentQuestion.choices.forEach((element) => {
          element.selected_choice = 0;
        });
        CurrentQuestion.choices[choiceIndex].selected_choice = 1;
        CurrentQuestion.isAttempted = true;
        CurrentQuestion.isCorrect = CurrentQuestion.isRight === choiceIndex;
        this.answers[this.state.selectedIndex] = {
          mock_question_id: CurrentQuestion.id,
          mocktest_question_choice_id: choiceId,
          sort_order: CurrentQuestion.sort_order,
        };
      }
      CurrentQuestion.isRight === choiceIndex
        ? (CurrentQuestion.userPicked = 1)
        : (CurrentQuestion.userPicked = 0);

      this.setState({
        mocktestQuestions: this.state.mockQuestionSet,

        // notvisited: attempted_obj,
      });
    }
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    this.props.dispatch(currentPageRouting(null));

    logEvent(analytics, "select_content", {
      page_title: "My Question Details",
    });
    this.getMocktestReattempted();
    this.toggleAsideScreen("start");
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
        if (window.outerWidth < 1100) {
          $(".mock-questions-count-column").css(
            "display",
            "none",
            "position",
            "absolute"
          );
        }
        if (window.outerWidth > 1100) {
          $(".mock-questions-count-column").css(
            "display",
            "block",
            "position",
            "relative"
          );
        }
        if (window.outerWidth === 768) {
          $(".mock-questions-count-column").css("display", "none");
        }
        if (window.outerWidth === 425) {
          $(".mock-questions-count-column").css("padding-left", "0px");
        }
      });
      $(".question-full-image img, .solution-body img").click(function () {
        modal.style.display = "block";
        modalImg.src = this.src;
        captionText.innerHTML = this.alt;
      });
      $(".question-full-image img, .solution-body img").hover(function () {
        $(this).css("cursor", "pointer");
      });
      $("#myMockModal span").click(function () {
        modal.style.display = "none";
      });
    });
  }

  handleBookmarkQuestion = () => {
    let mockQuestionSet = this.state.mockQuestionSet[this.state.selectedIndex];
    const requestBody = {
      mocktest_question_id:
        this.state.mockQuestionSet[this.state.selectedIndex].id,
    };
    const bookmarkData = Env.post(
      this.props.envendpoint + `mocktest/myquestions`,
      requestBody
    );
    bookmarkData.then(
      (response) => {
        if (mockQuestionSet.isBookmarked === 0) {
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
    mockQuestionSet.isBookmarked === 1
      ? (mockQuestionSet.isBookmarked = 0)
      : (mockQuestionSet.isBookmarked = 1);
    this.setState({ mockQuestionSet: this.state.mockQuestionSet });
  };

 

 
  getMocktestReattempted = async (response) => {
    const user_id = StorageConfiguration.sessionGetItem("user_id");
  
    try {
      const getQuizData = await Env.get(
        this.props.envendpoint +
          `myquestions/view_mocktest/${user_id}`
      );
  
      const solutionData = [];
      const correct = [];
      const question = getQuizData.data.response.question;
  
      if (Array.isArray(question)) {
        question.forEach((element, Qindex) => {
          let Qstatus = true;
          var choices = [];
          console.log(element, "elementttttttttttt");
          console.log(user_id, "user_id");
          console.log(getQuizData, "getQuizData");
          element.choices.forEach((item) => {
            choices.push({
              id: item.id,
              language1_choice: item.language1_choice,
              language2_choice: item.language2_choice,
              language3_choice: item.language3_choice,
              is_right_choice: item.is_right_choice,
              user_choices: item.user_choices,
            });
  
            if (item.is_right_choice === 1 && item.user_choices !== null) {
              correct.push(choices);
            }
            if (element.quesitions_selected) {
              if (
                item.id ===
                element.quesitions_selected.mock_test_question_choice_id
              ) {
                Qstatus = item.is_right_choice === 1;
              }
            }
          });
  
          let isRight = choices.findIndex((item) => item.is_right_choice === 1);
          let userPicked = choices.find(
            (item) => item.is_right_choice === 1 && item.user_choices !== null
          );
          solutionData.push({
            id: element.id,
            question_no: Qindex + 1,
            language1_question: element.language1_question,
            language2_question: element.language2_question,
            language3_question: element.language3_question,
            language1_solution: element.language1_solution,
            language2_solution: element.language2_solution,
            language3_solution: element.language3_solution,
            choices: choices,
            isAttempted: false,
            isCorrect: null,
            Qstatus: Qstatus,
            is_question_attempted: element.is_question_attempted,
            selected_answer: null,
            isBookmarked: element.is_favourite,
            is_skipped: element.is_skipped,
            userPicked: userPicked,
            isRight: isRight,
            difficult_level: element.difficult_level,
            question_overall_percentage: element.question_overall_percentage,
            topics_name: element.topics && element.topics.name,
            question_group: element.question_group,
            question_time_taken: element.quesitions_selected
              ? element.quesitions_selected.mock_test_question_time
              : 0,
          });
        });
      }
  
      this.setState({
        activeTabIndex: 1,
        activeSecTabIndex: `_1`,
        mockQuestionSet: solutionData,
        myQuestion: true,
        activeLoader: false,
        is_doubt: {
          is_doubt_share: 0,
        },
      });
    } catch (error) {
      console.error(error);
      
    }
  };
  

 

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

  handleMenu = () => {
    $(".mock-questions-count-column").fadeIn();
    $(".mock-questions-count-column").css({ display: "block" });
    $(".mock-questions-count-column-diable").fadeIn();
    $(".mock-questions-count-column-diable").css({ display: "block" });
    this.setState({
      showFullview: true,
    });
  };

  handlecloser = () => {
    $(".mock-questions-count-column").fadeOut();
    $(".mock-questions-count-column").css({ display: "block" });
    $(".mock-questions-count-column-diable").fadeOut();
    $(".mock-questions-count-column-diable").css({ display: "block" });

    this.setState({
      showFullview: false,
    });
  };

  // handleNext = () => {

  //     this.setState({
  //       selectedIndex: this.state.selectedIndex + 1,
  //     });
  //   };

  toggleAsideScreen = (type) => {
    function width() {
      let screenwidth = "";
      screenwidth = document.documentElement.clientWidth;
      return screenwidth;
    }
    let screenwidth = width();
    let showFullview = this.state.showFullview;
    if (type === "start") {
      if (screenwidth < 1100) {
        showFullview = false;
      }
    } else {
      if (screenwidth < 500) {
        showFullview = false;
      } else if (screenwidth < 1024) {
        showFullview = false;
      } else if (screenwidth < 1099) {
        showFullview = false;
      } else if (screenwidth > 1100) {
        $(".mock-questions-count-column").css(
          "display",
          "block",
          "position",
          "relative"
        );
        showFullview = true;
      }
    }
    this.setState({ showFullview: showFullview });
  };

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
    const mockQuestionSet = this.state.mockQuestionSet;

    return (
      <div
        className="mocktest-myquestion-container"
        style={{
          width: "100%",
          padding: "0px",
          margin: "0px",
          background: "#f9f9fd",
        }}
      >
        <div className="main-layout">
          {!this.state.activeLoader && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* Header */}
              <Card
                className="card main-head"
                style={{
                  boxShadow: " 0 2px 4px 0 #D7DEF8", 
                  width: "100%",
                }}
              >
                <Row
                  align="middle"
                  className="row-header"
                  style={{
                    boxShadow: " 0 2px 4px 0 #D7DEF8",
                    height:"57px", 
                  }}
                >
                  {/* Logo */}
                  <Col
                    xs={12}
                    sm={4}
                    md={5}
                    lg={5}
                    xl={5}
                    xxl={4}
                    className="mock-logo-column"
                  >
                    <span className="span" style={{ cursor: "pointer" }}>
                      <img src={logos} className="image" alt="logo" />
                    </span>
                  </Col>
                  {/* Title */}
                  <Col
                    xs={12}
                    sm={8}
                    md={9}
                    lg={11}
                    xl={11}
                    xxl={11}
                    className="title-column"
                  >
                    <div
                      style={{ position: "relative" }}
                      className="mocktest-title-container"
                    >
                      <div className="mocktest-title">{"My Questions"}</div>
                    </div>
                  </Col>
                  {/* Full Screen */}
                  <Col
                    xs={0}
                    sm={4}
                    md={10}
                    lg={8}
                    xl={8}
                    xxl={9}
                    className="title-column"
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "end",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ marginRight: "10px" }}>
                        <p className="screen-title">Full Screen</p>
                      </div>
                      <div style={{ float: "right", marginRight: "10px" }}>
                        {this.state.showfullscreen ? (
                          <ExpandOutlined
                            style={{
                              padding: "10px",
                              background: "#e4e5e7",
                              borderRadius: "90px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                            onClick={() => {
                              this.toggleFullScreen(false);
                            }}
                          />
                        ) : (
                          <CompressOutlined
                            style={{
                              padding: "8px",
                              background: "#e4e5e7",
                              borderRadius: "60px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                            onClick={() => {
                              this.toggleFullScreen(true);
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
                {/* content and footer */}
           <Row className="body-inner-layout">
                <Col
                  xs={24}
                  sm={24}
                  md={24}
                  lg={!this.state.showFullview ? 24 : 16}
                  xl={!this.state.showFullview ? 24 : 18}
                  xxl={!this.state.showFullview ? 24 : 18}
                  className="mock-question-column question-tab-column"
                  style={{
                    padding: "0px",
                    background: "#fff",
                    border: "none",
                    boxShadow: " 0 2px 4px 0 #D7DEF8",
                  }}
                >
                  <div
                    className="body-layout"
                    style={{
                      marginTop: "0px",
                    }}
                  >
                    <div className="inner-layout">
                      <div className="card">
                        <Row
                          gutter={[55, 10]}
                          className="row"
                          style={{ marginTop: "15px" }}
                        >
                          <Col
                            xs={24}
                            sm={12}
                            md={!this.state.showFullview ? 24 : 9}
                            lg={!this.state.showFullview ? 12 : 12}
                            xl={12}
                            xxl={12}
                            className="inner-Content question-stat "
                          >
                            <div
                              className="question-bars"                            
                            >
                              Question {this.state.selectedIndex + 1} /&nbsp;
                              {mockQuestionSet.length}
                            </div>
                          </Col>
                          <Col
                            xs={24}
                            sm={12}
                            md={!this.state.showFullview ? 24 : 9}
                            lg={!this.state.showFullview ? 24 : 10}
                            xl={11}
                            xxl={11}
                            className="inner-ContentEnd question-stat"
                          >
                            <div
                              className="content"
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "end",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "flex-end",
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  className="share-span"
                                  style={{ paddingRight: "10px" }}
                                  onClick={() => {
                                    this.mocktestReportPopup.showModal(
                                      mockQuestionSet[this.state.selectedIndex]
                                    );
                                  }}
                                >
                                  <img
                                    src={report}
                                    alt="report"
                                    className="share-icon"
                                  />
                                </div>

                                <div
                                  onClick={this.handleBookmarkQuestion}
                                  className="bookmark-span"
                                  style={{ paddingRight: "10px" }}
                                >
                                  <img
                                    src={
                                      mockQuestionSet.length !== 0 &&
                                      mockQuestionSet[this.state.selectedIndex]
                                        .isBookmarked === 0
                                        ? bookmark
                                        : bookmarked
                                    }
                                    alt="bookmarked"
                                    className="bookmark-icon"
                                  />
                                </div>
                                <div
                                  onClick={() =>
                                    this.quizSharePopup.showModal(
                                      "QuizQuestions",
                                      "",
                                      "",
                                      this.state.is_doubt
                                    )
                                  }
                                  className="share-span"
                                  style={{ paddingRight: "10px" }}
                                >
                                  <img
                                    src={share}
                                    alt="share"
                                    className="share-icon"
                                  />
                                </div>
                               
                              </div>
                            </div>
                          </Col>
                        </Row>
                        <Row gutter={[10, 10]} id="question-area">
                          {mockQuestionSet[this.state.selectedIndex]
                            .question_group !== null && (
                            <Col
                              xs={24}
                              sm={24}
                              md={12}
                              lg={12}
                              xl={12}
                              xxl={12}
                              id={
                                mockQuestionSet[this.state.selectedIndex]
                                  .isAttempted
                                  ? "mocktest-myquestions-attempted-fixed-contents"
                                  : "mocktest-myquestions-notvisited-fixed-contents"
                              }
                            >
                              <div className="group-question question-full-image">
                                <div
                                  className="question"
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      mockQuestionSet[this.state.selectedIndex]
                                        .question_group !== null
                                        ? mockQuestionSet[
                                            this.state.selectedIndex
                                          ].question_group[
                                            `content_${this.state.language_id}`
                                          ]
                                        : "",
                                  }}
                                  style={{
                                    background: "transparent",
                                  }}
                                ></div>
                              </div>
                            </Col>
                          )}
                          <Col
                            xs={
                              mockQuestionSet[this.state.selectedIndex]
                                .question_group !== null
                                ? 24
                                : 24
                            }
                            sm={
                              mockQuestionSet[this.state.selectedIndex]
                                .question_group !== null
                                ? 24
                                : 24
                            }
                            md={
                              mockQuestionSet[this.state.selectedIndex]
                                .question_group !== null
                                ? 12
                                : 24
                            }
                            lg={
                              mockQuestionSet[this.state.selectedIndex]
                                .question_group !== null
                                ? 12
                                : 24
                            }
                            xl={
                              mockQuestionSet[this.state.selectedIndex]
                                .question_group !== null
                                ? 12
                                : 24
                            }
                            xxl={
                              mockQuestionSet[this.state.selectedIndex]
                                .question_group !== null
                                ? 12
                                : 24
                            }
                            id={
                              mockQuestionSet[this.state.selectedIndex]
                                .isAttempted
                                ? "mocktest-myquestions-attempted-fixed-contents"
                                : "mocktest-myquestions-notvisited-fixed-contents"
                            }
                            className="question-options-group"
                          >
                            {mockQuestionSet[this.state.selectedIndex][
                              `${this.state.language_id}_question`
                            ] !== null ? (
                              <>
                                <div className=" question-full-image-option">
                                  <div className="question question-full-image">
                                    <div
                                      className="question-name"
                                      dangerouslySetInnerHTML={{
                                        __html:
                                          mockQuestionSet.length !== 0 &&
                                          mockQuestionSet[
                                            this.state.selectedIndex
                                          ][
                                            `${this.state.language_id}_question`
                                          ],
                                      }}
                                    ></div>
                                  </div>
                                </div>

                                <div className="reattempt-choices">
                                  <div>
                                    <Radio.Group
                                      value={
                                        mockQuestionSet[
                                          this.state.selectedIndex
                                        ].selected_answer
                                      }
                                      style={{ width: "100%" }}
                                    >
                                      {mockQuestionSet.length !== 0 &&
                                        mockQuestionSet[
                                          this.state.selectedIndex
                                        ].choices.length !== 0 &&
                                        mockQuestionSet[
                                          this.state.selectedIndex
                                        ].choices.map((item, index) => (
                                          <div
                                            className={
                                              mockQuestionSet[
                                                this.state.selectedIndex
                                              ].isAttempted &&
                                              item.is_right_choice === 1
                                                ? "right"
                                                : mockQuestionSet[
                                                    this.state.selectedIndex
                                                  ].isAttempted &&
                                                  item.is_right_choice === 0 &&
                                                  item.selected_choice === 1
                                                ? "wrong"
                                                : item.selected_choice === 1 &&
                                                  mockQuestionSet[
                                                    this.state.selectedIndex
                                                  ].isAttempted
                                                ? "choosen"
                                                : "not-choosen"
                                            }
                                            key={index}
                                          >
                                            <div
                                              className="mocktest-question-solution-choices-container"
                                              style={{
                                                padding: "2px 15px 2px 15px",
                                                margin: " 10px 32px",
                                                fontSize: "17px",
                                              }}
                                            >
                                              <Radio
                                                className={
                                                  mockQuestionSet[
                                                    this.state.selectedIndex
                                                  ].isAttempted &&
                                                  item.is_right_choice === 1
                                                    ? "mocktest-questions-main2-card2-choice-isright"
                                                    : mockQuestionSet[
                                                        this.state.selectedIndex
                                                      ].isAttempted &&
                                                      item.is_right_choice ===
                                                        0 &&
                                                      item.selected_choice === 1
                                                    ? "mocktest-questions-main2-card2-choice-iswrong"
                                                    : item.selected_choice ===
                                                        1 &&
                                                      mockQuestionSet[
                                                        this.state.selectedIndex
                                                      ].isAttempted
                                                    ? "mocktest-questions-main2-card2-choice-choosen"
                                                    : "mocktest-questions-main2-card2-choice-not-choosen"
                                                }
                                                onChange={(e) =>
                                                  this.handleReattemptChoice(
                                                    e,
                                                    item,
                                                    index
                                                  )
                                                }
                                                value={index}
                                                style={{
                                                  width: "100%",
                                                  paddingLeft: "5px",
                                                }}
                                              >
                                                <div
                                                  className={
                                                    item.selected_choice === 1
                                                      ? "mocktest-reattempt-question-choices-value-choosen question-full-image"
                                                      : "mocktest-reattempt-question-choices-value-not-choosen question-full-image"
                                                  }
                                                  style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    padding: "10px 16px",
                                                  }}
                                                >
                                                  <div
                                                    style={{
                                                      padding:
                                                        "0px 5px 0px 0px",
                                                    }}
                                                  >
                                                    {`${Choices[index]}`}
                                                  </div>
                                                  <div
                                                    dangerouslySetInnerHTML={{
                                                      __html:
                                                        item[
                                                          `${this.state.language_id}_choice`
                                                        ],
                                                    }}
                                                  ></div>
                                                </div>
                                              </Radio>
                                            </div>
                                          </div>
                                        ))}
                                    </Radio.Group>
                                  </div>
                                </div>

                                {mockQuestionSet.length > 0 &&
                                  mockQuestionSet[this.state.selectedIndex]
                                    .isAttempted && (
                                    <div className="solution-layout">
                                      <div
                                        style={{
                                          background: "#E4E8ED",
                                          padding: "10px 20px",
                                          marginLeft: "10px",
                                        }}
                                      >
                                        <Text className="solution-text">
                                          Solution
                                        </Text>
                                      </div>
                                      <div
                                        className="solution-body question-full-image"
                                        style={{
                                          padding: "10px 10px 150px 30px",
                                        }}
                                      >
                                        <div
                                          className="content"
                                          dangerouslySetInnerHTML={{
                                            __html:
                                              mockQuestionSet.length !== 0 &&
                                              mockQuestionSet[
                                                this.state.selectedIndex
                                              ][
                                                `${this.state.language_id}_solution`
                                              ],
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}
                              </>
                            ) : (
                              <div
                                style={{
                                  display: "flex",
                                  placeContent: "center",
                                }}
                              >
                                <div className="question question-full-image">
                                  <div className="question-name">
                                    <h1>No Question found</h1>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </div>

                  <div
                    className={
                      this.state.showFullview
                        ? "mocktest-footer-positions"
                        : "mocktest-footer-positions-full"
                    }
                  >
                    <Card className="mocktest-footer-container">
                      <Row>
                    <Col
                            xs={24}
                            sm={12}
                            md={ 9}
                            lg={ 12}
                            xl={10}
                            xxl={10}
                            className="inner-Content question-stat "
                          >
                      <div
                        className="back-solu-quest-btn"
                        
                      >
                        <Button
                          type="link"
                          onClick={() => {
                            this.props.navigate(`/my-questions`);
                            if (document.cancelFullScreen) {
                              document.cancelFullScreen();
                            } else if (
                              document.mozCancelFullScreen ||
                              document.mozFullScreen
                            ) {
                              document.mozCancelFullScreen();
                            } else if (
                              document.webkitCancelFullScreen ||
                              document.webkitIsFullScreen
                            ) {
                              document.webkitCancelFullScreen();
                            }
                          }}
                          style={{color:"black"}}
                        >
                          Back to list
                        </Button>
                      </div>
                      </Col>

                      <Col
                            xs={24}
                            sm={12}
                            md={ 9}
                            lg={ 10}
                            xl={7}
                            xxl={7}
                            className="inner-ContentEnd question-stat"
                          >

                      <div  style={{display:"flex"}}>
                       
                      { this.state.selectedIndex!==0 ? (
                          <div
                            className="prev-solu-btn"
                            onClick={() => {
                              if (this.state.selectedIndex !== 0) {
                                this.setState({
                                  selectedIndex: this.state.selectedIndex - 1,
                                });
                              }
                            }}
                          >
                            <Button type="link"  style={{color:"black"}}>Previous</Button>
                          </div>):null}
                        {mockQuestionSet.length - 1 !==
                        this.state.selectedIndex ? (
                          <div
                            className={"save-next-myquest-btn"}
                            onClick={() => {
                              if (
                                mockQuestionSet.length - 1 !==
                                this.state.selectedIndex
                              ) {
                                this.setState({
                                  selectedIndex: this.state.selectedIndex + 1,
                                });
                              }
                            }}
                          >
                          Next
                          </div>
                        ) : null}
                      </div>
                      </Col>
                      </Row>
                    </Card>
                  </div>
                </Col>
                {/* Sidebar */}
                {/* {!this.state.myQuestion  && ( */}
                <Col
                  xs={24}
                  sm={24}
                  md={24}
                  lg={8}
                  xl={6}
                  xxl={6}
                  //  className="questions-count-column"

                  style={{
                    backgroundColor: "#e0f1fb",
                    boxShadow: "rgba(17, 12, 41, 0.15) 0px 2px 10px 0px",
                  }}
                  className={
                    this.state.showFullview
                      ? "mock-questions-count-column"
                      : "mock-questions-count-column-diable"
                  }
                  id="mocktest-myquestions-status-card"
                >
                  <Card
                    className="card"
                    style={{
                      marginBottom: "10px",
                      backgroundColor: "#e0f1fb",
                    }}
                  >
                    <div className="my-question-profile-flex">
                      {/* Mockaside icon */}

                      {this.state.showFullview && (
                        <span
                          onClick={this.handlecloser}
                          className="my-questions-mockaside-icon"
                        >
                          <img alt="mockaside" src={mockaside} />
                        </span>
                      )}

                      {/* Profile image */}
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
                      {/* Profile details */}
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
                    </div>
                    {/* Divider */}
                    <Divider style={{ margin: 0 }} />
                    {/* Question status */}
                    <div
                      className="layout"
                      style={{ fontfamily: "PoppinsNormal" }}
                    >
                      <div className="header">
                        <div
                          className="text"
                          style={{
                            textAlign: "center",
                            fontSize: "16px",
                            backgroundColor: "#0B649D",
                            color: "white",
                            padding: "10px 0px 10px 0px",
                            width: "100%",
                          }}
                        >
                          Question Status
                        </div>
                      </div>

                      <div className="content" id={"myquestion-fixed-content"}>
                        <Row gutter={[30, 30]} className="row">
                          <Col
                            xs={24}
                            sm={24}
                            md={24}
                            lg={24}
                            xl={24}
                            xxl={24}
                            className="column"
                          >
                            <div className="layout">
                              <div
                                className="content"
                                id={"mocktest-myquestions-attempted-fixed-status"}
                                style={{ margin: "20px 6px" }}
                              >
                                <div
                                  className="mocktest-myquestions-content-grid"
                                 
                                >
                                  {this.state.mockQuestionSet.map(
                                    (item, index) => (
                                      <div
                                        key={index}
                                        style={{
                                          gridColumn: 1 / 5,
                                        }}
                                      >
                                        <div
                                          className="mocktest-myquestion-content-background-grid"
                                          style={{
                                            boxShadow:
                                              this.state.selectedIndex === index
                                                ? "rgba(0, 0, 0, 0.1) 0px 0px 90px"
                                                : "none",
                                            backgroundColor:
                                              this.state.selectedIndex === index
                                                ? " #ADD8E6"
                                                : "transparent",
                                          }}
                                        >
                                          <div
                                            style={{
                                              flex: 1,
                                              backgroundImage: `url("data:image/svg+xml,${
                                                item.isCorrect !== null
                                                  ? item.isCorrect
                                                    ? solutionCorrect
                                                    : solutionWrong
                                                  : mockNotvisited
                                              }")`,
                                              color: `${
                                                item.isCorrect === null
                                                  ? "black"
                                                  : "white"
                                              }`,
                                              backgroundRepeat: "no-repeat",
                                              backgroundPosition: "top center",
                                              backgroundSize: "42px 100%",
                                              padding: "6px",
                                              fontSize: "15px",
                                            }}
                                            onClick={() =>
                                              this.setState({
                                                selectedIndex: index,
                                              })
                                            }
                                            className={
                                              item.isAttempted
                                                ? "un-answered"
                                                : "not-answered"
                                            }
                                          >
                                            <div
                                              style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                padding: "11px",
                                                fontWeight: "700",
                                                position: "relative",
                                              }}
                                            >
                                              <span className="value">
                                                {item.question_no}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </Card>
                </Col>
                {!this.state.showFullview && (
                  <span
                    onClick={this.handleMenu}
                    className="my-questions-mockaside-icon-left"
                  >
                    <img
                      style={{ transform: "rotate(180deg)" }}
                      alt="mockaside"
                      src={mockaside}
                    />
                  </span>
                )}

                {/* )}  */}
              </Row>
             
            </div>
          )}
         
        </div>
        <MocktestReportPopup
          ref={(instance) => {
            this.mocktestReportPopup = instance;
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
})(MockQuestionDetails);
