import React, { Component } from "react";
import "../../assets/css/common.css";
import "../../assets/css/common.css";
import {
  Layout,
  Row,
  Col,
  Card,
  Avatar,
  Divider,
  FloatButton,
  Breadcrumb,
} from "antd";
import Env from "../../utilities/services/Env";
import { RightOutlined } from "@ant-design/icons";
import like from "../../assets/svg-icons/home-liked.svg";
import unlike from "../../assets/svg-icons/home-like.svg";
import comment from "../../assets/svg-icons/home-comment.svg";
import share from "../../assets/svg-icons/home-share.svg";
import CourseModulesMenu from "../../components/CourseModulesMenu";
import QuizSharePopup from "../../components/QuizSharePopup";
import { CommonService } from "../../utilities/services/Common";
import {
  currentCourse,
  currentPageRouting,
  currentTabIndex,
  disablePreference,
} from "../../reducers/action";
import NoRecords from "../../components/NoRecords";
import { connect } from "react-redux";
import GeneralPopup from "../../components/GeneralPopup";
import "../../assets/css/home-feed.css";
import { toast } from "react-toastify";
import InfiniteScroll from "react-infinite-scroll-component";
import Skeletons from "../../components/SkeletonsComponent";
import { analytics } from "../../firebase-config";
import { logEvent } from "firebase/analytics";
import { Content } from "antd/lib/layout/layout";
import AppSidebar from "../../components/layouts/AppSidebar";

class Ebooks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notesData: [],
      totalNotes: 0,
      activeLoader: true,
      activePage: 1,
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.props.dispatch(disablePreference(false));
    this.props.dispatch(currentTabIndex(null));
    this.props.dispatch(currentPageRouting(null));
    this.props.dispatch(currentCourse(null));
    this.getEbookList("preference");
    logEvent(analytics, "select_content", {
      page_title: "My Ebooks",
    });
  }

  componentWillReceiveProps(newProps) {
    if (newProps.preferences.id !== this.props.preferences.id) {
      this.setState(
        { catergoryId: newProps.preferences.id, activePage: 1 },
        () => {
          this.getEbookList("preference");
        }
      );
    }
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
        // this.getEbookList("Preference");
      },
      (error) => {
        console.error(error);
      }
    );
  }

  async getEbookList(type) {
    const getData = Env.get(
      this.props.envendpoint +
        `get/paidebooklist?page=${this.state.activePage}&filters[category_id][]=${this.props.preferences.id}&type=my_ebooks`
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
          });
        }, 1500);
      },
      (error) => {
        CommonService.hendleError(error, this.props, "main");
      }
    );
  }

  handleRefresh = () => {
    this.getEbookList("preference");
  };

  loadMore = () => {
    this.setState(
      (prev) => {
        return { activePage: prev.activePage + 1 };
      },
      () => this.getEbookList("paginate")
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
                <Breadcrumb items={[{ title: "My E-books" }]} />
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
                                          ) + item.noteable.course.course_image
                                        }
                                      />
                                    </div>
                                    <div className="feed-card-title">
                                      <a
                                        href={`course-details/${item.noteable.course_id}`}
                                      >
                                        {item.noteable.course.title}{" "}
                                        <RightOutlined className="right-arrow-icon" />
                                      </a>
                                    </div>
                                    <div className="feed-card-publish">
                                      {CommonService.getPostedTime(
                                        item.noteable.published_at
                                      )}
                                      &bull; {item.noteable_type}
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
                                      onClick={() =>
                                        this.props.navigate(
                                          `/course-details/${item.noteable.course_id}/ebook/${item.noteable.id}`
                                        )
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
                                            minHeight: "350px",
                                            height: "350px",
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
                                          minHeight: "350px",
                                          height: "350px",
                                        }}
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
                                              "course/" +
                                              item.noteable_type
                                          ) + item.noteable.article_image
                                        }
                                        className="my-notest article-feed-image"
                                      />
                                    </div>
                                  )}
                                </div>
                              }
                            >
                              <div className="feed-card-cover-content">
                                <div className="feed-card-cover-inner-content">
                                  {item.noteable.title}
                                </div>
                                <div className="feed-card-action-values">
                                  <div className="feed-card-action-columns">
                                    <span className="feed-card-action-text">
                                      {item.noteable_type === "quiz"
                                        ? CommonService.convertIntoKiloPrefix(
                                            item.quiz_records_count
                                          )
                                        : CommonService.convertIntoKiloPrefix(
                                            item.noteable.total_views
                                          )}{" "}
                                    </span>
                                    {item.noteable_type === "quiz"
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
                              <Divider className="feed-card-divider" />
                              <div className="feed-card-footer-content">
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
                                      {" "}
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
                                        alt="comment"
                                        src={comment}
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
                                      {" "}
                                      <img
                                        src={share}
                                        alt="share"
                                        className="feed-card-footer-share-icon"
                                      />
                                      Share
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          )}
                        </div>
                      </Col>
                    ))}
                  </Row>
                </InfiniteScroll>
              ) : (
                this.state.activeLoader === true && (
                  <Skeletons type={"mynotes"} />
                )
              )}

              {this.state.activePage > 1 && <FloatButton.BackTop />}

              {this.state.activeLoader === false &&
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
})(Ebooks);
