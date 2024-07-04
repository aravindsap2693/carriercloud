import React, { Component } from "react";
import { Card, Row, Switch, Col, Spin, Rate } from "antd";
import { ExpandOutlined, CompressOutlined } from "@ant-design/icons";
import QuizSharePopup from "../../../components/QuizSharePopup";
import Env from "../../../utilities/services/Env";
import { connect } from "react-redux";
import {
  currentPageRouting,
  mocktestStatusUpdate,
  mocktestReattempt,
} from "../../../reducers/action";
import StorageConfiguration from "../../../utilities/services/StorageConfiguration";
import { analytics } from "../../../firebase-config";
import { logEvent } from "firebase/analytics";
import logo from "../../../assets/images/full-logo.svg";
import MocktestInstruction from "../../../components/Mocktest/MocktestInstruction";
import MocktestQuestions from "./MocktestQuestions";
import MockInfo from "../../../assets/js-icons/MockInfo";
import { CommonService } from "../../../utilities/services/Common";
import _ from "lodash";
import "../../../assets/css/mocktest-analysis.css";
import * as workerTimers from "worker-timers";
import MocktestResult from "./MocktestResult";
import { Tooltip } from "antd";
import { Navigate } from "react-router-dom";

class MocktestView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeLoader: true,
      mocktest: {},
      language: {},
      languageList: [],
      Instruction: [],
      overall_time: null,
      overallTimeOut: false,
      showfullscreen: true,
      mocktest_section: [],
      is_section_timer: null,
      MocktestTimerStart: false,
      MocktestStart: props.mocktest_status.start,
      MocktestSolution: props.mocktest_status.solution,
      MocktestReattempt: props.mocktest_reattempt.state,
      MocktestResume: props.mocktest_status.resume,
      returnMocktest_section: [],
      reattemptSwitch: props.mocktest_reattempt.state,
      timerStatus: "start",
      showInstructions: false,
      courseRating: null,
    };
    this.userId = StorageConfiguration.sessionGetItem("user_id");
  }

  componentDidMount() {
  //  window.addEventListener("keydown", this.handlekeydown);
   this.temp = this.props.match.pathname.split("/");
   window.scrollTo(0, 0);
  //  window.addEventListener("contextmenu", this.preventContextMenu);
    logEvent(analytics, "select_content", "mocktest");
  
      this.props.dispatch(currentPageRouting(null));
     // this.getMocktest(this.props.match.params.mock_id);
      const data = this.getMocktest(this.props.match.params.mock_id);
     

      if (this.temp[this.temp.length - 1] === "result") {
        this.getMocktestRating(this.props.match.params.mock_id);
      }
  }

  componentWillUnmount() {
    window.removeEventListener("contextmenu", this.preventContextMenu);
    window.removeEventListener("keydown", this.handlekeydown);
  }

  componentWillReceiveProps(newprops) {
    this.temp = newprops.match.pathname.split("/");
    if (this.props.mocktest_status.start !== newprops.mocktest_status.start) {
      this.setState({
        MocktestStart: newprops.mocktest_status.start,
      });
    }
    if (
      this.props.mocktest_status.solution !== newprops.mocktest_status.solution
    ) {
      this.setState({
        MocktestTimerStart: false,
        MocktestSolution: newprops.mocktest_status.solution,
      });
    }
    if (this.props.mocktest_status.resume !== newprops.mocktest_status.resume) {
      this.setState({
        MocktestResume: newprops.mocktest_status.resume,
      });
    }
    if (
      this.props.mocktest_reattempt.state !== newprops.mocktest_reattempt.state
    ) {
      this.setState({
        MocktestReattempt: newprops.mocktest_reattempt.state,
        reattemptSwitch: newprops.mocktest_reattempt.state,
      });
    }
  }

  handlekeydown = (e) => {
    const forbiddenKeys = [123, 27, 116, 93, 122];
    if (
      forbiddenKeys.includes(e.keyCode) ||
      (e.ctrlKey && e.shiftKey && e.keyCode === 73)
    ) {
      e.preventDefault();
      return false;
    }
  };

  preventContextMenu = (e) => {
    e.preventDefault();
  };

  getMocktest = (mock_id) => {
    const getMocktest = Env.get(
      this.props.envendpoint + `mocktests/${mock_id}`
    );
    getMocktest.then(
      (response) => {
        const data = response.data.response;
        let mocktest_section = data.mocktest.mocktest_section.filter(
          (item) => item.section_question_count > 0
        );
        let temp = [];
        mocktest_section.forEach((item) => {
          let tem = _.pick(item, [
            "id",
            "section_name",
            "section_time",
            "sort_order",
          ]);
          tem["section_time"] = tem["section_time"] * 60;
          tem["mock_test_section_status"] = "pause";
          temp.push(tem);
        });
        temp.sort(function (a, b) {
          return a.sort_order - b.sort_order;
        });
        if (this.temp[this.temp.length - 1] !== "result" &&  data.mocktest.is_attempted !== 1 ) {
          if (document.referrer === "") {
            window.location.href = `/course-details/${this.props.match.params.id}?shared=/course-details/${this.props.match.params.id}/mocktest/${this.props.match.params.mock_id}`;
          }
        }
        if (this.temp[this.temp.length - 1] !== "result") {
          if (this.state.MocktestReattempt) {
            this.props.dispatch(
              mocktestReattempt(true, this.props.match.params.mock_id)
            );
            this.toggleFullScreen(false);
            this.props.dispatch(mocktestStatusUpdate(false, ""));
          } else {
            data.mocktest.is_attempted === 2 && this.toggleFullScreen();
            this.props.dispatch(
              mocktestStatusUpdate(
                true,
                data.mocktest.is_attempted === 0
                  ? "start"
                  : data.mocktest.is_attempted === 2
                  ? "resume"
                  : "solution"
              )
            );
            this.props.dispatch(mocktestReattempt(false, ""));
          }
        }
        let overall_time =
          data.mocktest.is_section_timer === 1
            ? data.mocktest.section_time_overall * 60
            : data.mocktest.overall_time * 60;

        this.setState({
          mocktest: data.mocktest,
          showInstructions: data.mocktest.is_attempted === 0,
          mocktest_section: temp,
          activeLoader: false,
          overall_time: overall_time,
          is_section_timer: data.mocktest.is_section_timer,
          timerStatus: data.mocktest.is_attempted === 2 ? "resume" : "start",
          MocktestStart: data.mocktest.is_attempted === 0,
          MocktestSolution: this.props.mocktest_reattempt.state
            ? false
            : data.mocktest.is_attempted === 1,
          MocktestResume: data.mocktest.is_attempted === 2,
          languageList: data.languages,
          Instruction: data.mock_test_instructions,
        });
      },
      (error) => {
        CommonService.hendleError(error, this.props);
      }
    );
  };

  getMockOverallTime = (Sections = this.state.mocktest_section) => {
    const { is_section_timer, overall_time } = this.state;
    const time =
      is_section_timer === 1
        ? Sections.reduce(
            (totalTime, section) => totalTime + section.section_time,
            0
          )
        : overall_time;
    return time;
  };

  getMockResumeOverallTime = (item = this.state.mocktest_section) => {
    let time = 0;
    let timeTaken = 0;
    if (item) {
      item.forEach((section) => {
        timeTaken += section.time_take_in_section_time || 0;
      });
      if (this.state.is_section_timer === 1) {
        item.forEach((section) => {
          if (section.time_take_in_section_time !== undefined) {
            const matchingSection = this.state.mocktest_section.find(
              (element) =>
                section.section_id === element.id &&
                section.mock_test_section_status ===
                  element.mock_test_section_status
            );
            if (matchingSection) {
              time +=
                matchingSection.section_time -
                (section.time_take_in_section_time || 0);
            }
          } else {
            time +=
              this.state.timerStatus === "resume"
                ? section.section_time * 60
                : section.section_time;
          }
        });
      } else {
        time = this.state.overall_time - timeTaken;
        this.setState({ overall_time: time });
      }
    }
    return time;
  };

  getMockResumefOverallTime = (item = this.state.mocktest_section) => {
    let time = 0;
    let timeTaken = 0;
    if (item) {
      item.forEach((section) => {
        timeTaken += section.time_take_in_section_time || 0;
      });
      if (this.state.is_section_timer === 1) {
        item.forEach((section) => {
          if (section.mock_test_section_status !== "completed") {
            if (section.time_take_in_section_time !== undefined) {
              const matchingSection = this.state.mocktest_section.find(
                (element) =>
                  section.section_id === element.id &&
                  section.mock_test_section_status ===
                    element.mock_test_section_status
              );
              if (matchingSection) {
                time +=
                  matchingSection.section_time -
                  (section.time_take_in_section_time || 0);
              }
            } else {
              time += section.section_time;
            }
          }
        });
      } else {
        time = this.state.overall_time - timeTaken;
        this.setState({ overall_time: time });
      }
    }
    return time;
  };

  toggleFullScreen = (status) => {
    this.setState({ showfullscreen: status });
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
  };

  handleStart = (attempt, language, languageList) => {
    this.toggleFullScreen(false);
    let attemptdata = this.state.mocktest;
    attemptdata["is_attempted"] = attempt;
    this.props.dispatch(mocktestStatusUpdate(true, "start"));
    this.props.dispatch(mocktestReattempt(false, ""));
    this.setState({
      mocktest: attemptdata,
      language: language,
      languageList: languageList,
      MocktestStart: true,
      showInstructions: false,
    });
  };

  handleTimer = async () => {
    var twentyMinutesLater = new Date();
    var time_given_sec;
    if (this.state.timerStatus === "start") {
      time_given_sec = this.getMockOverallTime(this.state.mocktest_section);
    } else if (this.state.timerStatus === "pause") {
      time_given_sec = this.getMockOverallTime(
        this.state.returnMocktest_section
      );
    }
    twentyMinutesLater.setSeconds(
      twentyMinutesLater.getSeconds() + time_given_sec
    );
    let overall_time = time_given_sec;
    this.setState({
      overall_time: overall_time,
      MocktestTimerStart: true,
    });
    if (overall_time > 0) {
      return new Promise((resolve) => {
        this.overallInterval = workerTimers.setInterval(() => {
          overall_time -= 1;
          this.setState({
            overall_time: overall_time,
          });
          if (overall_time <= 0) {
            this.setState({ overallTimeOut: true, showInstructions: false });

            if (
              this.overallInterval !== undefined &&
              this.overallInterval > 0
            ) {
              workerTimers.clearInterval(this.overallInterval);
            }
            this.overallInterval = 0;
          }
        }, 1000);
        resolve();
      });
    } else {
      this.setState({ overallTimeOut: true, showInstructions: false });
    }
  };

  handleResumeTimer = async (mocksection) => {
    var time_given_sec;
    if (this.state.timerStatus === "resume") {
      time_given_sec = this.getMockResumefOverallTime(mocksection);
    } else {
      time_given_sec = this.getMockResumefOverallTime(
        this.state.returnMocktest_section
      );
    }
    var twentyMinutesLater = new Date();
    twentyMinutesLater.setSeconds(
      twentyMinutesLater.getSeconds() + time_given_sec
    );
    let overall_time = time_given_sec;

    this.setState({
      overall_time: overall_time,
      MocktestTimerStart: true,
    });
    if (overall_time > 0) {
      return new Promise((resolve) => {
        this.overallInterval = workerTimers.setInterval(() => {
          overall_time -= 1;
          this.setState({
            overall_time: overall_time,
          });
          if (overall_time <= 0) {
            this.setState({ overallTimeOut: true, showInstructions: false });

            if (
              this.overallInterval !== undefined &&
              this.overallInterval > 0
            ) {
              workerTimers.clearInterval(this.overallInterval);
            }
            this.overallInterval = 0;
          }
        }, 1000);
        //resolve();
      });
    } else {
      this.setState({ overallTimeOut: true, showInstructions: false });
    }
  };

  handleClearInterval = (mocktest_section) => {
    let time_given_sec;
    if (this.state.timerStatus === "start") {
      time_given_sec = this.getMockOverallTime(mocktest_section);
    } else {
      time_given_sec = this.getMockResumefOverallTime(mocktest_section);
    }
    mocktest_section &&
      this.setState({
        overall_time: time_given_sec,
      });
    this.setState({
      timerStatus: "pause",
      returnMocktest_section: mocktest_section,
    });
    this.overallInterval > 0 &&
      this.overallInterval !== undefined &&
      workerTimers.clearInterval(this.overallInterval);
    this.overallInterval = 0;
  };

  handleReattempt = (e) => {
    if (e === true) {
      this.props.dispatch(mocktestStatusUpdate(false, ""));
      this.props.dispatch(
        mocktestReattempt(true, this.props.match.params.mock_id)
      );
      this.setState(
        {
          activeLoader: true,
          MocktestSolution: false,
          MocktestStart: false,
          MocktestResume: false,
          reattemptSwitch: true,
        },
        () => window.location.reload()
      );
    } else {
      this.props.dispatch(mocktestStatusUpdate(true, "solution"));
      this.props.dispatch(mocktestReattempt(false, ""));
      this.setState(
        {
          activeLoader: true,
          MocktestSolution: true,
          MocktestStart: false,
          MocktestResume: false,
          reattemptSwitch: false,
        },
        () => window.location.reload()
      );
    }
  };

  handleMockInfo = () => {
    this.setState((prevState) => ({
      showInstructions: !prevState.showInstructions,
    }));
  };

  async getMocktestRating(mock_id) {
    await Env.get(this.props.envendpoint + `mocktest/mockratingget/${mock_id}`)
      .then((getMocktestData) => {
        this.setState({ courseRating: getMocktestData.data.response.rating });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  handleRatingChange = (mock_data) => {
    const payload = {
      mock_test_id: this.props.match.params.mock_id,
      mock_testrating: mock_data,
    };
    Env.post(this.props.envendpoint + `mocktest/mocktestratingadd`, payload)
      .then((response) => {
        this.setState({ courseRating: mock_data });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  render() {
    const { mocktest } = this.state;
    return (
      <div
        className={
          this.temp && this.temp.includes("result")
            ? "mock-question-result-container"
            : "mock-question-container"
        }
        style={{
          width: "100%",
          padding: "0px",
          margin: "0px",
          background: "rgb(249, 249, 253)",
        }}
      >
        <div className="main-layout">
          {!this.state.activeLoader ? (
            <div
              className="question-column"
              style={{
                paddingLeft: "0px",
              }}
            >
              <Card className="card main-head">
                <Row
                  align="middle"
                  className="view-row-header"
                  style={{ boxShadow: " 0 2px 4px 0 #D7DEF8", height: "60px" }}
                >
                  <Col
                    xs={12}
                    sm={4}
                    md={5}
                    lg={5}
                    xl={
                      this.state.MocktestResume || this.state.MocktestStart
                        ? this.state.overall_time
                          ? 5
                          : 4
                        : 4
                    }
                    xxl={4}
                    className="mock-logo-column"
                  >
                    <span className="span" style={{ cursor: "pointer" }}>
                      <img src={logo} className="image" alt="logo" />
                    </span>
                  </Col>
                  <Col
                    xs={12}
                    sm={8}
                    md={
                      this.state.MocktestResume || this.state.MocktestStart
                        ? this.state.showInstructions
                          ? 9
                          : this.state.MocktestReattempt ||
                            this.state.MocktestSolution
                          ? 10
                          : 9
                        : this.temp[this.temp.length - 1] !== "result"
                        ? 9
                        : 7
                    }
                    lg={
                      this.state.MocktestResume || this.state.MocktestStart
                        ? this.state.showInstructions
                          ? this.state.overall_time !== null &&
                            this.state.overall_time !== 0
                            ? 10
                            : 11
                          : this.state.MocktestReattempt ||
                            this.state.MocktestSolution
                          ? 9
                          : 10
                        : this.temp[this.temp.length - 1] !== "result"
                        ? 11
                        : 9
                    }
                    xl={
                      this.state.MocktestResume || this.state.MocktestStart
                        ? this.state.showInstructions
                          ? this.state.overall_time !== null
                            ? 11
                            : 12
                          : this.state.MocktestReattempt ||
                            this.state.MocktestSolution
                          ? 11
                          : 11
                        : this.temp[this.temp.length - 1] !== "result"
                        ? 13
                        : 11
                    }
                    xxl={
                      this.state.MocktestResume || this.state.MocktestStart
                        ? this.state.showInstructions
                          ? this.state.overall_time !== null
                            ? 12
                            : 13
                          : this.state.MocktestReattempt ||
                            this.state.MocktestSolution
                          ? 14
                          : 12
                        : this.temp[this.temp.length - 1] !== "result"
                        ? 14
                        : 13
                    }
                    className="title-column"
                  >
                    <div
                      style={{ position: "relative" }}
                      className="mocktest-title-container"
                    >
                      <Tooltip title={mocktest.title} placement="bottomLeft">
                        <div className="mocktest-title ">{mocktest.title}</div>
                      </Tooltip>
                    </div>
                  </Col>
                  {/* {(this.state.MocktestResume || this.state.MocktestStart) &&
                    this.state.MocktestTimerStart && (
                      <Col
                        xs={0}
                        sm={5}
                        md={1}
                        lg={
                          this.state.MocktestTimerStart
                            ? this.state.is_section_timer === 1
                              ? this.state.showInstructions
                                ? 2
                                : 3
                              : 1
                            : 5
                        }
                        xl={
                          this.state.MocktestTimerStart
                            ? this.state.is_section_timer === 1
                              ? this.state.showInstructions
                                ? 5
                                : 5
                              : this.state.showInstructions
                              ? 1
                              : 1
                            : 5
                        }
                        xxl={
                          this.state.MocktestTimerStart
                            ? this.state.is_section_timer === 1
                              ? this.state.showInstructions
                                ? 5
                                : 5
                              : this.state.showInstructions
                              ? 2
                              : 2
                            : 5
                        }
                        style={{
                          display: "flex",
                          justifyContent:
                            this.state.is_section_timer === 1
                              ? "flex-end"
                              : "center",
                        }}
                        className="title-column"
                      >
                        <div
                          className="Iicon"
                          style={{
                            marginRight: "10px",
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                          onClick={this.handleMockInfo}
                        >
                          <MockInfo color={"#3C4852"} className="Iicon" />
                        </div>
                      </Col>
                    )} */}
                  {this.temp[this.temp.length - 1] === "result" ? (
                    <Col
                      xs={0}
                      sm={4}
                      md={12}
                      lg={10}
                      xl={9}
                      xxl={7}
                      className="title-column"
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "flex-end",
                          alignItems: "center",
                        }}
                      >
                        <div className="rate-text">
                          <div
                            style={{
                              fontSize: "20px",
                              fontWeight: "bold",
                              padding: "0px 10px",
                              color: "#3C4852",
                            }}
                          >
                            Rate the Test
                          </div>
                          <div className="mocktest-rate">
                            <Rate
                              allowHalf
                              value={Number(this.state.courseRating)}
                              className="icon"
                              onChange={this.handleRatingChange}
                            />
                          </div>
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
                  ) : this.state.MocktestResume || this.state.MocktestStart ? (
                    <Col
                      xs={21}
                      sm={this.state.showInstructions ? 5 : 4}
                      md={
                        this.state.is_section_timer === 1
                          ? this.state.showInstructions
                            ? 10
                            : 10
                          : 10
                      }
                      lg={
                        this.state.MocktestTimerStart
                          ? this.state.is_section_timer === 1
                            ? this.state.showInstructions
                              ? 9
                              : 9
                            : 9
                          : this.state.showInstructions
                          ? 9
                          : 9
                      }
                      xl={
                        this.state.MocktestTimerStart
                          ? this.state.is_section_timer === 1
                            ? this.state.showInstructions
                              ? 8
                              : 8
                            : this.state.showInstructions
                            ? 8
                            : 8
                          : this.state.showInstructions
                          ? 8
                          : 8
                      }
                      xxl={
                        this.state.MocktestTimerStart
                          ? this.state.is_section_timer === 1
                            ? this.state.showInstructions
                              ? 8
                              : 8
                            : 8
                          : this.state.showInstructions
                          ? 8
                          : 8
                      }
                      className="title-column"
                    >
                      <div
                        style={{ display: "flex", justifyContent: "flex-end" }}
                        className="overallTime"
                      >
                        <Col
                          xs={0}
                          sm={5}
                          md={1}
                          lg={
                            this.state.MocktestTimerStart
                              ? this.state.is_section_timer === 1
                                ? this.state.showInstructions
                                  ? 2
                                  : 3
                                : 1
                              : 5
                          }
                          xl={
                            this.state.MocktestTimerStart
                              ? this.state.is_section_timer === 1
                                ? this.state.showInstructions
                                  ? 5
                                  : 5
                                : this.state.showInstructions
                                ? 1
                                : 1
                              : 5
                          }
                          xxl={
                            this.state.MocktestTimerStart
                              ? this.state.is_section_timer === 1
                                ? this.state.showInstructions
                                  ? 5
                                  : 5
                                : this.state.showInstructions
                                ? 2
                                : 2
                              : 5
                          }
                          style={{
                            display: "flex",
                            justifyContent:
                              this.state.is_section_timer === 1
                                ? "flex-end"
                                : "flex-end",
                          }}
                          className="title-column"
                        >
                          <div
                            className="Iicon"
                            style={{
                              marginRight: "10px",
                              display: "flex",
                              alignItems: "center",
                              cursor: "pointer",
                            }}
                            onClick={this.handleMockInfo}
                          >
                            <MockInfo color={"#3C4852"} className="Iicon" />
                          </div>
                        </Col>

                        <div
                          style={{
                            color: "#2990CC",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "end",
                            alignItems: "center",
                          }}
                        >
                          {this.state.MocktestTimerStart &&
                            this.state.is_section_timer === 0 && (
                              <div className="center-column overall-timer">
                                <div style={{ marginRight: "6px" }}>
                                  <p className="screen-title">Overall Time :</p>
                                </div>
                                {this.state.overall_time !== null ? (
                                  <span
                                    className="mocktest-timer"
                                    style={{
                                      color: "#0B649D",
                                      width: "100px",
                                    }}
                                  >
                                    {CommonService.handleStartTimer(
                                      this.state.overall_time
                                    )}
                                  </span>
                                ) : (
                                  <span className="timer">
                                    <Spin />
                                  </span>
                                )}
                              </div>
                            )}
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
                      </div>
                    </Col>
                  ) : (
                    <Col
                      xs={0}
                      sm={4}
                      md={10}
                      lg={this.state.overall_time ? 8 : 8}
                      xl={this.state.overall_time ? 7 : 7}
                      xxl={6}
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
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "end",
                            alignItems: "center",
                            padding: "0px 40px 0px 30px",
                          }}
                        >
                          <p className="rescreen-title">Reattempt</p>
                          <span style={{ margin: "0px 20px" }}>
                            <Switch
                              size="small"
                              defaultChecked={this.state.reattemptSwitch}
                              onChange={(e) => this.handleReattempt(e)}
                            />
                          </span>
                        </div>
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
                  )}
                </Row>
              </Card>
              {this.temp[this.temp.length - 1] !== "result" ? (
                <>
                  {mocktest.is_attempted === 0 ? (
                    <div>
                      <MocktestInstruction
                        {...this.props}
                        mocktest={mocktest}
                        languageList={this.state.languageList}
                        Instruction={this.state.Instruction}
                        handleStart={this.handleStart}
                      />
                    </div>
                  ) : (
                    <div className="mocktest-question">
                      <MocktestQuestions
                        {...this.props}
                        language_id={this.state.language}
                        languageList={this.state.languageList}
                        mocktest={this.state.mocktest}
                        mocktest_section={this.state.mocktest_section}
                        overall_time={this.state.overall_time}
                        overallTimeOut={this.state.overallTimeOut}
                        handleTimer={this.handleTimer}
                        handleResumeTimer={this.handleResumeTimer}
                        handleClearInterval={this.handleClearInterval}
                        showInstructions={this.state.showInstructions}
                        handleMockInfo={this.handleMockInfo}
                        Instruction={this.state.Instruction}
                      />
                    </div>
                  )}
                </>
              ) : (
                <MocktestResult
                  {...this.props}
                  mocktest={this.state.mocktest}
                />
              )}
            </div>
          ) : (
            <Spin className="app-spinner" size="large" />
          )}
        </div>
        <QuizSharePopup
          ref={(instance) => {
            this.quizSharePopup = instance;
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
    mocktest_reattempt: state.mocktest_reattempt,
    mocktest_status: state.mocktest_status,
    current_course: state.current_course,
    envendpoint: state.envendpoint,
    profile_image: state.profile_image,
    profile_update: state.profile_update,
    envupdate: state.envupdate,
  };
})(MocktestView);
