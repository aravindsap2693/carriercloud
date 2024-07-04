import React, { Component } from "react";
import { Collapse, Spin, Steps } from "antd";
import Env from "../../../utilities/services/Env";
import NoRecords from "../../../components/NoRecords";
import "../../../assets/css/common.css";
import { CommonService } from "../../../utilities/services/Common";
import { quizResume, quizSolution, quizStart } from "../../../reducers/action";
import { connect } from "react-redux";
import StorageConfiguration from "../../../utilities/services/StorageConfiguration";
import { toast } from "react-toastify";

const { Panel } = Collapse;
const { Step } = Steps;

class Paths extends Component {
  constructor() {
    super();
    this.state = {
      paths: [],
      activeLoader: true,
    };
    this.handleContents = this.handleContents.bind(this);
  }

  componentDidMount() {
    this.getPathList();
    window.addEventListener('message', this.handleMessage);
  }
  componentWillUnmount() {
    window.removeEventListener('message', this.handleMessage);
}

  getPathList() {
    const courseId = this.props.courses.id;
    const getData = Env.get(
      this.props.envendpoint +
        `path-levels?course_id=${courseId}&user_id=${StorageConfiguration.sessionGetItem(
          "user_id"
        )}&is_subscribed=${this.props.courses.is_subscribe}`
    );
    getData.then(
      (response) => {
        const responseData = response.data.response.level_details;
        this.setState({ paths: responseData, activeLoader: false });
      },
      (error) => {
        console.error(error);
      }
    );
  }
  handleMessage = (event) => {
    if (event.data.type === 'navigateToResult' && event.data.isAPISubmit ) {
        const resultUrl = event.data.url;
        window.location.href = resultUrl;
       // this.props.navigate(resultUrl);
    }
};
  
  handleContents(e, data) {
    e.preventDefault();
    if (this.props.courses.is_subscribed === 1) {
      switch (data.type) {
        case "Quiz":
          if (data.is_attempted === 2) {
            this.props.dispatch(quizResume(true));
            this.props.routingProps.navigate(
              `/course-details/${this.props.courses.id}/quiz/${data.course_details_id}`
            );
          } else if (data.is_attempted === 1) {
            this.props.dispatch(quizSolution(true));
            this.props.routingProps.navigate(
              `/course-details/${this.props.courses.id}/quiz/${data.course_details_id}`
            );
          } else {
            this.props.dispatch(quizStart(true));
            this.props.routingProps.navigate(
              `/course-details/${this.props.courses.id}/quiz/${data.course_details_id}`
            );
          }
          break;
        case "Article":
          this.props.routingProps.navigate(
            `/course-details/${this.props.courses.id}/article/${data.course_details_id}`
          );
          break;
        case "Ebook":
          this.props.routingProps.navigate(
            `/course-details/${this.props.courses.id}/ebook/${data.course_details_id}`
          );
          break;
        case "Video":
          this.props.routingProps.navigate(
            `/course-details/${this.props.courses.id}/video/${data.course_details_id}`
          );
        default:
          break;
      }
    } else {
      toast("Please subscribe the course!");
    }
  }

  render() {
    return (
      <div className="course-modules-path-container">
        {this.state.paths.length > 0 && this.state.activeLoader === false ? (
          <Collapse
            defaultActiveKey={[""]}
            ghost
            accordion
            expandIconPosition="end"
            expandIcon={({ isActive }) => (
              <span className="course-modules-path-collapse-icon">
                {!isActive ? "+" : <span> &minus;</span>}
              </span>
            )}
          >
            {this.state.paths.map((main_level, main_index) => (
              <Panel header={main_level.levels_name} key={main_index}>
                {main_level.levels_number === 1 ? (
                  <div className="course-modules-level-path-container">
                    <Steps
                      progressDot
                      current={this.state.paths.length}
                      direction="vertical"
                      size="small"
                    >
                      {main_level.path &&
                        main_level.path.map((item, index) => (
                          <Step
                            key={index}
                            description={
                              <div>
                                <span>English</span> -{" "}
                                <span className="course-modules-path-language-link">
                                  {item.type}
                                </span>{" "}
                                {item.type === "Quiz" && (
                                  <span>
                                    <span>
                                      {" "}
                                      ({item.quiz_quesition_count} Questions)
                                    </span>
                                    {item.is_attempted === 0 ? (
                                      <span
                                        style={{
                                          margin: "5px",
                                          background: "#109CF1",
                                          borderRadius: "4px",
                                          padding: "2px 16px",
                                          color: "#fff",
                                          fontSize: "11px",
                                          cursor: "pointer",
                                        }}
                                        onClick={(e) =>
                                          this.handleContents(e, item)
                                        }
                                      >
                                        Start
                                      </span>
                                    ) : item.is_attempted === 1 ? (
                                      <span
                                        style={{
                                          margin: "5px",
                                          background: "#46760A ",
                                          borderRadius: "4px",
                                          padding: "2px 6px",
                                          color: "#fff",
                                          fontSize: "11px",
                                          cursor: "pointer",
                                        }}
                                        onClick={(e) =>
                                          this.handleContents(e, item)
                                        }
                                      >
                                        View Solution
                                      </span>
                                    ) : (
                                      <span
                                        style={{
                                          margin: "5px",
                                          background: "#E49836",
                                          borderRadius: "4px",
                                          padding: "2px 4px",
                                          color: "#fff",
                                          fontSize: "11px",
                                          cursor: "pointer",
                                        }}
                                        onClick={(e) =>
                                          this.handleContents(e, item)
                                        }
                                      >
                                        Resume
                                      </span>
                                    )}
                                  </span>
                                )}
                              </div>
                            }
                            title={
                              <a onClick={(e) => this.handleContents(e, item)}>
                                {item.title}
                              </a>
                            }
                          />
                        ))}
                    </Steps>
                  </div>
                ) : (
                  <div className="course-modules-main-path-container">
                    <Collapse
                      defaultActiveKey=""
                      ghost
                      accordion
                      expandIconPosition="end"
                      expandIcon={({ isActive }) => (
                        <span className="course-modules-path-collapse-icon">
                          {!isActive ? "+" : <span> &minus;</span>}
                        </span>
                      )}
                    >
                      {main_level.path &&
                        main_level.path.map((sub_level, sub_level_index) => (
                          <Panel
                            header={sub_level.sublevel_name}
                            key={sub_level_index}
                          >
                            {main_level.levels_number === 3 ? (
                              <div className="course-modules-main-path-container">
                                <Collapse
                                  defaultActiveKey=""
                                  ghost
                                  accordion
                                  expandIconPosition="end"
                                  expandIcon={({ isActive }) => (
                                    <span className="course-modules-path-collapse-icon">
                                      {!isActive ? "+" : <span> &minus;</span>}
                                    </span>
                                  )}
                                >
                                  {sub_level.getpathleveldetails.map(
                                    (sub_sub_level, sub_sub_level_index) => (
                                      <Panel
                                        header={
                                          sub_sub_level.path_sub_level_name
                                        }
                                        key={sub_sub_level_index}
                                      >
                                        <div className="course-modules-level-path-container">
                                          {sub_sub_level.sub_sub_leveldetails ? (
                                            <Steps
                                              progressDot
                                              current={
                                                sub_sub_level
                                                  .sub_sub_leveldetails.length
                                              }
                                              direction="vertical"
                                              size="small"
                                            >
                                              {sub_sub_level.sub_sub_leveldetails.map(
                                                (item, index) => (
                                                  <Step
                                                    key={index}
                                                    description={
                                                      <div>
                                                        <span>English</span> -{" "}
                                                        <span className="course-modules-path-language-link">
                                                          {item.type}
                                                        </span>{" "}
                                                        {item.type ===
                                                          "Quiz" && (
                                                          <span>
                                                            <span>
                                                              {" "}
                                                              (
                                                              {
                                                                item.quiz_quesition_count
                                                              }{" "}
                                                              Questions)
                                                            </span>
                                                            {item.is_attempted ===
                                                            0 ? (
                                                              <span
                                                                style={{
                                                                  margin: "5px",
                                                                  background:
                                                                    "#109CF1",
                                                                  borderRadius:
                                                                    "4px",
                                                                  padding:
                                                                    "2px 16px",
                                                                  color: "#fff",
                                                                  fontSize:
                                                                    "11px",
                                                                  cursor:
                                                                    "pointer",
                                                                }}
                                                                onClick={(e) =>
                                                                  this.handleContents(
                                                                    e,
                                                                    item
                                                                  )
                                                                }
                                                              >
                                                                Start
                                                              </span>
                                                            ) : item.is_attempted ===
                                                              1 ? (
                                                              <span
                                                                style={{
                                                                  margin: "5px",
                                                                  background:
                                                                    "#46760A ",
                                                                  borderRadius:
                                                                    "4px",
                                                                  padding:
                                                                    "2px 6px",
                                                                  color: "#fff",
                                                                  fontSize:
                                                                    "11px",
                                                                  cursor:
                                                                    "pointer",
                                                                }}
                                                                onClick={(e) =>
                                                                  this.handleContents(
                                                                    e,
                                                                    item
                                                                  )
                                                                }
                                                              >
                                                                View Solution
                                                              </span>
                                                            ) : (
                                                              <span
                                                                style={{
                                                                  margin: "5px",
                                                                  background:
                                                                    "#E49836",
                                                                  borderRadius:
                                                                    "4px",
                                                                  padding:
                                                                    "2px 4px",
                                                                  color: "#fff",
                                                                  fontSize:
                                                                    "11px",
                                                                  cursor:
                                                                    "pointer",
                                                                }}
                                                                onClick={(e) =>
                                                                  this.handleContents(
                                                                    e,
                                                                    item
                                                                  )
                                                                }
                                                              >
                                                                Resume
                                                              </span>
                                                            )}
                                                          </span>
                                                        )}
                                                      </div>
                                                    }
                                                    title={
                                                      <a
                                                        onClick={(e) =>
                                                          this.handleContents(
                                                            e,
                                                            item
                                                          )
                                                        }
                                                      >
                                                        {item.title}
                                                      </a>
                                                    }
                                                  />
                                                )
                                              )}
                                            </Steps>
                                          ) : null}
                                        </div>
                                      </Panel>
                                    )
                                  )}
                                </Collapse>
                              </div>
                            ) : (
                              <div className="course-modules-level-path-container">
                                <Steps
                                  progressDot
                                  current={
                                    sub_level.getpathleveldetails &&
                                    sub_level.getpathleveldetails.length
                                  }
                                  direction="vertical"
                                  size="small"
                                >
                                  {sub_level.getpathleveldetails &&
                                    sub_level.getpathleveldetails.map(
                                      (item, index) => (
                                        <Step
                                          key={index}
                                          description={
                                            <div>
                                              <span>English</span> -{" "}
                                              <span className="course-modules-path-language-link">
                                                {item.type}
                                              </span>{" "}
                                              {item.type === "Quiz" && (
                                                <span>
                                                  {" "}
                                                  <span>
                                                    ({item.quiz_quesition_count}{" "}
                                                    Questions)
                                                  </span>
                                                  {item.is_attempted === 0 ? (
                                                    <span
                                                      style={{
                                                        margin: "5px",
                                                        background: "#109CF1",
                                                        borderRadius: "4px",
                                                        padding: "2px 16px",
                                                        color: "#fff",
                                                        fontSize: "11px",
                                                        cursor: "pointer",
                                                      }}
                                                      onClick={(e) =>
                                                        this.handleContents(
                                                          e,
                                                          item
                                                        )
                                                      }
                                                    >
                                                      Start
                                                    </span>
                                                  ) : item.is_attempted ===
                                                    1 ? (
                                                    <span
                                                      style={{
                                                        margin: "5px",
                                                        background: "#46760A ",
                                                        borderRadius: "4px",
                                                        padding: "2px 6px",
                                                        color: "#fff",
                                                        fontSize: "11px",
                                                        cursor: "pointer",
                                                      }}
                                                      onClick={(e) =>
                                                        this.handleContents(
                                                          e,
                                                          item
                                                        )
                                                      }
                                                    >
                                                      View Solution
                                                    </span>
                                                  ) : (
                                                    <span
                                                      style={{
                                                        margin: "5px",
                                                        background: "#E49836",
                                                        borderRadius: "4px",
                                                        padding: "2px 4px",
                                                        color: "#fff",
                                                        fontSize: "11px",
                                                        cursor: "pointer",
                                                      }}
                                                      onClick={(e) =>
                                                        this.handleContents(
                                                          e,
                                                          item
                                                        )
                                                      }
                                                    >
                                                      Resume
                                                    </span>
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                          }
                                          title={
                                            <a
                                              onClick={(e) =>
                                                this.handleContents(e, item)
                                              }
                                            >
                                              {item.title}
                                            </a>
                                          }
                                        />
                                      )
                                    )}
                                </Steps>
                              </div>
                            )}
                          </Panel>
                        ))}
                    </Collapse>
                  </div>
                )}
              </Panel>
            ))}
          </Collapse>
        ) : (
          <Spin className="course-module-layout-spinner" size="large" />
        )}

        {this.state.activeLoader === false && this.state.paths.length === 0 && (
          <NoRecords />
        )}
      </div>
    );
  }
}

// export default connect((state) => {
//     return {
//       envendpoint: state.envendpoint,
//     };
//   })(Paths);
export default Paths;
