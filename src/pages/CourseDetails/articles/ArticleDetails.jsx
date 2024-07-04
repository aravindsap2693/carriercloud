import React, { Component } from "react";
import { Typography, Row, Col, Spin, Breadcrumb, FloatButton } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Env from "../../../utilities/services/Env";
import article_author from "../../../assets/svg-icons/article-author.svg";
import like from "../../../assets/svg-icons/home-like.svg";
import liked from "../../../assets/svg-icons/home-liked.svg";
import chat from "../../../assets/svg-icons/home-comment.svg";
import view from "../../../assets/svg-icons/view.svg";
import share from "../../../assets/svg-icons/share.svg";
import QuizSharePopup from "../../../components/QuizSharePopup";
import "../../../assets/css/article-detail.css";
import { connect } from "react-redux";
import { currentPageRouting } from "../../../reducers/action";
import { CommonService } from "../../../utilities/services/Common";
import moment from "moment";
import $ from "jquery";
import { toast } from "react-toastify";
import CommentsComponent from "../../../components/courseActions/CommentsComponent";
import { analytics } from "../../../firebase-config";
import { logEvent } from "firebase/analytics";
import RecentPost from "../../../components/RecentPost";

const { Text } = Typography;

class ArticleDetails extends Component {
  constructor() {
    super();
    this.state = {
      recentarticle: [],
      articles: [],
      articleContent: "",
      activeLoader: true,
      isLiked: false,
      visible: 5,
      active_Show_more: false,
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.props.dispatch(currentPageRouting(null));
    this.getArticleDetails();
    this.getRecentArticle();
    logEvent(analytics, "select_content", {
      page_title: "Article Details",
    });
  }

  componentDidUpdate() {
    var modal = document.getElementById("myModal");
    var modalImg = document.getElementById("img01");
    var captionText = document.getElementById("caption");
    $(function () {
      $(".article-iframe img").click(function () {
        modal.style.display = "block";
        modalImg.src = this.src;
        captionText.innerHTML = this.alt;
      });
      $(".article-iframe img").hover(function () {
        $(this).css("cursor", "pointer");
      });
      $("#myModal span").click(function () {
        modal.style.display = "none";
      });
      $(".article-iframe a").click(function () {
        $(this).attr("target", "_blank");
      });
    });
  }

  getArticleDetails() {
    const articleId = this.props.match.params.article_id;
    const getData = Env.get(this.props.envendpoint + `articles/${articleId}`);
    getData.then(
      (response) => {
        this.setState({
          articles: response.data.response.article,
          articleContent: response.data.response.article_url.replace(
            "view",
            "webview"
          ),
          activeLoader: false,
          isLiked: response.data.response.article.is_upvote === 1,
        });
      },
      (error) => {
        CommonService.hendleError(error, this.props);
      }
    );
  }

  handleLike = (isLiked) => {
    let articles = this.state.articles;
    articles.total_votes = !isLiked
      ? articles.total_votes + 1
      : articles.total_votes - 1;
    this.setState({ isLiked: !isLiked, articles: articles });
    const articleId = this.props.match.params.article_id;
    const requestBody = {
      vote_type: "article",
      vote_type_id: articleId,
    };
    toast(!isLiked ? "Liked !" : "Unliked !");
    const likeData = Env.post(this.props.envendpoint + `votes`, requestBody);
    likeData.then(
      (response) => {
        // toast(!isLiked ? "Liked !" : "Unliked !");
      },
      (error) => {
        console.error(error);
      }
    );
  };

  handleChatIcon = (e) => {
    $("html, body").animate({
      scrollTop: $("#comments-block").position().top,
    });
  };

  getRecentArticle() {
    const getData = Env.get(
      this.props.envendpoint +
        `article_get/recentarticles?course_id=${this.props.match.params.id}`
    );
    getData.then(
      (response) => {
        const data = response.data.response.articles.data;
        this.setState({ recentarticle: data.slice(0, 5) });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  render() {
    return (
      <div className="article-container">
        <div className="breadcrumb-container" style={{ marginTop: "20px" }}>
          <Breadcrumb
            className="link"
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
            style={{width:"80px"}}
          />
        </div>

        <div>
          <Row className="row" gutter={[30, 30]}>
            <Col xs={24} sm={24} md={18} lg={18} xl={18} xxl={18}>
              <div className="main-layout">
                <div className="inner-layout">
                  {this.state.activeLoader === false ? (
                    <div className="header">
                      <div className="title">
                        <Text className="text">
                          {this.state.articles.title}
                        </Text>
                        <div className="title-second-line">
                          <div className="author">
                            <Text className="text">Senthil Kumar</Text>
                            <span className="image-span">
                              <img
                                src={article_author}
                                alt="article_author"
                                className="image"
                              />
                            </span>
                            <span className="text" style={{ color: "#0B649D" }}>
                              {moment(this.state.articles.published_at).format(
                                "MMMM DD YYYY"
                              )}
                            </span>
                          </div>
                          <div style={{ flex: 1, textAlign: "end" }}>
                            <div className="actionbar">
                              <div className="actionbar-icons">
                                {!this.state.isLiked ? (
                                  <img
                                    alt="like"
                                    src={like}
                                    onClick={() =>
                                      this.handleLike(this.state.isLiked)
                                    }
                                    className="unlike"
                                  />
                                ) : (
                                  <img
                                    alt="liked"
                                    src={liked}
                                    onClick={() =>
                                      this.handleLike(this.state.isLiked)
                                    }
                                    className="like"
                                  />
                                )}
                                <span
                                  className="value"
                                  style={{ padding: "0px 10px" }}
                                >
                                  {this.state.articles.total_votes}
                                </span>
                              </div>
                              <div className="actionbar-icons">
                                <img
                                  alt="chat"
                                  src={chat}
                                  className="chat"
                                  id="comments-icon"
                                  onClick={() => this.handleChatIcon()}
                                />
                                <span
                                  className="value"
                                  style={{ padding: "0px 10px" }}
                                >
                                  {CommonService.convertIntoKiloPrefix(
                                    this.state.articles.total_comments
                                  )}
                                </span>
                              </div>
                              <div className="actionbar-icons">
                                <img alt="view" src={view} className="eye" />
                                <span
                                  className="value"
                                  style={{ padding: "0px 10px" }}
                                >
                                  {CommonService.convertIntoKiloPrefix(
                                    this.state.articles.total_views
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
                      <div className="banner">
                        <img
                          className="image"
                          src={
                            Env.getImageUrl(
                              `${this.props.envupdate.react_app_assets_url}course/article`
                            ) + this.state.articles.article_image
                          }
                          alt="article_image"
                        />
                      </div>

                      <div
                        className="article-iframe"
                        style={{ marginTop: "30px" }}
                        dangerouslySetInnerHTML={{
                          __html: this.state.articles.content,
                        }}
                      ></div>
                    </div>
                  ) : (
                    <Spin className="app-spinner" size="large" />
                  )}
                </div>

                <div id="myModal" className="modal">
                  <span className="close">&times;</span>
                  <img className="modal-content" id="img01" alt="content" />
                  <div id="caption"></div>
                </div>

                <QuizSharePopup
                  ref={(instance) => {
                    this.quizSharePopup = instance;
                  }}
                />
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
                      {!this.state.isLiked ? (
                        <img
                          src={like}
                          alt="unlike"
                          className="unlike"
                          style={{ width: "30px" }}
                        />
                      ) : (
                        <img
                          src={liked}
                          alt="liked"
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
                        Like ({this.state.articles.total_votes})
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
                        Comment ({this.state.articles.total_comments})
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
                        alt="share"
                        className="share"
                        src={share}
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
                  {...this.props}
                  types={"article"}
                  id={this.props.match.params.article_id}
                  image={this.state.articles.article_image}
                  visible={this.state.visible}
                  active_Show_more={this.state.active_Show_more}
                />
              </div>
              <FloatButton.BackTop />
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
              <RecentPost
                recentpost={this.state.recentarticle}
                type="article"
              />
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
    envupdate: state.envupdate,
    envendpoint: state.envendpoint,
    profile_update: state.profile_update,
    preferences: state.preferences,
  };
})(ArticleDetails);
