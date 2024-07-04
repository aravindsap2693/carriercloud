import React, { Component } from "react";
import "../../assets/css/common.css";
import {
  Row,
  Col,
  Button,
  Card,
  Avatar,
  Divider,
  FloatButton,
  Layout,
  Breadcrumb,
} from "antd";
import { Content } from "antd/lib/layout/layout";
import Env from "../../utilities/services/Env";
import { RightOutlined } from "@ant-design/icons";
// import like from "../../assets/svg-icons/home-liked.svg";
// import unlike from "../../assets/svg-icons/home-like.svg";
// import comment from "../../assets/svg-icons/home-comment.svg";
// import share from "../../assets/svg-icons/home-share.svg";
import start_banner from "../../assets/svg-images/quiz-start-new.svg";
import resume_banner from "../../assets/svg-images/quiz-resume-new.svg";
import solution_banner from "../../assets/svg-images/quiz-solution-new.svg";
import CourseModulesMenu from "../../components/CourseModulesMenu";
import QuizSharePopup from "../../components/QuizSharePopup";
import AppSidebar from "../../components/layouts/AppSidebar";
import { CommonService } from "../../utilities/services/Common";
import {
  currentCourse,
  currentPageRouting,
  currentTabIndex,
  disablePreference,
  quizReattempt,
  quizResume,
  quizSolution,
  quizStart,
  quizStartTimer,
  mocktestStatusUpdate,
  mocktestReattempt,
} from "../../reducers/action";
import NoRecords from "../../components/NoRecords";
import { connect } from "react-redux";
import GeneralPopup from "../../components/GeneralPopup";
import "../../assets/css/home-feed.css";
import { toast } from "react-toastify";
import $ from "jquery";
import InfiniteScroll from "react-infinite-scroll-component";
import Skeletons from "../../components/SkeletonsComponent";
import { analytics } from "../../firebase-config";
import { logEvent } from "firebase/analytics";

class MyNotes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notesData: [],
      totalNotes: 0,
      activeLoader: true,
      activePage: 1,
      catergoryId: props.preferences.id,
      disableMenu: true,
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.props.dispatch(disablePreference(false));
    this.props.dispatch(currentTabIndex(null));
    this.props.dispatch(currentPageRouting(null));
    this.props.dispatch(currentCourse(null));
    this.getUserNotes("preference");
    logEvent(analytics, "select_content", {
      page_title: "My Notes",
    });
    window.addEventListener('message', this.handleMessage);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.preferences.id !== this.props.preferences.id) {
      this.setState(
        { catergoryId: newProps.preferences.id, activePage: 1 },
        () => {
          this.getUserNotes("preference");
        }
      );
    }
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
  urlDecode(url) {
    return url.replace("watch?v=", "embed/");
  }

  handleLike(status, id, type) {
    const requestBody = {
      vote_type: type,
      vote_type_id: id,
    };
    let filteredData = this.state.notesData.filter(
      (item) => item.noteable.id === requestBody.vote_type_id
    );

    filteredData[0].noteable.is_upvote = status === 1 ? 0 : 1;
    filteredData[0].noteable.total_votes =
      status === 1
        ? filteredData[0].noteable.total_votes - 1
        : filteredData[0].noteable.total_votes + 1;

    this.setState({ notesData: this.state.notesData });
    toast(status === 1 ? "Unliked !" : "Liked !");

    const likeData = Env.post(this.props.envendpoint + `votes`, requestBody);
    likeData.then(
      (response) => {
        // this.getUserNotes("Preference");
      },
      (error) => {
        console.error(error);
      }
    );
  }

  async getUserNotes(type) {
    const getData = Env.get(
      this.props.envendpoint +
        `mynotes?page=${this.state.activePage}&filters[category_id][]=${this.state.catergoryId}`
    );
    await getData.then(
      (response) => {
        const data = response.data.response.myNotes.data;
        setTimeout(() => {
          this.setState({
            notesData:
              type !== "paginate" ? data : this.state.notesData.concat(data),
            totalNotes: response.data.response.myNotes.total,
            activeLoader: false,
            disableMenu: true,
          });
        }, 1500);
      },
      (error) => {
        CommonService.hendleError(error, this.props, "main");
      }
    );
  }

  handleContents = (e, data) => {
    e.preventDefault();
    this.props.dispatch(quizSolution(false));
    this.props.dispatch(quizReattempt(false, ""));
    this.props.dispatch(quizStart(false));
    this.props.dispatch(quizResume(false));
    this.props.dispatch(quizStartTimer(false));
    let parent_window = {};
    switch (data.noteable_type) {
      case "quiz":
        if (data.noteable.is_attempted === 2) {
          this.props.dispatch(quizResume(true));
          parent_window = window.open(
            `${process.env.PUBLIC_URL}/course-details/${data.noteable.course_id}/quiz/${data.noteable.id}`,
            "_blank",
            `toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=${window.screen.width},height=${window.screen.height}`
          );
          parent_window.focus();
          parent_window.addEventListener(
            "unload",
            function (event) {
              if (parent_window.closed) {
                this.setState({ activeLoader: true });
                this.getUserNotes("preference");
                // window.location.reload()
              }
              $("#root").toggle();
            }.bind(this)
          );
        } else if (data.noteable.is_attempted === 1) {
          if (e.currentTarget.innerText.toLowerCase() === "solution") {
            this.props.dispatch(quizSolution(true));
            this.props.navigate(
              `/course-details/${data.noteable.course_id}/quiz/${data.noteable.id}`
            );
          } else {
            this.props.navigate(
              `/course-details/${data.noteable.course_id}/quiz/${data.noteable.id}/result`
            );
          }
        } else {
          this.props.dispatch(quizStart(true));
          parent_window = window.open(
            `${process.env.PUBLIC_URL}/course-details/${data.noteable.course_id}/quiz/${data.noteable.id}`,
            "_blank",
            `toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=${window.screen.width},height=${window.screen.height}`
          );
          parent_window.focus();
          parent_window.addEventListener(
            "unload",
            function (event) {
              if (parent_window.closed) {
                // window.location.reload()
                this.setState({ activeLoader: true });
                this.getUserNotes("preference");
              }
              $("#root").toggle();
            }.bind(this)
          );
        }
        break;
      case "App\\Models\\MockTest":
        if (data.noteable.is_attempted === 2) {
          this.props.dispatch(mocktestStatusUpdate(true, "resume"));
          this.props.dispatch(mocktestReattempt(false, ""));
        parent_window = window.open(
          `${process.env.PUBLIC_URL}/course-details/${data.noteable.course_id}/mocktest/${data.noteable.id}`,
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
                  this.setState({ activeLoader: true });
                this.getUserNotes("preference");
                  return { activePage: 1 };
                  
                },
               
              );
            }
            
            $("#root").toggle(); 
          }.bind(this)
        );
         
        } else if (data.noteable.is_attempted === 1) {
          if (e.currentTarget.innerText.toLowerCase() === "solution") {
            this.props.dispatch(mocktestStatusUpdate(true, "solution"));
            this.props.dispatch(mocktestReattempt(false, ""));
            this.props.navigate(
              `${process.env.PUBLIC_URL}/course-details/${data.noteable.course_id}/mocktest/${data.noteable.id}`
            );
          } else {
            this.props.navigate(
              `${process.env.PUBLIC_URL}/course-details/${data.noteable.course_id}/mocktest/${data.noteable.id}/result`
            );
          }
        } else {
          this.props.dispatch(mocktestStatusUpdate(true, "start"));
          parent_window = window.open(
            `${process.env.PUBLIC_URL}/course-details/${data.noteable.course_id}/mocktest/${data.noteable.id}`,
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
                    this.setState({ activeLoader: true });
                    this.getUserNotes("preference");
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
        
      case "article":
        this.props.navigate(
          `/course-details/${data.noteable.course_id}/article/${data.noteable.id}`
        );
        break;
      case "ebook":
        this.props.navigate(
          `/course-details/${data.noteable.course_id}/ebook/${data.noteable.id}`
        );
        break;
      case "video":
        this.props.navigate(
          `/course-details/${data.noteable.course_id}/video/${data.noteable.id}`
        );
        break;
      case "course":
        this.props.dispatch(quizSolution(false));
        this.props.dispatch(disablePreference(true));
        this.props.navigate(`/course-details/${data.noteable.course_id}`);
        break;
      default:
        break;
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
            this.setState({ activeLoader: true }),
                    this.getUserNotes("preference")
                   
        );
        
      }
    }, 1000); // Check every second if the child window is closed
  }

  handleRefresh = () => {
    this.setState({ disableMenu: false }, () =>
      this.getUserNotes("preference")
    );
  };

  loadMore = () => {
    this.setState(
      (prev) => {
        return { activePage: prev.activePage + 1 };
      },
      () => this.getUserNotes("paginate")
    );
  };

  render() {
    return (
      <Layout>
        <AppSidebar {...this.props} />
        <Layout>
          <Content>
            <div className="all-course-main main-content">
              <div style={{ padding: "10px" }}>
                <Breadcrumb items={[{ title: "My Notes" }]} />
              </div>
              {this.state.notesData.length !== 0 ? (
                <InfiniteScroll
                  dataLength={this.state.notesData.length}
                  next={this.loadMore}
                  hasMore={this.state.notesData.length < this.state.totalNotes}
                  loader={<Skeletons type={"mynotes"} />}
                  scrollableTarget="scrollableDiv"
                >
                  <Row gutter={[60, 0]}>
                    {this.state.notesData.map((item, index) => (
                      <Col
                        key={index}
                        xs={24}
                        sm={24}
                        md={12}
                        lg={12}
                        xl={12}
                        xxl={12}
                        className="home-feed-content-column-1"
                      >
                        <div>
                          {item.noteable_type !== "post" && (
                            <Card
                              className="feed-cards"
                              title={
                                <div className="feed-card-content">
                                  <div className="feed-card-inner-content">
                                    <div className="feed-card-avatar">
                                      <Avatar
                                        size={50}
                                        src={
                                          Env.getImageUrl(
                                            `${this.props.envupdate.react_app_assets_url}course`
                                          ) + item.noteable.course?.course_image
                                        }
                                      />
                                    </div>
                                    <div className="feed-card-title">
                                      <a
                                        href={`course-details/${item.noteable.course_id}`}
                                      >
                                        {item.noteable.course?.title}{" "}
                                        <RightOutlined className="right-arrow-icon" />
                                      </a>
                                    </div>
                                    <div className="feed-card-publish">
                                      {CommonService.getPostedTime(
                                        item.noteable.published_at
                                      )}{" "}
                                      &bull;{" "}
                                      {item.noteable_type ===
                                      "App\\Models\\MockTest"
                                        ? "MockTest"
                                        : item.noteable_type}
                                    </div>
                                  </div>
                                  <div>
                                    <CourseModulesMenu
                                      {...this.props}
                                      type={item.noteable_type}
                                      course_id={item.noteable.course_id}
                                      id={item.noteable.id}
                                      is_favourite={item.noteable.is_favourite}
                                      handleRefresh={this.handleRefresh}
                                    />
                                  </div>
                                </div>
                              }
                              cover={
                                <div className="feed-card-body">
                                  {item.noteable_type === "ebook" ? (
                                    <div
                                      onClick={(e) =>
                                        this.handleContents(e, item)
                                      }
                                    >
                                      <div className="ebook-cover-image-container">
                                        <img
                                          alt="example"
                                          src={
                                            Env.getImageUrl(
                                              this.props.envupdate
                                                .react_app_assets_url +
                                                "course/" +
                                                item.noteable_type
                                            ) + item.noteable.image
                                          }
                                          className="ebook-image"
                                          style={{
                                            minHeight: "377px",
                                            height: "377px",
                                          }}
                                        />
                                      </div>
                                      <img
                                        alt="example"
                                        src={
                                          Env.getImageUrl(
                                            this.props.envupdate
                                              .react_app_assets_url +
                                              "course/" +
                                              item.noteable_type
                                          ) + item.noteable.image
                                        }
                                        className="ebook-cover-image"
                                        style={{
                                          minHeight: "377px",
                                          height: "377px",
                                        }}
                                      />
                                    </div>
                                  ) : item.noteable_type === "video" ? (
                                    <div
                                      onClick={(e) =>
                                        this.handleContents(e, item)
                                      }
                                    >
                                      <iframe
                                        frameborder="0"
                                        src={this.urlDecode(
                                          item.noteable.video_url
                                        )}
                                        title="video"
                                        className="video-iframe"
                                        style={{ height: "370px" }}
                                      ></iframe>
                                      <div
                                        className="video-iframe-overlay"
                                        style={{
                                          height: "380px",
                                          top: "80px",
                                        }}
                                      ></div>
                                    </div>
                                  ) : item.noteable_type === "quiz" ? (
                                    <div
                                      style={{ padding: "60px 0px" }}
                                      className={
                                        item.noteable.is_attempted === 0
                                          ? "my-notest start-quiz-content"
                                          : item.noteable.is_attempted === 1
                                          ? "my-notest solution-quiz-content"
                                          : "my-notest resume-quiz-content"
                                      }
                                    >
                                      <div>
                                        <img
                                          alt="example"
                                          src={
                                            item.noteable.is_attempted === 0
                                              ? start_banner
                                              : item.noteable.is_attempted === 1
                                              ? solution_banner
                                              : resume_banner
                                          }
                                          className="feeds-card-quiz-image"
                                        />
                                      </div>
                                      <div
                                        className={
                                          item.noteable.is_attempted === 0
                                            ? "quiz-start-text"
                                            : item.noteable.is_attempted === 1
                                            ? "quiz-solution-text"
                                            : "quiz-resume-text"
                                        }
                                      >
                                        {item.noteable.questions_count} -
                                        Questions :{" "}
                                        {item.noteable
                                          .time_duration_in_seconds / 60}{" "}
                                        mins
                                      </div>
                                      <div>
                                        {item.noteable.is_attempted !== 1 ? (
                                          <Button
                                            onClick={(e) =>
                                              this.handleContents(e, item)
                                            }
                                            className={
                                              item.noteable.is_attempted === 0
                                                ? "start-quiz-button"
                                                : "resume-quiz-button"
                                            }
                                          >
                                            {item.noteable.is_attempted === 0
                                              ? "Start"
                                              : "Resume"}
                                          </Button>
                                        ) : (
                                          <div>
                                            <Button
                                              className="solution-quiz-button"
                                              onClick={(e) =>
                                                this.handleContents(e, item)
                                              }
                                            >
                                              Solution
                                            </Button>
                                            <Button
                                              className="solution-quiz-button"
                                              onClick={(e) =>
                                                this.handleContents(e, item)
                                              }
                                            >
                                              Analysis
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ) : item.noteable_type ===
                                    "App\\Models\\MockTest" ? (
                                    <div
                                      style={{ padding: "60px 0px" }}
                                      className={
                                        item.noteable.is_attempted === 0
                                          ? "my-notest start-quiz-content"
                                          : item.noteable.is_attempted === 1
                                          ? "my-notest solution-quiz-content"
                                          : "my-notest resume-quiz-content"
                                      }
                                    >
                                      <div>
                                        <img
                                          alt="example"
                                          src={
                                            item.noteable.is_attempted === 0
                                              ? start_banner
                                              : item.noteable.is_attempted === 1
                                              ? solution_banner
                                              : resume_banner
                                          }
                                          className="feeds-card-quiz-image"
                                        />
                                      </div>
                                      <div
                                        className={
                                          item.noteable.is_attempted === 0
                                            ? "quiz-start-text"
                                            : item.noteable.is_attempted === 1
                                            ? "quiz-solution-text"
                                            : "quiz-resume-text"
                                        }
                                      >
                                        {CommonService.getMockCountandtime(
                                          item.noteable
                                        )}
                                      </div>
                                      <div>
                                        {item.noteable.is_attempted !== 1 ? (
                                          <Button
                                            onClick={(e) =>
                                              this.handleContents(e, item)
                                            }
                                            className={
                                              item.noteable.is_attempted === 0
                                                ? "start-quiz-button"
                                                : "resume-quiz-button"
                                            }
                                          >
                                            {item.noteable.is_attempted === 0
                                              ? "Start"
                                              : "Resume"}
                                          </Button>
                                        ) : (
                                          <div>
                                            <Button
                                              className="solution-quiz-button"
                                              onClick={(e) =>
                                                this.handleContents(e, item)
                                              }
                                            >
                                              Solution
                                            </Button>
                                            <Button
                                              className="solution-quiz-button"
                                              onClick={(e) =>
                                                this.handleContents(e, item)
                                              }
                                            >
                                              Analysis
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ) : item.noteable_type === "article" ? (
                                    <div
                                      onClick={(e) =>
                                        this.handleContents(e, item)
                                      }
                                    >
                                      <img
                                        alt="example"
                                        src={
                                          Env.getImageUrl(
                                            this.props.envupdate
                                              .react_app_assets_url +
                                              "course/" +
                                              item.noteable_type
                                          ) + item.noteable.article_image
                                        }
                                        className="my-notest article-feed-image"
                                      />
                                    </div>
                                  ) : (
                                    <div>
                                      <img
                                        alt="example"
                                        src={
                                          Env.getImageUrl(
                                            this.props.envupdate
                                              .react_app_assets_url +
                                              item.noteable_type
                                          ) + item.noteable.ebook_image
                                        }
                                        className="my-notest article-feed-image"
                                      />
                                    </div>
                                  )}
                                </div>
                              }
                            >
                              {/* <--------changes----------------> */}
                              {item.noteable_type ===
                              "App\\Models\\MockTest" ? (
                                <>
                                  <div className="feed-card-cover-content">
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <div className="feed-card-cover-inner-content">
                                        {item.noteable.title}
                                      </div>
                                      <div className="feed-card-action-columns">
                                        <span className="feed-card-action-text">
                                          {item.noteable_type === "quiz" ||
                                          item.noteable_type ===
                                            "App\\Models\\MockTest"
                                            ? CommonService.convertIntoKiloPrefix(
                                              item.noteable.attendees_count
                                              )
                                            : CommonService.convertIntoKiloPrefix(
                                                item.noteable.total_views
                                              )}{" "}
                                        </span>
                                        {item.noteable_type === "quiz" ||
                                        item.noteable_type ===
                                          "App\\Models\\MockTest"
                                          ? "Attempts"
                                          : "Views"}
                                      </div>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="feed-card-cover-content">
                                    <div className="feed-card-cover-inner-content">
                                      {item.noteable.title}
                                    </div>
                                    <Divider />
                                    <div className="feed-card-action-values">
                                      <div className="feed-card-action-columns">
                                        <span className="feed-card-action-text">
                                          {item.noteable_type === "quiz" ||
                                          item.noteable_type ===
                                            "App\\Models\\MockTest"
                                            ? CommonService.convertIntoKiloPrefix(
                                                item.quiz_records_count
                                              )
                                            : CommonService.convertIntoKiloPrefix(
                                                item.noteable.total_views
                                              )}{" "}
                                        </span>
                                        {item.noteable_type === "quiz" ||
                                        item.noteable_type ===
                                          "App\\Models\\MockTest"
                                          ? "Attempts"
                                          : "Views"}
                                      </div>
                                      <div className="feed-card-action-columns">
                                        <span className="feed-card-action-text">
                                          {CommonService.convertIntoKiloPrefix(
                                            item.noteable.total_votes
                                          )}{" "}
                                        </span>
                                        Likes
                                      </div>
                                      <div className="feed-card-action-columns">
                                        <span className="feed-card-action-text">
                                          {CommonService.convertIntoKiloPrefix(
                                            item.noteable.total_comments
                                          )}{" "}
                                        </span>
                                        Comments
                                      </div>
                                    </div>
                                  </div>
                                  {/* <Divider className="feed-card-divider" /> */}
                                  {/* <div className="feed-card-footer-content">
                                    <div className="feed-card-footer-inner-content">
                                      <div>
                                        <span
                                          className="feed-card-footer-icon-container"
                                          onClick={() =>
                                            this.handleLike(
                                              parseInt(item.noteable.is_upvote),
                                              item.noteable.id,
                                              item.noteable_type
                                            )
                                          }
                                        >
                                          <img
                                            src={
                                              item.noteable.is_upvote !== null
                                                ? item.noteable.is_upvote.toString() ===
                                                  "1"
                                                  ? like
                                                  : unlike
                                                : unlike
                                            }
                                            alt="like"
                                            className="feed-card-footer-like-icon"
                                          />
                                          Likes
                                        </span>
                                      </div>
                                      <div>
                                        <span className="feed-card-footer-icon-container">
                                          {" "}
                                          <img
                                            src={comment}
                                            alt="comment"
                                            className="feed-card-footer-comment-icon"
                                          />
                                          Comments
                                        </span>
                                      </div>
                                      <div>
                                        <span
                                          className="feed-card-footer-icon-container"
                                          onClick={() =>
                                            this.quizSharePopup.showModal(
                                              item.noteable_type,
                                              item.noteable.id,
                                              item.noteable.course_id
                                            )
                                          }
                                        >
                                          <img
                                            src={share}
                                            alt="share"
                                            className="feed-card-footer-share-icon"
                                          />
                                          Share
                                        </span>
                                      </div>
                                    </div>
                                  </div> */}
                                </>
                              )}
                            </Card>
                          )}
                        </div>
                      </Col>
                    ))}
                  </Row>
                </InfiniteScroll>
              ) : (
                this.state.activeLoader && <Skeletons type={"mynotes"} />
              )}

              {this.state.activePage > 1 && <FloatButton.BackTop />}

              <div>
                {this.state.activeLoader &&
                  this.state.notesData.length !== 0 && (
                    <Skeletons type={"mynotes"} />
                  )}
              </div>
              {!this.state.activeLoader &&
                this.state.notesData.length === 0 && <NoRecords />}

              <QuizSharePopup
                ref={(instance) => {
                  this.quizSharePopup = instance;
                }}
              />
              <GeneralPopup
                ref={(instance) => {
                  this.generalPopup = instance;
                }}
              />
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default connect((state) => {
  return {
    preferences: state.preferences,
    envupdate: state.envupdate,
    envendpoint: state.envendpoint,
  };
})(MyNotes);
