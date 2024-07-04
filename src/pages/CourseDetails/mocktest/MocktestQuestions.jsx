import React, { Component } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Divider,
  Spin,
  Avatar,
  Radio,
  Dropdown,
  Menu,
  Checkbox,
  Space,
} from "antd";
import {
  CaretDownOutlined,
  RightOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import right_status from "../../../assets/svg-icons/result-correct.svg";
import wrong_status from "../../../assets/svg-icons/result-wrong.svg";
import result_skiped from "../../../assets/svg-icons/result-skiped.svg";
import result_notvisited from "../../../assets/svg-icons/result-notvisited.svg";
import MocktestSwitchOverPopup from "../../../components/Mocktest/MocktestSwitchOverPopup";
import MocktestReportPopup from "../../../components/Mocktest/MocktestReportPopup";
import QuizSharePopup from "../../../components/QuizSharePopup";
import "../../../assets/css/mocktest-question.css";
import Env, { profileImageUrl } from "../../../utilities/services/Env";
import Choices from "../../../utilities/mock-data/MocktestChoices.json";
import MocktestInstruction from "../../../components/Mocktest/MocktestInstruction";
import {
  currentPageRouting,
  mocktestStatusUpdate,
  mocktestReattempt,
} from "../../../reducers/action";
import { CommonService } from "../../../utilities/services/Common";
import moment from "moment";
import StorageConfiguration from "../../../utilities/services/StorageConfiguration";
import pause_icon from "../../../assets/svg-icons/quiz-pause.svg";
import $ from "jquery";
import { analytics } from "../../../firebase-config";
import { logEvent } from "firebase/analytics";
import timer from "../../../assets/svg-icons/timer.svg";
import bookmark from "../../../assets/svg-icons/mock-bookmark.svg";
import bookmarked from "../../../assets/svg-icons/mock-bookmarked.svg";
import markforreview from "../../../assets/svg-icons/mock-mark-for-review.svg";
import markforreviewed from "../../../assets/svg-icons/mock-mark-for-reviewed.svg";
import mockaside from "../../../assets/svg-icons/mock-aside-icon.svg";
import report from "../../../assets/svg-icons/report.svg";
import share from "../../../assets/svg-icons/mock-share.svg";
import "../../../assets/css/mocktest-common.css";
import MocktestLeavePopup from "../../../components/Mocktest/MocktestLeavePopup";
import { renderToStaticMarkup } from "react-dom/server";
import MockAnswered from "../../../assets/js-icons/MockAnswered";
import MockunAnswered from "../../../assets/js-icons/MockunAnswered";
import MockMarkedAnswered from "../../../assets/js-icons/MockMarkedAnswered";
import MockNotvisited from "../../../assets/js-icons/MockNotvisited";
import MockMarked from "../../../assets/js-icons/MockMarked";
import MockInfo from "../../../assets/js-icons/MockInfo";
import NoRecords from "../../../components/NoRecords";
import SolutionSkiped from "../../../assets/js-icons/SolutionSkiped";
import SolutionCorrect from "../../../assets/js-icons/SolutionCorrect";
import SolutionWrong from "../../../assets/js-icons/SolutionWrong";
import SolutionTimer from "../../../assets/js-icons/SolutionTimer";
import _ from "lodash";
import MocktestErrorPopup from "../../../components/Mocktest/MocktestErrorPopup";
import * as workerTimers from "worker-timers";
import CreateDoubts from "../../../components/Doubt/CreateDoubts";
import logo from "../../../assets/svg-images/waterMark.svg";
import * as htmlToImage from "html-to-image";
import { message } from "antd";
import { connect } from "react-redux";

const { Text } = Typography;

const mockAnswered = encodeURIComponent(renderToStaticMarkup(<MockAnswered />));
const mockunAnswered = encodeURIComponent(
  renderToStaticMarkup(<MockunAnswered />)
);
const mockmarkedAnswered = encodeURIComponent(
  renderToStaticMarkup(<MockMarkedAnswered />)
);
const mockNotvisited = encodeURIComponent(
  renderToStaticMarkup(<MockNotvisited />)
);
const mockMarked = encodeURIComponent(renderToStaticMarkup(<MockMarked />));
const solutionSkiped = encodeURIComponent(
  renderToStaticMarkup(<SolutionSkiped />)
);
const solutionCorrect = encodeURIComponent(
  renderToStaticMarkup(<SolutionCorrect />)
);
const solutionWrong = encodeURIComponent(
  renderToStaticMarkup(<SolutionWrong />)
);

class MocktestQuestions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTabIndex: null,
      activeSecTabIndex: null,
      activeTab: [],
      attempted: [],
      attempted_count: [],
      activeLoader: true,
      correct: [],
      course_id: null,
      CheckboxValue: ["All"],
      changeStatus: "",
      current_use_time_obj: [],
      fullMockQuestionSet: [],
      is_section_timer: props.mocktest.is_section_timer,
      language_id: props.language_id.language,
      languageList: props.languageList,
      language_name: props.language_id.name,
      myQuestion: false,
      mocktest_section_id: 1,
      mocktest_record_id: 0,
      mocktest_section: props.mocktest_section,
      mockRequestPayload: {},
      mockQuestionSet: [],
      marked: [],
      MocktestResume: props.mocktest_status.resume,
      mockSectionDetails: [],
      mocktest_section_record: [],
      MocktestReattempt: props.mocktest_reattempt.state,
      MocktestStart: props.mocktest_status.start,
      MocktestSolution: props.mocktest_status.solution,
      notvisited: [],
      overall_time: props.overall_time,
      originalSectionTime: props.mocktest_section,
      selectedIndex: 0,
      sectionRemainingTime: [],
      sectionTimeTaken: {
        _1: 0,
      },
      sectionTime: 0,
      showFullview: true,
      skipped: [],
      unanswered: [],
      wrong: [],
      timerStatus: props.mocktest_status.start ? "start" : "resume",
      sectionEnable: [],
      mock_section_status: [],
      isSubmit: false,
      isPostSave: false,
      isRefesh: false,
      sectionSubmitStatus: null,
      sectionSubmitBtnAllow: true,
      isAPISubmit: false,
    };
    this.isScrolling = true;
    this.userId = StorageConfiguration.sessionGetItem("user_id");
    this.answers = [];
    this.panes = [];
  }

  componentDidMount() {
    window.addEventListener("offline", this.changeStatus);
    window.addEventListener("beforeunload", this.handleRefresh);
    window.scrollTo(0, 0);
    this.props.dispatch(currentPageRouting(null));
    this.handleSectionQuestion();
    logEvent(analytics, "select_content", {
      page_title: this.state.MocktestStart
        ? "StartMocktest"
        : this.state.MocktestSolution
        ? "MocktestSolution"
        : this.state.MocktestResume
        ? "MocktestResume"
        : "MocktestReattempt",
    });

    if (
      this.props.mocktest_reattempt.state ||
      this.props.mocktest_status.solution
    ) {
      window.removeEventListener("beforeunload", this.handleRefresh);
    }
    this.toggleAsideScreen("start");
    // window.history.pushState(null, '', window.location.href);
    window.addEventListener("popstate", this.handleBackButton);
    window.addEventListener("message", this.receiveMessage, false);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.overallTimeOut !== this.props.overallTimeOut) {
      this.handleSubmit(false);
      this.handleclearQInterval();
    }
    if (newProps.overall_time !== this.props.overall_time) {
      this.setState({ overall_time: newProps.overall_time });
    }
  }

  componentDidUpdate() {
    var modal = document.getElementById("myMockModal");
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
    const targetDiv2 = document.querySelector(`#question-area`);
    targetDiv2 &&
      (this.state.MocktestStart || this.state.MocktestResume) &&
      targetDiv2.addEventListener(
        "wheel",
        function (e) {
          e.preventDefault();
          if (!this.isScrolling)
            // message.config({
            //   maxCount: 1,
            //   duration: 5, // Duration of the message
            //   style: {
            //     // Apply styles to the entire message popup
            //     backgroundColor: "#e0f1fb", // Background color for the entire message popup
            //     padding: "10px",
            //     color: "white", // Text color
            //   },
            // });

            message.info({
              content:
                "You can click on the scrollbar and drag it to scroll the page, the scroll wheel is disabled to provide you real exam experience.",
              duration: 5,
            });
          this.isScrolling = true;
        },
        { passive: false }
      );
  }

  componentWillUnmount() {
    if (
      (this.state.MocktestStart || this.state.MocktestResume) &&
      this.state.overall_time > 0 &&
      !this.state.activeLoader &&
      !this.state.isSubmit
    ) {
      this.setState({ isRefesh: false });
      this.submitLeaveMocktest("unmounted");
    }
    if (
      (this.state.MocktestStart || this.state.MocktestResume) &&
      this.state.overall_time <= 0 &&
      !this.state.isSubmit &&
      !this.state.isAPISubmit
    ) {
      this.postMockQuestionSubmit("back");
    }
    window.removeEventListener("beforeunload", this.handleRefresh);
    window.removeEventListener("online", this.changeStatus);
    window.removeEventListener("offline", this.changeStatus);
    window.removeEventListener("popstate", this.handleBackButton);
    window.removeEventListener("message", this.receiveMessage, false);
  }

  handleRefresh = async (e) => {
    if (
      !this.state.activeLoader &&
      !this.state.isRefesh &&
      !this.state.isSubmit &&
      !this.state.isAPISubmit
    ) {
      await this.submitLeaveMocktest("unmounted");
      this.setState({ isRefesh: true });
    }
    if (
      (this.state.MocktestStart || this.state.MocktestResume) &&
      this.state.overall_time <= 0 &&
      !this.state.isSubmit
    ) {
      await this.postMockQuestionSubmit("back");
    }
  };

  receiveMessage = (event) => {
    if (event.data === "handleLeaveMocktest") {
      this.handleLeaveMocktest();
    }
  };

  handleBackButton = (event) => {
    event.preventDefault();
    event.stopPropagation();
    window.history.pushState(null, "", window.location.href);
    // alert('Back button is disabled during the test.');
  };

  changeStatus = (e) => {
    this.errorPopup && this.errorPopup.showErrorModal("onLine");
  };

  /**
   * Handle add and get user based mocktest record
   */
  getMockUserRecord = (language_id) => {
    var mock_id = this.props.match.params.mock_id;
    let userattempt_overall_time = this.state.overall_time; // userattempt_overall_time is in sec with or without section time
    let sectionTimeTaken = [];
    this.panes.forEach((item) => {
      sectionTimeTaken.push({
        time: 0,
        section_id: item.key,
        status: "pause",
        section_mark: 30,
      });
    });
    const mocktest = {
      mock_test_id: mock_id,
      user_id: this.userId,
      user_status: "pause",
      mocktest_start_at: moment(new Date()).format("YYYY-MM-DD hh:mm:ss"),
      userattempt_overall_time: userattempt_overall_time,
      section_time_taken: sectionTimeTaken,
    };
    const getMockUserRecord = Env.post(
      this.props.envendpoint + `mocktest/userrecordsave`,
      mocktest
    );
    getMockUserRecord.then(
      (response) => {
        const data = response.data.response.data;
        this.setState({
          mocktest_record_id: data.id,
        });
        this.getAllMockQuestions(this.panes, language_id);
      },
      (error) => {
        console.error(error);
        this.errorPopup && this.errorPopup.showErrorModal("userrecord");
      }
    );
  };

  /**
   * Handle to get Language List from mocktest details
   */
  getLanguageList = (response) => {
    const data = response;
    this.setState({
      language_id: data[0].language,
      languageList: data,
      language_name: data[0].name,
    });
  };

  /**
   * Get mocktest question for all section
   */
  getAllMockQuestions = async () => {
    try {
      const apiRequests = Env.get(
        this.props.envendpoint + this.handleApiEndpoint()
      );
      const responses = await apiRequests;
      const fetchedData = responses.data.response;
      this.handleResponse(fetchedData);
    } catch (error) {
      CommonService.hendleError(error, this.props);
    }
  };

  /**
   * Get mocktest question for all Api Endpoint
   */
  handleApiEndpoint = () => {
    const mocktestId = this.props.match.params.mock_id;
    let api = "";
    if (this.state.MocktestStart) {
      api = `mocktests/${mocktestId}/questionsall?mock_test_id=${mocktestId}&submitted_mocktest_record_id=${this.state.mocktest_record_id}`;
    }
    if (this.state.MocktestResume) {
      api = `mocktest/resumenew/${mocktestId}`;
    }
    if (this.state.MocktestSolution) {
      api = `mocktest/solutionnew/${mocktestId}`;
    }
    if (this.state.MocktestReattempt) {
      api = `mocktest/solutionnew/${mocktestId}`;
    }
    return api;
  };

  /**
   * dispatch mocktest question response
   */
  handleResponse = (response) => {
    if (this.state.MocktestStart) {
      this.getMockQuestions(response);
    }
    if (this.state.MocktestResume) {
      this.getMocktestResumeQuestions(response);
    }
    if (this.state.MocktestSolution) {
      this.getMocktestSolutions(response);
    }
    if (this.state.MocktestReattempt) {
      this.getMocktestReattempted(response);
    }
  };

  /**
   * Handle to get mocktest question for start status
   */
  getMockQuestions = (response) => {
    this.panes.forEach((panes, pindex) => {
      const mocktest = [];
      let activeTabIndex = pindex + 1;
      let questions = response.questions.filter(
        (que) => que.mock_test_section_id === panes.key
      );
      const data = questions;
      const sectionTimeGiven =
        this.state.is_section_timer === 1
          ? this.props.mocktest.mocktest_section[pindex].section_time * 60
          : 0;
      data.forEach((element, Qindex) => {
        var choices = [];
        element.choices.forEach((item) => {
          choices.push({
            id: item.id,
            language1_choice: item.language1_choice,
            language2_choice: item.language2_choice,
            language3_choice: item.language3_choice,
            is_right_choice: item.is_right_choice,
            selected_choice: 0,
          });
        });
        mocktest.push({
          id: element.id,
          question_no: Qindex + 1,
          language1_question: element.language1_question,
          language2_question: element.language2_question,
          language3_question: element.language3_question,
          language1_solution: element.language1_solution,
          language2_solution: element.language2_solution,
          language3_solution: element.language3_solution,
          choices: choices,
          selected_answer: null,
          isAttempted: false,
          isReview: 0,
          mark: element.mark,
          negative_mark: element.negative_mark,
          isAnsReview: 0,
          isBookmarked: element.is_favourite,
          isSkipped: pindex === 0 && Qindex === 0,
          userPicked: 0,
          question_group: element.question_group,
          question_time_taken: 0,
        });

        this.answers.push({
          mock_question_id: element.id,
          mocktest_question_choice_id: 0,
          sort_order: Qindex + 1,
        });
      });
      mocktest["section_time_taken"] = sectionTimeGiven;
      let mockQuestionSet = this.state.mockQuestionSet;
      _.assign(mockQuestionSet, {
        [`_${activeTabIndex}`]: mocktest,
      });
      let qusReview = mockQuestionSet[`_${activeTabIndex}`].filter(
        (item) => item.isReview === 1
      );
      let ansReview = mockQuestionSet[`_${activeTabIndex}`].filter(
        (item) => item.isAnsReview === 1
      );
      let marked = this.state.marked;
      _.assign(marked, {
        [`_${activeTabIndex}`]: {
          qusReview: qusReview,
          ansReview: ansReview,
        },
      });
      let attempted_obj = mocktest.filter(
        (item) => item.isAttempted === true && item.isAnsReview === 0
      );
      let attempted = this.state.attempted;
      _.assign(attempted, {
        [`_${activeTabIndex}`]: attempted_obj,
      });
      let attempted_count = this.state.attempted_count;
      _.assign(attempted_count, {
        [`_${activeTabIndex}`]: attempted_obj.length,
      });
      let notvisited_obj = mocktest.filter(
        (item) => item.isAttempted === false && item.isSkipped === false
      );
      let notvisited = this.state.notvisited;
      _.assign(notvisited, {
        [`_${activeTabIndex}`]: notvisited_obj,
      });
      let unanswered_obj = mocktest.filter(
        (item) => item.isSkipped === true && item.isReview === 0
      );
      let unanswered = this.state.unanswered;
      _.assign(unanswered, {
        [`_${activeTabIndex}`]: unanswered_obj,
      });
      const sectionTime = this.getSectionUsedTime(mocktest);
      let sectionTimeTaken = this.state.sectionTimeTaken;
      _.assign(sectionTimeTaken, {
        [`_${activeTabIndex}`]: sectionTime,
      });
      let mock_section_status = this.state.mock_section_status;
      mock_section_status[`_${activeTabIndex}`] = "Pause";
      let sectionEnable = this.state.sectionEnable;
      if (this.state.activeTabIndex === activeTabIndex) {
        sectionEnable[`_${activeTabIndex}`] = false;
      }
      let sectionData = this.state.mockSectionDetails;
      let secIdex = parseInt(activeTabIndex, 10) - 1;
      let originalSectionTime =
        this.props.mocktest.mocktest_section[secIdex].section_time;
      sectionData[secIdex] = {
        key: activeTabIndex,
        section_id: this.panes[activeTabIndex - 1].key,
        sectionName: this.panes[activeTabIndex - 1].label,
        question: mocktest.length,
        ansMarked: marked[`_${activeTabIndex}`].ansReview.length,
        attempted: attempted[`_${activeTabIndex}`]
          ? attempted[`_${activeTabIndex}`].length
          : attempted.length,
        marked: marked[`_${activeTabIndex}`].qusReview.length,
        not_visted_count: notvisited[`_${activeTabIndex}`].length,
        skipped_count: unanswered[`_${activeTabIndex}`].length,
        time_take_in_section_time: sectionTimeTaken[`_${activeTabIndex}`],
        submitted_mocktest_record_id: this.state.mocktest_record_id,
        originalSectionTime: originalSectionTime * 60,
        mock_test_section_status: mock_section_status[`_${activeTabIndex}`],
      };
      this.setState(
        {
          activeTabIndex: 1,
          activeSecTabIndex: `_1`,
          sectionEnable: sectionEnable,
          mockQuestionSet: mockQuestionSet,
          mock_section_status: mock_section_status,
          mockSectionDetails: sectionData,
          notvisited: notvisited,
          unanswered: unanswered,
          marked: marked,
          activeLoader: false,
          mockRequestPayload: {
            mocktest_record_id: this.state.mocktest_record_id,
            mock_id: this.props.match.params.mock_id,
            mock_end_datetime: moment(new Date()).format("YYYY-MM-DD hh:mm:ss"),
            mock_start_datetime: moment(new Date()).format(
              "YYYY-MM-DD hh:mm:ss"
            ),
            id: this.userId,
            is_section_timer: this.state.is_section_timer,
            is_reattempt: this.props.mocktest_reattempt.state === false ? 0 : 1,
            skipped_questions_count: data.length,
            user_answers: JSON.stringify([]),
          },
          sectionTimeTaken: sectionTimeTaken,
        },
        () => {
          if (activeTabIndex === this.panes.length) {
            this.handleStartRunTime(mockQuestionSet);
          }
        }
      );
      this.props.dispatch(mocktestStatusUpdate(true, "start_timer"));
    });
  };

  /**
   * Handle to get mocktest question for resume status
   */
  getMocktestResumeQuestions = (response) => {
    let availableSec = [];
    let activeSecTabIndex = null;
    let activeTab = null;
    this.panes.forEach((panes, pindex) => {
      let activeTabIndex = pindex + 1;
      const mocktestQuestions = [];
      const data = response.mock_test;
      const questionsmocktest = data.questionsmocktest.filter(
        (que) => que.mock_test_section_id === panes.key
      );
      let section_details = data.section_details.filter(
        (item) =>
          _.isUndefined(item.section_question_count) ||
          item.section_question_count !== 0
      );
      let section_time_taken = this.getMockSectionUsedtime(
        section_details,
        this.props.mocktest_section[pindex]
      );
      questionsmocktest.forEach((element, Qindex) => {
        this.answers.push({
          mocktest_question_id: element.id,
          mocktest_question_choice_id: 0,
          sort_order: Qindex + 1,
        });
        var choices = [];
        let selected_answer = null;
        element.choices.forEach((item, index) => {
          choices.push({
            id: item.id,
            language1_choice: item.language1_choice,
            language2_choice: item.language2_choice,
            language3_choice: item.language3_choice,
            is_right_choice: item.is_right_choice,
            selected_choice: element.quesitions_selected
              ? item.id ===
                element.quesitions_selected.mock_test_question_choice_id
                ? 1
                : 0
              : 0,
            user_choices: item.user_choices,
          });
          if (element.quesitions_selected) {
            if (
              item.id ===
              element.quesitions_selected.mock_test_question_choice_id
            ) {
              selected_answer = index;
            }
          }
          if (item.user_choices !== null) {
            this.answers[index] = {
              mocktest_question_choice_id: item.id,
              mocktest_question_id: element.id,
              sort_order: index + 1,
            };
          }
        });
        let userPicked = choices.find((item) => item.user_choices !== null);
        mocktestQuestions.push({
          id: element.id,
          question_no: Qindex + 1,
          language1_question: element.language1_question,
          language2_question: element.language2_question,
          language3_question: element.language3_question,
          language1_solution: element.language1_solution,
          language2_solution: element.language2_solution,
          language3_solution: element.language3_solution,
          choices: choices,
          selected_answer: selected_answer,
          isAttempted: element.quesitions_selected
            ? element.quesitions_selected.mock_test_question_choice_id !== 0
              ? true
              : false
            : false,
          isReview: element.quesitions_selected
            ? element.quesitions_selected.marked_for_review
            : 0,
          mark: element.mark,
          negative_mark: element.negative_mark,
          isAnsReview: element.quesitions_selected
            ? element.quesitions_selected.answered_marked_for_review
            : 0,
          isBookmarked: element.is_favourite,
          isSkipped: element.quesitions_selected
            ? element.quesitions_selected.is_right_choice === 2
            : Qindex === 0,
          userPicked: userPicked,
          question_group: element.question_group,
          question_time_taken: element.quesitions_selected
            ? element.quesitions_selected.mock_test_question_time
            : 0,
        });
      });
      mocktestQuestions["section_time_taken"] = section_time_taken;
      let mockQuestionSet = this.state.mockQuestionSet;
      _.assign(mockQuestionSet, {
        [`_${activeTabIndex}`]: mocktestQuestions,
      });
      let qusReview = mockQuestionSet[`_${activeTabIndex}`].filter(
        (item) =>
          item.isReview === 1 &&
          item.isAnsReview === 0 &&
          item.isAttempted === false
      );
      let ansReview = mockQuestionSet[`_${activeTabIndex}`].filter(
        (item) =>
          item.isReview === 0 &&
          item.isAnsReview === 1 &&
          item.isAttempted === true
      );
      let marked = this.state.marked;
      _.assign(marked, {
        [`_${activeTabIndex}`]: {
          qusReview: qusReview,
          ansReview: ansReview,
        },
      });
      let notvisited_obj = mocktestQuestions.filter(
        (item) => item.isAttempted === false && item.isSkipped === false
      );
      let notvisited = this.state.notvisited;
      _.assign(notvisited, {
        [`_${activeTabIndex}`]: notvisited_obj,
      });
      let unanswered_obj = mocktestQuestions.filter(
        (item) => item.isSkipped === true && item.isReview === 0
      );
      let unanswered = this.state.unanswered;
      _.assign(unanswered, {
        [`_${activeTabIndex}`]: unanswered_obj,
      });
      let attempted_obj = mocktestQuestions.filter(
        (item) => item.isAttempted === true && item.isAnsReview === 0
      );
      let attempted = this.state.attempted;
      _.assign(attempted, {
        [`_${activeTabIndex}`]: attempted_obj,
      });
      let attempted_count = this.state.attempted_count;
      _.assign(attempted_count, {
        [`_${activeTabIndex}`]: attempted_obj.length,
      });
      const sectionTime = this.getSectionUsedTime(mocktestQuestions);
      let sectionTimeTaken = this.state.sectionTimeTaken;
      _.assign(sectionTimeTaken, {
        [`_${activeTabIndex}`]: sectionTime,
      });
      let mocktest_section = this.state.mocktest_section;
      let mock_section_status = this.state.mock_section_status;
      let keyss = _.keys(mock_section_status);
      if (keyss.length === 0) {
        section_details.forEach((item, index) => {
          if (item.mock_test_section_status !== undefined) {
            mock_section_status[`_${index + 1}`] =
              item.mock_test_section_status;
            mocktest_section[index].mock_test_section_status =
              item.mock_test_section_status;
          } else {
            mocktest_section[index].mock_test_section_status = "Pause";
            mock_section_status[`_${index + 1}`] = "Pause";
          }
        });
      }
      let sectionEnable = this.state.sectionEnable;
      if (this.state.activeTabIndex === activeTabIndex) {
        sectionEnable[`_${activeTabIndex}`] =
          mock_section_status[`_${activeTabIndex}`] === "completed"
            ? true
            : false;
      }
      if (
        mock_section_status[`_${activeTabIndex}`] !== "completed" &&
        mocktestQuestions["section_time_taken"] > 0
      ) {
        if (activeTab === null) {
          activeTab = panes;
        }
        availableSec.push(activeTabIndex);
      }
      if (activeTabIndex === this.panes.length && availableSec.length === 0) {
        activeTab = panes;
      }
      let sectionData = this.state.mockSectionDetails;
      let secIdex = parseInt(activeTabIndex, 10) - 1;
      let originalSectionTime =
        this.props.mocktest.mocktest_section[secIdex].section_time;
      sectionData[secIdex] = {
        key: activeTabIndex,
        section_id: this.panes[activeTabIndex - 1].key,
        sectionName: this.panes[activeTabIndex - 1].label,
        question: mocktestQuestions.length,
        ansMarked: marked[`_${activeTabIndex}`].ansReview.length,
        attempted: attempted[`_${activeTabIndex}`]
          ? attempted[`_${activeTabIndex}`].length
          : attempted.length,
        marked: marked[`_${activeTabIndex}`].qusReview.length,
        not_visted_count: notvisited[`_${activeTabIndex}`].length,
        skipped_count: unanswered[`_${activeTabIndex}`].length,
        time_take_in_section_time: sectionTimeTaken[`_${activeTabIndex}`],
        submitted_mocktest_record_id: data.mock_test_records[0].id,
        originalSectionTime: originalSectionTime * 60,
        mock_test_section_status: mock_section_status[`_${activeTabIndex}`],
      };
      // Get active tab index for in complete sections
      if (this.state.is_section_timer === 1) {
        activeSecTabIndex =
          availableSec.length === 0 ? activeTabIndex : availableSec[0];
      } else {
        activeSecTabIndex = 1;
      }
      this.setState(
        {
          activeTab: activeTab,
          activeTabIndex: activeSecTabIndex,
          activeSecTabIndex: `_${activeSecTabIndex}`,
          sectionEnable: sectionEnable,
          mockQuestionSet: mockQuestionSet,
          mockSectionDetails: sectionData,
          notvisited: notvisited,
          unanswered: unanswered,
          marked: marked,
          mocktest_section,
          activeLoader: activeTabIndex < this.panes.length,
          mocktest_section_record: section_details,
          mocktest_record_id: data.mock_test_records[0].id,
          mockRequestPayload: {
            mocktest_record_id: data.mock_test_records[0].id,
            mock_id: this.props.match.params.mock_id,
            mock_end_datetime: moment(new Date()).format("YYYY-MM-DD hh:mm:ss"),
            is_section_timer: this.state.is_section_timer,
            mock_start_datetime: moment(new Date()).format(
              "YYYY-MM-DD hh:mm:ss"
            ),
            id: this.userId,
            is_reattempt: this.props.mocktest_reattempt.state === false ? 0 : 1,
            skipped_questions_count:
              data.mock_test_records[0].skipped_questions_count,
            user_answers: JSON.stringify(this.answers),
          },
          sectionTimeTaken: sectionTimeTaken,
        },
        () => {
          if (this.state.is_section_timer === 1) {
            if (
              availableSec.length === 0 &&
              activeTabIndex === this.panes.length
            ) {
              this.handleSubmit(false);
            } else if (
              !(activeTabIndex < this.panes.length) &&
              availableSec.length !== 0
            ) {
              this.setState({
                mocktest_section_id: this.panes[activeSecTabIndex - 1].key,
              });
              this.handleResumeRunTime(mockQuestionSet, section_details);
            }
          } else {
            if (activeTabIndex === 1) {
              this.setState({
                mocktest_section_id: this.panes[activeSecTabIndex - 1].key,
              });
              this.handleResumeRunTime(mockQuestionSet, section_details);
            }
          }
        }
      );
    });
  };

  /**
   * Handle to get mocktest question for solution status
   */
  getMocktestSolutions = (response) => {
    this.panes.forEach((item, index) => {
      let activeTabIndex = index + 1;
      let questionsmocktest = response.mock_test.questionsmocktest.filter(
        (que) => que.mock_test_section_id === item.key
      );
      const solutionData = [];
      const correct = [];
      const data = response.mock_test;
      questionsmocktest.forEach((element, Qindex) => {
        var choices = [];
        let selected_answer = null;
        let Qstatus = true;
        element.choices.forEach((item, index) => {
          choices.push({
            id: item.id,
            language1_choice: item.language1_choice,
            language2_choice: item.language2_choice,
            language3_choice: item.language3_choice,
            is_right_choice: item.is_right_choice,
            user_choices: item.user_choices,
          });
          item.is_right_choice === 1 &&
            item.user_choices !== null &&
            correct.push(choices);
          if (element.quesitions_selected) {
            if (
              item.id ===
              element.quesitions_selected.mock_test_question_choice_id
            ) {
              selected_answer = index;
              Qstatus = item.is_right_choice === 1;
            } else if (selected_answer === null && item.is_right_choice === 1) {
              selected_answer = index;
            }
          } else if (item.is_right_choice === 1) {
            selected_answer = index;
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
          isAttempted: element.is_question_attempted !== 1 ? false : true,
          isBookmarked: element.is_favourite,
          selected_answer: selected_answer,
          Qstatus: Qstatus,
          is_skipped: element.is_skipped,
          userPicked: userPicked,
          isRight: isRight,
          difficult_level: element.difficult_level,
          question_overall_percentage: element.question_overall_percentage,
          topics_name: element.topics && element.topics.name,
          mark: element.mark,
          negative_mark: element.negative_mark,
          question_group: element.question_group,
          question_skipped_percentage: element.question_skipped_percentage,
          question_time_taken: element.quesitions_selected
            ? element.quesitions_selected.mock_test_question_time
            : 0,
        });
      });
      let notvisited_obj = solutionData.filter(
        (item) => !item.isAttempted && item.is_skipped === 0
      );
      let notvisited = this.state.notvisited;
      _.assign(notvisited, {
        [`_${activeTabIndex}`]: notvisited_obj,
      });
      let mockQuestionSet = this.state.mockQuestionSet;
      _.assign(mockQuestionSet, {
        [`_${activeTabIndex}`]: solutionData,
      });
      let wrong_count = solutionData.filter(
        (item) =>
          _.isUndefined(item.userPicked) &&
          item.isAttempted &&
          item.is_skipped === 0
      );
      let wrong = this.state.wrong;
      _.assign(wrong, {
        [`_${activeTabIndex}`]: wrong_count.length,
      });
      let correct_count = this.state.correct;
      _.assign(correct_count, {
        [`_${activeTabIndex}`]: correct.length,
      });
      const answered = solutionData.filter((item) => item.is_skipped === 0);
      const unanswered = solutionData.filter((item) => item.is_skipped === 1);
      let skipped = this.state.skipped;
      _.assign(skipped, {
        [`_${activeTabIndex}`]: unanswered.length,
      });
      this.setState({
        activeTabIndex: 1,
        activeSecTabIndex: `_1`,
        mockQuestionSet: mockQuestionSet,
        fullMockQuestionSet: mockQuestionSet,
        myQuestion: true,
        unanswered: unanswered,
        attempted: answered,
        activeLoader: false,
        correct: correct_count,
        wrong: wrong,
        notvisited: notvisited,
        skipped: skipped,
        course_id: data.course_id,
        is_doubt: {
          is_doubt: data.is_doubt,
          is_doubt_share: data.is_doubt_share,
        },
      });
    });
  };

  /**
   * Handle to get mocktest question for Reattempt status
   */
  getMocktestReattempted = (response) => {
    this.panes.forEach((panes, index) => {
      let activeTabIndex = index + 1;
      let questionsmocktest = response.mock_test.questionsmocktest.filter(
        (que) => que.mock_test_section_id === panes.key
      );
      const solutionData = [];
      const correct = [];
      const data = response.mock_test;
      questionsmocktest.forEach((element, Qindex) => {
        let Qstatus = true;
        var choices = [];
        element.choices.forEach((item) => {
          choices.push({
            id: item.id,
            language1_choice: item.language1_choice,
            language2_choice: item.language2_choice,
            language3_choice: item.language3_choice,
            is_right_choice: item.is_right_choice,
            user_choices: item.user_choices,
          });
          item.is_right_choice === 1 &&
            item.user_choices !== null &&
            correct.push(choices);
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
      let notvisited_obj = solutionData.filter(
        (item) => item.is_question_attempted === 0
      );
      let notvisited = this.state.notvisited;
      _.assign(notvisited, {
        [`_${activeTabIndex}`]: notvisited_obj,
      });
      let mockQuestionSet = this.state.mockQuestionSet;
      _.assign(mockQuestionSet, {
        [`_${activeTabIndex}`]: solutionData,
      });
      let wrong_count = solutionData.filter(
        (item) =>
          _.isUndefined(item.userPicked) &&
          item.is_skipped === 0 &&
          item.is_question_attempted === 1
      );
      let wrong = this.state.wrong;
      _.assign(wrong, {
        [`_${activeTabIndex}`]: wrong_count.length,
      });
      const unanswered = solutionData.filter((item) => item.is_skipped === 1);
      let skipped = this.state.skipped;
      _.assign(skipped, {
        [`_${activeTabIndex}`]: unanswered.length,
      });
      let correct_count = this.state.correct;
      _.assign(correct_count, {
        [`_${activeTabIndex}`]: correct.length,
      });
      this.setState({
        activeTabIndex: 1,
        activeSecTabIndex: `_1`,
        mockQuestionSet: mockQuestionSet,
        fullMockQuestionSet: mockQuestionSet,
        myQuestion: true,
        unanswered: [],
        attempted: [],
        notvisited: notvisited,
        activeLoader: false,
        correct: correct_count,
        wrong: wrong,
        skipped: skipped,
        course_id: data.course_id,
        is_doubt: {
          is_doubt: data.is_doubt,
          is_doubt_share: data.is_doubt_share,
        },
      });
    });
  };

  /**
   * Handle to post Save&Next question status
   */
  postSaveNext = (type) => {
    const mock = this.state.mockQuestionSet[this.state.activeSecTabIndex];
    let CurrentQuestion =
      this.state.mockQuestionSet[this.state.activeSecTabIndex][
        this.state.selectedIndex
      ];
    let filtered_choice = _.filter(CurrentQuestion.choices, function (o) {
      return o.selected_choice !== 0;
    });
    CurrentQuestion.isSkipped = filtered_choice.length === 0;
    CurrentQuestion.isAttempted = filtered_choice.length > 0;
    if (
      CurrentQuestion.isAnsReview === 1 &&
      CurrentQuestion.selected_answer === null
    ) {
      CurrentQuestion.isAnsReview = 0;
      CurrentQuestion.isReview = 1;
    } else if (
      CurrentQuestion.isReview === 1 &&
      CurrentQuestion.selected_answer !== null
    ) {
      CurrentQuestion.isAnsReview = 1;
      CurrentQuestion.isReview = 0;
    }
    let qusReview = mock.filter(
      (item) => item.isAttempted === false && item.isReview === 1
    );
    let ansReview = mock.filter(
      (item) => item.isAttempted === true && item.isAnsReview === 1
    );
    let choice_id = CurrentQuestion.choices.filter(
      (item) => item.selected_choice === 1
    );
    let marked = this.state.marked;
    _.assign(marked, {
      [this.state.activeSecTabIndex]: {
        qusReview: qusReview,
        ansReview: ansReview,
      },
    });
    if (type !== "unmounted" && type !== "filter") {
      if (
        this.state.selectedIndex !==
        this.state.mockQuestionSet[this.state.activeSecTabIndex].length - 1
      ) {
        if (type !== "question_no") {
          let NextQuestion =
            this.state.mockQuestionSet[this.state.activeSecTabIndex][
              this.state.selectedIndex + 1
            ];
          if (
            NextQuestion.selected_answer === null &&
            !NextQuestion.isAttempted
          ) {
            NextQuestion.isSkipped = true;
          }
        }
      }
    }
    let sectionTimeTaken = this.handleSectionTimeTaken();
    let notvisited_obj = mock.filter(
      (item) => item.isAttempted === false && item.isSkipped === false
    );
    let notvisited = this.state.notvisited;
    _.assign(notvisited, {
      [`_${this.state.activeTabIndex}`]: notvisited_obj,
    });
    let attempted_obj = mock.filter(
      (item) => item.isAttempted === true && item.isAnsReview === 0
    );
    let attempted = this.state.attempted;
    _.assign(attempted, {
      [`_${this.state.activeTabIndex}`]: attempted_obj,
    });
    let attempted_count = this.state.attempted_count;
    _.assign(attempted_count, {
      [`_${this.state.activeTabIndex}`]: attempted_obj.length,
    });
    let unanswered_obj = mock.filter(
      (item) => item.isSkipped === true && item.isReview === 0
    );
    let unanswered = this.state.unanswered;
    _.assign(unanswered, {
      [`_${this.state.activeTabIndex}`]: unanswered_obj,
    });
    let sectionData = this.state.mockSectionDetails;
    let secIdex = parseInt(this.state.activeTabIndex, 10) - 1;
    sectionData[secIdex] = {
      key: this.state.activeTabIndex,
      section_id: this.panes[this.state.activeTabIndex - 1].key,
      sectionName: this.panes[this.state.activeTabIndex - 1].label,
      question: this.state.mockQuestionSet[this.state.activeSecTabIndex].length,
      ansMarked: this.state.marked[this.state.activeSecTabIndex]
        ? this.state.marked[this.state.activeSecTabIndex].ansReview.length
        : 0,
      attempted: attempted[this.state.activeSecTabIndex]
        ? attempted[this.state.activeSecTabIndex].length
        : attempted.length,
      marked: marked[this.state.activeSecTabIndex].qusReview
        ? marked[this.state.activeSecTabIndex].qusReview.length
        : 0,
      not_visted_count: notvisited[this.state.activeSecTabIndex].length,
      skipped_count: unanswered[this.state.activeSecTabIndex].length,
      time_take_in_section_time: sectionTimeTaken[this.state.activeSecTabIndex],
      submitted_mocktest_record_id: this.state.mocktest_record_id,
      originalSectionTime: sectionData[secIdex].originalSectionTime,
      mock_test_section_status: this.state.mock_section_status
        ? this.state.mock_section_status[this.state.activeSecTabIndex]
        : "completed",
    };
    const Secpayload = {
      mock_test_id: this.props.match.params.mock_id,
      mock_test_question_id: CurrentQuestion.id,
      submitted_mocktest_record_id: this.state.mocktest_record_id,
      section_id: this.state.mocktest_section_id,
      time_take_in_section_time: sectionTimeTaken[this.state.activeSecTabIndex],
    };
    const payload = {
      answered_marked_for_review: CurrentQuestion.isAnsReview,
      mark: CurrentQuestion.mark,
      marked_for_review: CurrentQuestion.isReview,
      mock_test_id: this.props.match.params.mock_id,
      mock_test_question_choice_id: choice_id[0] ? choice_id[0].id : 0,
      mock_test_question_id: CurrentQuestion.id,
      mock_test_question_time: CurrentQuestion.question_time_taken,
      mock_test_section_status:
        this.state.mock_section_status[this.state.activeSecTabIndex],
      negative_mark: CurrentQuestion.negative_mark,
      section_mark: 30,
      submitted_mocktest_record_id: this.state.mocktest_record_id,
      section_id: this.state.mocktest_section_id,
      choice_chosen: choice_id[0] ? choice_id[0].is_right_choice : 2,
      time_take_in_section_time: sectionTimeTaken[this.state.activeSecTabIndex],
    };
    if (type !== "unmounted" && type !== "filter") {
      if (
        this.state.selectedIndex !==
        this.state.mockQuestionSet[this.state.activeSecTabIndex].length - 1
      ) {
        if (type !== "question_no") {
          let NextQuestion =
            this.state.mockQuestionSet[this.state.activeSecTabIndex][
              this.state.selectedIndex + 1
            ];
          if (
            NextQuestion.selected_answer === null &&
            !NextQuestion.isAttempted
          ) {
            NextQuestion.isSkipped = true;
          }
        }
        this.setState({
          isPostSave: true,
          selectedIndex:
            type === "question_no"
              ? this.state.selectedIndex
              : this.state.selectedIndex + 1,
        });
      }
      this.setState({
        unanswered: unanswered,
        question_timer: 0,
        marked: marked,
        attempted: attempted,
        notvisited: notvisited,
        mockSectionDetails: sectionData,
        sectionTimeTaken: sectionTimeTaken,
      });
    }
    if (type !== "filter") {
      const postsectiontime = Env.post(
        this.props.envendpoint + `mocktest/mocktestsectiontimesubmit`,
        Secpayload
      );
      postsectiontime.then(
        (res) => {
          this.setState({ isPostSave: false });
        },
        (error) => {
          console.error(error);
        }
      );
      const postSaveData = Env.post(
        this.props.envendpoint + `mocktest/eachquestionsubmit`,
        payload
      );
      postSaveData.then(
        (res) => {},
        (error) => {
          console.error(error);
        }
      );
    }
  };

  postMockQuestionSubmit = async (data) => {
    this.handleclearQInterval();
    this.postSaveNext("question_no");
    const sectionData = this.handleAllSectionDetails();
    const mockDatas = {
      submitted_mocktest_record_id: this.state.mocktest_record_id,
      user_total_mark: "100",
      mock_test_id: this.props.match.params.mock_id,
      user_status: "completed",
      mocktest_completed_at: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
      sections: sectionData,
    };
    try {
      await Env.post(
        this.props.envendpoint + `mocktest/submitmocktest`,
        JSON.stringify(mockDatas)
      );
      this.setState({ isAPISubmit: true });

      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen || document.mozFullScreen) {
        document.mozCancelFullScreen();
      } else if (
        document.webkitCancelFullScreen ||
        document.webkitIsFullScreen
      ) {
        document.webkitCancelFullScreen();
      }
      if (this.state.isAPISubmit) {
        const courseId = this.props.match.params.id;
        const mockId = this.props.match.params.mock_id;
        const resultUrl = `/course-details/${courseId}/mocktest/${mockId}/result`;
        const messagePayload = {
          type: "navigateToResult",
          url: resultUrl,
          //isAPISubmitted: this.props.isAPISubmitted,
          isAPISubmit: this.state.isAPISubmit,
        };
        if (window.opener) {
          window.opener.postMessage(messagePayload, "*");
          window.close();
        } else {
          this.props.navigate(resultUrl); // Navigate if no parent window
        }
      }
    } catch (error) {
      console.error(error);
      this.errorPopup && this.errorPopup.showErrorModal();
    }
  };

  postSectionSubmit = (type) => {
    let section = [];
    let sectionData = this.handleSectionDetails();
    section.push(sectionData[parseInt(this.state.activeTabIndex, 10) - 1]);

    let mockDatas = {
      submitted_mocktest_record_id: this.state.mocktest_record_id,
      mock_test_section_status: "completed",
      section_id: section[0].section_id,
      time_take_in_section_time: section[0].time_take_in_section_time,
    };
    const postmockData = Env.post(
      this.props.envendpoint + `mocktest/submitsectionmocktest`,
      JSON.stringify(mockDatas)
    );
    postmockData.then(
      (response) => {},
      (error) => {
        console.error(error);
      }
    );
    this.handleNextSection("TimeOut");
  };

  handleStartRunTime = async (mockQuestionSet) => {
    await this.handleTimerStart(mockQuestionSet);
    await this.props.handleTimer();
  };

  handleResumeRunTime = async (mockQuestionSet, mocktest_section_record) => {
    await this.handleTimerStart(mockQuestionSet);
    await this.props.handleResumeTimer(mocktest_section_record);
  };

  handleNext = () => {
    if (
      this.state.selectedIndex !==
      this.state.mockQuestionSet[this.state.activeSecTabIndex].length - 1
    ) {
      this.setState({
        selectedIndex: this.state.selectedIndex + 1,
      });
    }
  };

  handleReattemptChoice = (e, item, choiceIndex) => {
    let choiceId = item.id;
    let CurrentQuestion =
      this.state.mockQuestionSet[this.state.activeSecTabIndex][
        this.state.selectedIndex
      ];

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
          sort_order:
            this.state.MocktestReattempt === true
              ? CurrentQuestion.sort_order
              : this.answers[this.state.selectedIndex].sort_order,
        };
      }
      CurrentQuestion.isRight === choiceIndex
        ? (CurrentQuestion.userPicked = 1)
        : (CurrentQuestion.userPicked = 0);
      let attempted_obj = this.state.mockQuestionSet[
        this.state.activeSecTabIndex
      ].filter((item) => item.isAttempted === true);
      let attempted = this.state.attempted;
      _.assign(attempted, {
        [`_${this.state.activeTabIndex}`]: attempted_obj,
      });
      let attempted_count = this.state.attempted_count;
      _.assign(attempted_count, {
        [`_${this.state.activeTabIndex}`]: attempted_obj.length,
      });

      this.setState({
        mocktestQuestions: this.state.mockQuestionSet,
        attempted: attempted,
        // notvisited: attempted_obj,
      });
    }
  };

  handleChoice = (e, choiceId, choiceIndex) => {
    let CurrentQuestion =
      this.state.mockQuestionSet[this.state.activeSecTabIndex][
        this.state.selectedIndex
      ];
    CurrentQuestion.selected_answer = choiceIndex;
    if (CurrentQuestion.choices[choiceIndex].selected_choice === 1) {
      CurrentQuestion.choices.forEach((element) => {
        element.selected_choice = 0;
      });
      this.state.mockQuestionSet[this.state.activeSecTabIndex].forEach(
        (element, index) => {
          element.isSkipped = this.state.selectedIndex > index;
        }
      );
      this.answers[this.state.selectedIndex] = {
        mock_question_id: CurrentQuestion.id,
        mocktest_question_choice_id: 0,
        sort_order: this.answers[this.state.selectedIndex].sort_order,
      };
    } else {
      CurrentQuestion.choices.forEach((element) => {
        element.selected_choice = 0;
      });
      CurrentQuestion.choices[choiceIndex].selected_choice = 1;
      this.answers[this.state.selectedIndex] = {
        mock_question_id: CurrentQuestion.id,
        mocktest_question_choice_id: choiceId,
        sort_order:
          this.state.MocktestReattempt === true
            ? CurrentQuestion.sort_order
            : this.answers[this.state.selectedIndex].sort_order,
      };
    }
    CurrentQuestion.isRight === choiceIndex
      ? (CurrentQuestion.userPicked = 1)
      : (CurrentQuestion.userPicked = 0);
    let attempted_obj = this.state.mockQuestionSet[
      this.state.activeSecTabIndex
    ].filter((item) => item.isAttempted === true && item.isAnsReview === 0);
    let attempted = this.state.attempted;
    _.assign(attempted, {
      [`_${this.state.activeTabIndex}`]: attempted_obj,
    });
    let attempted_count = this.state.attempted_count;
    _.assign(attempted_count, {
      [`_${this.state.activeTabIndex}`]: attempted_obj.length,
    });
    let notvisited_obj = this.state.mockQuestionSet[
      this.state.activeSecTabIndex
    ].filter((item) => item.isAttempted === false && item.isSkipped === false);
    let notvisited = this.state.notvisited;
    _.assign(notvisited, {
      [this.state.activeSecTabIndex]: notvisited_obj,
    });
    let unanswered_obj = this.state.mockQuestionSet[
      this.state.activeSecTabIndex
    ].filter((item) => item.isSkipped === true && item.isReview === 0);
    let unanswered = this.state.unanswered;
    _.assign(unanswered, {
      [`_${this.state.activeTabIndex}`]: unanswered_obj,
    });
    let qusReview = this.state.mockQuestionSet[
      this.state.activeSecTabIndex
    ].filter((item) => item.isReview === 1);
    let ansReview = this.state.mockQuestionSet[
      this.state.activeSecTabIndex
    ].filter((item) => item.isAnsReview === 1);
    let marked = this.state.marked;
    _.assign(marked, {
      [this.state.activeSecTabIndex]: {
        qusReview: qusReview,
        ansReview: ansReview,
      },
    });
    let sectionData = this.state.mockSectionDetails;
    sectionData.filter((item) => {
      if (item.key === this.state.activeTabIndex) {
        item.ansMarked = ansReview.length;
        item.attempted = attempted[`_${this.state.activeTabIndex}`];
        item.marked = qusReview.length;
        item.notvisited = notvisited[`_${this.state.activeTabIndex}`].length;
        item.unanswered = unanswered[this.state.activeSecTabIndex].length;
        item.time_take_in_section_time =
          this.state.sectionTimeTaken[this.state.activeSecTabIndex];
      }
    });
    this.setState({
      mockRequestPayload: {
        mocktest_record_id: this.state.mocktest_record_id,
        mock_id: this.props.match.params.mock_id,
        id: this.userId,
        is_section_timer: this.state.is_section_timer,
        is_reattempt: this.props.mocktest_reattempt.state === false ? 0 : 1,
        skipped_questions_count:
          notvisited[this.state.activeSecTabIndex].length,
        user_answers: JSON.stringify(this.answers),
        mock_start_datetime: this.state.mockRequestPayload.mock_start_datetime,
        question_timer: this.state.question_timer,
      },
      mocktestQuestions: this.state.mockQuestionSet,
      attempted: attempted,
      attempted_count: attempted_count,
      notvisited: notvisited,
      marked: marked,
      mockSectionDetails: sectionData,
      unanswered: unanswered,
      selectedIndex: this.state.selectedIndex,
    });
  };

  handleTimerStart = async (mockQuestionSet) => {
    return new Promise((resolve) => {
      this.interval = workerTimers.setInterval(() => {
        const currentQuestion =
          mockQuestionSet[this.state.activeSecTabIndex][
            this.state.selectedIndex
          ];
        currentQuestion["question_time_taken"] += 1;
        const sectionTimeKey =
          this.state.is_section_timer === 1
            ? "section_time_taken"
            : "section_time_taken";
        mockQuestionSet[this.state.activeSecTabIndex][sectionTimeKey] +=
          this.state.is_section_timer === 1 ? -1 : 1;
        this.setState({ mockQuestionSet }, () => this.getSetionTimer());
      }, 1000);
      resolve();
    });
  };

  getSectionUsedTime = (mockQuestionSet) => {
    return mockQuestionSet.reduce(
      (accumulator, item) => accumulator + item.question_time_taken,
      0
    );
  };

  handleclearQInterval = (mocktest_section) => {
    this.interval > 0 &&
      this.interval !== undefined &&
      workerTimers.clearInterval(this.interval);
    this.interval = 0;
    this.props.handleClearInterval(mocktest_section);
  };

  handleLoader = () => {
    this.setState({
      activeLoader: true,
    });
  };

  getSetionTimer = () => {
    const time_given_sec = this.getMockSectiontime(this.props.mocktest, "sec");
    const sumWithInitial = this.getSectionUsedTime(
      this.state.mockQuestionSet[this.state.activeSecTabIndex]
    );
    const current_use_time_obj = [];
    if (this.state.is_section_timer === 1) {
      const used_time = this.state.mocktest_section_record.find(
        (item) => item.section_id === this.state.activeTab.key
      );
      if (used_time) {
        current_use_time_obj.push(
          sumWithInitial - used_time.time_take_in_section_time
        );
      }
    }
    const sectionRemainingTime = _.set(
      { ...this.state.sectionRemainingTime },
      [`_${this.state.activeTabIndex}`],
      time_given_sec - sumWithInitial
    );
    const secKeys = _.keys(this.state.sectionEnable);
    const availableSec = secKeys.filter(
      (item, i) => !this.state.sectionEnable[item]
    );
    if (
      this.state.is_section_timer === 1 &&
      time_given_sec - sumWithInitial <= 0
    ) {
      if (
        this.state.mock_section_status[this.state.activeSecTabIndex] ===
        "completed"
      ) {
        if (
          this.state.activeTabIndex < this.panes.length &&
          !this.props.overallTimeOut
        ) {
          this.handleNextSection("TimeOut");
        } else if (availableSec.length > 0) {
          this.handleTabChange(availableSec[0] + 1);
        }
      }
      if (
        this.state.activeTabIndex < this.panes.length &&
        !this.props.overallTimeOut
      ) {
        this.setState(
          {
            sectionSubmitStatus: false,
          },
          () => this.handleSectionSubmit(false)
        );
      }
    }
    this.setState({
      sectionTime: sumWithInitial,
      sectionRemainingTime: sectionRemainingTime,
      current_use_time_obj: current_use_time_obj,
    });
  };

  handleNextSection = (type) => {
    if (this.state.activeTabIndex < this.panes.length) {
      let activeTabIndex = parseInt(this.state.activeTabIndex, 10);
      let sectionEnable = this.state.sectionEnable;
      let mockSectionDetails = this.state.mockSectionDetails;
      let sectionTimeTaken = this.handleSectionTimeTaken();
      let mocktest_section = this.handleResumeMocktestSection(sectionTimeTaken);
      let mock_section_status = this.state.mock_section_status;
      if (type === "TimeOut") {
        mocktest_section[activeTabIndex - 1].section_time = 0;
        this.interval > 0 &&
          this.interval &&
          workerTimers.clearInterval(this.interval);
        this.interval = 0;
        this.state.sectionSubmitStatus &&
          this.props.handleClearInterval(mocktest_section);
        sectionEnable[this.state.activeSecTabIndex] = true;
        sectionEnable[`_${activeTabIndex + 1}`] = false;
        mock_section_status[this.state.activeSecTabIndex] = "completed";
        mockSectionDetails[activeTabIndex - 1].mock_test_section_status =
          "completed";
      }
      this.setState(
        {
          sectionSubmitBtnAllow: true,
          sectionEnable: sectionEnable,
          changeStatus: type,
          mock_section_status: mock_section_status,
          mockSectionDetails: mockSectionDetails,
        },
        () => {
          this.handleTabChange(activeTabIndex + 1);
        }
      );
    }
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

  handlecloseTimer = (time) => {
    this.setState({ sectionSubmitBtnAllow: true, isSubmit: false });
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

  getSectiontab = (section) => {
    let sectionEnable = this.state.sectionEnable;
    if (section) {
      section.sort(function (a, b) {
        return a.sort_order - b.sort_order;
      });
      section.forEach((item, index) => {
        let currentState = {};
        _.assign(currentState, {
          key: item.id,
          label: item.section_name,
        });
        _.assign(sectionEnable, {
          [`_${index + 1}`]:
            this.state.MocktestSolution === true ||
            this.state.MocktestReattempt === true
              ? false
              : this.props.mocktest.is_section_timer === 0
              ? false
              : true,
        });
        this.panes.push(currentState);
      });
    }
    this.setState({
      activeTab: this.panes[0] ? this.panes[0] : null,
      mocktest_section_id: this.panes[0]?.key,
      sectionEnable: sectionEnable,
    });
    return this.panes;
  };

  getMockSectionUsedtime = (section_details, mocktest_section) => {
    let sectionTimeGiven = mocktest_section.section_time;
    let time = 0;
    section_details.filter((item) => {
      if (item.section_id === mocktest_section.id) {
        if (this.state.is_section_timer === 1) {
          time = sectionTimeGiven - item.time_take_in_section_time;
        } else {
          time = item.time_take_in_section_time;
        }
      } else if (item.id === mocktest_section.id) {
        time = sectionTimeGiven;
      }
    });
    return time;
  };

  getMockSectiontime = (mocktest, type) => {
    const { is_section_timer, activeTab } = this.state;
    let time = 0;

    if (is_section_timer === 1) {
      const section = mocktest.mocktest_section.find(
        (item) => item.section_name === activeTab.label
      );
      if (section) {
        time = section.section_time * 60;
      }
    } else {
      time = mocktest.overall_time * 60;
    }
    return type === "min" ? (time % 3600) / 60 : time;
  };

  handleSectionQuestion = (e = 0, language_id = this.state.language_id) => {
    !language_id && this.getLanguageList(this.props.languageList);
    if (this.panes.length === 0) {
      this.panes = this.getSectiontab(this.state.originalSectionTime);
    }
    let keyss = _.keys(this.state.mockQuestionSet);
    if (!keyss.includes(`_${this.state.activeTabIndex}`)) {
      if (this.state.MocktestStart) {
        if (this.state.mocktest_record_id === 0) {
          this.getMockUserRecord(language_id);
        }
      } else {
        this.getAllMockQuestions(this.panes, language_id);
      }
    } else {
      this.setState(
        {
          activeSecTabIndex: `_${this.state.activeTabIndex}`,
          activeLoader: false,
        },
        () => {
          if (!this.state.MocktestReattempt && !this.state.MocktestSolution) {
            this.postSaveNext("filter");
          }
        }
      );
    }
  };

  handleTabChange = (e) => {
    if (e !== this.state.activeTabIndex) {
      if (!this.state.MocktestReattempt && !this.state.MocktestSolution) {
        this.postSaveNext("question_no");
      }
      let sectionTimeTaken = this.handleSectionTimeTaken();
      let attempted_obj = this.state.mockQuestionSet[
        this.state.activeSecTabIndex
      ].filter((item) => item.isAttempted === true && item.isAnsReview === 0);
      let attempted = this.state.attempted;
      _.assign(attempted, {
        [this.state.activeSecTabIndex]: attempted_obj,
      });
      let attempted_count = this.state.attempted_count;
      _.assign(attempted_count, {
        [`_${this.state.activeSecTabIndex}`]: attempted_obj.length,
      });
      let mockQuestionSet = [];
      if (this.state.MocktestReattempt || this.state.MocktestSolution) {
        mockQuestionSet = this.state.fullMockQuestionSet;
      } else {
        mockQuestionSet = this.state.mockQuestionSet;
      }
      mockQuestionSet[`_${e}`][0].isSkipped = mockQuestionSet[`_${e}`][0]
        .isSkipped
        ? mockQuestionSet[`_${e}`][0].isSkipped
        : !mockQuestionSet[`_${e}`][0].isSkipped;
      this.setState(
        {
          activeSecTabIndex: `_${e}`,
          activeTabIndex: e,
          activeTab: this.panes[e - 1],
          mocktest_section_id: this.panes[e - 1].key,
          selectedIndex: 0,
          activeLoader: true,
          CheckboxValue: ["All"],
          attempted: attempted,
          sectionTimeTaken: sectionTimeTaken,
          mockQuestionSet: mockQuestionSet,
          timerStatus: this.state.MocktestStart ? "start" : "pause",
        },
        () => {
          this.handleSectionQuestion(e - 1, this.state.language_id);
          if (this.state.changeStatus === "TimeOut") {
            this.state.MocktestStart &&
              this.handleStartRunTime(mockQuestionSet);
            this.state.MocktestResume &&
              this.handleResumeRunTime(
                mockQuestionSet,
                this.state.mocktest_section_record
              );
          }
        }
      );
    }
  };

  handleStartMocktestSection = (originalSectionTime) => {
    const time_given_sec = this.getMockSectiontime(this.props.mocktest, "sec");
    const { is_section_timer, activeTab, sectionTime } = this.state;
    return originalSectionTime.map((item) => {
      if (is_section_timer === 1 && item.section_name === activeTab.label) {
        item.section_time = time_given_sec - sectionTime;
      }
      return item;
    });
  };

  handleResumeMocktestSection = (sectionTimeTaken) => {
    const time_given_sec = this.getMockSectiontime(this.props.mocktest, "sec");
    const section = this.state.mocktest_section.map((item, index) => {
      if (this.state.is_section_timer === 1) {
        if (this.state.timerStatus === "resume") {
          item.section_time =
            item.section_name === this.state.activeTab.label
              ? time_given_sec - sectionTimeTaken[this.state.activeSecTabIndex]
              : item.section_time -
                (this.state.mocktest_section_record[index]
                  .time_take_in_section_time || 0);
        } else {
          item.section_time =
            item.section_name === this.state.activeTab.label
              ? this.state.sectionRemainingTime[`_${this.state.activeTabIndex}`]
              : item.section_time;
        }
      }
      return item;
    });
    return section;
  };

  hendleLanguageClick = (e) => {
    let language_name = "";
    this.state.languageList.filter((item) => {
      if (item.language === e.key) {
        language_name = item.name;
      }
    });
    this.setState({
      language_id: e.key,
      language_name: language_name,
    });
  };

  handleBookmarkQuestion = () => {
    let mockQuestionSet = this.state.mockQuestionSet;
    let bookQ =
      mockQuestionSet[this.state.activeSecTabIndex][this.state.selectedIndex];
    bookQ.isBookmarked === 1
      ? (bookQ.isBookmarked = 0)
      : (bookQ.isBookmarked = 1);
    this.setState({ mockQuestionSet: mockQuestionSet });
    const requestBody = {
      mocktest_question_id:
        this.state.mockQuestionSet[this.state.activeSecTabIndex][
          this.state.selectedIndex
        ].id,
    };
    const bookmarkData = Env.post(
      this.props.envendpoint + `mocktest/myquestions`,
      requestBody
    );
    bookmarkData.then(
      (response) => {},
      (error) => {
        console.error(error);
      }
    );
  };

  handleScreenCapture = (id) => {
    var node = document.getElementById("question-area");
    node.style.background = "#fff";
    node.style.background = `#fff url(${logo}) no-repeat center center`;
    node.style.backgroundSize = "auto 65px";
    node.style.margin = "4px";
    node.style.zIndex = "40";

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
          if (id) {
            this.CreateDoubts.toggleModal(file, id.id, this.state.is_doubt);
          } else {
            this.CreateDoubts.toggleModal(
              file,
              this.state.course_id,
              this.state.is_doubt
            );
          }
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

  handleMarkforReview = () => {
    const CurrentQuestion =
      this.state.mockQuestionSet[this.state.activeSecTabIndex][
        this.state.selectedIndex
      ];
    if (CurrentQuestion.selected_answer === null) {
      if (CurrentQuestion.isReview === 1) {
        CurrentQuestion.isReview = 0;
        CurrentQuestion.isAnsReview = 0;
      } else {
        CurrentQuestion.isAnsReview = 0;
        CurrentQuestion.isReview = 1;
      }
    } else {
      if (CurrentQuestion.isAnsReview === 1) {
        CurrentQuestion.isAnsReview = 0;
        CurrentQuestion.isReview = 0;
      } else if (CurrentQuestion.isReview === 1) {
        CurrentQuestion.isAnsReview = 0;
        CurrentQuestion.isReview = 0;
      } else {
        CurrentQuestion.isAnsReview = 1;
        CurrentQuestion.isReview = 0;
      }
    }
    this.setState(
      {
        mockQuestionSet: this.state.mockQuestionSet,
      },
      () => this.postSaveNext()
    );
  };

  handleClearResponse = () => {
    let mock = this.state.mockQuestionSet[this.state.activeSecTabIndex];
    const CurrentQuestion =
      this.state.mockQuestionSet[this.state.activeSecTabIndex][
        this.state.selectedIndex
      ];
    mock[this.state.selectedIndex].choices.forEach((element) => {
      element.selected_choice = 0;
    });
    mock.filter((item, index) => {
      if (index === this.state.selectedIndex) {
        item.selected_answer = null;
        item.isAttempted = false;
        item.isSkipped = true;
        item.isReview = 0;
        item.isAnsReview = 0;
      }
    });
    let attempted_obj = mock.filter(
      (item) => item.isAttempted === true && item.isAnsReview === 0
    );
    let reindex = attempted_obj.findIndex(
      (item) => item.id === CurrentQuestion.id
    );
    reindex > 0 && attempted_obj.splice(reindex, 1);
    let attempted = this.state.attempted;
    _.assign(attempted, {
      [`_${this.state.activeTabIndex}`]: attempted_obj,
    });
    let attempted_count = this.state.attempted_count;
    _.assign(attempted_count, {
      [`_${this.state.activeTabIndex}`]: attempted_obj.length,
    });
    let notvisited_obj = mock.filter(
      (item) => item.isAttempted === false && item.isSkipped === false
    );
    let notvisited = this.state.notvisited;
    _.assign(notvisited, {
      [`_${this.state.activeTabIndex}`]: notvisited_obj,
    });
    let unanswered_obj = mock.filter(
      (item) => item.isSkipped && item.isReview === 0
    );
    let unanswered = this.state.unanswered;
    _.assign(unanswered, {
      [`_${this.state.activeTabIndex}`]: unanswered_obj,
    });
    let qusReview = mock.filter((item) => item.isReview === 1);
    let ansReview = mock.filter((item) => item.isAnsReview === 1);
    let marked = this.state.marked;
    _.assign(marked, {
      [this.state.activeSecTabIndex]: {
        qusReview: qusReview,
        ansReview: ansReview,
      },
    });
    this.setState({
      attempted: attempted,
      attempted_count: attempted_count,
      notvisited: notvisited,
      unanswered: unanswered,
      // marked: marked,
    });
  };

  handleCountFilter = (e) => {
    let mockQuestionSet =
      this.state.fullMockQuestionSet[this.state.activeSecTabIndex];
    let Question = {};
    // if (e.includes("All")) {
    if (e[0] === "All") {
      const index = e.indexOf("All");
      if (index >= 0) {
        e.splice(index, 1);
      }
    } else if (e.length === 0) {
      e.push("All");
    } else if (e.includes("All")) {
      e = ["All"];
    }

    e.forEach((filter) => {
      switch (filter) {
        case "notvisited":
          let notVisited = [];
          if (this.state.MocktestReattempt) {
            notVisited = mockQuestionSet.filter(
              (item) => item.is_question_attempted === 0
            );
          } else {
            notVisited = mockQuestionSet.filter((item) => !item.isAttempted);
          }
          Question[this.state.activeSecTabIndex] = [
            ...(Question[this.state.activeSecTabIndex] || []),
            ...notVisited,
          ];
          break;
        case "Correct":
          let correctQuestion = [];
          if (!this.state.MocktestReattempt) {
            correctQuestion = mockQuestionSet.filter(
              (item) =>
                item.is_skipped === 0 &&
                item.Qstatus === true &&
                item.isAttempted === true
            );
          } else {
            correctQuestion = mockQuestionSet.filter(
              (item) =>
                item.Qstatus === true &&
                item.is_question_attempted === 1 &&
                item.is_skipped === 0
            );
          }
          Question[this.state.activeSecTabIndex] = [
            ...(Question[this.state.activeSecTabIndex] || []),
            ...correctQuestion,
          ];
          break;
        case "isSkipped":
          let unanswered = mockQuestionSet.filter(
            (item) => item.is_skipped === 1
          );
          Question[this.state.activeSecTabIndex] = [
            ...(Question[this.state.activeSecTabIndex] || []),
            ...unanswered,
          ];
          break;
        case "Wrong":
          let wrongQuestion = mockQuestionSet.filter(
            (item) => item.Qstatus === false
          );
          Question[this.state.activeSecTabIndex] = [
            ...(Question[this.state.activeSecTabIndex] || []),
            ...wrongQuestion,
          ];
          break;
        default:
          Question = this.state.fullMockQuestionSet;
      }
    });
    this.setState({
      mockQuestionSet: Question,
      selectedIndex: 0,
      CheckboxValue: e,
    });
  };

  handleSectionTimeTaken = () => {
    const sectionTime = this.getSectionUsedTime(
      this.state.mockQuestionSet[this.state.activeSecTabIndex]
    );
    let sectionTimeTaken = this.state.sectionTimeTaken;
    if (sectionTimeTaken[`_${this.state.activeTabIndex}`]) {
      sectionTimeTaken[`_${this.state.activeTabIndex}`] = +sectionTime;
    } else {
      _.assign(sectionTimeTaken, {
        [`_${this.state.activeTabIndex}`]: sectionTime,
      });
    }
    return sectionTimeTaken;
  };

  handleSectionDetails = () => {
    let sectionTimeTaken = this.handleSectionTimeTaken();
    let sectionData = this.state.mockSectionDetails;
    if (sectionData.length < 1) {
      sectionData.push({
        key: this.state.activeTabIndex,
        section_id: this.panes[this.state.activeTabIndex - 1].key,
        sectionName: this.panes[this.state.activeTabIndex - 1].label,
        question:
          this.state.mockQuestionSet[this.state.activeSecTabIndex].length,
        ansMarked:
          this.state.marked[`_${this.state.activeTabIndex}`].ansReview.length,
        attempted: this.state.attempted[`_${this.state.activeTabIndex}`]
          ? this.state.attempted[`_${this.state.activeTabIndex}`].length
          : this.state.attempted.length,
        marked:
          this.state.marked[`_${this.state.activeTabIndex}`].qusReview.length,
        not_visted_count:
          this.state.notvisited[`_${this.state.activeTabIndex}`].length,
        skipped_count:
          this.state.unanswered[`_${this.state.activeTabIndex}`].length,
        time_take_in_section_time:
          sectionTimeTaken[`_${this.state.activeTabIndex}`],
        submitted_mocktest_record_id: this.state.mocktest_record_id,
        originalSectionTime:
          this.props.mocktest.mocktest_section[this.state.activeTabIndex - 1]
            .section_time * 60,
        mock_test_section_status: this.state.mock_section_status
          ? this.state.mock_section_status[this.state.activeTabIndex - 1]
          : "Pause",
      });
      return sectionData;
    } else {
      sectionData.map((item) => {
        if (item.key === this.state.activeTabIndex) {
          item.ansMarked =
            this.state.marked[`_${this.state.activeTabIndex}`].ansReview.length;
          item.attempted = this.state.attempted[`_${this.state.activeTabIndex}`]
            ? this.state.attempted[`_${this.state.activeTabIndex}`].length
            : this.state.attempted.length;
          item.marked =
            this.state.marked[`_${this.state.activeTabIndex}`].qusReview.length;
          item.notvisited =
            this.state.notvisited[`_${this.state.activeTabIndex}`].length;
          item.unanswered =
            this.state.unanswered[`_${this.state.activeTabIndex}`].length;
          item.time_take_in_section_time =
            sectionTimeTaken[`_${this.state.activeTabIndex}`];
        }
      });
      return sectionData;
    }
  };

  handleSectioncurrentDetails = () => {
    let sectionTimeTaken = this.handleSectionTimeTaken();
    const sectionData = {
      key: this.state.activeTabIndex,
      section_id: this.panes[this.state.activeTabIndex - 1].key,
      sectionName: this.panes[this.state.activeTabIndex - 1].label,
      question: this.state.mockQuestionSet[this.state.activeSecTabIndex].length,
      ansMarked:
        this.state.marked[`_${this.state.activeTabIndex}`].ansReview.length,
      attempted: this.state.attempted_count[`_${this.state.activeTabIndex}`],
      marked:
        this.state.marked[`_${this.state.activeTabIndex}`].qusReview.length,
      not_visted_count:
        this.state.notvisited[`_${this.state.activeTabIndex}`].length,
      skipped_count:
        this.state.unanswered[`_${this.state.activeTabIndex}`].length,
      time_take_in_section_time:
        sectionTimeTaken[`_${this.state.activeTabIndex}`],
      submitted_mocktest_record_id: this.state.mocktest_record_id,
      originalSectionTime:
        this.props.mocktest.mocktest_section[this.state.activeTabIndex - 1]
          .section_time * 60,
      mock_test_section_status: this.state.mock_section_status
        ? this.state.mock_section_status[this.state.activeTabIndex - 1]
        : "Pause",
    };
    return sectionData;
  };

  handleAllSectionDetails = (type) => {
    let sectionTimeTaken = this.handleSectionTimeTaken();
    let sectionData = [];
    let section = {};
    this.props.mocktest_section.forEach((item, index) => {
  
      let activeTabIndex = index + 1;
      let question = this.state.mockQuestionSet[`_${activeTabIndex}`]
        ? this.state.mockQuestionSet[`_${activeTabIndex}`].length
        : item.section_question_count;
      section = {
        key: index + 1,
        section_id: this.panes[index].key,
        sectionName: this.panes[index].label,
        question: question,
        ansMarked: this.state.marked[`_${activeTabIndex}`]
          ? this.state.marked[`_${activeTabIndex}`].ansReview.length
          : 0,
        attempted: this.state.attempted[`_${activeTabIndex}`]
          ? this.state.attempted[`_${activeTabIndex}`].length
          : this.state.attempted.length,
        marked: this.state.marked[`_${activeTabIndex}`]
          ? this.state.marked[`_${activeTabIndex}`].qusReview.length
          : 0,
        not_visted_count: this.state.notvisited[`_${activeTabIndex}`]
          ? this.state.notvisited[`_${activeTabIndex}`].length
          : item.section_question_count,
        skipped_count: this.state.unanswered[`_${activeTabIndex}`]
          ? type === "popup"
            ? this.state.unanswered[`_${activeTabIndex}`].length
            : this.state.unanswered[`_${activeTabIndex}`].length +
              this.state.marked[`_${activeTabIndex}`].qusReview.length
          : 0,
        time_take_in_section_time: sectionTimeTaken[`_${activeTabIndex}`]
          ? sectionTimeTaken[`_${activeTabIndex}`]
          : 0,
        originalSectionTime:
          this.props.mocktest.mocktest_section[index].section_time * 60,
        submitted_mocktest_record_id: this.state.mocktest_record_id,
        mock_test_section_status: "completed",
      };
      sectionData.push(section);
    });
    return sectionData;
  };

  handleSubmit = (status) => {
    this.postSaveNext("question_no");
    let sectionData = this.handleAllSectionDetails("popup");
    let originalSectionTime = this.state.originalSectionTime;
    let sectionTimeTaken = this.handleSectionTimeTaken();
    let mocktest_section;
    if (this.state.MocktestStart || this.state.MocktestResume) {
      if (this.state.timerStatus === "start") {
        mocktest_section = this.handleStartMocktestSection(originalSectionTime);
      } else {
        mocktest_section = this.handleResumeMocktestSection(sectionTimeTaken);
      }
    }
    this.setState({ isSubmit: true });
    this.leavePopup.closeModal();
    this.mocktestReportPopup.closeModal();
    this.timeoverPopup.showSubmitModal(
      this.state.mockRequestPayload,
      sectionData,
      mocktest_section,
      this.state.activeTabIndex,
      status
    );
  };

  handleResumeSection = (originalSectionTime, sectionTimeTaken) => {
    const time_given_sec = this.getMockSectiontime(this.props.mocktest, "sec");
    let section = [];
    originalSectionTime.forEach((item, index) => {
      if (this.state.timerStatus === "resume") {
        if (item.section_name === this.state.activeTab.label) {
          item.section_time =
            time_given_sec - sectionTimeTaken[this.state.activeSecTabIndex];
        } else {
          item.section_time =
            item.section_time -
            (this.state.mocktest_section_record[index]
              .time_take_in_section_time || 0);
        }
      } else {
        item.section_time =
          item.section_time - this.state.sectionTimeTaken[`_${index + 1}`];
      }
      section.push(item);
    });
    return section;
  };

  handleSectionSubmit = (status) => {
    this.postSaveNext("question_no");
    if (!status) {
      let activeTabIndex = parseInt(this.state.activeTabIndex, 10);
      let sectionTimeTaken = this.handleSectionTimeTaken();
      let mocktest_section = this.handleResumeMocktestSection(sectionTimeTaken);
      mocktest_section[activeTabIndex - 1].section_time = 0;
      this.handleclearQInterval(mocktest_section);
    }
    this.setState({ sectionSubmitBtnAllow: false });
    let sectionRemainingTime =
      this.state.mockQuestionSet[this.state.activeSecTabIndex];
    this.leavePopup.closeModal();
    this.mocktestReportPopup.closeModal();
    this.timeoverPopup.showSectionModal(
      this.state.mockRequestPayload,
      this.handleSectioncurrentDetails(),
      sectionRemainingTime,
      status
    );
  };

  handleSectionChange = (e) => {
    this.setState(
      {
        activeLoader: true,
        changeStatus: "",
      },
      () => this.handleTabChange(e.target.value)
    );
  };

  handleQuestion = (index) => {
    let Question =
      this.state.mockQuestionSet[this.state.activeSecTabIndex][index];
    if (!this.state.MocktestReattempt && !this.state.MocktestSolution) {
      if (Question.selected_answer === null && !Question.isAttempted) {
        Question.isSkipped = true;
      }
    }
    !this.state.MocktestReattempt &&
      !this.state.MocktestSolution &&
      index !== this.state.selectedIndex &&
      this.postSaveNext("question_no");
    const targetDiv1 = document.querySelector(`#mock-attempted-fixed-content`);
    const targetDiv2 = document.querySelector(
      `#mock-startresume-fixed-content`
    );
    const targetDiv3 = document.querySelector(`#mock-notvisited-fixed-content`);
    const targetDiv4 = document.querySelector(`.question-options-group`);

    if (targetDiv1) {
      targetDiv1.scrollTo(0, 0);
    }

    if (targetDiv2) {
      targetDiv2.scrollTo(0, 0);
    }

    if (targetDiv3) {
      targetDiv3.scrollTo(0, 0);
    }
    if (targetDiv4) {
      targetDiv4.scrollTo(0, 0);
    }
    this.setState({ selectedIndex: index });
  };

  handleLeaveMocktest = () => {
    let mockSectionDetails = this.handleSectionDetails(); // Assuming handleSectionDetails() returns some relevant data
    this.setState({ isSubmit: true });
    this.leavePopup.showModal(
      this.state.mockRequestPayload,
      mockSectionDetails,
      this.state.notvisited[`_${this.state.activeTabIndex}`]
    );
  };

  submitLeaveMocktest = (type) => {
    this.handleclearQInterval();
    this.postSaveNext(type);
    let mockSectionDetails = this.handleSectionDetails();
    let sectionTimeTaken = [];
    mockSectionDetails.map((item) => {
      sectionTimeTaken.push({
        time: item.time_take_in_section_time,
        section_id: item.section_id,
        status: item.mock_test_section_status,
        section_mark: 30,
      });
    });
    let payload = {
      mock_test_id: this.state.mockRequestPayload.mock_id,
      section_time_taken: sectionTimeTaken,
      mock_test_submit_record_id: this.state.mocktest_record_id,
    };
    const postQuizData = Env.post(
      this.props.envendpoint + `mocktest/leavemocktest`,
      payload
    );
    postQuizData.then(
      (response) => {
        this.props.dispatch(mocktestStatusUpdate(true, "start_timer"));
        if (type !== "unmounted") {
          window.history.back();
          this.props.navigate(`/course-details/${this.props.match.params.id}`);
        }
        if (window.opener) {
          window.close();
        }
      },

      (error) => {
        console.error(error);
        this.errorPopup && this.errorPopup.showErrorModal("leave");
      }
    );
  };

  getAnalysis = (index) => {
    return (
      <Row
        gutter={[0, 15]}
        className="mocktest-type-row"
        style={{
          background: "#fff",
          width: "210px",
          boxShadow: "rgba(17, 12, 41, 0.15) 0px 2px 10px 0px",
        }}
      >
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <div className="drop-outer">
            <div className="drop-inner">
              <div
                className="drop-img drop-rectimg"
                style={{
                  flex: 1,
                  backgroundImage: `url("data:image/svg+xml,${mockAnswered}")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "top center",
                  backgroundSize: "90% 90%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "8px",
                    color: "#fff",
                    fontWeight: "700",
                  }}
                >
                  {this.state.attempted[`_${index}`]
                    ? this.state.attempted[`_${index}`].length
                    : this.state.attempted.length}
                </div>
              </div>
            </div>
            <div className="drop-text" style={{ fontWeight: "bold" }}>
              Answered
            </div>
          </div>{" "}
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <div className="drop-outer">
            <div className="drop-inner">
              <div
                className="drop-img drop-rectimg"
                style={{
                  flex: 1,
                  backgroundImage: `url("data:image/svg+xml,${mockunAnswered}")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "top center",
                  backgroundSize: "90% 90%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "8px",
                    color: "#fff",
                    fontWeight: "700",
                  }}
                >
                  {this.state.MocktestReattempt === true
                    ? this.state.correct
                    : this.state.unanswered[`_${index}`].length}{" "}
                </div>
              </div>
            </div>
            <div className="drop-text" style={{ fontWeight: "bold" }}>
              Unanswered
            </div>
          </div>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <div className="content drop-outer">
            <div className="drop-inner">
              <div
                className="drop-img drop-circleimg not-answered"
                style={{
                  flex: 1,
                  backgroundImage: `url("data:image/svg+xml,${mockNotvisited}")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "top center",
                  backgroundSize: "80% 95%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "10px",
                    fontWeight: "700",
                  }}
                >
                  {this.state.notvisited[`_${index}`].length}
                </div>
              </div>
            </div>
            <div className="drop-text" style={{ fontWeight: "bold" }}>
              Not visited
            </div>
          </div>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <div className="drop-outer">
            <div className="drop-inner">
              <div
                className="drop-img drop-circleimg mark-question Marked-review"
                style={{
                  flex: 1,
                  backgroundImage: `url("data:image/svg+xml,${mockMarked}")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "top center",
                  backgroundSize: "80% 95%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "10px 10px ",
                    color: "#fff",
                    fontWeight: "700",
                  }}
                >
                  {this.state.marked[`_${index}`].qusReview.length}
                </div>
              </div>
            </div>
            <div className="drop-text" style={{ fontWeight: "bold" }}>
              Marked for Review
            </div>
          </div>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <div className="drop-outer">
            <div className="drop-inner">
              <div
                className="drop-img drop-circleimg mark-question"
                style={{
                  flex: "1 1 5%",
                  backgroundImage: `url("data:image/svg+xml,${mockmarkedAnswered}")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "top center",
                  backgroundSize: "90% 90%",
                  width: "43px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "8px 15px 14px 12px",
                    color: "#fff",
                    fontWeight: "700",
                  }}
                >
                  {this.state.MocktestSolution || this.state.MocktestReattempt
                    ? this.state.correct
                    : this.state.marked[`_${index}`].ansReview.length}
                </div>
              </div>
            </div>
            <div className="drop-text" style={{ fontWeight: "bold" }}>
              Answers & Marked
            </div>
          </div>
        </Col>
      </Row>
    );
  };

  displaySection = () => {
    const mockQuestionSet =
      this.state.mockQuestionSet[this.state.activeSecTabIndex];

    const Language = (
      <Menu style={{ textTransform: "capitalize", width: "110px" }}>
        {this.state.languageList.map((item) => (
          <Menu.Item key={item.language} onClick={this.hendleLanguageClick}>
            {item.name}
          </Menu.Item>
        ))}
      </Menu>
    );
    return (
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
        }}
      >
        <div className="course-modules-mocktest-group-buttons">
          <Row gutter={[5, 5]}>
            <Col
              lg={
                !this.state.MocktestSolution && !this.state.MocktestReattempt
                  ? 16
                  : 24
              }
              md={
                !this.state.MocktestSolution && !this.state.MocktestReattempt
                  ? 18
                  : 24
              }
              sm={
                !this.state.MocktestSolution && !this.state.MocktestReattempt
                  ? 20
                  : 24
              }
              xs={
                !this.state.MocktestSolution && !this.state.MocktestReattempt
                  ? 24
                  : 24
              }
              xl={
                !this.state.MocktestSolution && !this.state.MocktestReattempt
                  ? 19
                  : 24
              }
              xxl={
                !this.state.MocktestSolution && !this.state.MocktestReattempt
                  ? 19
                  : 24
              }
            >
              <Radio.Group
                onChange={this.handleSectionChange}
                value={this.state.activeTabIndex}
                name="selectedTag"
              >
                {this.panes.map((item, index) => (
                  <Radio.Button
                    className="mocktest-toggle-buttons"
                    value={index + 1}
                    key={index + 1}
                    disabled={
                      (index + 1).toString() ===
                      this.state.activeTabIndex.toString()
                        ? null
                        : this.state.sectionEnable[`_${index + 1}`]
                    }
                  >
                    <div className="question-section-tabpane">
                      {this.state.MocktestSolution ||
                      this.state.MocktestReattempt ? (
                        <p className="question-section-tabpane-name">
                          {item.label}
                        </p>
                      ) : (
                        (this.state.MocktestResume ||
                          this.state.MocktestStart) && (
                          <Dropdown
                            dropdownRender={(e) => this.getAnalysis(index + 1)}
                            width="150px"
                            trigger={
                              this.state.is_section_timer === 0
                                ? ["hover"]
                                : (index + 1).toString() ===
                                  this.state.activeTabIndex.toString()
                                ? ["hover"]
                                : []
                            }
                          >
                            <div>
                              <p className="question-section-tabpane-name">
                                {item.label}
                              </p>
                              <a
                                onClick={(e) => e.preventDefault()}
                                style={{
                                  position: "absolute",
                                  bottom: "0%",
                                  cursor:
                                    this.state.is_section_timer === 0
                                      ? "pointer"
                                      : (index + 1).toString() ===
                                        this.state.activeTabIndex.toString()
                                      ? "pointer"
                                      : "not-allowed",
                                  right:
                                    item.label.length <= 9 && index % 2 === 0
                                      ? "10%"
                                      : item.label.length >= 15
                                      ? "6%"
                                      : "6%",
                                }}
                              >
                                <MockInfo
                                  color={
                                    (index + 1).toString() ===
                                    this.state.activeTabIndex.toString()
                                      ? "#fff"
                                      : this.state.sectionEnable[
                                          `_${index + 1}`
                                        ]
                                      ? "#b4b6b9"
                                      : "#3C4852"
                                  }
                                />
                              </a>
                            </div>
                          </Dropdown>
                        )
                      )}
                    </div>
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Col>
            <Col
              xxl={
                !this.state.MocktestSolution && !this.state.MocktestReattempt
                  ? 5
                  : 0
              }
              xl={
                !this.state.MocktestSolution && !this.state.MocktestReattempt
                  ? 5
                  : 0
              }
              lg={
                !this.state.MocktestSolution && !this.state.MocktestReattempt
                  ? 8
                  : 0
              }
              md={
                !this.state.MocktestSolution && !this.state.MocktestReattempt
                  ? 6
                  : 0
              }
              sm={
                !this.state.MocktestSolution && !this.state.MocktestReattempt
                  ? 4
                  : 0
              }
              xs={
                !this.state.MocktestSolution && !this.state.MocktestReattempt
                  ? 14
                  : 0
              }
            >
              {(this.state.MocktestResume || this.state.MocktestStart) && (
                <div className="center-column section-timer-flex">
                  <div
                    className="section-timer"
                    style={{ marginRight: "5px", display: "flex" }}
                  >
                    Section Time
                    <span className="colan">:</span>
                  </div>
                  <span
                    className="mocktest-timer"
                    style={{
                      color: "#0B649D",
                      width:
                        mockQuestionSet.section_time_taken >= 60
                          ? "85px"
                          : "70px",
                    }}
                  >
                    {CommonService.handleStartTimer(
                      mockQuestionSet.section_time_taken
                    )}
                  </span>
                </div>
              )}
            </Col>
          </Row>
        </div>
        <div
          className="body-layout"
          style={{
            marginTop: "0px",
          }}
        >
          <div className="inner-layout">
            <div className="card">
              <Row gutter={[55, 10]} className="row">
                <Col
                  xs={24}
                  sm={12}
                  md={!this.state.showFullview ? 24 : 24}
                  lg={!this.state.showFullview ? 12 : 24}
                  xl={12}
                  xxl={12}
                  className="inner-Content question-stat "
                >
                  <div className="question-bar">
                    Question {this.state.selectedIndex + 1} /&nbsp;
                    {mockQuestionSet.length}
                  </div>
                  {(this.state.MocktestResume || this.state.MocktestStart) && (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width:
                            mockQuestionSet[this.state.selectedIndex]
                              .question_time_taken > 3600
                              ? "125px"
                              : "100px",
                        }}
                      >
                        <img
                          src={timer}
                          alt="timer"
                          style={{ width: "19px", margin: "0px 6px" }}
                        />
                        <span style={{ fontSize: "17px" }}>
                          {CommonService.handleStartTimer(
                            mockQuestionSet[this.state.selectedIndex]
                              .question_time_taken
                          )}
                          &nbsp;
                        </span>
                      </div>
                      <div className="content">
                        <span className="box-1">
                          {mockQuestionSet[this.state.selectedIndex].mark}
                        </span>
                        <span className="box-2">
                          -
                          {
                            mockQuestionSet[this.state.selectedIndex]
                              .negative_mark
                          }
                        </span>
                      </div>
                    </>
                  )}
                  {this.state.MocktestSolution && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "0px 10px",
                      }}
                    >
                      <SolutionTimer
                        status={
                          mockQuestionSet[this.state.selectedIndex].Qstatus
                        }
                      />
                      <span className="questionContainer">You:&nbsp;</span>
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#758898",
                          width: "60px",
                        }}
                      >
                        {CommonService.handleStartTimer(
                          mockQuestionSet[this.state.selectedIndex]
                            .question_time_taken
                        )}
                      </span>
                    </div>
                  )}
                  {this.state.MocktestSolution && (
                    <div style={{ padding: "0px 10px" }}>
                      <Space>
                        <span className="questionContainer">Avg:&nbsp;</span>
                        <span
                          style={{
                            fontSize: "15px",
                            fontWeight: "600",
                            color: "#758898",
                          }}
                        >
                          0.12
                        </span>
                        <Divider
                          type="vertical"
                          style={{ borderColor: "#8ba6bc", height: "20px" }}
                        />
                      </Space>
                    </div>
                  )}
                  {this.state.MocktestSolution && (
                    <div style={{ padding: "0px 10px" }}>
                      <span className="questionContainer">Mark:&nbsp;</span>
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: mockQuestionSet[this.state.selectedIndex]
                            .Qstatus
                            ? "#10a54e"
                            : "#EE2D3B",
                        }}
                      >
                        {mockQuestionSet[this.state.selectedIndex].Qstatus
                          ? mockQuestionSet[this.state.selectedIndex].mark
                          : "-" +
                            mockQuestionSet[this.state.selectedIndex]
                              .negative_mark}
                      </span>
                    </div>
                  )}
                </Col>
                <Col
                  xs={24}
                  sm={12}
                  md={!this.state.showFullview ? 24 : 24}
                  lg={!this.state.showFullview ? 24 : 24}
                  xl={12}
                  xxl={12}
                  className="inner-ContentEnd question-stat"
                >
                  {this.state.MocktestSolution && (
                    <>
                      <div
                        style={{
                          padding: "0px 10px",
                          textAlign: "center",
                        }}
                      >
                        Correct %:&nbsp;
                        <span
                          style={{
                            fontWeight: "600",
                          }}
                        >
                          {Math.floor(
                            mockQuestionSet[this.state.selectedIndex]
                              .question_overall_percentage
                          )}
                          %
                        </span>
                      </div>
                      <div
                        style={{
                          padding: "0px 10px",
                          textAlign: "center",
                        }}
                      >
                        Skipped %:&nbsp;
                        <span
                          style={{
                            fontWeight: "600",
                          }}
                        >
                          {
                            mockQuestionSet[this.state.selectedIndex]
                              .question_skipped_percentage
                          }
                          %
                        </span>
                      </div>
                      <div
                        className="text-span"
                        style={{
                          padding: "0px 10px",
                        }}
                      >
                        Level:&nbsp;
                        <span
                          style={{
                            fontWeight: "600",
                          }}
                        >
                          {
                            mockQuestionSet[this.state.selectedIndex]
                              .difficult_level.name
                          }
                        </span>
                      </div>
                    </>
                  )}
                  <div className="content">
                    <div
                      onClick={() => {
                        if (
                          this.state.MocktestSolution === true ||
                          this.state.MocktestReattempt === true
                        ) {
                          this.mocktestReportPopup.showModal(
                            mockQuestionSet[this.state.selectedIndex]
                          );
                        } else {
                          this.state.overall_time > 1 &&
                            this.mocktestReportPopup.showModal(
                              mockQuestionSet[this.state.selectedIndex]
                            );
                        }
                      }}
                      className="share-span"
                    >
                      <img src={report} alt="report" className="share-icon" />
                    </div>
                    {this.state.MocktestSolution && (
                      <div
                        onClick={this.handleBookmarkQuestion}
                        className="bookmark-span"
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
                    )}
                    {this.state.MocktestSolution && (
                      <div
                        className="bookmark-span"
                        onClick={() => {
                          this.quizSharePopup.showModal(
                            "QuizQuestions",
                            "",
                            "",
                            this.state.is_doubt
                          );
                        }}
                      >
                        <img
                          alt="share"
                          className="course-details-article-menu-icon"
                          src={share}
                        />
                      </div>
                    )}
                    {(this.state.MocktestResume ||
                      this.state.MocktestStart) && (
                      <div className="share-span">
                        <img
                          onClick={() => this.handleMarkforReview()}
                          src={
                            mockQuestionSet[this.state.selectedIndex]
                              .isReview === 0 &&
                            mockQuestionSet[this.state.selectedIndex]
                              .isAnsReview === 0
                              ? markforreview
                              : markforreviewed
                          }
                          alt="markforreview"
                          className="share-icon"
                        />
                      </div>
                    )}
                    {this.state.languageList.length > 1 && (
                      <div className="language-drop">
                        <Dropdown
                          dropdownRender={(e) => Language}
                          width="100px"
                          trigger={["click"]}
                        >
                          <a
                            style={{ textTransform: "capitalize" }}
                            className="dropdownAnt-link"
                            onClick={(e) => e.preventDefault()}
                          >
                            {this.state.language_name}&nbsp;
                            <CaretDownOutlined />
                          </a>
                        </Dropdown>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
              <Row gutter={[10, 10]} id="question-area">
                {mockQuestionSet[this.state.selectedIndex].question_group !==
                  null && (
                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={12}
                    xl={12}
                    xxl={12}
                    id={
                      mockQuestionSet[this.state.selectedIndex].isAttempted &&
                      (this.state.MocktestSolution === true ||
                        this.state.MocktestReattempt === true)
                        ? "mock-attempted-fixed-content"
                        : this.state.MocktestStart === true ||
                          this.state.MocktestResume === true
                        ? "mock-startresume-fixed-content"
                        : "mock-notvisited-fixed-content"
                    }
                    style={{ borderRight: "1px solid lightgrey" }}
                  >
                    <div className="group-question question-full-image">
                      <div
                        className="question"
                        dangerouslySetInnerHTML={{
                          __html:
                            mockQuestionSet[this.state.selectedIndex]
                              .question_group !== null
                              ? mockQuestionSet[this.state.selectedIndex]
                                  .question_group[
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
                    mockQuestionSet[this.state.selectedIndex].question_group !==
                    null
                      ? 24
                      : 24
                  }
                  sm={
                    mockQuestionSet[this.state.selectedIndex].question_group !==
                    null
                      ? 24
                      : 24
                  }
                  md={
                    mockQuestionSet[this.state.selectedIndex].question_group !==
                    null
                      ? 12
                      : 24
                  }
                  lg={
                    mockQuestionSet[this.state.selectedIndex].question_group !==
                    null
                      ? 12
                      : 24
                  }
                  xl={
                    mockQuestionSet[this.state.selectedIndex].question_group !==
                    null
                      ? 12
                      : 24
                  }
                  xxl={
                    mockQuestionSet[this.state.selectedIndex].question_group !==
                    null
                      ? 12
                      : 24
                  }
                  id={
                    mockQuestionSet[this.state.selectedIndex].isAttempted &&
                    (this.state.MocktestSolution ||
                      this.state.MocktestReattempt)
                      ? "mock-attempted-fixed-content"
                      : this.state.MocktestStart || this.state.MocktestResume
                      ? "mock-startresume-fixed-content"
                      : "mock-notvisited-fixed-content"
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
                                mockQuestionSet[this.state.selectedIndex][
                                  `${this.state.language_id}_question`
                                ],
                            }}
                          ></div>
                        </div>
                        {this.state.MocktestSolution && (
                          <div className="solution-choices">
                            <Radio.Group
                              value={
                                mockQuestionSet[this.state.selectedIndex]
                                  .selected_answer
                              }
                              style={{ width: "100%", margin: "0px 0px" }}
                            >
                              {mockQuestionSet.length !== 0 &&
                                mockQuestionSet[this.state.selectedIndex]
                                  .choices.length !== 0 &&
                                mockQuestionSet[
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
                                    <div className="mocktest-question-solution-choices-container">
                                      <Radio
                                        className={
                                          item.is_right_choice === 1
                                            ? "mocktest-questions-main2-card2-choice-isright"
                                            : item.is_right_choice === 0 &&
                                              item.user_choices === null
                                            ? "mocktest-questions-main2-card2-choice-not-choosen"
                                            : "mocktest-questions-main2-card2-choice-iswrong"
                                        }
                                        value={index}
                                      >
                                        <div
                                          className={
                                            item.selected_choice === 1
                                              ? "mocktest-question-choices-value-choosen question-full-image"
                                              : "mocktest-question-choices-value-not-choosen question-full-image"
                                          }
                                        >
                                          <div
                                            style={{
                                              padding: "0px 5px 0px 0px",
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
                        )}
                      </div>

                      {this.state.MocktestReattempt && (
                        <div className="reattempt-choices">
                          <Radio.Group
                            value={
                              mockQuestionSet[this.state.selectedIndex]
                                .selected_answer
                            }
                            style={{ width: "100%" }}
                          >
                            {mockQuestionSet.length !== 0 &&
                              mockQuestionSet[this.state.selectedIndex].choices
                                .length !== 0 &&
                              mockQuestionSet[
                                this.state.selectedIndex
                              ].choices.map((item, index) => (
                                <div
                                  className={
                                    mockQuestionSet[this.state.selectedIndex]
                                      .isAttempted && item.is_right_choice === 1
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
                                  <div className="mocktest-question-solution-choices-container">
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
                                            item.is_right_choice === 0 &&
                                            item.selected_choice === 1
                                          ? "mocktest-questions-main2-card2-choice-iswrong"
                                          : item.selected_choice === 1 &&
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
                                        }}
                                      >
                                        <div
                                          style={{
                                            padding: "0px 5px 0px 0px",
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
                      )}
                      {this.state.MocktestStart && (
                        <div className="start-choices">
                          <Radio.Group
                            value={
                              mockQuestionSet[this.state.selectedIndex]
                                .selected_answer
                            }
                            style={{ width: "100%" }}
                          >
                            {mockQuestionSet.length !== 0 &&
                              mockQuestionSet[this.state.selectedIndex].choices
                                .length !== 0 &&
                              mockQuestionSet[
                                this.state.selectedIndex
                              ].choices.map((item, index) => (
                                <div
                                  className={
                                    item.selected_choice === 1
                                      ? "choosen"
                                      : "not-choosen"
                                  }
                                  key={index}
                                  onChange={(e) =>
                                    this.handleChoice(e, item.id, index)
                                  }
                                >
                                  <div className="mocktest-question-choices-container">
                                    <Radio value={index}>
                                      <div
                                        className={
                                          item.selected_choice === 1
                                            ? "mocktest-question-choices-value-choosen question-full-image"
                                            : "mocktest-question-choices-value-not-choosen question-full-image"
                                        }
                                      >
                                        <div
                                          style={{
                                            padding: "0px 5px 0px 0px",
                                          }}
                                        >
                                          {Choices[index]}
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
                      )}
                      {this.state.MocktestResume && (
                        <div className="resume-choices">
                          <Radio.Group
                            value={
                              mockQuestionSet[this.state.selectedIndex]
                                .selected_answer
                            }
                            style={{ width: "100%" }}
                          >
                            {mockQuestionSet.length !== 0 &&
                              mockQuestionSet[this.state.selectedIndex].choices
                                .length !== 0 &&
                              mockQuestionSet[
                                this.state.selectedIndex
                              ].choices.map((item, index) => (
                                <div
                                  className={
                                    item.selected_choice === 1
                                      ? "choosen"
                                      : "not-choosen"
                                  }
                                  key={index}
                                  style={{ width: "fit-content" }}
                                  onChange={(e) =>
                                    this.handleChoice(e, item.id, index)
                                  }
                                >
                                  <div className="mocktest-question-choices-container">
                                    <Radio value={index}>
                                      <div
                                        className={
                                          item.selected_choice === 1
                                            ? "mocktest-question-choices-value-choosen question-full-image"
                                            : "mocktest-question-choices-value-not-choosen question-full-image"
                                        }
                                      >
                                        {" "}
                                        <div
                                          style={{
                                            padding: "0px 5px 0px 0px",
                                          }}
                                        >
                                          {Choices[index]}
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
                      )}
                      {this.state.MocktestSolution &&
                        mockQuestionSet.length > 0 && (
                          <div className="solution-layout">
                            <div
                              style={{
                                background: "#E4E8ED",
                                padding: "10px 20px ",
                              }}
                            >
                              <Text className="solution-text">Solution</Text>
                            </div>
                            <div className="solution-body question-full-image">
                              <div className="solution-subtext-div">
                                <Text className="solution-subtext">
                                  {" "}
                                  Topic :{" "}
                                </Text>
                                <Text className="solution-subtext-content">
                                  {
                                    mockQuestionSet[this.state.selectedIndex]
                                      .topics_name
                                  }
                                </Text>
                              </div>
                              <div
                                className="content"
                                style={{
                                  paddingBottom: "20px",
                                  marginBottom: "2em",
                                }}
                                dangerouslySetInnerHTML={{
                                  __html:
                                    mockQuestionSet.length !== 0 &&
                                    mockQuestionSet[this.state.selectedIndex][
                                      `${this.state.language_id}_solution`
                                    ],
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      {this.state.MocktestReattempt &&
                        mockQuestionSet.length > 0 &&
                        mockQuestionSet[this.state.selectedIndex]
                          .isAttempted && (
                          <div className="solution-layout">
                            <div
                              style={{
                                background: "#E4E8ED",
                                padding: "10px 20px",
                              }}
                            >
                              <Text className="solution-text">Solution</Text>
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
                                    mockQuestionSet[this.state.selectedIndex][
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
              ? "mocktest-footer-position"
              : "mocktest-footer-position-full"
          }
        >
          <Card className="mocktest-footer-container">
            {(this.state.MocktestResume || this.state.MocktestStart) && (
              <>
                {mockQuestionSet.length > this.state.selectedIndex && (
                  <div
                    className={
                      mockQuestionSet[this.state.selectedIndex].isReview ===
                        1 ||
                      mockQuestionSet[this.state.selectedIndex].isAnsReview ===
                        1
                        ? "mark-question-btn"
                        : "un-mark-question-btn"
                    }
                    onClick={() => {
                      this.handleMarkforReview();
                    }}
                  >
                    {mockQuestionSet[this.state.selectedIndex].isReview === 0 &&
                    mockQuestionSet[this.state.selectedIndex].isAnsReview === 0
                      ? "Mark for Review & Next"
                      : " Un-Mark for Review"}
                  </div>
                )}
                <div
                  className="clear-response-btn"
                  onClick={() => {
                    this.handleClearResponse();
                  }}
                >
                  Clear Response
                </div>
              </>
            )}
            {(this.state.MocktestReattempt || this.state.MocktestSolution) && (
              <div className="back-solu-btn">
                <Button
                  type="link"
                  style={{ padding: "0px 35px" }}
                  onClick={() => {
                    this.props.dispatch(mocktestStatusUpdate(true, "solution"));
                    this.props.dispatch(mocktestReattempt(false, ""));
                    this.props.navigate(
                      `/course-details/${this.props.match.params.id}`
                    );
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
                >
                  <ArrowLeftOutlined />
                  Back to list
                </Button>
              </div>
            )}
            <div
              onClick={(e) => {
                e.preventDefault();
                const targetDiv1 = document.querySelector(
                  `#mock-attempted-fixed-content `
                );
                const targetDiv2 = document.querySelector(
                  `#mock-startresume-fixed-content`
                );
                const targetDiv3 = document.querySelector(
                  `#mock-notvisited-fixed-content`
                );
                const targetDiv4 = document.querySelector(
                  `.question-options-group`
                );

                if (targetDiv1) {
                  targetDiv1.scrollTo(0, 0);
                }

                if (targetDiv2) {
                  targetDiv2.scrollTo(0, 0);
                }

                if (targetDiv3) {
                  targetDiv3.scrollTo(0, 0);
                }
                if (targetDiv4) {
                  targetDiv4.scrollTo(0, 0);
                }

                this.state.MocktestResume || this.state.MocktestStart
                  ? mockQuestionSet.length - 1 !== this.state.selectedIndex
                    ? !this.state.isPostSave && this.postSaveNext()
                    : this.state.activeTabIndex < this.panes.length
                    ? this.state.is_section_timer === 1
                      ? this.props.mocktest.allow_submit_before_section_time ===
                        0
                        ? !this.state.isPostSave && this.postSaveNext()
                        : this.state.sectionSubmitBtnAllow &&
                          this.setState(
                            { sectionSubmitStatus: true },
                            this.handleSectionSubmit(true)
                          )
                      : this.handleNextSection()
                    : this.props.mocktest.allow_submit_before_section_time === 0
                    ? !this.state.isPostSave && this.postSaveNext()
                    : !this.state.isSubmit && this.handleSubmit(true)
                  : this.handleNext();
              }}
              className={
                this.state.MocktestResume || this.state.MocktestStart
                  ? "save-next-btn"
                  : mockQuestionSet.length - 1 !== this.state.selectedIndex
                  ? "save-next-solu-btn"
                  : ""
              }
            >
              {this.state.MocktestResume || this.state.MocktestStart
                ? mockQuestionSet.length - 1 !== this.state.selectedIndex
                  ? "Save & Next"
                  : "Save"
                : mockQuestionSet.length - 1 !== this.state.selectedIndex
                ? "Next"
                : null}
            </div>
          </Card>
        </div>
      </Col>
    );
  };

  render() {
   

    return (
      <div
        className="mocktest-question-container"
        style={{
          width: "100%",
          padding: "0px",
          margin: "0px",
          background: "#f9f9fd",
        }}
      >
        {this.props.showInstructions ? (
          <div>
            <MocktestInstruction
              {...this.props}
              mocktest={this.props.mocktest}
              languageList={this.state.languageList}
              Instruction={this.props.Instruction}
              showInstructions={this.props.showInstructions}
              handleMockInfo={this.props.handleMockInfo}
            />
          </div>
        ) : (
          <>
            {this.panes.length > 0 ? (
              <div className="main-layout" style={{ height: "100vh" }}>
                {!this.state.activeLoader &&
                this.state.activeTabIndex !== null ? (
                  <Row
                    gutter={[0, 0]}
                    className="row"
                    style={{
                      padding: this.state.showFullview
                        ? "2px 6px"
                        : "2px 7px 2px 8px",
                      height: "100%",
                    }}
                  >
                    {this.displaySection()}
                    {!this.state.showFullview && (
                      <span
                        className="mockaside-icon-left"
                        onClick={this.handleMenu}
                      >
                        <img
                          style={{ transform: "rotate(180deg)" }}
                          alt="mockaside"
                          src={mockaside}
                        />
                      </span>
                    )}
                    <Col
                      xs={24}
                      sm={24}
                      md={24}
                      lg={8}
                      xl={6}
                      xxl={6}
                      className={
                        this.state.showFullview
                          ? "mock-questions-count-column"
                          : "mock-questions-count-column-diable"
                      }
                      id="mock-question-status-card"
                    >
                      <Card className="card" id="mock-question-status-card">
                        {!this.state.myQuestion ? (
                          <>
                            <Row className="mock-card-user-block">
                              <Col
                                xs={24}
                                sm={24}
                                md={22}
                                lg={21}
                                xl={21}
                                xxl={21}
                              >
                                <Row>
                                  <Col
                                    xs={22}
                                    sm={22}
                                    md={6}
                                    lg={4}
                                    xl={4}
                                    xxl={4}
                                  >
                                    <div style={{ textAlign: "center" }}>
                                      {/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
                                        this.props.profile_image
                                      ) &&
                                      !this.props.profile_image.includes(
                                        "data"
                                      ) &&
                                      !this.props.profile_image.includes(
                                        "prtner"
                                      ) ? (
                                        <Avatar
                                          style={{
                                            width: "50px",
                                            borderRadius: "90px",
                                          }}
                                          size={45}
                                          src={
                                            profileImageUrl +
                                            (this.props.profile_image === null
                                              ? StorageConfiguration.sessionGetItem(
                                                  "profile_image"
                                                )
                                              : this.props.profile_image)
                                          }
                                        />
                                      ) : (
                                        <Avatar
                                          style={{
                                            color: "#E0F3FF",
                                            background: "#0B649D",
                                          }}
                                          size={45}
                                        >
                                          {this.props.profile_update
                                            .first_name !== undefined &&
                                            this.props.profile_update.first_name
                                              .charAt(0)
                                              .toUpperCase()}
                                        </Avatar>
                                      )}
                                    </div>
                                  </Col>
                                  <Col
                                    xs={22}
                                    sm={22}
                                    md={14}
                                    lg={18}
                                    xl={20}
                                    xxl={20}
                                  >
                                    <div
                                      style={{
                                        flex: 2,
                                        padding: "0px 20px",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        textAlign: "center",
                                      }}
                                    >
                                      <div
                                        style={{
                                          color: "#0B649D",
                                          fontWeight: 600,
                                          width: "95%",
                                          textOverflow: "elllpise",
                                          overflow: "hidden",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {this.props.profile_update.user_name ===
                                        null
                                          ? StorageConfiguration.sessionGetItem(
                                              "user_name"
                                            )
                                          : this.props.profile_update.user_name}
                                      </div>
                                      <div
                                        style={{
                                          color: "#90A0B7",
                                          fontSize: "12px",
                                          width: "95%",
                                          textOverflow: "elllpise",
                                          overflow: "hidden",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {this.props.profile_update.email_id ===
                                        null
                                          ? StorageConfiguration.sessionGetItem(
                                              "email_id"
                                            )
                                          : this.props.profile_update.email_id}
                                      </div>
                                    </div>
                                  </Col>
                                </Row>
                              </Col>
                              <Col
                                xs={2}
                                sm={2}
                                md={2}
                                lg={3}
                                xl={3}
                                xxl={3}
                                className="resume-icon-col"
                              >
                                <img
                                  className="pause-icon"
                                  alt="pause_icon"
                                  src={pause_icon}
                                  onClick={() => {
                                    if (this.state.overall_time > 1) {
                                      this.handleLeaveMocktest();
                                    }
                                  }}
                                />
                              </Col>
                            </Row>
                            <Divider style={{ margin: 0 }} />
                            {(this.state.MocktestResume ||
                              this.state.MocktestStart) && (
                              <Row
                                gutter={[0, 20]}
                                className="mocktest-type-row"
                                style={{ padding: "20px 10px 15px 23px" }}
                              >
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={12}
                                  lg={12}
                                  xl={12}
                                  xxl={12}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div className="outer-box">
                                      <div
                                        className="img-same rect-img"
                                        style={{
                                          flex: 1,
                                          backgroundImage: `url("data:image/svg+xml,${mockAnswered}")`,
                                          backgroundRepeat: "no-repeat",
                                          backgroundPosition: "top center",
                                          backgroundSize: "100% 100%",
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            padding: "6px",
                                            color: "#fff",
                                            fontWeight: "700",
                                          }}
                                        >
                                          {this.state.attempted[
                                            this.state.activeSecTabIndex
                                          ]
                                            ? this.state.attempted[
                                                this.state.activeSecTabIndex
                                              ].length
                                            : this.state.attempted.length}
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      className="text-review answered-mocktest-sidebar"
                                      style={{ fontWeight: "bold" }}
                                    >
                                      Answered
                                    </div>
                                  </div>
                                </Col>
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={12}
                                  lg={12}
                                  xl={12}
                                  xxl={12}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div className="outer-box">
                                      <div
                                        className="img-same rect-img"
                                        style={{
                                          flex: 1,
                                          backgroundImage: `url("data:image/svg+xml,${mockunAnswered}")`,
                                          backgroundRepeat: "no-repeat",
                                          backgroundPosition: "top center",
                                          backgroundSize: "100% 100%",
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            padding: "6px",
                                            color: "#fff",
                                            fontWeight: "700",
                                          }}
                                        >
                                          {this.state.MocktestReattempt
                                            ? this.state.correct
                                            : this.state.unanswered[
                                                this.state.activeSecTabIndex
                                              ].length}{" "}
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      className="text-review"
                                      style={{ fontWeight: "bold" }}
                                    >
                                      Unanswered
                                    </div>
                                  </div>
                                </Col>
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={12}
                                  lg={12}
                                  xl={12}
                                  xxl={12}
                                >
                                  <div
                                    className="content"
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      marginTop: "1px",
                                    }}
                                  >
                                    <div className="outer-box">
                                      <div
                                        style={{
                                          flex: 1,
                                          backgroundImage: `url("data:image/svg+xml,${mockNotvisited}")`,
                                          backgroundRepeat: "no-repeat",
                                          backgroundPosition: "center",
                                          backgroundSize: "91% 105%",
                                          marginTop: "10px",
                                          marginLeft: "6px",
                                          height: "40px",
                                        }}
                                        className="not-visited-sidebar circle-img img-same"
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            padding: "8px",
                                            fontWeight: "700",
                                            fontSize: "16px",
                                          }}
                                        >
                                          {
                                            this.state.notvisited[
                                              this.state.activeSecTabIndex
                                            ].length
                                          }
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      className="text-review"
                                      style={{
                                        fontWeight: "bold",
                                      }}
                                    >
                                      Not visited
                                    </div>{" "}
                                  </div>
                                </Col>
                                <Col
                                  xs={12}
                                  sm={12}
                                  md={12}
                                  lg={12}
                                  xl={12}
                                  xxl={12}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div className="outer-box">
                                      <div
                                        style={{
                                          flex: 1,
                                          backgroundImage: `url("data:image/svg+xml,${mockMarked}")`,
                                          backgroundRepeat: "no-repeat",
                                          backgroundPosition: "top center",
                                          backgroundSize: "100% 100%",
                                          width: "47px",
                                        }}
                                        className="mark-question circle-img img-same"
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            padding: "10px 10px ",
                                            color: "#fff",
                                            fontWeight: "700",
                                          }}
                                        >
                                          {
                                            this.state.marked[
                                              this.state.activeSecTabIndex
                                            ].qusReview.length
                                          }
                                        </div>
                                      </div>
                                    </div>

                                    <div
                                      className="text-review"
                                      style={{
                                        fontWeight: "bold",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                      }}
                                    >
                                      Marked for Review
                                    </div>
                                  </div>
                                </Col>
                                <Col
                                  xs={24}
                                  sm={24}
                                  md={24}
                                  lg={24}
                                  xl={24}
                                  xxl={24}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div className="outer-box">
                                      <div
                                        style={{
                                          flex: "1 1 7%",
                                          backgroundImage: `url("data:image/svg+xml,${mockmarkedAnswered}")`,
                                          backgroundRepeat: "no-repeat",
                                          backgroundPosition: "top center",
                                          backgroundSize: "100% 100%",
                                          marginLeft: "5px",
                                          width: "43px",
                                        }}
                                        className="mark-question circle-img img-same"
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            padding: "8px 12px 10px 10px ",
                                            color: "#fff",
                                            fontWeight: "700",
                                            fontSize: "16px",
                                          }}
                                        >
                                          {this.state.MocktestSolution ||
                                          this.state.MocktestReattempt
                                            ? this.state.correct
                                            : this.state.marked[
                                                this.state.activeSecTabIndex
                                              ].ansReview.length}
                                        </div>
                                      </div>
                                    </div>

                                    <div
                                      className="text-review"
                                      style={{
                                        fontWeight: "bold",
                                      }}
                                    >
                                      Answers & Marked for Review
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            )}
                            {/* ----------------Mockasideicon------------------ */}
                            {this.state.showFullview && (
                              <span
                                onClick={this.handlecloser}
                                className="mockaside-icon"
                              >
                                <img alt="mockaside" src={mockaside} />
                              </span>
                            )}
                            <div className="layout">
                              <div
                                className="header"
                                style={{ position: "relative" }}
                              >
                                <div className="title">
                                  {this.state.activeTab &&
                                    this.state.activeTab.label}
                                </div>
                              </div>
                            </div>
                            <Divider style={{ margin: 0 }} />
                            <div className="layout">
                              <div
                                className="content"
                                id={
                                  this.state.MocktestSolution ||
                                  this.state.MocktestReattempt
                                    ? "mock-attempted-fixed-status"
                                    : "mock-fixed-content"
                                }
                                style={{ margin: "0px 6px" }}
                              >
                                {this.state.mockQuestionSet[
                                  this.state.activeSecTabIndex
                                ].length === 0 ? (
                                  <Spin className="app-spinner" size="large" />
                                ) : (
                                  <div className="side-BarText">
                                    {this.state.mockQuestionSet[
                                      this.state.activeSecTabIndex
                                    ].map((item, index) => (
                                      <div
                                        key={index}
                                        style={{
                                          gridColumn: 2 / 5,
                                        }}
                                      >
                                        {this.state.MocktestStart && (
                                          <div
                                            style={{
                                              boxShadow:
                                                this.state.selectedIndex ===
                                                index
                                                  ? "rgba(0, 0, 0, 0.1) 0px 0px 90px"
                                                  : "none",
                                              backgroundColor:
                                                this.state.selectedIndex ===
                                                index
                                                  ? " #ADD8E6"
                                                  : "transparent",
                                              padding: "1px 4px",
                                              borderRadius: "8px",
                                            }}
                                          >
                                            <div
                                              style={{
                                                flex: 1,
                                                backgroundImage: `url("data:image/svg+xml,${
                                                  item.isAnsReview === 1
                                                    ? mockmarkedAnswered
                                                    : item.isAttempted
                                                    ? mockAnswered
                                                    : item.isReview
                                                    ? mockMarked
                                                    : item.isSkipped
                                                    ? mockunAnswered
                                                    : mockNotvisited
                                                }")`,
                                                backgroundRepeat: "no-repeat",
                                                backgroundPosition:
                                                  "top center",
                                                backgroundSize: " 42px 100%",
                                                padding: "8px",
                                                fontSize: "16px",
                                              }}
                                              onClick={() =>
                                                this.handleQuestion(index)
                                              }
                                              className={
                                                item.isAttempted
                                                  ? "answered"
                                                  : item.isSkipped
                                                  ? "un-answered"
                                                  : item.isReview === 1
                                                  ? "mark-question"
                                                  : "not-answered"
                                              }
                                            >
                                              <div
                                                style={{
                                                  padding: "11px",
                                                  fontWeight: "700",
                                                  position: "relative",
                                                  fontSize: "15px",
                                                }}
                                              >
                                                <span className="value">
                                                  {item.question_no}
                                                </span>
                                              </div>{" "}
                                            </div>
                                          </div>
                                        )}
                                        {this.state.MocktestResume && (
                                          <div
                                            style={{
                                              boxShadow:
                                                this.state.selectedIndex ===
                                                index
                                                  ? "rgba(0, 0, 0, 0.1) 0px 0px 90px"
                                                  : "none",
                                              backgroundColor:
                                                this.state.selectedIndex ===
                                                index
                                                  ? " #ADD8E6"
                                                  : " transparent",
                                              padding: "1px 3px",
                                              borderRadius: "10px",
                                            }}
                                          >
                                            <div
                                              style={{
                                                flex: 1,
                                                backgroundImage: `url("data:image/svg+xml,${
                                                  item.isAnsReview === 1
                                                    ? mockmarkedAnswered
                                                    : item.isAttempted
                                                    ? mockAnswered
                                                    : item.isReview
                                                    ? mockMarked
                                                    : item.isSkipped
                                                    ? mockunAnswered
                                                    : mockNotvisited
                                                }")`,
                                                backgroundRepeat: "no-repeat",
                                                backgroundPosition:
                                                  "top center",
                                                backgroundSize: "42px 100%",
                                                padding: "6px",
                                                fontSize: "15px",
                                              }}
                                              onClick={() =>
                                                this.handleQuestion(index)
                                              }
                                              className={
                                                item.isAttempted
                                                  ? "answered"
                                                  : item.isSkipped
                                                  ? "un-answered"
                                                  : item.isReview === 1
                                                  ? "mark-question"
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
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            {(this.state.MocktestResume ||
                              this.state.MocktestStart) && (
                              <div className="mocktest-quest-footer">
                                {this.state.activeTabIndex <
                                this.panes.length ? (
                                  <div className="question-next">
                                    {this.state.is_section_timer === 1 ? (
                                      <Button
                                        className="question-next-btn"
                                        block
                                        size="large"
                                        onClick={() => {
                                          this.state.sectionSubmitBtnAllow &&
                                            this.setState(
                                              { sectionSubmitStatus: true },
                                              () =>
                                                this.handleSectionSubmit(true)
                                            );
                                        }}
                                        disabled={
                                          this.props.mocktest
                                            .allow_submit_before_section_time ===
                                          0
                                        }
                                        style={{
                                          background:
                                            "linear-gradient(180deg, #85C149 0%, #4A7B0E 100%)",
                                          borderRadius: "3px",
                                          color: "#fff",
                                          opacity:
                                            this.props.mocktest
                                              .allow_submit_before_section_time ===
                                            0
                                              ? 0.5
                                              : 10,
                                        }}
                                      >
                                        Section submit
                                      </Button>
                                    ) : (
                                      <Button
                                        className="question-next-btn"
                                        block
                                        size="large"
                                        onClick={() => this.handleNextSection()}
                                        disabled={
                                          this.props.mocktest
                                            .allow_submit_before_section_time ===
                                          0
                                        }
                                        style={{
                                          background:
                                            "linear-gradient(180deg, #85C149 0%, #4A7B0E 100%)",
                                          borderRadius: "3px",
                                          color: "#fff",
                                        }}
                                      >
                                        Next Section
                                      </Button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="question-submited">
                                    <Button
                                      className="question-submit-btn"
                                      block
                                      size="large"
                                      onClick={() => this.handleSubmit(true)}
                                      disabled={
                                        this.state.isSubmit
                                          ? true
                                          : this.props.mocktest
                                              .allow_submit_before_section_time ===
                                              0 || this.state.overall_time <= 1
                                      }
                                      style={{
                                        background:
                                          "linear-gradient(180deg, #85C149 0%, #4A7B0E 100%)",
                                        color: "#fff",
                                        borderRadius: "2.38026px",
                                        opacity: this.state.isSubmit
                                          ? true
                                          : this.props.mocktest
                                              .allow_submit_before_section_time ===
                                              0 || this.state.overall_time <= 1
                                          ? 0.5
                                          : 10,
                                      }}
                                    >
                                      Submit
                                      <RightOutlined className="icon" />{" "}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          //----------------view solutions-------------------------
                          <>
                            <div className="layout drawer-topic-container">
                              {this.state.showFullview && (
                                <span
                                  onClick={this.handlecloser}
                                  className="mockaside-icon"
                                >
                                  <img alt="mockaside" src={mockaside} />
                                </span>
                              )}
                              <div className="drawer-topic">
                                {this.state.activeTab &&
                                  this.state.activeTab.label}
                              </div>
                            </div>
                            <Divider style={{ margin: 0 }} />
                            <Checkbox.Group
                              className="mocktest-Checkbox-Group"
                              style={{ width: "100%", padding: "1em" }}
                              onChange={(e) => this.handleCountFilter(e)}
                              value={this.state.CheckboxValue}
                            >
                              <Row
                                gutter={[0, 10]}
                                className="mocktest-type-row"
                                style={{ fontWeight: "bold", fontSize: "15px" }}
                              >
                                <Col
                                  xs={24}
                                  sm={24}
                                  md={24}
                                  lg={24}
                                  xl={24}
                                  xxl={24}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div
                                      style={{
                                        flex: 3,
                                        padding: "10px",
                                      }}
                                    >
                                      All Questions
                                    </div>
                                    <div
                                      style={{
                                        flex: 1,
                                      }}
                                      className="mocktest-Checkbox-Item"
                                    >
                                      <span
                                        style={{
                                          padding: "0px 10px",
                                        }}
                                      >
                                        {
                                          this.state.fullMockQuestionSet[
                                            this.state.activeSecTabIndex
                                          ].length
                                        }
                                      </span>
                                      <Checkbox value="All" />
                                    </div>
                                  </div>
                                </Col>
                                <Col
                                  xs={24}
                                  sm={24}
                                  md={24}
                                  lg={24}
                                  xl={24}
                                  xxl={24}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div
                                      style={{
                                        flex: 3,
                                        padding: "10px",
                                      }}
                                    >
                                      <img
                                        src={right_status}
                                        style={{
                                          width: "18px",
                                          margin: "0px 6px 0px 0px",
                                        }}
                                        alt="right_status"
                                      />
                                      Correct
                                    </div>
                                    <div
                                      style={{
                                        flex: 1,
                                      }}
                                      className="mocktest-Checkbox-Item"
                                    >
                                      <span
                                        style={{
                                          padding: "0px 10px",
                                        }}
                                      >
                                        {
                                          this.state.correct[
                                            this.state.activeSecTabIndex
                                          ]
                                        }
                                      </span>
                                      <Checkbox
                                        disabled={
                                          this.state.correct[
                                            this.state.activeSecTabIndex
                                          ] === 0
                                        }
                                        value="Correct"
                                      />
                                    </div>
                                  </div>
                                </Col>
                                <Col
                                  xs={24}
                                  sm={24}
                                  md={24}
                                  lg={24}
                                  xl={24}
                                  xxl={24}
                                >
                                  <div
                                    className="content"
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div
                                      style={{
                                        padding: "10px",
                                        flex: 3,
                                      }}
                                    >
                                      <img
                                        src={wrong_status}
                                        style={{
                                          width: "17px",
                                          margin: "0px 6px 0px 0px",
                                        }}
                                        alt="wrong_status"
                                      />
                                      Wrong
                                    </div>
                                    <div
                                      style={{
                                        flex: 1,
                                      }}
                                      className="mocktest-Checkbox-Item"
                                    >
                                      <span
                                        style={{
                                          padding: "0px 10px",
                                        }}
                                      >
                                        {
                                          this.state.wrong[
                                            this.state.activeSecTabIndex
                                          ]
                                        }
                                      </span>
                                      <Checkbox
                                        disabled={
                                          this.state.wrong[
                                            this.state.activeSecTabIndex
                                          ] === 0
                                        }
                                        value="Wrong"
                                      />
                                    </div>
                                  </div>
                                </Col>
                                <Col
                                  xs={24}
                                  sm={24}
                                  md={24}
                                  lg={24}
                                  xl={24}
                                  xxl={24}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div
                                      style={{
                                        padding: "10px",
                                        flex: "3 1 0%",
                                      }}
                                    >
                                      <img
                                        src={result_skiped}
                                        style={{
                                          width: "17px",
                                          margin: "0px 6px 0px 0px",
                                        }}
                                        alt="result_skiped"
                                      />
                                      Skipped
                                    </div>
                                    <div
                                      style={{
                                        flex: 1,
                                      }}
                                      className="mocktest-Checkbox-Item"
                                    >
                                      <span
                                        style={{
                                          padding: "0px 10px",
                                        }}
                                      >
                                        {
                                          this.state.skipped[
                                            this.state.activeSecTabIndex
                                          ]
                                        }
                                      </span>
                                      <Checkbox
                                        disabled={
                                          this.state.skipped[
                                            this.state.activeSecTabIndex
                                          ] === 0
                                        }
                                        value="isSkipped"
                                      />
                                    </div>
                                  </div>
                                </Col>
                                <Col
                                  xs={24}
                                  sm={24}
                                  md={24}
                                  lg={24}
                                  xl={24}
                                  xxl={24}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div
                                      style={{
                                        flex: 3,
                                        padding: "10px",
                                      }}
                                    >
                                      <img
                                        src={result_notvisited}
                                        style={{
                                          width: "15px",
                                          margin: "0px 6px 0px 0px",
                                        }}
                                        alt="result_notvisited"
                                      />
                                      Not Visited
                                    </div>
                                    <div
                                      style={{
                                        flex: 1,
                                      }}
                                      className="mocktest-Checkbox-Item"
                                    >
                                      <span
                                        style={{
                                          padding: "0px 10px",
                                        }}
                                      >
                                        {
                                          this.state.notvisited[
                                            this.state.activeSecTabIndex
                                          ].length
                                        }
                                      </span>
                                      <Checkbox
                                        disabled={
                                          this.state.notvisited[
                                            this.state.activeSecTabIndex
                                          ].length === 0
                                        }
                                        value="notvisited"
                                      />
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </Checkbox.Group>
                            <Divider style={{ margin: 0 }} />
                            <div className="layout">
                              <div
                                className="content"
                                id={
                                  this.state.MocktestSolution ||
                                  this.state.MocktestReattempt
                                    ? "mock-attempted-fixed-status"
                                    : "mock-fixed-content"
                                }
                                style={{ margin: "0px 6px" }}
                              >
                                {this.state.mockQuestionSet[
                                  this.state.activeSecTabIndex
                                ].length === 0 ? (
                                  <Spin className="app-spinner" size="large" />
                                ) : (
                                  <div className="mock-content-grid">
                                    {this.state.mockQuestionSet[
                                      this.state.activeSecTabIndex
                                    ].map((item, index) => (
                                      <div
                                        key={index}
                                        style={{
                                          gridColumn: 1 / 5,
                                        }}
                                      >
                                        {this.state.MocktestSolution && (
                                          <div
                                            className="mock-content-background-grid"
                                            style={{
                                              backgroundColor:
                                                this.state.selectedIndex ===
                                                index
                                                  ? " #ADD8E6"
                                                  : "transparent",
                                            }}
                                          >
                                            <div
                                              style={{
                                                flex: 1,
                                                backgroundImage: `url("data:image/svg+xml,${
                                                  item.is_skipped === 1
                                                    ? solutionSkiped
                                                    : item.isAttempted
                                                    ? item.userPicked !==
                                                      undefined
                                                      ? solutionCorrect
                                                      : solutionWrong
                                                    : mockNotvisited
                                                }")`,
                                                backgroundRepeat: "no-repeat",
                                                backgroundPosition:
                                                  "top center",
                                                backgroundSize: "42px 100%",
                                                padding: "6px",
                                                fontSize: "15px",
                                              }}
                                              onClick={() =>
                                                this.handleQuestion(index)
                                              }
                                              className={
                                                item.is_skipped === 1 ||
                                                item.isAttempted
                                                  ? "un-answered"
                                                  : "not-answered"
                                              }
                                            >
                                              <div
                                                style={{
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
                                        )}
                                        {this.state.MocktestReattempt && (
                                          <div
                                            className="mock-content-background-grid"
                                            style={{
                                              boxShadow:
                                                this.state.selectedIndex ===
                                                index
                                                  ? "rgba(0, 0, 0, 0.1) 0px 0px 90px"
                                                  : "none",
                                              backgroundColor:
                                                this.state.selectedIndex ===
                                                index
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
                                                backgroundRepeat: "no-repeat",
                                                backgroundPosition:
                                                  "top center",
                                                backgroundSize: "42px 100%",
                                                padding: "6px",
                                                fontSize: "15px",
                                              }}
                                              onClick={() =>
                                                this.handleQuestion(index)
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
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="mocktest-quest-footer">
                              <div className="question-submit">
                                <Button
                                  className="question-analysis-btn"
                                  block
                                  size="large"
                                  style={{
                                    background: "#0B649D",
                                    color: "#fff",
                                    borderRadius: "2.38026px",
                                  }}
                                  onClick={() => {
                                    this.props.dispatch(
                                      mocktestStatusUpdate(true, "solution")
                                    );
                                    this.props.dispatch(
                                      mocktestReattempt(false, "")
                                    );
                                    this.props.navigate(
                                      `/course-details/${this.props.match.params.id}/mocktest/${this.props.match.params.mock_id}/result`
                                    );
                                  }}
                                >
                                  Analysis
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </Card>
                    </Col>
                  </Row>
                ) : (
                  <Spin className="app-spinner" size="large" />
                )}
              </div>
            ) : (
              <>
                <div
                  className="breadcrumb-container"
                  style={{ margin: "20px" }}
                >
                  <Button
                    type="link"
                    onClick={() => {
                      this.props.navigate(
                        `/course-details/${this.props.match.params.id}`
                      );
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
                  >
                    <ArrowLeftOutlined />
                    Back
                  </Button>
                </div>
                <NoRecords />
              </>
            )}
          </>
        )}
        <div id="myMockModal" className="modal">
          <span className="close">&times;</span>
          <img className="modal-content" alt="content" id="img01" />
          <div id="caption"></div>
        </div>
        <MocktestSwitchOverPopup
          ref={(instance) => {
            this.timeoverPopup = instance;
          }}
          {...this.props}
          handleNextSection={this.handleNextSection}
          handlecloseTimer={this.handlecloseTimer}
          postSaveNext={this.postSaveNext}
          handleclearQInterval={this.handleclearQInterval}
          postMockQuestionSubmit={this.postMockQuestionSubmit}
          postSectionSubmit={this.postSectionSubmit}
        />
        <MocktestReportPopup
          ref={(instance) => {
            this.mocktestReportPopup = instance;
          }}
          {...this.props}
        />
        <MocktestLeavePopup
          ref={(instance) => {
            this.leavePopup = instance;
          }}
          {...this.props}
          submitLeaveMocktest={this.submitLeaveMocktest}
          handlecloseTimer={this.handlecloseTimer}
        />
        <MocktestErrorPopup
          ref={(instance) => {
            this.errorPopup = instance;
          }}
          submitLeaveMocktest={this.submitLeaveMocktest}
          getMockUserRecord={this.getMockUserRecord}
          handleclearQInterval={this.handleclearQInterval}
          postMockQuestionSubmit={this.postMockQuestionSubmit}
          handleLoader={this.handleLoader}
          {...this.props}
        />
        <CreateDoubts
          {...this.props}
          ref={(instance) => {
            this.CreateDoubts = instance;
          }}
        />
        <QuizSharePopup
          ref={(instance) => {
            this.quizSharePopup = instance;
          }}
          handleScreenCapture={this.handleScreenCapture}
          {...this.props}
        />
      </div>
    );
  }
}

export default MocktestQuestions;
