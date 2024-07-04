import React, { Component } from "react";
import { Card, Row, Col, Breadcrumb, Layout, FloatButton, Space } from "antd";
import "../../assets/css/common.css";
import quiz_start from "../../assets/svg-images/quiz-start-new.svg";
import Env from "../../utilities/services/Env";
import { NavLink } from "react-router-dom";
import {
  currentCourse,
  currentPageRouting,
  currentTabIndex,
  disablePreference,
  quizReattempt,
  quizResume,
  quizSolution,
  quizStart,
} from "../../reducers/action";
import { connect } from "react-redux";
import AppSidebar from "../../components/layouts/AppSidebar";
import { Content } from "antd/lib/layout/layout";
import NoRecords from "../../components/NoRecords";
import InfiniteScroll from "react-infinite-scroll-component";
import Skeletons from "../../components/SkeletonsComponent";
import { analytics } from "../../firebase-config";
import { logEvent } from "firebase/analytics";
import { CommonService } from "../../utilities/services/Common";
import { Radio } from "antd";

const filterOptions = [
  {
    id: 0,
    name: "Quiz",
    type: "quiz",
  },
  {
    id: 1,
    name: "Mock Test",
    type: "mocktest",
  },
];

class MyQuestions extends Component {
  constructor() {
    super();
    this.state = {
      myQuestions: [],
      TotalQuestion: "",
      activeLoader: true,
      activePage: 1,
      selectedOption: "quiz",
    };
  }

  componentDidMount() {
    this.getMyQuestions("preference");
    this.props.dispatch(disablePreference(false));
    this.props.dispatch(quizSolution(false));
    this.props.dispatch(quizResume(false));
    this.props.dispatch(quizStart(false));
    this.props.dispatch(currentTabIndex(null));
    this.props.dispatch(currentPageRouting(null));
    this.props.dispatch(currentCourse(null));
    logEvent(analytics, "select_content", {
      page_title: "My Questions",
    });
  }

  getMyQuestions(type) {
    const getQuestionData = Env.get(
      this.props.envendpoint +
        `myquestions?type=${this.state.selectedOption}&page=${this.state.activePage}`
    );
    getQuestionData.then(
      (response) => {
        const data = response.data.response.myQuestions;
        setTimeout(() => {
          this.setState({
            myQuestions:
              type === "preference"
                ? data.data
                : this.state.myQuestions.concat(data.data),
            TotalQuestion: data.total,
            activeLoader: false,
          });
        }, 1000);
      },
      (error) => {
        CommonService.hendleError(error, this.props, "main");
      }
    );
  }

  handleQuestionCard(event, data) {
    this.props.dispatch(quizReattempt(true, data.quiz_question_id));
  }

  stringTrimmer(text) {
    if (text.length > 220) {
      return text.substr(0, 219) + "...";
    } else {
      return text;
    }
  }

  loadMore = () => {
    this.setState(
      (prev) => {
        return { activePage: prev.activePage + 1 };
      },
      () => this.getMyQuestions("paginate")
    );
  };
  handleChange = (e) => {
    this.setState({ selectedOption: e.target.value }, (e) => {
      this.getMyQuestions("preference");
    });
  };
  renderCard(item) {
    return (
      <Card
        className="my-question-card-column"
        onClick={(e) => this.handleQuestionCard(e, item)}
        cover={
          <Space className="all-courses-card-image-attempt-start">
            <img alt="quiz_start" src={quiz_start} />
          </Space>
        }
        title={null}
        style={{
          borderRadius: "0px",
          border: "0px solid lightgrey",
          cursor: "pointer",
          boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
          padding: "15px",
        }}
      >
        <div
          style={{
            padding: "10px 0px",
            height: "160px",
            overflow: "hidden",
          }}
        >
          <div
            style={{ fontSize: "15px" }}
            dangerouslySetInnerHTML={{
              __html: `
                ${
                  item.questions.question
                    ? `<p>${item.questions.question}</p>`
                    : item.questions.language1_question
                    ? `<p>${item.questions.language1_question}</p>`
                    : item.questions.language2_question
                    ? `<p>${item.questions.language2_question}</p>`
                    : item.questions.language3_question
                    ? `<p>${item.questions.language3_question}</p>`
                    : ""
                }`,
            }}
          />
        </div>
      </Card>
    );
  }

  render() {
    const { selectedOption } = this.state;
    return (
      <Layout>
        <AppSidebar {...this.props} />
        <Layout>
          <Content>
            <div className="all-course-main main-content">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ padding: "10px" }}>
                  <Breadcrumb items={[{ title: "My Questions" }]} />
                </div>
                <div style={{ marginTop: "10px" }}>
                  <Radio.Group
                    value={selectedOption}
                    onChange={this.handleChange}
                    style={{ display: "flex" }}
                  >
                    {filterOptions.map((option) => (
                      <Radio.Button
                        key={option.id}
                        value={option.type}
                        style={{
                          borderRadius: "4px",
                          ...(selectedOption === option.type
                            ? {
                                marginRight: "-3px",
                                padding:"0px 30px",
                                color:"black",
                                border:"1px solid black",
                                borderLeft:"2px solid #0b649d",
                                borderRight:"2px solid #0b649d"
                              }
                            : {
                                color: "#fff",
                                backgroundColor: "#0b649d",
                               marginRight:"-2px",
                               padding:"0px 20px",
                              }),
                        }}
                      >
                        {option.name}
                      </Radio.Button>
                    ))}
                  </Radio.Group>
                </div>
              </div>

              <div>
                <div>
                  {this.state.myQuestions.length !== 0 ? (
                    <InfiniteScroll
                      dataLength={this.state.myQuestions.length}
                      next={this.loadMore}
                      hasMore={
                        this.state.myQuestions.length < this.state.TotalQuestion
                      }
                      loader={<Skeletons type={"course"} />}
                      scrollableTarget="scrollableDiv"
                    >
                      <Row>
                        {this.state.myQuestions.map((item, index) => (
                          <Col span={8} key={index} style={{ padding: "10px" }}>
                            {this.state.selectedOption === "quiz" ? (
                              <NavLink to={`/my-questions/details`}>
                                {this.renderCard(item)}
                              </NavLink>
                            ) : (
                              <NavLink to={`/my-questions/details/mocktest`}>
                                {this.renderCard(item)}
                              </NavLink>
                            )}
                          </Col>
                        ))}
                      </Row>
                    </InfiniteScroll>
                  ) : this.state.activeLoader === true ? (
                    <Skeletons type={"course"} />
                  ) : (
                    <>
                      <NoRecords />
                    </>
                  )}
                  {this.state.activePage > 1 && <FloatButton.BackTop />}
                </div>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default connect((state) => {
  return {
    envendpoint: state.envendpoint,
  };
})(MyQuestions);
