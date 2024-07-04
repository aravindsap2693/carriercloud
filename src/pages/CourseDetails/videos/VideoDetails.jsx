import React, { Component } from "react";
import { Spin, Typography, Card, Row, Col, Breadcrumb } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import article_author from "../../../assets/svg-icons/article-author.svg";
import like from "../../../assets/svg-icons/home-like.svg";
import liked from "../../../assets/svg-icons/home-liked.svg";
import chat from "../../../assets/svg-icons/chat.svg";
import view from "../../../assets/svg-icons/view.svg";
import share from "../../../assets/svg-icons/share.svg";
import QuizSharePopup from "../../../components/QuizSharePopup";
import ReactPlayer from "react-player/youtube";
import Env from "../../../utilities/services/Env";
import "../../../assets/css/video-detail.css";
import { currentPageRouting } from "../../../reducers/action";
import { connect } from "react-redux";
import { CommonService } from "../../../utilities/services/Common";
import { toast } from "react-toastify";
import CommentsComponent from "../../../components/courseActions/CommentsComponent";
import moment from "moment";
import $ from "jquery";
import { analytics } from "../../../firebase-config";
import { logEvent } from "firebase/analytics";
import RecentPost from "../../../components/RecentPost";

const { Text } = Typography;

class VideoDetails extends Component {
  constructor() {
    super();
    this.state = {
      descriptionShowMore: false,
      videos: [],
      activeLoader: true,
      isLiked: false,
      visible: 5,
      active_Show_more: false,
      recentevideos: [],
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.props.dispatch(currentPageRouting(null));
    this.getVideoDetails();
    this.getRecentVideos();
    logEvent(analytics, "select_content", {
      page_title: "Video Details",
    });
  }

  getVideoDetails = () => {
    const videoId = this.props.match.params.video_id;
    const getData = Env.get(this.props.envendpoint + `videos/${videoId}`);
    getData.then(
      (response) => {
        this.setState({
          videos: response.data.response.video,
          activeLoader: false,
          isLiked: response.data.response.video.is_upvote === 1,
        });
      },
      (error) => {
        CommonService.hendleError(error, this.props);
      }
    );
  };

  handleLike = (isLiked) => {
    let videos = this.state.videos;
    videos.total_votes = !isLiked
      ? videos.total_votes + 1
      : videos.total_votes - 1;
    this.setState({ isLiked: !this.state.isLiked, videos: videos });
    const videoId = this.props.match.params.video_id;
    const requestBody = {
      vote_type: "video",
      vote_type_id: videoId,
    };
    toast(isLiked ? "Liked !" : "Unliked !");
    const likeData = Env.post(this.props.envendpoint + `votes`, requestBody);
    likeData.then(
      (response) => {
        // this.getVideoDetails();
      },
      (error) => {
        console.error(error);
      }
    );
  };

  handleChatIcon = () => {
    $("html, body").animate({
      scrollTop: $("#comments-block").position().top,
    });
  };

  getRecentVideos() {
    const getData = Env.get(
      this.props.envendpoint +
        `video_get/recentvideo?course_id=${this.props.match.params.id}`
    );
    getData.then(
      (response) => {
        const data = response.data.response.video.data;
        this.setState({ recentevideos: data.slice(0, 5) });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  render() {
    return (
      <div className="video-detail-container">
        <div className="breadcrumb-container" style={{ marginTop: "20px" }}>
          <Breadcrumb
            className="breadcrumb"
            separator=""
            onClick={() => this.props.navigate(-1)}
            items={[
              {
                className: "link",
                type: "separator",
                separator: (
                  <ArrowLeftOutlined style={{ paddingRight: "5px" }} />
                ),
              },
              {
                title: "Back",
              },
            ]}
          />
        </div>

        <div>
          <Row className="row" gutter={[30, 30]}>
            <Col xs={24} sm={24} md={18} lg={18} xl={18} xxl={18}>
              <div className="main-layout">
                <div className="video-main-container">
                  {this.state.activeLoader === false ? (
                    <div className="video-inner-content">
                      <div className="title-container">
                        <div className="text">
                          <Text className="title">
                            {this.state.videos.title}
                          </Text>
                          <div
                            style={{ display: "flex", flexDirection: "row" }}
                          >
                            <div className="author">
                              <Text className="text">Senthil Kumar</Text>
                              <span className="image-span">
                                <img
                                  src={article_author}
                                  alt="article_author"
                                  className="image"
                                />
                              </span>
                              <span
                                className="text"
                                style={{ color: "#0B649D" }}
                              >
                                {moment(this.state.videos.published_at).format(
                                  "MMMM DD YYYY"
                                )}
                              </span>
                            </div>
                            <div style={{ flex: 1, textAlign: "end" }}>
                              <div className="actionbar">
                                <div className="actionbar-icons">
                                  {!this.state.isLiked ? (
                                    <img
                                      src={like}
                                      onClick={() =>
                                        this.handleLike(this.state.isLiked)
                                      }
                                      className="unlike"
                                      alt="like"
                                    />
                                  ) : (
                                    <img
                                      src={liked}
                                      onClick={() =>
                                        this.handleLike(this.state.isLiked)
                                      }
                                      className="liked"
                                      alt="like"
                                    />
                                  )}
                                  <span
                                    className="value"
                                    style={{ padding: "0px 10px" }}
                                  >
                                    {this.state.videos.total_votes}
                                  </span>
                                </div>
                                <div className="actionbar-icons">
                                  <img
                                    src={chat}
                                    className="chat"
                                    id="comments-icon"
                                    alt="chat"
                                    onClick={() => this.handleChatIcon()}
                                  />
                                  <span
                                    className="value"
                                    style={{ padding: "0px 10px" }}
                                  >
                                    {CommonService.convertIntoKiloPrefix(
                                      this.state.videos.total_comments
                                    )}
                                  </span>
                                </div>
                                <div className="actionbar-icons">
                                  <img src={view} alt="view" className="eye" />
                                  <span
                                    className="value"
                                    style={{ padding: "0px 10px" }}
                                  >
                                    {CommonService.convertIntoKiloPrefix(
                                      this.state.videos.total_views
                                    )}
                                  </span>
                                </div>
                                <div className="actionbar-icons">
                                  <img
                                    className="share"
                                    src={share}
                                    onClick={() =>
                                      this.quizSharePopup.showModal()
                                    }
                                    alt="share"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="video-container">
                        <ReactPlayer
                          url={this.state.videos.video_url}
                          className="video-player"
                          controls={true}
                          playing={true}
                          playIcon={false}
                          width="100%"
                        />
                      </div>

                      <Card className="card" title="Description">
                        <div className="content">
                          <span className="description">
                            {this.state.videos.description}
                          </span>
                        </div>
                      </Card>
                    </div>
                  ) : (
                    <Spin className="app-spinner" size="large" />
                  )}

                  <QuizSharePopup
                    ref={(instance) => {
                      this.quizSharePopup = instance;
                    }}
                  />
                </div>
              </div>
              <div className="main-layout">
                <Row style={{ textAlign: "center", alignItems: "center" }}>
                  <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={8}>
                    <div
                      onClick={() => this.handleLike(this.state.isLiked)}
                      style={{
                        // width: "50%",
                        cursor: "pointer",
                        margin: "auto",
                      }}
                    >
                      {this.state.isLiked === false ? (
                        <img
                          src={like}
                          alt="like"
                          className="unlike"
                          style={{ width: "30px" }}
                        />
                      ) : (
                        <img
                          alt="like"
                          src={liked}
                          className="like"
                          style={{ width: "30px" }}
                        />
                      )}
                      <span
                        className="value"
                        style={{
                          padding: "20px",
                          color: "#0B649D",
                          position: "relative",
                          top: "3px",
                          fontWeight: 600,
                        }}
                      >
                        Like ({this.state.videos.total_votes})
                      </span>
                    </div>
                  </Col>
                  <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={8}>
                    <div
                      style={{
                        // width: "50%",
                        cursor: "pointer",
                        margin: "auto",
                      }}
                    >
                      <img
                        src={chat}
                        alt="chat"
                        className="chat"
                        style={{ width: "30px" }}
                      />
                      <span
                        className="value"
                        style={{
                          padding: "20px",
                          color: "#0B649D",
                          position: "relative",
                          top: "3px",
                          fontWeight: 600,
                        }}
                      >
                        Comment ({this.state.videos.total_comments})
                      </span>
                    </div>
                  </Col>
                  <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={8}>
                    <div
                      onClick={() => this.quizSharePopup.showModal()}
                      style={{
                        // width: "50%",
                        cursor: "pointer",
                        margin: "auto",
                      }}
                    >
                      <img
                        className="share"
                        src={share}
                        alt="share"
                        onClick={() => this.quizSharePopup.showModal()}
                        style={{ width: "20px" }}
                      />
                      <span
                        className="value"
                        style={{
                          padding: "20px",
                          color: "#0B649D",
                          position: "relative",
                          top: "3px",
                          fontWeight: 600,
                        }}
                      >
                        Share
                      </span>
                    </div>
                  </Col>
                </Row>
              </div>

              <div id="comments-block">
                <CommentsComponent
                  types={"video"}
                  id={this.props.match.params.video_id}
                  image={this.state.videos.video_image}
                  open={this.state.visible}
                  active_Show_more={this.state.active_Show_more}
                  {...this.props}
                />
              </div>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={6}
              lg={6}
              xl={6}
              xxl={6}
              style={{ marginTop: "10px" }}
            >
              <RecentPost recentpost={this.state.recentevideos} type="video" />
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    current_course: state.current_course,
    envendpoint: state.envendpoint,
    profile_update: state.profile_update,
  };
})(VideoDetails);
