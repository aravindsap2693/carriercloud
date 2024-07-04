import React, { Component } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Divider,
  Spin,
  Switch,
  Avatar,
} from "antd";
import quiz_info from "../../../assets/svg-icons/quiz-info.svg";
import quiz_bookmark from "../../../assets/svg-icons/quiz-bookmark.svg";
import quiz_bookmarked from "../../../assets/svg-icons/quiz-bookmarked.svg";
import quiz_solution from "../../../assets/svg-icons/quiz-solution.svg";
import {
  ArrowLeftOutlined,
  ExpandOutlined,
  CompressOutlined,
  MenuOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import quiz_level_easy from "../../../assets/svg-icons/quiz-level-easy.svg";
import quiz_level_medium from "../../../assets/svg-icons/quiz-level-medium.svg";
import quiz_level_hard from "../../../assets/svg-icons/quiz-level-hard.svg";
import quiz_topics from "../../../assets/svg-icons/quiz-topics.svg";
import share from "../../../assets/svg-icons/share.svg";
import QuizSubmitPopup from "../../../components/QuizSubmitPopup";
import QuizLeavePopup from "../../../components/QuizLeavePopup";
import QuizInstructionPopup from "../../../components/QuizInstructionPopup";
import QuizTimeOverPopup from "../../../components/QuizTimeOverPopup";
import QuizQuestionsReportPopup from "../../../components/QuizQuestionsReportPopup";
import QuizSharePopup from "../../../components/QuizSharePopup";
import { RightOutlined } from "@ant-design/icons";
import "../../../assets/css/quiz-question.css";
import Env, { profileImageUrl } from "../../../utilities/services/Env";
import Choices from "../../../utilities/Choices.json";
import { connect } from "react-redux";
import {
  currentPageRouting,
  quizReattempt,
  quizResume,
  quizSolution,
  quizStart,
  quizStartTimer,
} from "../../../reducers/action";
import { CommonService } from "../../../utilities/services/Common";
import moment from "moment";
import StorageConfiguration from "../../../utilities/services/StorageConfiguration";
import pause_icon from "../../../assets/svg-icons/quiz-pause.svg";
import { toast } from "react-toastify";
import $ from "jquery";
import analysis from "../../../assets/svg-images/analysis.svg";
import logo from "../../../assets/svg-images/waterMark.svg";
import CreateDoubts from "../../../components/Doubt/CreateDoubts";
import * as htmlToImage from "html-to-image";
import { analytics } from "../../../firebase-config";
import { logEvent } from "firebase/analytics";

const { Text } = Typography;

class QuizQuestions extends Component {
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
      startQuiz: props.quiz_start,
      viewQuizSolution: props.quiz_solution,
      reattemptQuiz: props.quiz_reattempt.state,
      resumeQuiz: props.quiz_resume,
      remainingTime: {
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
      currentDate: new Date(),
      previousTime: 0,
      showMore: true,
      showfullscreen: true,
      course_id: null,
      is_doubt: {},
    };
    this.userId = StorageConfiguration.sessionGetItem("user_id");
    this.answers = [];
    this.handleChoice = this.handleChoice.bind(this);
    this.handleResumeChoice = this.handleResumeChoice.bind(this);
  }

  componentDidMount() {
    window.addEventListener("keydown", this.handlekeydown);
    window.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });
    window.scrollTo(0, 0);
    window.addEventListener("beforeunload", this.handleRefresh);
    this.props.dispatch(currentPageRouting(null));
    this.state.reattemptQuiz
      ? this.getQuizReattempted()
      : this.getQuizDetails(this.props.match.params.quiz_id);
    logEvent(analytics, "select_content", {
      page_title: this.state.startQuiz
        ? "StartQuiz"
        : this.state.viewQuizSolution
        ? "viewQuizSolution"
        : this.state.resumeQuiz
        ? "resumeQuiz"
        : "reattemptQuiz",
    });
  }

  componentWillReceiveProps(newProps) {
    if (newProps.quiz_start_timer === true) {
      this.handleTimer();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handlekeydown);
    window.removeEventListener("contextmenu", function (e) {
      e.preventDefault();
    });
    window.removeEventListener("beforeunload", this.handleRefresh);
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
      $(".question-full-image img, .solution-body img").click(function () {
        modal.style.display = "block";
        modalImg.src = this.src;
        captionText.innerHTML = this.alt;
      });
      $(".question-full-image img, .solution-body img").hover(function () {
        $(this).css("cursor", "pointer");
      });
      $("#myModal span").click(function () {
        modal.style.display = "none";
      });
    });
  }

  handlekeydown = (e) => {
    if (process.env.REACT_APP_ENV === "prod") {
      if (e.keyCode === 123 || e.keyCode === 116 || e.keyCode === 93) {
        e.preventDefault();
        return false;
      } else if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
      }
    }
  };

  handleRefresh = (e) => {
    this.props.dispatch(quizStartTimer(false));
    this.props.dispatch(quizSolution(false));
    this.props.dispatch(quizStart(false));
    this.props.dispatch(quizResume(false));
  };

  handleChoice(e, choiceId, choiceIndex) {
    let nextIndex = this.state.selectedIndex + 1;
    let checkStatus = true;
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
        this.answers[this.state.selectedIndex] = {
          quiz_question_id: quizQuestionSet[this.state.selectedIndex].id,
          quiz_question_choice_id: 0,
          sort_order: this.answers[this.state.selectedIndex].sort_order,
        };
        checkStatus = false;
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
          sort_order:
            this.state.reattemptQuiz === true
              ? quizQuestionSet[this.state.selectedIndex].sort_order
              : this.answers[this.state.selectedIndex].sort_order,
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
      // let removedNull = this.answers.filter((element) => element !== null);
      this.setState({
        quizRequestPayload: {
          quiz_id: this.state.quiz.id,
          id: this.userId,
          is_reattempt: this.props.quiz_reattempt.state === false ? 0 : 1,
          skipped_questions_count: unattempted.length,
          user_answers: JSON.stringify(this.answers),
          quiz_start_datetime:
            this.state.quizRequestPayload.quiz_start_datetime,
        },
        quizQuestions: quizQuestionSet,
        attempted: attempted,
        unattempted: unattempted,
        previousTime: 0,
      });

      if (quizQuestionSet.length >= nextIndex) {
        setTimeout(() => {
          if (this.state.reattemptQuiz === true) {
            this.setState({ selectedIndex: this.state.selectedIndex });
            if (isRightChoice[0].id === choiceId) {
              this.setState({ correct: this.state.correct + 1 });
            } else {
              this.setState({ wrong: this.state.wrong + 1 });
            }
          } else {
            if (
              quizQuestionSet[this.state.selectedIndex + 1] !== undefined &&
              checkStatus === true
            ) {
              this.setState({
                selectedIndex: this.state.selectedIndex,
                showMore: this.state.showMore,
              });
            }
          }
        }, 1000);
      }
    }
  }

  handleResumeChoice(e, choiceId, choiceIndex) {
    let nextIndex = this.state.selectedIndex + 1;
    let checkStatus = true;
    let quizQuestionSet = this.state.quizQuestionSet;
    if (
      quizQuestionSet[this.state.selectedIndex].choices[choiceIndex]
        .user_choices !== null
    ) {
      quizQuestionSet[this.state.selectedIndex].choices.forEach((element) => {
        element.user_choices = null;
      });
      this.answers[this.state.selectedIndex] = {
        quiz_question_id: quizQuestionSet[this.state.selectedIndex].id,
        quiz_question_choice_id: 0,
        sort_order: this.answers[this.state.selectedIndex].sort_order,
      };
      quizQuestionSet[this.state.selectedIndex].isAttempted = false;
      checkStatus = false;
    } else {
      quizQuestionSet[this.state.selectedIndex].choices.forEach((element) => {
        element.user_choices = null;
      });
      quizQuestionSet[this.state.selectedIndex].choices[
        choiceIndex
      ].user_choices = {};
      this.answers[this.state.selectedIndex] = {
        quiz_question_id: quizQuestionSet[this.state.selectedIndex].id,
        quiz_question_choice_id: choiceId,
        sort_order: this.state.selectedIndex + 1,
      };
      quizQuestionSet[this.state.selectedIndex].isAttempted = true;
    }

    let attempted = quizQuestionSet.filter((item) => item.isAttempted === true);
    let unattempted = quizQuestionSet.filter(
      (item) => item.isAttempted === false
    );
    // let removedNull = this.answers.filter((element) => element !== null);
    this.setState({
      quizRequestPayload: {
        quiz_id: this.state.quiz.id,
        // time_taken_in_seconds: 120,
        quiz_end_datetime: moment(new Date()).format("YYYY-MM-DD hh:mm:ss"),
        quiz_start_datetime: moment(
          this.state.quizRequestPayload.quiz_start_datetime
        ).format("YYYY-MM-DD hh:mm:ss"),
        id: this.userId,
        is_reattempt: this.props.quiz_reattempt.state === false ? 0 : 1,
        // quiz_status: "completed",
        skipped_questions_count: unattempted.length,
        user_answers: JSON.stringify(this.answers),
      },
      quizQuestions: quizQuestionSet,
      attempted: attempted,
      unattempted: unattempted,
      previousTime: this.state.previousTime,
    });
    if (nextIndex !== quizQuestionSet.length) {
      setTimeout(() => {
        if (
          quizQuestionSet[this.state.selectedIndex + 1] !== undefined &&
          checkStatus === true
        ) {
          this.setState({
            selectedIndex: this.state.selectedIndex,
            showMore: this.state.showMore,
          });
        }
      }, 1000);
    }
  }

  handleBookmarkQuestion = () => {
    let quizQuestionSet = this.state.quizQuestionSet;
    const requestBody = {
      quiz_question_id: quizQuestionSet[this.state.selectedIndex].id,
    };
    if (quizQuestionSet[this.state.selectedIndex].isBookmarked === 1) {
      toast("Bookmark removed successfully !");
    } else {
      toast("Bookmark added successfully !");
    }

    quizQuestionSet[this.state.selectedIndex].isBookmarked === 1
      ? (quizQuestionSet[this.state.selectedIndex].isBookmarked = 0)
      : (quizQuestionSet[this.state.selectedIndex].isBookmarked = 1);
    this.setState({ quizQuestionSet: quizQuestionSet });
    const bookmarkData = Env.post(
      this.props.envendpoint + `myquestions`,
      requestBody
    );
    bookmarkData.then(
      (response) => {},
      (error) => {
        console.error(error);
      }
    );
  };

  getQuizDetails = (quizId) => {
    const getQuizData = Env.get(
      this.props.envendpoint + `quiz/quizshow/${quizId}`
    );
    getQuizData.then(
      (response) => {
        const data = response.data.response.quiz;
        this.props.dispatch(quizSolution(data.is_attempted === 1));
        this.props.dispatch(quizStart(data.is_attempted === 0));
        this.props.dispatch(quizResume(data.is_attempted === 2));
        this.setState(
          {
            startQuiz: data.is_attempted === 0,
            viewQuizSolution: data.is_attempted === 1,
            resumeQuiz: data.is_attempted === 2,
          },
          () => {
            this.state.startQuiz && this.getQuizQuestions();
            this.state.viewQuizSolution && this.getQuizSolutions();
            this.state.resumeQuiz && this.getResumeQuestions();
          }
        );
      },
      (error) => {
        console.error(error);
      }
    );
  };

  getQuizQuestions = () => {
    var quizId = "";
    if (this.state.startQuiz === true) {
      quizId = this.props.match.params.quiz_id;
    } else {
      quizId = this.props.quiz_reattempt.id;
    }
    const quizzes = [];
    const getQuizData = Env.get(this.props.envendpoint + `quiz/${quizId}`);
    getQuizData.then(
      (response) => {
        const data = response.data.response.quiz;
        data.question_set.forEach((element, index) => {
          var choices = [];
          element.choices.forEach((item) => {
            choices.push({
              id: item.id,
              choice: item.choice,
              selected_choice: 0,
            });
          });
          quizzes.push({
            id: element.id,
            question: element.question,
            solution: element.solution,
            choices: choices,
            isAttempted: false,
            isBookmarked: element.is_favourite,
            userPicked: 0,
            question_group: element.question_group,
          });
          this.answers.push({
            quiz_question_id: element.id,
            quiz_question_choice_id: 0,
            sort_order: index + 1,
          });
        });

        this.setState(
          {
            quizQuestionSet: quizzes,
            quiz: {
              id: data.id,
              title: data.title,
              time_duration_in_seconds: data.time_duration_in_seconds,
              quiz_records_count: data.quiz_records_count,
              questions_count: data.questions_count,
              mark: data.mark,
              instruction: data.instruction,
            },
            previousTime: 0,
            remainingTime: {
              hours: Math.floor(data.time_duration_in_seconds / 3600),
              minutes: Math.floor((data.time_duration_in_seconds % 3600) / 60),
              seconds: 0,
            },
            unattempted: quizzes,
            activeLoader: false,
            quizRequestPayload: {
              quiz_id: data.id,
              quiz_end_datetime: moment(new Date()).format(
                "YYYY-MM-DD hh:mm:ss"
              ),
              quiz_start_datetime: moment(new Date()).format(
                "YYYY-MM-DD hh:mm:ss"
              ),
              id: this.userId,
              is_reattempt: this.props.quiz_reattempt.state === false ? 0 : 1,
              skipped_questions_count: data.question_set.length,
              user_answers: JSON.stringify([]),
            },
          },
          () => this.instructionPopup.showModal(this.state.quiz, this.props)
        );
      },
      (error) => {
        console.error(error);
      }
    );
  };

  handleTimer() {
    var twentyMinutesLater = new Date();
    twentyMinutesLater.setMinutes(
      twentyMinutesLater.getMinutes() +
        this.state.quiz.time_duration_in_seconds / 60
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
          this.state.unattempted,
          this.state.previousTime
        );
      }
    }, 1000);
  }

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

  async getQuizSolutions() {
    const quizId = this.props.match.params.quiz_id;
    const getQuizData = Env.get(
      this.props.envendpoint + `quiz/solution/${quizId}`
    );
    const solutionData = [];
    const correct = [];
    var wrong = "";
    await getQuizData.then(
      (response) => {
        const data = response.data.response.quizSolution.questions;
        data.forEach((element) => {
          var choices = [];
          element.choices.forEach((item) => {
            choices.push({
              id: item.id,
              choice: item.choice,
              is_right_choice: item.is_right_choice,
              user_choices: item.user_choices,
            });
            item.is_right_choice === 1 &&
              item.user_choices !== null &&
              correct.push(choices);
          });
          let isRight = choices.findIndex((item) => item.is_right_choice === 1);
          let userPicked = choices.find(
            (item) => item.is_right_choice === 1 && item.user_choices !== null
          );
          solutionData.push({
            id: element.id,
            question: element.question,
            solution: element.solution,
            choices: choices,
            isAttempted: true,
            isBookmarked: element.is_favourite,
            is_skipped: element.is_skipped,
            userPicked: userPicked,
            isRight: isRight,
            difficult_level: element.difficult_level,
            question_overall_percentage: element.question_overall_percentage,
            topics_name: element.topics && element.topics.name,
            question_group: element.question_group,
          });
        });
        const answered = solutionData.filter((item) => item.is_skipped === 0);
        const unanswered = solutionData.filter((item) => item.is_skipped === 1);
        wrong = solutionData.length - unanswered.length - correct.length;
        this.setState({
          quizQuestionSet: solutionData,
          quiz: {
            id: response.data.response.quizSolution.id,
            title: response.data.response.quizSolution.title,
            time_duration_in_seconds:
              response.data.response.quizSolution.time_duration_in_seconds,
            quiz_records_count:
              response.data.response.quizSolution.quiz_records_count,
            questions_count:
              response.data.response.quizSolution.questions_count,
          },
          unattempted: unanswered,
          attempted: answered,
          activeLoader: false,
          correct: correct.length,
          wrong: wrong,
          course_id: response.data.response.quizSolution.course_id,
          is_doubt: {
            is_doubt: response.data.response.quizSolution.is_doubt,
            is_doubt_share: response.data.response.quizSolution.is_doubt_share,
          },
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  async getResumeQuestions() {
    const quizId = this.props.match.params.quiz_id;
    const getQuizData = Env.get(
      this.props.envendpoint + `quiz/resume/${quizId}`
    );
    const solutionData = [];
    // const attempted = false
    await getQuizData.then(
      (response) => {
        const data = response.data.response.quizResumeData;
        const questions = data.questions;
        questions.forEach((element, index) => {
          this.answers.push({
            quiz_question_id: element.id,
            quiz_question_choice_id: 0,
            sort_order: index + 1,
          });
          var choices = [];
          element.isAttempted = false;
          element.choices.forEach((item) => {
            choices.push({
              id: item.id,
              choice: item.choice,
              is_right_choice: item.is_right_choice,
              user_choices: item.user_choices,
            });
            if (item.user_choices !== null) {
              element.isAttempted = true;
              this.answers[index] = {
                quiz_question_choice_id: item.id,
                quiz_question_id: element.id,
                sort_order: index + 1,
              };
            }
          });
          let userPicked = choices.find((item) => item.user_choices !== null);
          solutionData.push({
            id: element.id,
            question: element.question,
            solution: element.solution,
            choices: choices,
            isBookmarked: element.is_favourite,
            is_skipped: element.is_skipped,
            userPicked: userPicked,
            isAttempted: element.isAttempted,
            question_group: element.question_group,
          });
        });
        const answered = solutionData.filter(
          (item) => item.isAttempted === true
        );
        const unanswered = solutionData.filter(
          (item) => item.isAttempted === false
        );
        // const minutes = Math.floor(response.data.response.quizResumeData.time_duration_in_seconds % 3600 / 60)
        // const remaining_minutes = minutes - Math.floor(response.data.response.quizResumeData.quiz_records[0].time_taken_in_seconds % 3600 / 60)
        // const seconds = Math.floor(response.data.response.quizResumeData.time_duration_in_seconds % 3600 % 60)
        // const remaining_seconds = seconds - Math.floor(response.data.response.quizResumeData.quiz_records[0].time_taken_in_seconds % 3600 % 60)
        this.setState(
          {
            quizQuestionSet: solutionData,
            quiz: {
              id: data.id,
              title: data.title,
              time_duration_in_seconds: data.time_duration_in_seconds,
              quiz_records_count: data.quiz_records_count,
              questions_count: data.questions_count,
              time_taken_in_seconds: data.quiz_records[0].time_taken_in_seconds,
              mark: data.mark,
              // instruction: data.instruction,
            },
            unattempted: unanswered,
            activeLoader: false,
            attempted: answered,
            previousTime: data.quiz_records[0].time_taken_in_seconds,
            quizRequestPayload: {
              quiz_id: data.id,
              quiz_end_datetime: moment(new Date()).format(
                "YYYY-MM-DD hh:mm:ss"
              ),
              quiz_start_datetime: moment(new Date()).format(
                "YYYY-MM-DD hh:mm:ss"
              ),
              id: this.userId,
              is_reattempt: this.props.quiz_reattempt.state === false ? 0 : 1,
              skipped_questions_count:
                data.quiz_records[0].skipped_questions_count,
              user_answers: JSON.stringify(this.answers),
            },
          },
          () => {
            if (
              data.quiz_records[0].time_taken_in_seconds >=
              data.time_duration_in_seconds
            ) {
              this.timeoverPopup.showModal2(
                this.state.quizRequestPayload,
                this.state.attempted,
                this.state.unattempted,
                data
              );
            } else {
              this.handleResumeTimer();
            }
          }
        );
      },
      (error) => {
        console.error(error);
      }
    );
  }

  handleResumeTimer() {
    var twentyMinutesLater = new Date();
    var remainingSeconds =
      this.state.quiz.time_duration_in_seconds -
      this.state.quiz.time_taken_in_seconds; // 873
    var minutes = Math.floor(remainingSeconds / 60);
    var seconds = Math.floor((remainingSeconds % 3600) % 60);
    twentyMinutesLater.setMinutes(twentyMinutesLater.getMinutes() + minutes);
    twentyMinutesLater.setSeconds(twentyMinutesLater.getSeconds() + seconds);
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
          this.state.unattempted,
          this.state.previousTime
        );
      }
    }, 1000);
  }

  async getQuizReattempted() {
    const quizId = this.props.match.params.quiz_id;
    const getQuizData = Env.get(
      this.props.envendpoint + `quiz/solution/${quizId}`
    );
    const solutionData = [];
    await getQuizData.then(
      (response) => {
        const data = response.data.response.quizSolution.questions;
        data.forEach((element, index) => {
          var choices = [];
          element.choices.forEach((item) => {
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
            id: element.id,
            question: element.question,
            solution: element.solution,
            choices: choices,
            isAttempted: false,
            isBookmarked: element.is_favourite,
            is_skipped: element.is_skipped,
            userPicked: userPicked,
            isRight: isRight,
            difficult_level: element.difficult_level,
            question_overall_percentage: element.question_overall_percentage,
            topics_name: element.topics && element.topics.name,
            question_group: element.question_group,
          });
          this.answers.push({
            quiz_question_id: element.id,
            quiz_question_choice_id: 0,
            sort_order: index + 1,
          });
        });
        this.setState({
          quizQuestionSet: solutionData,
          quiz: {
            id: response.data.response.quizSolution.id,
            title: response.data.response.quizSolution.title,
            time_duration_in_seconds:
              response.data.response.quizSolution.time_duration_in_seconds,
            quiz_records_count:
              response.data.response.quizSolution.quiz_records_count,
            questions_count:
              response.data.response.quizSolution.questions_count,
          },
          unattempted: solutionData,
          activeLoader: false,
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  handleScreenCapture = (id) => {
    var node = document.getElementById("snap-area");
    node.style.background = "#fff";
    node.style.background = `#fff url(${logo}) no-repeat center center`;
    node.style.backgroundSize = "auto 65px";
    node.style.margin = "4px";
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

  render() {
    return (
      <div
        className="quiz-question-container"
        style={{
          width: "100%",
          padding: "0px",
          margin: "0px",
          background: "#f9f9fd",
        }}
      >
        <div className="main-layout">
          {this.state.activeLoader === false ? (
            <div>
              <Row
                gutter={[35, 0]}
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
                          <span className="title">{this.state.quiz.title}</span>
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
                          {this.state.viewQuizSolution === true && (
                            <ArrowLeftOutlined
                              className="back-icon"
                              onClick={() => this.props.navigate(-1)}
                            />
                          )}
                          {this.state.reattemptQuiz === true && (
                            <ArrowLeftOutlined
                              className="back-icon"
                              onClick={() => this.props.navigate(-1)}
                            />
                          )}
                          {this.state.reattemptQuiz !== true &&
                            this.state.viewQuizSolution !== true && (
                              <ArrowLeftOutlined
                                className="back-icon"
                                onClick={() =>
                                  this.leavePopup.showModal(
                                    this.state.quizRequestPayload,
                                    this.state.attempted,
                                    this.state.unattempted,
                                    this.state.previousTime
                                  )
                                }
                              />
                            )}
                        </Col>
                      </Row>
                    </Card>
                  </div>

                  <div
                    className="body-layout"
                    style={{
                      marginTop:
                        this.props.quiz_start || this.props.quiz_resume
                          ? "0px"
                          : "0px",
                    }}
                  >
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
                              this.state.quizQuestionSet[
                                this.state.selectedIndex
                              ].isBookmarked === 0 ? (
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
                                    src={quiz_bookmarked}
                                    alt="quiz_bookmark"
                                    className="bookmarked-icon"
                                  />
                                </span>
                              )}
                              {this.state.startQuiz === false &&
                                this.state.resumeQuiz === false && (
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
                                )}
                              <span className="container-header-menu-icon">
                                <MenuOutlined
                                  style={{ fontSize: "20px", color: "#0B649D" }}
                                  onClick={this.handleMenu}
                                />
                              </span>
                            </div>
                          </Col>
                        </Row>

                        <div>
                          <Row gutter={[40, 10]} id="snap-area">
                            {this.state.quizQuestionSet[
                              this.state.selectedIndex
                            ].question_group !== null && (
                              <Col
                                xs={24}
                                sm={24}
                                md={12}
                                lg={12}
                                xl={12}
                                xxl={12}
                                id={
                                  this.state.quizQuestionSet[
                                    this.state.selectedIndex
                                  ].isAttempted === true &&
                                  (this.state.viewQuizSolution === true ||
                                    this.state.reattemptQuiz === true)
                                    ? "attempted-fixed-content"
                                    : this.state.startQuiz === true ||
                                      this.state.resumeQuiz === true
                                    ? "startresume-fixed-content"
                                    : "unattempted-fixed-content"
                                }
                                // style={{height: '500px', overflow: 'hidden', overflowY: 'scroll'}}
                              >
                                <div className="group-question question-full-image">
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
                                </div>
                              </Col>
                            )}
                            <Col
                              xs={
                                this.state.quizQuestionSet[
                                  this.state.selectedIndex
                                ].question_group !== null
                                  ? 24
                                  : 24
                              }
                              sm={
                                this.state.quizQuestionSet[
                                  this.state.selectedIndex
                                ].question_group !== null
                                  ? 24
                                  : 24
                              }
                              md={
                                this.state.quizQuestionSet[
                                  this.state.selectedIndex
                                ].question_group !== null
                                  ? 12
                                  : 24
                              }
                              lg={
                                this.state.quizQuestionSet[
                                  this.state.selectedIndex
                                ].question_group !== null
                                  ? 12
                                  : 24
                              }
                              xl={
                                this.state.quizQuestionSet[
                                  this.state.selectedIndex
                                ].question_group !== null
                                  ? 12
                                  : 24
                              }
                              xxl={
                                this.state.quizQuestionSet[
                                  this.state.selectedIndex
                                ].question_group !== null
                                  ? 12
                                  : 24
                              }
                              id={
                                this.state.quizQuestionSet[
                                  this.state.selectedIndex
                                ].isAttempted === true &&
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
                                <div className="question question-full-image">
                                  <div
                                    className="question-name"
                                    dangerouslySetInnerHTML={{
                                      __html:
                                        this.state.quizQuestionSet.length !==
                                          0 &&
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
                                          <div className="quiz-question-choices-container">
                                            <div>
                                              <div
                                                className={
                                                  item.is_right_choice === 1
                                                    ? "quiz-questions-main2-card2-choice-isright"
                                                    : item.is_right_choice ===
                                                        0 &&
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
                                                  ? "quiz-question-choices-value-choosen question-full-image"
                                                  : "quiz-question-choices-value-not-choosen question-full-image"
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
                                                    item.is_right_choice ===
                                                      0 &&
                                                    item.selected_choice === 1
                                                  ? "quiz-questions-main2-card2-choice-iswrong"
                                                  : item.selected_choice ===
                                                      1 &&
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
                                          <div className="quiz-question-choices-value question-full-image">
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
                                                ? "quiz-question-choices-value-choosen question-full-image"
                                                : "quiz-question-choices-value-not-choosen question-full-image"
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
                                          this.handleResumeChoice(
                                            e,
                                            item.id,
                                            index
                                          )
                                        }
                                      >
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
                                          <div className="quiz-question-choices-value question-full-image">
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
                              this.state.quizQuestionSet[
                                this.state.selectedIndex
                              ].isAttempted === true && (
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
                                        <Text className="solution-text">
                                          Solution:{" "}
                                        </Text>
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
                                            alt="quiz_solution"
                                            src={quiz_solution}
                                          />
                                        </span>
                                      </Col>
                                    </Row>

                                    <div className="solution-body question-full-image">
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
                                            this.state.quizQuestionSet
                                              .length !== 0 &&
                                            this.state.quizQuestionSet[
                                              this.state.selectedIndex
                                            ].solution,
                                        }}
                                      ></div>
                                    </div>

                                    {(this.state.viewQuizSolution === true ||
                                      this.state.reattemptQuiz === true) &&
                                      this.state.quizQuestionSet.length > 0 &&
                                      this.state.quizQuestionSet[
                                        this.state.selectedIndex
                                      ].isAttempted === true && (
                                        <div className="footer-layout">
                                          <Divider />
                                          <div className="footer-inner-layout">
                                            <Row
                                              align="middle"
                                              className="footer-row"
                                            >
                                              <Col
                                                xs={12}
                                                sm={8}
                                                md={8}
                                                lg={12}
                                                xl={8}
                                                xxl={8}
                                                className="difficult-column"
                                              >
                                                <span className="image-span">
                                                  {this.state.quizQuestionSet[
                                                    this.state.selectedIndex
                                                  ].difficult_level.name ===
                                                    "Easy" && (
                                                    <img
                                                      className="image"
                                                      alt="quiz_level_easy"
                                                      src={quiz_level_easy}
                                                    />
                                                  )}
                                                  {this.state.quizQuestionSet[
                                                    this.state.selectedIndex
                                                  ].difficult_level.name ===
                                                    "Medium" && (
                                                    <img
                                                      className="image"
                                                      alt="quiz_level_medium"
                                                      src={quiz_level_medium}
                                                    />
                                                  )}
                                                  {this.state.quizQuestionSet[
                                                    this.state.selectedIndex
                                                  ].difficult_level.name ===
                                                    "Hard" && (
                                                    <img
                                                      className="image"
                                                      alt="quiz_level_hard"
                                                      src={quiz_level_hard}
                                                    />
                                                  )}
                                                </span>
                                                <span className="text-span">
                                                  Difficulty Level -{" "}
                                                  <span
                                                    className={
                                                      this.state
                                                        .quizQuestionSet[
                                                        this.state.selectedIndex
                                                      ].difficult_level.name ===
                                                      "Easy"
                                                        ? "easy-text"
                                                        : this.state
                                                            .quizQuestionSet[
                                                            this.state
                                                              .selectedIndex
                                                          ].difficult_level
                                                            .name === "Hard"
                                                        ? "hard-text"
                                                        : "medium-text"
                                                    }
                                                  >
                                                    {" "}
                                                    {
                                                      this.state
                                                        .quizQuestionSet[
                                                        this.state.selectedIndex
                                                      ].difficult_level.name
                                                    }{" "}
                                                  </span>
                                                </span>
                                              </Col>
                                              <Col
                                                xs={12}
                                                sm={8}
                                                md={8}
                                                lg={12}
                                                xl={12}
                                                xxl={12}
                                                className="attempt-column"
                                              >
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
                                                          this.state
                                                            .quizQuestionSet[
                                                            this.state
                                                              .selectedIndex
                                                          ].topics_name
                                                        }
                                                      </span>
                                                    </span>
                                                  </div>
                                                </div>
                                              </Col>
                                            </Row>
                                          </div>
                                        </div>
                                      )}
                                  </Card>
                                </div>
                              )}
                          </div>
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
                            // textDecoration: "underline",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {this.state.viewQuizSolution ? "Next" : "Save & Next"}
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
                    style={{ paddingRight: "0px" }}
                  >
                    <Card className="card" id="question-status-card">
                      <div className="card-user-block">
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
                              style={{
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
                              {this.props.profile_update.first_name !==
                                undefined &&
                                this.props.profile_update.first_name
                                  .charAt(0)
                                  .toUpperCase()}
                            </Avatar>
                          )}
                        </div>
                        <div
                          style={{
                            flex: 2,
                            padding: "0px 20px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <div style={{ color: "#0B649D", fontWeight: 600 }}>
                            {this.props.profile_update.user_name === null
                              ? StorageConfiguration.sessionGetItem("user_name")
                              : this.props.profile_update.user_name}
                          </div>
                          <div style={{ color: "#90A0B7", fontSize: "12px" }}>
                            {StorageConfiguration.sessionGetItem("email_id")}
                          </div>
                        </div>
                        <div style={{ float: "right", marginRight: "10px" }}>
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
                      {(this.state.resumeQuiz === true ||
                        this.state.startQuiz === true) && (
                        <Row className="quiz-row-sub-header">
                          <Col
                            xs={4}
                            sm={4}
                            md={4}
                            lg={4}
                            xl={4}
                            xxl={4}
                            className="left-column"
                          >
                            <img
                              className="pause-icon"
                              alt="pause_icon"
                              src={pause_icon}
                              onClick={() =>
                                this.leavePopup.showModal(
                                  this.state.quizRequestPayload,
                                  this.state.attempted,
                                  this.state.unattempted,
                                  this.state.previousTime
                                )
                              }
                            />
                          </Col>
                          <Col
                            xs={16}
                            sm={16}
                            md={16}
                            lg={16}
                            xl={16}
                            xxl={16}
                            className="center-column"
                          >
                            {this.state.remainingTime.hours !== 0 ||
                            this.state.remainingTime.minutes !== 0 ||
                            this.state.remainingTime.seconds !== 0 ? (
                              <span
                                className="quiz-timer"
                                style={{
                                  color: "#0B649D",
                                }}
                              >
                                <span className="text">
                                  {this.state.remainingTime.hours !== 0 &&
                                    this.state.remainingTime.hours +
                                      " " +
                                      " hrs " +
                                      " : "}
                                  {this.state.remainingTime.minutes +
                                    " " +
                                    " mins " +
                                    " : " +
                                    this.state.remainingTime.seconds +
                                    " secs"}
                                </span>
                              </span>
                            ) : (
                              <span className="timer">
                                <Spin />
                              </span>
                            )}
                          </Col>
                          <Col
                            xs={4}
                            sm={4}
                            md={4}
                            lg={4}
                            xl={4}
                            xxl={4}
                            className="quiz-status-right-column"
                          >
                            <img
                              src={quiz_info}
                              alt="quiz_info"
                              onClick={() =>
                                this.instructionPopup.showModal(this.state.quiz)
                              }
                              style={{ width: "25px", cursor: "pointer" }}
                              className="icon"
                            />
                          </Col>
                        </Row>
                      )}
                      {this.state.resumeQuiz === false &&
                        this.state.startQuiz === false && (
                          <div>
                            <Divider style={{ margin: 0 }} />
                            <Row style={{ padding: "20px 15px" }}>
                              <Col
                                xs={12}
                                sm={12}
                                md={10}
                                lg={8}
                                xl={8}
                                xxl={8}
                                className="analysis-block"
                              >
                                Reattempt
                                <span style={{ margin: "0px 20px" }}>
                                  <Switch
                                    size="small"
                                    defaultChecked={this.state.reattemptQuiz}
                                    onChange={(e) => {
                                      if (e === true) {
                                        this.props.dispatch(
                                          quizSolution(false)
                                        );
                                        this.props.dispatch(quizStart(false));
                                        this.props.dispatch(quizResume(false));
                                        this.props.dispatch(
                                          quizStartTimer(false)
                                        );
                                        this.props.dispatch(
                                          quizReattempt(true)
                                        );
                                        // this.state.quizQuestionSet.forEach(ele => {
                                        //   ele.isAttempted = false
                                        // })
                                        this.setState(
                                          {
                                            activeLoader: true,
                                            viewQuizSolution: false,
                                            startQuiz: false,
                                            resumeQuiz: false,
                                            reattemptQuiz: true,
                                            // quizQuestionSet: []
                                            // this.state.quizQuestionSet.length > 0 &&
                                            // this.state.quizQuestionSet[
                                            //   this.state.selectedIndex
                                            // ].isAttempted === true && (
                                          },
                                          () => window.location.reload()
                                        );
                                      } else {
                                        this.props.dispatch(quizSolution(true));
                                        this.props.dispatch(quizStart(false));
                                        this.props.dispatch(quizResume(false));
                                        this.props.dispatch(
                                          quizStartTimer(false)
                                        );
                                        this.props.dispatch(
                                          quizReattempt(false, "")
                                        );
                                        this.setState(
                                          {
                                            activeLoader: true,
                                            viewQuizSolution: true,
                                            startQuiz: false,
                                            resumeQuiz: false,
                                            reattemptQuiz: false,
                                          },
                                          () => window.location.reload()
                                        );
                                      }
                                    }}
                                  />
                                </span>
                              </Col>
                              <Col
                                xs={12}
                                sm={12}
                                md={10}
                                lg={8}
                                xl={8}
                                xxl={8}
                                className="analysis-block"
                              >
                                Analysis
                                <span style={{ margin: "0px 20px" }}>
                                  <img
                                    className="image-analysis"
                                    onClick={() => {
                                      this.props.navigate(
                                        `/course-details/${this.props.current_course.id}/quiz/${this.state.quiz.id}/result`
                                      );
                                    }}
                                    alt="analysis"
                                    src={analysis}
                                  />
                                </span>
                              </Col>
                            </Row>
                          </div>
                        )}
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

                        <div className="quiz-footer">
                          <Row className="quiz-type2-row">
                            <Col
                              xs={12}
                              sm={12}
                              md={12}
                              lg={8}
                              xl={8}
                              xxl={8}
                              className="column"
                            >
                              <div className="content">
                                <div
                                  style={{
                                    border: "1px solid #2ED47A",
                                    borderRadius: "7px",
                                    width: "40px",
                                    height: "35px",
                                    margin: "auto",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    color: "#2ED47A",
                                    fontWeight: 900,
                                  }}
                                >
                                  {this.state.viewQuizSolution === true ||
                                  this.state.reattemptQuiz === true
                                    ? this.state.correct
                                    : this.state.attempted.length}
                                </div>
                                <div
                                  className="text"
                                  style={{
                                    padding: "10px",
                                    textAlign: "center",
                                  }}
                                >
                                  Answered
                                </div>
                              </div>
                            </Col>
                            {(this.state.viewQuizSolution === true ||
                              this.state.reattemptQuiz === true) && (
                              <Col
                                xs={12}
                                sm={12}
                                md={12}
                                lg={8}
                                xl={8}
                                xxl={8}
                                className="column"
                              >
                                <div className="content">
                                  <div
                                    style={{
                                      border:
                                        "1px solid rgba(238, 45, 59, 0.5)",
                                      borderRadius: "7px",
                                      width: "40px",
                                      height: "35px",
                                      margin: "auto",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      color: "rgba(238, 45, 59, 0.5)",
                                      fontWeight: 900,
                                    }}
                                  >
                                    {this.state.wrong}
                                  </div>
                                  <div
                                    className="text"
                                    style={{
                                      padding: "10px",
                                      textAlign: "center",
                                    }}
                                  >
                                    Wrong
                                  </div>
                                </div>
                              </Col>
                            )}
                            <Col
                              xs={24}
                              sm={24}
                              md={12}
                              lg={8}
                              xl={8}
                              xxl={8}
                              className="column"
                            >
                              <div className="content">
                                <div
                                  style={{
                                    border: "1px solid rgba(90, 114, 200, 0.2)",
                                    borderRadius: "7px",
                                    width: "40px",
                                    height: "35px",
                                    margin: "auto",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    color: "#000",
                                    fontWeight: 900,
                                  }}
                                >
                                  {this.state.unattempted.length}
                                </div>
                                <div
                                  className="text"
                                  style={{
                                    padding: "10px",
                                    textAlign: "center",
                                  }}
                                >
                                  Unanswered
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </div>

                        <Divider style={{ margin: "0px" }} />

                        <div
                          className="content"
                          id={
                            this.state.viewQuizSolution === true ||
                            this.state.reattemptQuiz === true
                              ? "attempted-fixed-status"
                              : "fixed-content"
                          }
                          style={{ margin: "30px" }}
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
                                className="column"
                                key={index}
                              >
                                {this.state.startQuiz === true && (
                                  <span
                                    onClick={() =>
                                      this.setState({ selectedIndex: index })
                                    }
                                    className={
                                      item.isAttempted === true
                                        ? "answered"
                                        : "not-answered"
                                    }
                                  >
                                    {this.state.selectedIndex === index && (
                                      <span className="status-icon">
                                        &bull;
                                      </span>
                                    )}
                                    <span className="value">{index + 1}</span>
                                  </span>
                                )}
                                {this.state.resumeQuiz === true && (
                                  <span
                                    onClick={() =>
                                      this.setState({ selectedIndex: index })
                                    }
                                    className={
                                      item.isAttempted === true
                                        ? "answered"
                                        : "not-answered"
                                    }
                                  >
                                    {this.state.selectedIndex === index && (
                                      <span className="status-icon">
                                        &bull;
                                      </span>
                                    )}
                                    <span className="value">{index + 1}</span>
                                  </span>
                                )}
                                {this.state.viewQuizSolution === true && (
                                  <span
                                    onClick={() =>
                                      this.setState({ selectedIndex: index })
                                    }
                                    className={
                                      item.is_skipped === 1
                                        ? "not-answered"
                                        : item.userPicked !== undefined
                                        ? "correct"
                                        : "wrong-answer"
                                    }
                                  >
                                    {this.state.selectedIndex === index && (
                                      <span className="status-icon">
                                        &bull;
                                      </span>
                                    )}
                                    <span className="value">{index + 1}</span>
                                  </span>
                                )}
                                {this.state.reattemptQuiz === true && (
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
                                )}
                              </Col>
                            ))}
                          </Row>
                        </div>

                        {(this.state.resumeQuiz === true ||
                          this.state.startQuiz === true) && (
                          <div className="question-submit">
                            <Button
                              className="button"
                              block
                              size="large"
                              onClick={() =>
                                this.submitPopup.showModal(
                                  this.state.quizRequestPayload,
                                  this.state.attempted,
                                  this.state.unattempted,
                                  this.state.previousTime
                                )
                              }
                            >
                              {" "}
                              Submit <RightOutlined className="icon" />{" "}
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  </Col>
                )}
              </Row>
            </div>
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
          {...this.props}
        />

        <QuizLeavePopup
          ref={(instance) => {
            this.leavePopup = instance;
          }}
          {...this.props}
        />

        <QuizInstructionPopup
          {...this.props}
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

        <QuizQuestionsReportPopup
          {...this.props}
          ref={(instance) => {
            this.quizQuestionsReportPopup = instance;
          }}
        />
        <CreateDoubts
          {...this.props}
          ref={(instance) => {
            this.CreateDoubts = instance;
          }}
        />

        <QuizSharePopup
          {...this.props}
          ref={(instance) => {
            this.quizSharePopup = instance;
          }}
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
    quiz_resume: state.quiz_resume,
    quiz_start: state.quiz_start,
    quiz_start_timer: state.quiz_start_timer,
    current_course: state.current_course,
    profile_image: state.profile_image,
    profile_update: state.profile_update,
    envupdate: state.envupdate,
    envendpoint: state.envendpoint,
  };
})(QuizQuestions);
