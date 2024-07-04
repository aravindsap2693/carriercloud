import React, { Component } from "react";
import { Row, Col, Collapse, Spin } from "antd";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import "../../../assets/css/path.css";
import Env from "../../../utilities/services/Env";
import {
  mocktestStatusUpdate,
  mocktestReattempt,
  quizReattempt,
  quizResume,
  quizSolution,
  quizStart,
  quizStartTimer,
} from "../../../reducers/action";
import { connect } from "react-redux";
import StorageConfiguration from "../../../utilities/services/StorageConfiguration";
import { toast } from "react-toastify";
import $ from "jquery";
import _ from "lodash";

const { Panel } = Collapse;

class Path2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataDownToggle: true,
      selectedMainIndex: 0,
      selectedSubIndex: null,
      selectedSubSubIndex: null,
      paths: [],
      pathsContent: [],
      activeLoader: true,
      mainLoader: true,
      rowPerPage: 10,
      extraParams: null,
      SubAccordion: false,
      SubSubAccordion: false,
      scrollY: 0,
      courseId: props.courses.id,
    };
  }

  componentDidMount() {
    this.getPathList();
    window.addEventListener('message', this.handleMessage);
  }
  componentWillUnmount() {
    window.removeEventListener('message', this.handleMessage);
}

  handleMessage = (event) => {
    if (event.data.type === 'navigateToResult' && event.data.isAPISubmit ) {
        const resultUrl = event.data.url;
        window.location.href = resultUrl;
       // this.props.navigate(resultUrl);
    }
};
  getPathList() {
    const getData = Env.get(
      this.props.envendpoint +
        `path-levels-all-latest?course_id=${
          this.state.courseId
        }&user_id=${StorageConfiguration.sessionGetItem(
          "user_id"
        )}&is_subscribed=${this.props.courses.is_subscribed}`
    );
    getData.then(
      (response) => {
        const responseData = response.data.response.level_details;
        this.setState({
          paths: responseData,
          mainLoader: false,
        });
        this.state.selectedMainIndex == 0 &&
          responseData[0].levels_number == 1 &&
          this.handleContentList(0, responseData[0]);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getPathContent(extraParams) {
    this.setState((prevState) => {
      return {
        extraParams:
          extraParams === prevState.extraParams
            ? prevState.extraParams
            : extraParams,
      };
    });
    this.setState({
      activeLoader: true,
    });
    const getData = Env.get(
      this.props.envendpoint + `path-levels-content?${extraParams}`
    );
    getData.then(
      (response) => {
        const responseData = response.data.response.path_contents;
        this.setState({
          pathsContent: responseData,
          mainLoader: false,
          activeLoader: false,
        });
      },
      (error) => {
        if (error.response !== undefined && error.response.status === 404) {
          this.setState({
            pathsContent: [],
            mainLoader: false,
            activeLoader: false,
          });
        }
        console.error(error);
      }
    );
  }

  handleListItem = (item, id) => {
    this.setState({
      dataDownToggle: !this.state.dataDownToggle,
      selectedMainIndex: id,
      selectedSubIndex: null,
      selectedSubSubIndex: null,
    });
    item.levels_number === 1 && this.handleContentList(0, item);
  };

  handleContentList = (e, item) => {
    let index = 0;
    if (typeof e !== "object") {
      index = e !== undefined ? e : this.state.selectedSubIndex;
    } else {
      let leng = _.isUndefined(e) ? e.length : e.length - 1;
      index = leng > 0 ? e[leng] : null;
    }
    let main_level_id = item.levels_number ? item.id : item.main_level_id;
    let extraParams = `&course_id=${
      this.state.courseId
    }&user_id=${StorageConfiguration.sessionGetItem("user_id")}&is_subscribed=${
      this.props.courses.is_subscribed
    }`;

    let SubIndex =
      index == this.state.selectedSubIndex
        ? this.state.selectedSubSubIndex
        : null;

    this.setState({
      selectedSubIndex: index,
      SubAccordion: index == this.state.selectedSubIndex,
      selectedSubSubIndex: SubIndex,
    });
    SubIndex = SubIndex ? SubIndex : 0;
    if (index !== null) {
      switch (item.levels_number) {
        case 1:
          extraParams += `&main_level_id=${main_level_id}&levels_number=${item.levels_number}`;
          if (this.state.extraParams !== extraParams) {
            e !== undefined && this.getPathContent(extraParams);
          }
          break;
        case 2:
          extraParams += `&main_level_id=${main_level_id}&levels_number=${item.levels_number}&sublevel_id=${item.path[index].id}`;
          if (this.state.extraParams !== extraParams) {
            e !== undefined && this.getPathContent(extraParams);
          }
          break;
        default:
          break;
      }
    }
  };

  handleThiredContentList = (e, item) => {
    let SubIndex =
      this.state.selectedSubIndex === null ? null : this.state.selectedSubIndex;
    let SubSubIndex = 0;

    if (typeof e == "string") {
      SubSubIndex = _.isUndefined(e)
        ? this.state.selectedSubSubIndex === null
          ? null
          : this.state.selectedSubSubIndex
        : e;
    } else {
      let leng = _.isUndefined(e) ? e.length : e.length - 1;
      SubSubIndex =
        leng == 0
          ? this.state.selectedSubSubIndex === null
            ? null
            : this.state.selectedSubSubIndex
          : e[leng];
    }
    let main_level_id = item.levels_number ? item.id : item.main_level_id;
    let extraParams = `&course_id=${
      this.state.courseId
    }&user_id=${StorageConfiguration.sessionGetItem("user_id")}&is_subscribed=${
      this.props.courses.is_subscribed
    }`;
    this.setState({
      selectedSubSubIndex: SubSubIndex,
      SubSubAccordion: SubSubIndex == this.state.selectedSubSubIndex,
    });
    SubIndex = SubIndex ? parseInt(SubIndex) : 0;
    SubSubIndex = SubSubIndex ? parseInt(SubSubIndex) : 0;
    if (SubIndex !== null) {
      extraParams += `&main_level_id=${main_level_id}&levels_number=${item.levels_number}&sublevel_id=${item.path[SubIndex].id}&sub_sub_level_id=${item.path[SubIndex].getpathleveldetails[SubSubIndex].path_sub_sub_levelid}`;
      if (this.state.selectedSubSubIndex !== SubSubIndex) {
        e !== undefined && this.getPathContent(extraParams);
      }
    }
  };

  handleScroll = (id, type, FirtID) => {
    let scrollHeight = document.getElementById(`${type}_${id}`).scrollHeight;
    let scrollTop = window.scrollY;
    let scrolly = 100;

    if (id === FirtID) {
      scrolly = 580;
      this.setState({ scrollY: scrolly });
    } else {
      if (scrollTop >= 1900) {
        scrolly = scrollTop - document.body.scrollHeight / 6;
      } else if (scrollTop >= 1400) {
        scrolly = scrollTop - document.body.scrollHeight / 7;
      } else if (scrollTop >= 900) {
        scrolly = scrollTop - document.body.scrollHeight / 8;
      } else if (scrollTop > 800) {
        scrolly = scrollTop - document.body.scrollHeight / 9;
      } else {
        scrolly = scrollTop + document.body.scrollHeight / 10;
      }
      scrolly = Math.round(scrolly);
      if (scrolly < this.state.scrollY) {
        scrolly -= scrollHeight;
      } else {
        scrolly += scrollHeight;
      }
      this.setState({ scrollY: scrolly });
    }

    window.scrollTo(0, scrolly, "smooth");
  };

  displayContent = () => {
    return (
      <div className="path-content-scroll">
        {this.state.activeLoader ? (
          <Spin className="path-spinner" size="large" />
        ) : (
          <>
            {this.state.pathsContent.length > 0 ? (
              <>
                {this.state.pathsContent.map((item, index) => (
                  <div
                    className="sub-sub-level-content"
                    key={index}
                    onClick={(e) => this.handleContents(e, item)}
                  >
                    <span style={{ color: "#0B649D", cursor: "pointer" }}>
                      {item.title}
                    </span>
                    <div
                      style={{
                        padding: "5px 0px",
                        color: "grey",
                        fontSize: "10px",
                      }}
                    >
                      English | <a href="">{item.type}</a>{" "}
                      {this.props.courses.is_subscribed === 1 && (
                        <>
                          {(item.type === "Quiz" ||
                            item.type === "mocktest") && (
                            <span
                              style={{
                                background:
                                  item.is_attempted === 0 ||
                                  item.is_attempted === 1
                                    ? item.is_attempted === 1
                                      ? "#46760A "
                                      : "#0B649D"
                                    : "#E49836",
                                fontSize: "12px",
                                color: "#fff",
                                padding: "0px 6px",
                                borderRadius: "2px",
                                margin: "0px 10px",
                              }}
                            >
                              {item.is_attempted === 0 ||
                              item.is_attempted === 1
                                ? item.is_attempted === 1
                                  ? "View Solution"
                                  : "Start"
                                : "Resume"}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <h3 style={{ textAlign: "center", marginTop: "10px" }}>
                No Records
              </h3>
            )}
          </>
        )}
      </div>
    );
  };

  handleContents = (e, data) => {
    e.preventDefault();
    this.props.dispatch(quizSolution(false));
    this.props.dispatch(quizReattempt(false, ""));
    this.props.dispatch(quizStart(false));
    this.props.dispatch(quizResume(false));
    this.props.dispatch(quizStartTimer(false));
    this.props.dispatch(mocktestStatusUpdate(false, ""));
    this.props.dispatch(mocktestReattempt(false, ""));
    let parent_window = {};
    if (this.props.courses.is_subscribed === 1) {
      switch (data.type) {
        case "Quiz":
          if (data.is_attempted === 2) {
            this.props.dispatch(quizResume(true));
            parent_window = window.open(
              `${process.env.PUBLIC_URL}/course-details/${this.state.courseId}/quiz/${data.course_details_id}`,
              "_blank",
              `toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=${window.screen.width},height=${window.screen.height}`
            );
            parent_window.focus();
            parent_window.addEventListener(
              "unload",
              function (event) {
                if (parent_window.closed) {
                  this.setState({ mainLoader: true });
                  this.getPathList();
                  this.getPathContent(this.state.extraParams);
                }
                $("#root").toggle();
              }.bind(this)
            );
          } else if (data.is_attempted === 1) {
            this.props.dispatch(quizSolution(true));
            this.props.routingProps.navigate(
              `/course-details/${this.state.courseId}/quiz/${data.course_details_id}`
            );
          } else {
            this.props.dispatch(quizStart(true));
            parent_window = window.open(
              `${process.env.PUBLIC_URL}/course-details/${this.state.courseId}/quiz/${data.course_details_id}`,
              "_blank",
              `toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=${window.screen.width},height=${window.screen.height}`
            );
            parent_window.focus();
            parent_window.addEventListener(
              "unload",
              function (event) {
                if (parent_window.closed) {
                  this.setState({ mainLoader: true });
                  this.getPathList();
                  this.getPathContent(this.state.extraParams);
                }
                $("#root").toggle();
              }.bind(this)
            );
          }
          this.monitorChildWindow(parent_window);
          break;
        case "mocktest":
          if (data.is_attempted === 2) {
            this.props.dispatch(mocktestStatusUpdate(true, "resume"));
            this.props.dispatch(mocktestReattempt(false, ""));
          parent_window = window.open(
            `/course-details/${this.state.courseId}/mocktest/${data.course_details_id}`,
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
                    this.setState({ mainLoader: true });
                    this.getPathList();
                    this.getPathContent(this.state.extraParams);
                    return { activePage: 1 };
                    
                  },
                 
                );
              }
              
              $("#root").toggle(); 
            }.bind(this)
          );
           
          } else if (data.is_attempted === 1) {
            this.props.dispatch(mocktestStatusUpdate(true, "solution"));
            this.props.routingProps.navigate(
              `/course-details/${this.state.courseId}/mocktest/${data.course_details_id}`
            );
          } else {
            this.props.dispatch(mocktestStatusUpdate(true, "start"));
            parent_window = window.open(
              `/course-details/${this.state.courseId}/mocktest/${data.course_details_id}`,
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
                      this.setState({ mainLoader: true });
                    this.getPathList();
                    this.getPathContent(this.state.extraParams);
                      return { activePage: 1 };
                    },
                    
                  );
                }
               
                $("#root").toggle(); 
              }.bind(this)
            );
          
          }
          this.monitorChildWindow(parent_window);
          break;
        case "Article":
          this.props.routingProps.navigate(
            `/course-details/${this.state.courseId}/article/${data.course_details_id}`
          );
          break;
        case "Ebook":
          this.props.routingProps.navigate(
            `/course-details/${this.state.courseId}/ebook/${data.course_details_id}`
          );
          break;
        case "Video":
          this.props.routingProps.navigate(
            `/course-details/${this.state.courseId}/video/${data.course_details_id}`
          );
          break;
        default:
          break;
      }
    } else {
      toast("Please subscribe the course!");
    }
  };

  monitorChildWindow(childWindow) {
    const checkChildClosed = setInterval(() => {
      if (childWindow.closed) {
        clearInterval(checkChildClosed);
        // Notify the child window to handle leave
        window.postMessage('handleLeaveMocktest', '*');
        this.setState(
          (prev) => {
            return { activePage: 1 };
          },
          () =>
            this.setState({ mainLoader: true }),
                    this.getPathList(),
                    this.getPathContent(this.state.extraParams),
        );
        
      }
    }, 1000); // Check every second if the child window is closed
  }

 

  render() {
    return (
      <div className="path-container">
        {this.state.mainLoader === false ? (
          <Row>
            <Col
              xs={8}
              sm={8}
              md={8}
              lg={8}
              xl={8}
              xxl={8}
              style={{
                background: "#fff",
                borderRadius: "3px",
                padding: "20px",
              }}
            >
              {
                // Main Level
                this.state.paths.map((item, index) => (
                  <div key={index}>
                    <Collapse
                      activeKey={this.state.selectedMainIndex}
                      className="main-collapse"
                      ghost
                      expandIconPosition="end"
                      onChange={() => this.handleListItem(item, index)}
                      accordion={index !== this.state.selectedMainIndex}
                      expandIcon={() =>
                        index !== this.state.selectedMainIndex ? (
                          <DownOutlined />
                        ) : (
                          <RightOutlined />
                        )
                      }
                    >
                      <Panel
                        header={item.levels_name}
                        key={index}
                        className={
                          index === this.state.selectedMainIndex
                            ? "collapse-panel-active"
                            : "collapse-panel"
                        }
                      ></Panel>
                    </Collapse>
                  </div>
                ))
              }
            </Col>
            <Col xs={16} sm={16} md={16} lg={16} xl={16} xxl={16}>
              <div
                style={{
                  marginLeft: "20px",
                  background: "#fff",
                  borderRadius: "3px",
                  padding: "20px",
                  border: "1px solid rgba(90, 114, 200, 0.08)",
                }}
              >
                {/* Sub Level */}
                <Collapse
                  activeKey={[this.state.selectedSubIndex]}
                  ghost
                  style={{ borderRadius: "3px" }}
                  expandIconPosition="end"
                  onChange={(e) =>
                    this.handleContentList(
                      e,
                      this.state.paths[this.state.selectedMainIndex]
                    )
                  }
                  accordion={this.state.SubAccordion}
                >
                  {this.state.paths.length !== 0 &&
                  this.state.paths[this.state.selectedMainIndex]
                    .levels_number !== 1 &&
                  this.state.paths[this.state.selectedMainIndex].path !==
                    undefined ? (
                    this.state.paths[this.state.selectedMainIndex].path.map(
                      (ele, index) => (
                        <Panel
                          header={ele.sublevel_name}
                          key={index}
                          id={`sublevel_${ele.id}`}
                          style={{
                            padding: "3px",
                            margin: "10px 0px",
                            border: "1px solid rgba(90, 114, 200, 0.08)",
                            boxShadow: "0px 2px 10px rgba(90, 114, 200, 0.08)",
                          }}
                        >
                          {/* Sub Sub Level */}
                          <Collapse
                            activeKey={[this.state.selectedSubSubIndex]}
                            style={{
                              background: "#fff",
                              position: "relative",
                              bottom: "10px",
                              margin: "15px",
                            }}
                            ghost
                            onChange={(e) =>
                              this.handleThiredContentList(
                                e,
                                this.state.paths[this.state.selectedMainIndex]
                              )
                            }
                            expandIconPosition="end"
                            accordion={this.state.SubSubAccordion}
                          >
                            {this.state.paths[this.state.selectedMainIndex]
                              .levels_number !== 2 &&
                            ele.getpathleveldetails !== undefined
                              ? ele.getpathleveldetails.map((item2, index) => (
                                  <Panel
                                    header={item2.path_sub_level_name}
                                    key={index}
                                    style={{
                                      padding: "3px",
                                      border:
                                        "1px solid rgba(90, 114, 200, 0.08)",
                                      margin: "10px 0px",
                                      boxShadow:
                                        "0px 2px 10px rgba(90, 114, 200, 0.08)",
                                    }}
                                    id={`subsublevel_${item2.path_sub_sub_levelid}`}
                                  >
                                    {this.displayContent()}
                                  </Panel>
                                ))
                              : // Sub Content
                                this.displayContent()}
                          </Collapse>
                        </Panel>
                      )
                    )
                  ) : // Main Content
                  this.state.paths.length !== 0 &&
                    this.state.pathsContent !== undefined ? (
                    <div
                      style={{
                        boxShadow: "0px 2px 10px rgba(90, 114, 200, 0.08)",
                        padding: "15px",
                      }}
                    >
                      {!this.state.activeLoader ? (
                        <>
                          {this.state.pathsContent.map((item3, index) => (
                            <div
                              className="sub-sub-level-content"
                              key={index}
                              onClick={(e) => this.handleContents(e, item3)}
                            >
                              <span
                                style={{ color: "#0B649D", cursor: "pointer" }}
                              >
                                {item3.title}
                              </span>
                              <div
                                style={{
                                  padding: "5px 0px",
                                  color: "grey",
                                  fontSize: "10px",
                                }}
                              >
                                English | <a href="">{item3.type}</a>{" "}
                                {this.props.courses.is_subscribed === 1 && (
                                  <>
                                    {(item3.type === "Quiz" ||
                                      item3.type === "mocktest") && (
                                      <span
                                        style={{
                                          background:
                                            item3.is_attempted === 0 ||
                                            item3.is_attempted === 1
                                              ? item3.is_attempted === 1
                                                ? "#46760A "
                                                : "#0B649D"
                                              : "#E49836",
                                          fontSize: "12px",
                                          color: "#fff",
                                          padding: "0px 6px",
                                          borderRadius: "2px",
                                          margin: "0px 10px",
                                        }}
                                      >
                                        {item3.is_attempted === 0 ||
                                        item3.is_attempted === 1
                                          ? item3.is_attempted === 1
                                            ? "View Solution"
                                            : "Start"
                                          : "Resume"}
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <Spin className="path-spinner" size="large" />
                      )}
                    </div>
                  ) : (
                    <h3 style={{ textAlign: "center", marginTop: "10px" }}>
                      No Records
                    </h3>
                  )}
                </Collapse>
              </div>
            </Col>
          </Row>
        ) : (
          <Spin className="path-spinner" size="large" />
        )}
      </div>
    );
  }
}
export default connect((state) => {
  return {
    envupdate: state.envupdate,
    envendpoint: state.envendpoint,
  };
})(Path2);
