import React, { Component } from "react";
import { Button, Tabs, Radio, Card, Spin, Flex } from "antd";
import "../../../assets/css/quiz-result.css";
import { connect } from "react-redux";
import {
  mocktestStatusUpdate,
  mocktestReattempt,
} from "../../../reducers/action";
import $ from "jquery";
import { analytics } from "../../../firebase-config";
import { logEvent } from "firebase/analytics";
import LineChart from "../../../components/Mocktest/ChartJS/LineChart";
import BarChart from "../../../components/Mocktest/ChartJS/BarChart";
import MocktestTable from "../../../components/Mocktest/Tables/Table";
import Env from "../../../utilities/services/Env";
import _ from "lodash";
import MocktestPerformance from "../../../components/Mocktest/MocktestPerformance";
import { CommonService } from "../../../utilities/services/Common";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

const overallColumns = [
  { title: "Section", dataIndex: "sectionName", key: "sectionName" },
  { title: "Questions", dataIndex: "question", key: "question" },
  { title: "Attempt", dataIndex: "attempted", key: "attempted" },
  { title: "Accurancy", dataIndex: "accurancy", key: "accurancy" },
  { title: "Time", dataIndex: "time", key: "time" },
  { title: "Score", dataIndex: "score", key: "score" },
];

const sectioncolumns = [
  {
    title: "",
    dataIndex: "status",
    key: "status",
    onCell: (_, index) => {
      if (index % 2 === 0) {
        return {
          rowSpan: 2,
        };
      } else {
        return {
          rowSpan: 0,
        };
      }
    },
  },
  {
    title: "Person",
    dataIndex: "person",
    key: "person",
  },
  { title: "Count", dataIndex: "count", key: "count" },
  { title: "Time", dataIndex: "time", key: "time" },
];

class MocktestResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
      activeTabIndex: 1,
      activesecTabIndex: 1,
      activesecTabIndexTwo: 1,
      activeLoader: true,
      sectionComparison: [],
      overallPerformance: [],
      sectionPerformance: [],
      overallScorePercentile: [],
      overall_section_analysis: [],
      score_distribution: [],
      sectionScoreDistribution: [],
      sectionStrengthWeekness: [],
      SectionScorePercentile: [],
      params: {
        params: {
          mock_test_id: props.match.params.mock_id,
        },
      },
    };
    this.panes = [];
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    // this.props.dispatch(mocktestStatusUpdate(true, "solution"));
    logEvent(analytics, "select_content", {
      page_title: "Mock test Result",
    });
    this.getOverviewPerformance(this.props.match.params.mock_id);
    this.getSectiontab(this.props.mocktest.mocktest_section);
  }

  componentDidUpdate() {
    $("#comments-icon").click("click", function () {
      $("html, body").animate({
        scrollTop: $("#comments-block").position().top,
      });
    });
  }

  getOverviewPerformance = () => {
    const getOverviewPerformance = Env.get(
      this.props.envendpoint + `mocktest/mocktestoverallperformanceandata`,
      this.state.params
    );
    getOverviewPerformance.then(
      (response) => {
        const data = response.data.response;
        this.setState({
          overallPerformance: data.overall_performance,
        });
        this.getScoreDistribution(this.props.match.params.mock_id);
        this.getSectionAnalysis(this.props.match.params.mock_id);
        this.getScorePercentile(this.props.match.params.mock_id);
      },
      (error) => {
        console.error(error);
      }
    );
  };

  getScorePercentile = (mock_test_id) => {
    const getScorePercentile = Env.get(
      this.props.envendpoint +
        `mocktest/mocktestscorevspercentileoverall/${mock_test_id}`
    );
    getScorePercentile.then(
      (response) => {
        const data = response.data.response;
        let labels = [0];
        labels.push(data.percentile);
        let values = [0];
        values.push(parseInt(data.score));
        this.setState({
          activeLoader: false,
          overallScorePercentile: {
            labels: labels,
            data: values,
          },
        });
      },
      (error) => {
        console.error(error);
      }
    );
  };

  getSectionAnalysis = () => {
    const getSectionAnalysis = Env.get(
      this.props.envendpoint + `mocktest/mocktestoverallsectionanalysis`,
      this.state.params
    );
    getSectionAnalysis.then(
      (response) => {
        const data = response.data.response;
        let section_analysis = [];
        data.overall_section_analysis.forEach((item, i) => {
          section_analysis.push({
            key: i,
            sectionName: item.section_name,
            question: item.section_question_count,
            attempted: item.total_attempt_count,
            skipped_count: item.skipped_count,
            accurancy: `${item.section_accuracy}%`,
            time: CommonService.handleTimeShow(item.time_take_in_section_time),
            score: item.section_mark,
          });
        });
        this.setState({
          overall_section_analysis: section_analysis,
          overallPerformance: {
            ...this.state.overallPerformance,
            ...data.overall_performance,
          },
        });
      },
      (error) => {
        console.error(error);
      }
    );
  };

  getScoreDistribution = (mock_test_id) => {
    const getScoreDistribution = Env.get(
      this.props.envendpoint +
        `mocktest/mocktestscoredistributionoverall/${mock_test_id}`
    );
    getScoreDistribution.then(
      (response) => {
        const data = response.data.response;
        const labels = Object.keys(data.score_distribution);
        const values = Object.values(data.score_distribution);
        this.setState({
          activeLoader: false,
          score_distribution: {
            labels: labels.reverse(),
            data: values.reverse(),
          },
        });
      },
      (error) => {
        console.error(error);
      }
    );
  };

  getAllSectionPerformance = async (sections) => {
    try {
      const requests = sections.map((endpoint) => {
        const requestOne = Env.get(
          `${this.props.envendpoint}mocktest/mocktestsectionbasedaverage?mock_test_id=${this.props.match.params.mock_id}&section_id=${endpoint.key}`
        );
        const requestTwo = Env.get(
          `${this.props.envendpoint}mocktest/mocktestsectioncomparison?mock_test_id=${this.props.match.params.mock_id}&section_id=${endpoint.key}`
        );
        return Promise.all([requestOne, requestTwo]);
      });
      const requestDataArray = await Promise.all(requests);
      requestDataArray.forEach((requestData) => {
        const data = requestData.map((elements) => elements.data.response);
        const result = {
          section_analysis: {
            ...data[0].section_analysis,
            ...data[1].section_analysis,
          },
          section_performance: data[0].section_performance,
        };
        this.getSectionPerformance(result);
      });
    } catch (error) {
      console.error("Error occurred while fetching data:", error);
    }
  };

  getAllSectionScoreDistribution = async (sections) => {
    try {
      const apiRequests = sections.map((endpoint) =>
        Env.get(
          this.props.envendpoint +
            `mocktest/mocktestscoredistributionsection/${this.props.match.params.mock_id}?mock_test_section_id=${endpoint.key}`
        )
      );
      const responses = await Promise.allSettled(apiRequests);
      const fetchedData = responses
        .filter((response) => response.status === "fulfilled")
        .map((elements) => elements.value.data.response);
      this.getSectionScoreDistribution(fetchedData);
    } catch (error) {
      console.error("Error occurred while fetching data:", error);
    }
  };

  getAllSectionStrengthWeekness = async (sections) => {
    try {
      const apiRequests = sections.map((endpoint) =>
        Env.get(
          this.props.envendpoint +
            `mocktest/mockteststrengthandweekness?mock_test_id=${this.props.match.params.mock_id}&mock_test_section_id=${endpoint.key}`
        )
      );
      const responses = await Promise.allSettled(apiRequests);
      const fetchedData = responses
        .filter((response) => response.status === "fulfilled")
        .map((elements) => elements.value.data.response);
      this.getSectionStrengthWeekness(fetchedData);
    } catch (error) {
      console.error("Error occurred while fetching data:", error);
    }
  };

  getAllScorePercentile = async (sections) => {
    try {
      const apiRequests = sections.map((endpoint) =>
        Env.get(
          this.props.envendpoint +
            `mocktest/mocktestscorevspercentilesection/${this.props.match.params.mock_id}?mock_test_section_id=${endpoint.key}`
        )
      );
      const responses = await Promise.allSettled(apiRequests);
      const fetchedData = responses
        .filter((response) => response.status === "fulfilled")
        .map((elements) => elements.value.data.response);
      this.getSectionScorePercentile(fetchedData);
    } catch (error) {
      console.error("Error occurred while fetching data:", error);
    }
  };

  getSectionScorePercentile = (response) => {
    response.forEach((item, index) => {
      let SectionScorePercentile = this.state.SectionScorePercentile;
      let labels = [0];
      labels.push(item.percentile);
      let values = [0];
      values.push(item.score);
      _.assign(SectionScorePercentile, {
        [`_${this.panes[index].key}`]: {
          labels: labels,
          data: values,
        },
      });
      this.setState({
        SectionScorePercentile: SectionScorePercentile,
      });
    });
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

  getSectiontab = (sections) => {
    if (sections && sections.length > 0) {
      let mocktest_section = sections.filter(
        (item) => item.section_question_count > 0
      );
      const sortedSections = mocktest_section.sort(
        (a, b) => a.sort_order - b.sort_order
      );
      const panes = sortedSections.map((item, index) => ({
        key: item.id,
        label: item.section_name,
      }));
      const defaultTabIndex = sortedSections[0].id;
      this.setState({
        activesecTabIndex: defaultTabIndex,
        activesecTabIndexTwo: defaultTabIndex,
      });
      this.panes = panes;
      // Assuming these functions return promises
      this.getAllSectionPerformance(this.panes);
      this.getAllSectionScoreDistribution(this.panes);
      this.getAllSectionStrengthWeekness(this.panes);
      this.getAllScorePercentile(this.panes);
    }
  };

  getSectionPerformance = (item) => {
    let section_analysis = [];
    let timeTemp = [];
    let temp = Object.keys(item.section_analysis);
    let fTemp = temp.filter((key) => {
      if (
        !key.includes("id") &&
        !key.includes("d_at") &&
        !key.includes("section") &&
        !key.includes("_status") &&
        !key.includes("_time")
      ) {
        return key;
      }
      if (key.includes("_time")) {
        timeTemp.push(key);
      }
    });
    fTemp.forEach((key, i) => {
      let status = key.includes("attempt")
        ? "Total Attempt"
        : key.includes("correct")
        ? "Correct Answer"
        : key.includes("wrong")
        ? "Wrong Answer"
        : key.includes("skipped")
        ? "Skipped Answer"
        : "Not Visited";
      let timeT =
        status === "Total Attempt" && i === 5
          ? item.section_analysis.time_take_in_section_time
          : status === "Correct Answer" && i === 6
          ? item.section_analysis.correct_total_time
          : status === "Wrong Answer" && i === 7
          ? item.section_analysis.wrong_total_time
          : status === "Skipped Answer" && i === 8
          ? item.section_analysis.skipped_total_time
          : status === "Skipped Answer" && i === 3
          ? item.section_analysis.average_skipped_total_time
          : status === "Wrong Answer" && i === 2
          ? item.section_analysis.average_wrong_total_time
          : status === "Correct Answer" && i === 1
          ? item.section_analysis.average_correct_total_time
          : status === "Total Attempt" && i === 0
          ? item.section_analysis.average_time_total_attempt
          : status === "Not Visited"
          ? "-"
          : 0;
      let add = key.includes("average") ? 1.1 : 1;
      section_analysis.push({
        key: i,
        short:
          [
            "Total Attempt",
            "Correct Answer",
            "Wrong Answer",
            "Skipped Answer",
            "Not Visited",
          ].indexOf(status) + add,
        status,
        person: key.includes("average") ? "Average" : "You",
        count: item.section_analysis[key],
        time:
          timeT !== "-" && timeT !== 0
            ? CommonService.handleTimeShow(timeT)
            : timeT,
      });
    });
    section_analysis.sort((a, b) => a.short - b.short);
    let sectionComparison = this.state.sectionComparison;
    let section_performance = item.section_performance;
    section_performance["marks_scored"] = item.section_analysis.section_mark;
    section_performance["mock_test_overall_time_taken"] =
      item.section_analysis.time_take_in_section_time;
    section_performance["accuracy"] = item.section_analysis.section_accuracy;
    _.assign(sectionComparison, {
      [`_${item.section_analysis.section_id}`]: {
        section_analysis,
        section_performance,
      },
    });
    this.setState({
      sectionComparison,
    });
  };

  getSectionScoreDistribution = (response) => {
    response.forEach((item, index) => {
      const labels = Object.keys(item.score_distribution);
      const values = Object.values(item.score_distribution);
      let sectionScoreDistribution = this.state.sectionScoreDistribution;
      _.assign(sectionScoreDistribution, {
        [`_${this.panes[index].key}`]: {
          labels: labels.reverse(),
          data: values.reverse(),
        },
      });
      this.setState({
        sectionScoreDistribution: sectionScoreDistribution,
      });
    });
  };

  getSectionStrengthWeekness = (response) => {
    response.forEach((item, index) => {
      let temp = [];
      let init = 0;
      item.strength_and_weekness.forEach((strength, i) => {
        ++init;
        strength.difficulty_levels.forEach((levels, key) => {
          init++;
          temp.push({
            key: init,
            rowSpans: key + strength.difficulty_levels.length,
            index: strength.difficulty_levels.length,
            topics: strength.topic_name,
            level: levels.difficulty_name,
            question: levels.questions,
            score: levels.score,
            time: CommonService.handleTimeShow(levels.time),
            accurancy: `${CommonService.convertIntoDecimalPrefix(
              levels.accuracy
            )}%`,
            strength: levels.strength,
          });
        });
      });
      let sectionStrengthWeekness = this.state.sectionStrengthWeekness;
      _.assign(sectionStrengthWeekness, {
        [`_${this.panes[index].key}`]: temp,
      });
      this.setState({
        sectionStrengthWeekness: sectionStrengthWeekness,
      });
    });
  };

  handleBackButtonClick = () => {
    // Exit full screen mode if active
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen || document.mozFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen || document.webkitIsFullScreen) {
      document.webkitCancelFullScreen();
    }

    // Navigate back to the appropriate page
    const destination = this.props.current_tab_index
      ? `/course-details/${this.props.match.params.id}`
      : "/my-notes";
    this.props.navigate(destination);
  };

  display = () => {
    return (
      <Card
        className="mocktest-analytics-card"
        bordered={true}
        style={{
          boxShadow: "6px 0px 18px rgba(90, 114, 200, 0.06)",
          padding: "20px",
          margin: "0px 0px 30px 0px",
        }}
      >
        <div
          style={{
            padding: "0px 50px",
          }}
        >
          {this.state.sectionComparison[`_${this.state.activesecTabIndex}`] && (
            <MocktestPerformance
              performance={
                this.state.sectionComparison[`_${this.state.activesecTabIndex}`]
                  .section_performance
              }
            />
          )}
          <div className="mocktest-section-analysis-table">
            {this.state.sectionComparison[
              `_${this.state.activesecTabIndex}`
            ] && (
              <MocktestTable
                columns={sectioncolumns}
                dataSource={
                  this.state.sectionComparison[
                    `_${this.state.activesecTabIndex}`
                  ].section_analysis
                }
              />
            )}
          </div>
        </div>
      </Card>
    );
  };

  dispalyTwo = () => {
    const sectionStrengthWeekness = this.state.sectionStrengthWeekness;
    const Strengthcolumns = [
      {
        title: "Topics",
        dataIndex: "topics",
        onCell: (_, index) => {
          if (_.rowSpans % _.index === 0) {
            return {
              rowSpan: _.index,
            };
          } else {
            return {
              rowSpan: 0,
            };
          }
        },
      },
      {
        title: "Level",
        dataIndex: "level",
      },
      {
        title: "Questions",
        dataIndex: "questions",
        render: (e, questions) => (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1px",
              gridAutoRows: "minmax(30px, auto)",
              justifyContent: "center",
              placeItems: "center",
            }}
          >
            {questions.question.map((tag) => {
              let color =
                tag.is_right_choice === 0
                  ? "red" // worng
                  : tag.is_right_choice === 1
                  ? "green" // right
                  : tag.is_right_choice === 2
                  ? "gray" // skiped
                  : "linear-gradient(180deg, #f8f8f6 48.3%, #d3d3d3 100%)"; // not visted

              let borderColor =
                tag.is_right_choice === 0
                  ? "red"
                  : tag.is_right_choice === 1
                  ? "green"
                  : tag.is_right_choice === 2
                  ? "gray"
                  : "";

              return (
                <div
                  style={{
                    background: color,
                    border: `1px solid ${borderColor}`,
                    borderRadius: "60%",
                    height: "25px",
                    width: "25px",
                    fontSize: "14px",
                    color: tag.is_right_choice === null ? "#686666" : "#fff",
                  }}
                >
                  {tag.question_no}
                </div>
              );
            })}
          </div>
        ),
      },
      {
        title: "Score",
        dataIndex: "score",
      },
      {
        title: "Time",
        dataIndex: "time",
      },
      {
        title: "Accuracy",
        dataIndex: "accurancy",
      },
      {
        title: "Strength",
        dataIndex: "strength",
      },
    ];
    return (
      <Card
        bordered={true}
        className="mocktest-analytics-card"
        style={{
          boxShadow: "6px 0px 18px rgba(90, 114, 200, 0.06)",
          padding: "45px 40px",
          margin: "0px 0px 30px 0px",
          borderRadius: "8px",
          // analysic content bg radius//
        }}
      >
        <div className="mocktest-section-analysis-table">
          {sectionStrengthWeekness[`_${this.state.activesecTabIndexTwo}`] && (
            <MocktestTable
              columns={Strengthcolumns}
              dataSource={
                sectionStrengthWeekness[`_${this.state.activesecTabIndexTwo}`]
              }
            />
          )}
        </div>
      </Card>
    );
  };

  render() {
    return (
      <>
        {this.state.activeLoader ? (
          <Spin className="app-spinner" size="large" />
        ) : (
          <div
            className="mocktest-analysis"
            style={{
              height:
                this.state.activeTabIndex !== "3"
                  ? "auto"
                  : "calc(100vh - 8vh)",
            }}
          >
            <div className="mocktest-analysis-TabPane-boby">
              <Tabs
                activeKey={this.state.activeTabIndex.toString()}
                onChange={(e) => {
                  this.setState({ activeTabIndex: e });
                }}
                tabBarExtraContent={
                  <Flex
                    className="tabBtnContainer"
                    justify={
                      window.innerWidth < 1024 ? "space-between" : "center"
                    }
                    gap={
                      window.innerWidth < 320
                        ? 2
                        : window.innerWidth < 600
                        ? 10
                        : 17
                    }
                    align={"baseline"}
                    wrap={"wrap-reverse"}
                  >
                    <Button
                      className="mocktest-analysis-solution-button"
                      type="primary"
                      block
                      size="large"
                      onClick={() => {
                        this.props.dispatch(
                          mocktestStatusUpdate(true, "solution")
                        );
                        this.props.dispatch(mocktestReattempt(false, ""));
                        this.props.navigate(
                          `/course-details/${this.props.match.params.id}/mocktest/${this.props.match.params.mock_id}`
                        );
                      }}
                    >
                      View Solution
                    </Button>
                    <Button
                      type="link"
                      className="Back-two"
                      onClick={this.handleBackButtonClick}
                    >
                      <ArrowLeftOutlined />
                      Back
                    </Button>
                    <Button
                      className="mocktest-analysis-solution-button Back-one"
                      type="primary"
                      block
                      size="large"
                      onClick={this.handleBackButtonClick}
                    >
                      Back
                    </Button>
                  </Flex>
                }
              >
                <TabPane tab="Overview" key="1">
                  <div>
                    <Card
                      className="mocktest-analytics-card"
                      bordered={true}
                      style={{
                        boxShadow: "6px 0px 18px rgba(90, 114, 200, 0.06)",
                        padding: "20px",
                        margin: "0px 0px 30px 0px",
                        borderRadius: "8px",
                        // analysic content bg radius//
                      }}
                    >
                      <div className="mocktest-tab-menu-title">
                        Overall Performance
                      </div>
                      <div className="mocktest-tab-menu-body">
                        <MocktestPerformance
                          performance={this.state.overallPerformance}
                        />
                        <div className="mocktest-section-analysis-table">
                          {this.state.activeTabIndex.toString() === "1" && (
                            <MocktestTable
                              columns={overallColumns}
                              dataSource={this.state.overall_section_analysis}
                            />
                          )}
                        </div>
                      </div>
                    </Card>
                    <Card
                      bordered={true}
                      className="mocktest-analytics-card"
                      style={{
                        boxShadow: "6px 0px 18px rgba(90, 114, 200, 0.06)",
                        padding: "20px",
                        margin: "0px 0px 30px 0px",
                        borderRadius: "8px",
                        // analysic content bg radius//
                      }}
                    >
                      <div className="mocktest-tab-menu-title">
                        Score Distribution
                      </div>
                      <BarChart dataSet={this.state.score_distribution} />
                    </Card>
                    <Card
                      bordered={true}
                      className="mocktest-analytics-card"
                      style={{
                        boxShadow: "6px 0px 18px rgba(90, 114, 200, 0.06)",
                        padding: "20px",
                        margin: "0px 0px 30px 0px",
                        borderRadius: "8px",
                        // analysic content bg radius//
                      }}
                    >
                      <div className="mocktest-tab-menu-title">
                        Percentile vs Score
                      </div>
                      <LineChart dataSet={this.state.overallScorePercentile} />
                    </Card>
                  </div>
                </TabPane>
                <TabPane tab="Section Comparison" key="2">
                  <div>
                    <div className="mocktest-section-analysis-tab">
                      <div style={{ background: "#fff" }}>
                        <Radio.Group
                          onChange={(e) => {
                            this.setState({
                              activesecTabIndex: e.target.value,
                            });
                          }}
                          value={this.state.activesecTabIndex}
                          name="selectedTag"
                        >
                          {this.panes.map((item, index) => (
                            <Radio.Button
                              className="mocktest-toggle-buttons"
                              value={item.key}
                              key={index}
                            >
                              {item.label}
                            </Radio.Button>
                          ))}
                        </Radio.Group>
                      </div>
                      {this.display()}
                    </div>
                    <Card
                      className="mocktest-analytics-card"
                      bordered={true}
                      style={{
                        boxShadow: "6px 0px 18px rgba(90, 114, 200, 0.06)",
                        padding: "20px",
                        margin: "0px 0px 30px 0px",
                        borderRadius: "8px",
                        // analysic content bg radius//
                      }}
                    >
                      <div className="mocktest-tab-menu-title">
                        Score Distribution
                      </div>
                      <BarChart
                        dataSet={
                          this.state.sectionScoreDistribution[
                            `_${this.state.activesecTabIndex}`
                          ]
                        }
                      />
                    </Card>
                    <Card
                      bordered={true}
                      className="mocktest-analytics-card"
                      style={{
                        boxShadow: "6px 0px 18px rgba(90, 114, 200, 0.06)",
                        padding: "20px",
                        margin: "0px 0px 30px 0px",
                        borderRadius: "8px",
                        // analysic content bg radius//
                      }}
                    >
                      <div className="mocktest-tab-menu-title">
                        Percentile vs Score
                      </div>
                      <LineChart
                        dataSet={
                          this.state.SectionScorePercentile[
                            `_${this.state.activesecTabIndex}`
                          ]
                        }
                      />
                    </Card>
                  </div>
                </TabPane>
                <TabPane tab="Strength and Weakness" key="3">
                  <div>
                    <div className="mocktest-section-analysis-tab">
                      <div style={{ background: "#fff" }}>
                        <Radio.Group
                          onChange={(e) => {
                            this.setState({
                              activesecTabIndexTwo: e.target.value,
                            });
                          }}
                          value={this.state.activesecTabIndexTwo}
                          name="selectedTag"
                        >
                          {this.panes.map((item, index) => (
                            <Radio.Button
                              className="mocktest-toggle-buttons"
                              value={item.key}
                              key={index}
                            >
                              {item.label}
                            </Radio.Button>
                          ))}
                        </Radio.Group>
                      </div>
                      {this.dispalyTwo()}
                    </div>
                  </div>
                </TabPane>
              </Tabs>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default connect((state) => {
  return {
    mocktest_solution: state.mocktest_solution,
    current_course: state.current_course,
    envendpoint: state.envendpoint,
    profile_update: state.profile_update,
    current_tab_index: state.current_tab_index,
  };
})(MocktestResult);
