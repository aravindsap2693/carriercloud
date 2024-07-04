import React, { Component } from "react";
import {
  Button,
  Typography,
  Card,
  Row,
  Col,
  Spin,
  Breadcrumb,
  Divider,
  FloatButton,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import language_image from "../../../assets/svg-icons/course-language.svg";
import ebook_calendar from "../../../assets/svg-icons/ebook-calendar.svg";
import pdf_sample from "../../../assets/svg-icons/pdf-icon.svg";
import epub_sample from "../../../assets/images/epub-sample.png";
import Env from "../../../utilities/services/Env";
import $ from "jquery";
import "../../../assets/css/ebook-detail.css";
import { connect } from "react-redux";
import { currentPageRouting } from "../../../reducers/action";
import { CommonService } from "../../../utilities/services/Common";
import like from "../../../assets/svg-icons/home-like.svg";
import liked from "../../../assets/svg-icons/home-liked.svg";
import comment from "../../../assets/svg-icons/home-comment.svg";
import view from "../../../assets/svg-icons/view.svg";
import { toast } from "react-toastify";
import CommentsComponent from "../../../components/courseActions/CommentsComponent";
import QuizSharePopup from "../../../components/QuizSharePopup";
import chat from "../../../assets/svg-icons/home-comment.svg";
import share from "../../../assets/svg-icons/share.svg";
import { analytics } from "../../../firebase-config";
import { logEvent } from "firebase/analytics";
import RecentPost from "../../../components/RecentPost";

const { Text } = Typography;

class EbookDetails extends Component {
  constructor() {
    super();
    this.state = {
      descriptionShowMore: false,
      ebooks: [],
      activeLoader: true,
      isLiked: false,
      ebook_files: [],
      visible: 5,
      recentebook: [],
      active_Show_more: false,
    };
    this.myscroll = React.createRef();
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.props.dispatch(currentPageRouting(null));
    this.getEbookDetails();
    logEvent(analytics, "select_content", {
      page_title: "Ebook Details",
    });
  }

  handleLike = (isLiked) => {
    const ebookId = this.props.match.params.ebook_id;
    const requestBody = {
      vote_type: "ebook",
      vote_type_id: ebookId,
    };
    let ebooks = this.state.ebooks;
    ebooks.total_votes = !isLiked
      ? ebooks.total_votes + 1
      : ebooks.total_votes - 1;
    this.setState({ isLiked: !isLiked, ebooks: ebooks });

    toast(!isLiked ? "Liked !" : "Unliked !");
    const likeData = Env.post(this.props.envendpoint + `votes`, requestBody);
    likeData.then(
      (response) => {
        // toast(!isLiked ? "Liked !" : "Unliked !");
        // this.getEbookDetails();
      },
      (error) => {
        console.error(error);
      }
    );
  };

  async getEbookDetails() {
    const ebookId = this.props.match.params.ebook_id;
    const getData = Env.get(this.props.envendpoint + `ebooks/${ebookId}`);

    await getData.then(
      (response) => {
        this.setState({
          ebooks: response.data.response.ebook,
          activeLoader: false,
          ebook_files: response.data.response.ebook.files_ebook,
          isLiked: response.data.response.ebook.is_upvote === 1,
        });
        this.getRecentEbook();
      },
      (error) => {
        CommonService.hendleError(error, this.props);
      }
    );
  }

  handleChatIcon = () => {
    $("html, body").animate({
      scrollTop: $("#comments-block").position().top,
    });
  };

  getRecentEbook = () => {
    const getData = Env.get(
      this.props.envendpoint +
        `ebooks_get/recentebooks?course_id=${this.props.match.params.id}`
    );
    getData.then(
      (response) => {
        const data = response.data.response.ebooks.data;
        this.setState({ recentebook: data.slice(0, 5) });
      },
      (error) => {
        console.error(error);
      }
    );
  };

  render() {
    return (
      <div className="ebook-detail-container">
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
              <div className="content">
                {this.state.activeLoader === false ? (
                  <div className="inner-content">
                    <Card className="header-card">
                      <div className="content">
                        <div className="main">
                          <Row align="middle" className="row">
                            <Col
                              xs={24}
                              sm={24}
                              md={8}
                              lg={8}
                              xl={8}
                              xxl={6}
                              className="banner-column"
                            >
                              <img
                                className="image"
                                alt="ebooks"
                                src={
                                  Env.getImageUrl(
                                    `${this.props.envupdate.react_app_assets_url}course/ebook`
                                  ) + this.state.ebooks.image
                                }
                              />
                            </Col>
                            <Col
                              xs={24}
                              sm={24}
                              md={16}
                              lg={16}
                              xl={16}
                              xxl={18}
                              className="content-column"
                            >
                              <div className="title-content">
                                <Row className="row">
                                  <Text className="text">
                                    {this.state.ebooks.title}
                                  </Text>
                                </Row>
                                <div className="info">
                                  <Row className="row">
                                    <Col
                                      xs={12}
                                      sm={12}
                                      md={12}
                                      lg={12}
                                      xl={12}
                                      xxl={12}
                                      className="language-column"
                                    >
                                      <div className="content">
                                        <div className="image-container">
                                          <img
                                            src={language_image}
                                            alt="language"
                                            className="image"
                                          />
                                        </div>
                                        <div className="text-container">
                                          <div className="language">
                                            <Text
                                              strong
                                              className="language-text"
                                            >
                                              English
                                            </Text>
                                          </div>
                                          <div className="language">
                                            <Text className="language-label">
                                              Language
                                            </Text>
                                          </div>
                                        </div>
                                      </div>
                                    </Col>
                                    <Col
                                      xs={12}
                                      sm={12}
                                      md={12}
                                      lg={12}
                                      xl={12}
                                      xxl={12}
                                      className="date-column"
                                    >
                                      <div className="content">
                                        <div className="image-container">
                                          <img
                                            alt="ebook"
                                            src={ebook_calendar}
                                            className="image"
                                          />
                                        </div>
                                        <div className="date-container">
                                          <div className="date">
                                            <Text strong className="date-text">
                                              {CommonService.getDate(
                                                this.state.ebooks.created_at,
                                                "MMM DD YYYY"
                                              )}
                                            </Text>
                                          </div>
                                          <div className="date">
                                            <Text className="date-label">
                                              Date
                                            </Text>
                                          </div>
                                        </div>
                                      </div>
                                    </Col>
                                  </Row>
                                </div>
                                <div className="actions">
                                  <Row className="row">
                                    <Col
                                      xs={24}
                                      sm={24}
                                      md={24}
                                      lg={24}
                                      xl={24}
                                      xxl={24}
                                    >
                                      <div className="content">
                                        <span className="action-span">
                                          {!this.state.isLiked ? (
                                            <img
                                              src={like}
                                              onClick={() =>
                                                this.handleLike(
                                                  this.state.isLiked
                                                )
                                              }
                                              className="unlike"
                                              alt="like"
                                              style={{ padding: "0px 10px" }}
                                            />
                                          ) : (
                                            <img
                                              src={liked}
                                              onClick={() =>
                                                this.handleLike(
                                                  this.state.isLiked
                                                )
                                              }
                                              className="like"
                                              alt="liked"
                                              style={{ padding: "0px 10px" }}
                                            />
                                          )}
                                          {CommonService.convertIntoKiloPrefix(
                                            this.state.ebooks.total_votes
                                          )}{" "}
                                          <span className="action-text">
                                            Likes
                                          </span>
                                        </span>
                                        <span className="action-span">
                                          <img
                                            src={view}
                                            alt="view"
                                            className="feed-card-footer-comment-icon"
                                          />
                                          {CommonService.convertIntoKiloPrefix(
                                            this.state.ebooks.total_views
                                          )}{" "}
                                          <span className="action-text">
                                            Views
                                          </span>
                                        </span>
                                        <span className="action-span">
                                          <img
                                            alt="comment"
                                            src={comment}
                                            className="feed-card-footer-comment-icon"
                                            id="comments-icon"
                                            onClick={() =>
                                              this.handleChatIcon()
                                            }
                                          />
                                          {CommonService.convertIntoKiloPrefix(
                                            this.state.ebooks.total_comments
                                          )}{" "}
                                          <span className="action-text">
                                            Comments
                                          </span>
                                        </span>
                                      </div>
                                    </Col>
                                  </Row>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      </div>
                    </Card>

                    <Card className="get-card" title="PDF">
                      {this.state.ebook_files.map((item, index) => (
                        <Row align="middle" className="row" key={index}>
                          <Col
                            xs={12}
                            sm={12}
                            md={18}
                            lg={18}
                            xl={18}
                            xxl={18}
                            className="image-column"
                          >
                            {item.ebook_file_type === "epub" && (
                              <img
                                src={epub_sample}
                                alt="epub_sample"
                                className="image"
                              />
                            )}
                            {item.ebook_file_type !== "epub" && (
                              <img
                                src={pdf_sample}
                                alt="pdf_sample"
                                className="image"
                              />
                            )}
                            <span className="title-span">
                              {item.ebook_file_type === "epub"
                                ? `EPUB Version - ${
                                    this.state.ebook_files.length - index
                                  }`
                                : `PDF Version - ${
                                    this.state.ebook_files.length - index
                                  }`}
                            </span>
                          </Col>
                          <Col
                            xs={12}
                            sm={12}
                            md={6}
                            lg={6}
                            xl={6}
                            xxl={6}
                            className="button-column"
                          >
                            <Button
                              type="primary"
                              onClick={() => {
                                return window.open(
                                  Env.getImageUrl(
                                    `${this.props.envupdate.react_app_assets_url}course/ebook`
                                  ) + item.ebook_file_url,
                                  "_blank"
                                );
                              }}
                              className="button"
                            >
                              View
                            </Button>
                          </Col>
                          {this.state.ebooks.files_ebook[index + 1] && (
                            <Divider />
                          )}
                        </Row>
                      ))}
                    </Card>

                    <Card title="Description" className="description-card">
                      <Row align="middle" className="row">
                        <Col
                          xs={24}
                          sm={24}
                          md={24}
                          lg={24}
                          xl={24}
                          xxl={24}
                          className="column"
                        >
                          <div className="content">
                            <span className="text">
                              {this.state.ebooks.description}
                            </span>
                          </div>
                        </Col>
                      </Row>
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
              <div className="main-layout" style={{ cursor: "pointer" }}>
                <Row style={{ textAlign: "center", alignItems: "center" }}>
                  <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={8}>
                    {!this.state.isLiked ? (
                      <img
                        src={like}
                        alt="like"
                        onClick={() => this.handleLike(this.state.isLiked)}
                        className="unlike"
                        style={{ width: "30px" }}
                      />
                    ) : (
                      <img
                        src={liked}
                        alt="liked"
                        onClick={() => this.handleLike(this.state.isLiked)}
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
                        cursor: "pointer",
                      }}
                    >
                      Like ({this.state.ebooks.total_votes})
                    </span>
                  </Col>
                  <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={8}>
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
                        cursor: "pointer",
                      }}
                    >
                      Comment ({this.state.ebooks.total_comments})
                    </span>
                  </Col>
                  <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={8}>
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
                        cursor: "pointer",
                      }}
                    >
                      Share
                    </span>
                  </Col>
                </Row>
              </div>

              <div id="comments-block">
                <FloatButton.BackTop />
                <CommentsComponent
                  {...this.props}
                  types={"ebook"}
                  id={this.props.match.params.ebook_id}
                  image={this.state.ebooks.ebook_image}
                  visible={this.state.visible}
                  active_Show_more={this.state.active_Show_more}
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
              <RecentPost recentpost={this.state.recentebook} type="ebook" />
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
  };
})(EbookDetails);
