import React, { Component } from "react";
import "../../assets/css/common.css";
import {
  Layout,
  Row,
  Col,
  Button,
  Carousel,
  Card,
  Avatar,
  Divider,
  FloatButton,
  Typography,
  List,
} from "antd";
import AppSidebar from "../../components/layouts/AppSidebar";
import pinicon from "../../assets/svg-icons/pin-icon.svg";
import Env from "../../utilities/services/Env";
import playstore_icon from "../../assets/images/playstore_icon.svg";
import ad_image from "../../assets/images/For-support-banner-FINAL.jpg";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import start_banner from "../../assets/svg-images/quiz-start-new.svg";
import resume_banner from "../../assets/svg-images/quiz-resume-new.svg";
import solution_banner from "../../assets/svg-images/quiz-solution-new.svg";
import CourseModulesMenu from "../../components/CourseModulesMenu";
import QuizSharePopup from "../../components/QuizSharePopup";
import { CommonService } from "../../utilities/services/Common";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  currentPageRouting,
  currentTabIndex,
  disablePreference,
  quizReattempt,
  quizResume,
  quizSolution,
  quizStart,
  quizStartTimer,
  setActiveMenu,
  userLogOut,
} from "../../reducers/action";
import { connect } from "react-redux";
import GeneralPopup from "../../components/GeneralPopup";
import "../../assets/css/home-feed.css";
import { toast } from "react-toastify";
import $ from "jquery";
import Skeletons from "../../components/SkeletonsComponent";
import { analytics } from "../../firebase-config";
import { logEvent } from "firebase/analytics";
import StorageConfiguration from "../../utilities/services/StorageConfiguration";

const { Text } = Typography;

const { Content } = Layout;
const MAX_ITEMS = 3;
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 1,
      banners: [],
      bannerDuration: 0,
      totalBanners: 0,
      feedData: [],
      totalFeed: 0,
      activeLoader: true,
      activePage: 1,
      catergoryId: props.preferences.id,
      featuredCourses: [],
      announcement: [],
      showAnnouncement: false,
      end_record: null,
      CarouselLoader: true,
      IsNotify: false,
    };
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.carousel = React.createRef();
    this.handleContents = this.handleContents.bind(this);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.props.dispatch(disablePreference(false));
    this.props.dispatch(setActiveMenu(null));
    this.props.dispatch(currentTabIndex(null));
    this.props.dispatch(
      currentPageRouting({ path: "/home-feed", selectedKeys: "1" })
    );
    this.props.preferences.id && this.getBannerFeeds();
    this.getUserFeeds("preference");
    this.getFeaturedCourse();
    this.getAnnouncement();
    logEvent(analytics, "select_content", {
      page_title: "Home Feed",
    });
  }

  componentWillReceiveProps(newProps) {
    if (
      newProps.preferences.id &&
      newProps.preferences.id !== this.props.preferences.id
    ) {
      this.setState(
        { catergoryId: newProps.preferences.id, activePage: 1 },
        () => {
          this.getBannerFeeds();
          this.getUserFeeds("preference");
          this.getFeaturedCourse();
        }
      );
    }
  }

  urlDecode(url) {
    return url.replace("watch?v=", "embed/");
  }

  next() {
    this.carousel.next();
  }

  previous() {
    this.carousel.prev();
  }

  getBannerFeeds() {
    const getData = Env.get(
      this.props.envendpoint +
        `preference_banners_new?category_id=${this.state.catergoryId}&logged_in_type=web`
    );
    getData.then(
      (response) => {
        const data = response.data.response.banners.data;
        this.setState({
          CarouselLoader: false,
          banners: data,
          totalBanners: response.data.response.banners.total,
          bannerDuration: parseInt(
            response.data.response.banners.bannerDuration
          ),
          currentIndex: 1,
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  async getUserFeeds(type) {
    const getData = Env.get(
      this.props.envendpoint +
        `homefeedsweb?appversion_status=1.34&device_id=91f8007b01fbbb89&page=${this.state.activePage}&filters[category_id][]=${this.state.catergoryId}`
    );
    await getData.then(
      (response) => {
        const data = response.data.response?.feeds.data;
        this.setState({
          feedData:
            type !== "paginate" ? data : this.state.feedData.concat(data),
          totalFeed: response.data.response?.feeds.total,
          activeLoader: false,
          end_record: response.data.response?.feeds.to,
        });
      },
      (error) => {
        if (error.response !== undefined && error.response.status === 401) {
          this.props.dispatch(userLogOut(undefined));
          StorageConfiguration.sessionRemoveAllItem();
          sessionStorage.clear();
          this.props.navigate("/login");
          toast("Logged out successfully ");
        }
        console.error(error);
      }
    );
  }

  getFeaturedCourse() {
    const getData = Env.get(
      this.props.envendpoint +
        `allcourses?filters[is_featured]=1&page=1&filters[category_id][]=${this.state.catergoryId}&logged_in_type=web`
    );
    getData.then(
      (response) => {
        const data = response.data.response.courses.data;
        this.setState({ featuredCourses: data });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getAnnouncement() {
    const getData = Env.get(
      this.props.envendpoint + `notifications/user/count`
    );
    getData.then(
      (response) => {
        const data = response.data.response;
        const arr = data.notify_data.split("\n");
        this.setState({ IsNotify: data.notify === "1", announcement: arr });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  handletoggle = (showAnnouncement) => {
    this.setState({ showAnnouncement: !showAnnouncement });
  };

  handleContents(e, data) {
    e.preventDefault();
    this.props.dispatch(quizStartTimer(false));
    this.props.dispatch(quizSolution(false));
    this.props.dispatch(quizResume(false));
    this.props.dispatch(quizStart(false));
    this.props.dispatch(quizReattempt(false, ""));
    let parent_window = {};
    switch (data.item_type) {
      case "quiz":
        if (data.is_attempted === 2) {
          this.props.dispatch(quizResume(true));
          parent_window = window.open(
            `${process.env.PUBLIC_URL}/course-details/${data.course_id}/quiz/${data.id}`,
            "_blank",
            `toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=${window.screen.width},height=${window.screen.height}`
          );
          parent_window.focus();
          parent_window.addEventListener(
            "unload",
            function (event) {
              if (parent_window.closed) {
                this.setState({ activeLoader: true });
                this.getUserFeeds("preference");
              }
              $("#root").toggle();
            }.bind(this)
          );
        } else if (data.is_attempted === 1) {
          if (e.currentTarget.innerText.toLowerCase() === "solution") {
            this.props.dispatch(quizSolution(true));
            this.props.navigate(
              `/course-details/${data.course_id}/quiz/${data.id}`
            );
          } else {
            this.props.navigate(
              `/course-details/${data.course_id}/quiz/${data.id}/result`
            );
          }
        } else {
          this.props.dispatch(quizStart(true));
          parent_window = window.open(
            `${process.env.PUBLIC_URL}/course-details/${data.course_id}/quiz/${data.id}`,
            "_blank",
            `toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=${window.screen.width},height=${window.screen.height}`
          );
          parent_window.focus();
          parent_window.addEventListener(
            "unload",
            function (event) {
              if (parent_window.closed) {
                this.setState({ activeLoader: true });
                this.getUserFeeds("preference");
              }
              $("#root").toggle();
            }.bind(this)
          );
        }
        break;
      case "article":
        this.props.navigate(
          `/course-details/${data.course_id}/article/${data.id}`
        );
        break;
      case "ebook":
        this.props.navigate(
          `/course-details/${data.course_id}/ebook/${data.id}`
        );
        break;
      case "video":
        this.props.navigate(
          `/course-details/${data.course_id}/video/${data.id}`
        );
        break;
      case "course":
        this.props.dispatch(quizSolution(false));
        this.props.dispatch(disablePreference(true));
        this.props.navigate(`/course-details/${data.course_id}`);
        break;
      default:
        break;
    }
  }

  handleBannerRedirection(e, data) {
    e.preventDefault();
    if (data.banner_type === 1) {
      this.props.navigate(`/course-details/${data.course_id}`);
    }
    if (data.banner_type === 3) {
      this.generalPopup.showModal(true, data.banner_content);
    }
  }

  getRenderedItems() {
    if (this.state.showAnnouncement) {
      return this.state.announcement;
    } else {
      return this.state.announcement.slice(0, MAX_ITEMS);
    }
  }

  loadMore = () => {
    this.setState(
      (prev) => {
        return { activePage: prev.activePage + 1 };
      },
      () => this.getUserFeeds("paginate")
    );
  };

  render() {
    return (
      <div>
        <Layout>
          <AppSidebar {...this.props} />
          <Layout>
            <Content>
              <div className="home-feed-content">
                <Row gutter={[60, 0]}>
                  <Col
                    xs={24}
                    sm={24}
                    md={24}
                    lg={18}
                    xl={18}
                    xxl={18}
                    className="home-feed-content-column-1"
                  >
                    <div className="feed-main-section">
                      <div className="carousel-container">
                        {this.state.currentIndex}/{this.state.totalBanners}
                      </div>
                      {!this.state.CarouselLoader && (
                        <div className="carousel-actions-container">
                          <div className="left-action">
                            <LeftOutlined
                              onClick={this.previous}
                              className="action-icon"
                            />
                          </div>
                          <div className="right-action">
                            <RightOutlined
                              onClick={this.next}
                              className="action-icon"
                            />
                          </div>
                        </div>
                      )}
                      {this.state.CarouselLoader ? (
                        <Skeletons type={"Carousel"} />
                      ) : (
                        <Carousel
                          autoplay={
                            this.state.banners.length > 0 ? true : false
                          }
                          dots={false}
                          ref={(node) => (this.carousel = node)}
                          afterChange={(e) =>
                            this.setState({ currentIndex: e + 1 })
                          }
                          autoplaySpeed={this.state.bannerDuration * 1000}
                        >
                          {this.state.banners.map((item, index) => (
                            <div
                              key={index}
                              onClick={(e) =>
                                this.handleBannerRedirection(e, item)
                              }
                            >
                              <div className="carousel-image-container">
                                <img
                                  src={
                                    Env.getImageUrl(
                                      this.props.envupdate
                                        .react_app_assets_url + "banner"
                                    ) + item.banner_image
                                  }
                                  alt="banner_image"
                                  className="carousel-image"
                                />
                              </div>
                            </div>
                          ))}
                        </Carousel>
                      )}
                    </div>
                    {this.state.IsNotify && (
                      <div className="feed-announcement">
                        <Card className="announc-cards">
                          <div className="feed-card-inner-content">
                            {this.getRenderedItems().map((item, index) => (
                              <div key={index}>
                                {item}
                                <br />
                              </div>
                            ))}
                            {this.state.announcement?.length > MAX_ITEMS && (
                              <Text
                                className="ant-breadcrumb-link"
                                onClick={() =>
                                  this.handletoggle(this.state.showAnnouncement)
                                }
                              >
                                Read&nbsp;
                                {this.state.showAnnouncement ? "less" : "more"}
                              </Text>
                            )}
                          </div>
                        </Card>
                      </div>
                    )}
                    {this.state.feedData?.length > 0 ? (
                      <InfiniteScroll
                        dataLength={this.state.feedData.length}
                        next={this.loadMore}
                        hasMore={
                          this.state.feedData.length < this.state.totalFeed
                        }
                        loader={<Skeletons type={"home"} />}
                        scrollableTarget="scrollableDiv"
                      >
                        <div className="feed-section">
                          {this.state.feedData.map((item, index) => (
                            <Card
                              key={index}
                              className="feed-cards"
                              title={
                                <div className="feed-card-content">
                                  <div className="feed-card-inner-content">
                                    <div className="feed-card-avatar">
                                      <Avatar
                                        size={50}
                                        src={
                                          Env.getImageUrl(
                                            this.props.envupdate
                                              .react_app_assets_url + "course"
                                          ) + item.course_image_image
                                        }
                                      />
                                    </div>
                                    <div
                                      className="feed-card-title"
                                      style={{ cursor: "context-menu" }}
                                    >
                                      <a
                                        href={`course-details/${item.course_id}`}
                                      >
                                        {item.group}{" "}
                                        <RightOutlined className="right-arrow-icon" />
                                      </a>
                                    </div>
                                    <div className="feed-card-publish">
                                      {CommonService.getPostedTime(
                                        item.published_at
                                      )}{" "}
                                      &bull; {item.item_type}
                                      {item.is_pin === 1 && (
                                        <span style={{ padding: "0px 12px" }}>
                                          <img
                                            src={pinicon}
                                            alt="pinicon"
                                            style={{
                                              width: "17px",
                                            }}
                                          />
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <CourseModulesMenu
                                      {...this.props}
                                      homeFeed
                                      type={item.item_type}
                                      id={item.id}
                                      course_id={item.course_id}
                                      is_favourite={item.is_favourite}
                                    />
                                  </div>
                                </div>
                              }
                              cover={
                                <div className="feed-card-body">
                                  {item.item_type === "ebook" ? (
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
                                                item.item_type
                                            ) + item.item_image
                                          }
                                          className="ebook-image"
                                        />
                                      </div>
                                      <img
                                        alt="example"
                                        src={
                                          Env.getImageUrl(
                                            this.props.envupdate
                                              .react_app_assets_url +
                                              "course/" +
                                              item.item_type
                                          ) + item.item_image
                                        }
                                        className="ebook-cover-image"
                                      />
                                    </div>
                                  ) : item.item_type === "video" ? (
                                    <div
                                      onClick={(e) =>
                                        this.handleContents(e, item)
                                      }
                                    >
                                      <iframe
                                        title="video"
                                        frameborder="0"
                                        src={this.urlDecode(item.item_image)}
                                        className="video-iframe"
                                      ></iframe>
                                      <div className="video-iframe-overlay"></div>
                                    </div>
                                  ) : item.item_type === "quiz" ? (
                                    <div
                                      className={
                                        item.is_attempted === 0
                                          ? "start-quiz-content"
                                          : item.is_attempted === 1
                                          ? "solution-quiz-content"
                                          : "resume-quiz-content"
                                      }
                                    >
                                      <div>
                                        <img
                                          alt="example"
                                          src={
                                            item.is_attempted === 0
                                              ? start_banner
                                              : item.is_attempted === 1
                                              ? solution_banner
                                              : resume_banner
                                          }
                                          className="feeds-card-quiz-image"
                                        />
                                      </div>
                                      <div
                                        className={
                                          item.is_attempted === 0
                                            ? "quiz-start-text"
                                            : item.is_attempted === 1
                                            ? "quiz-solution-text"
                                            : "quiz-resume-text"
                                        }
                                      >
                                        {item.question_count} - Questions :{" "}
                                        {item.quiz_duration / 60} mins
                                      </div>
                                      <div>
                                        {item.is_attempted !== 1 ? (
                                          <Button
                                            onClick={(e) =>
                                              this.handleContents(e, item)
                                            }
                                            className={
                                              item.is_attempted === 0
                                                ? "start-quiz-button"
                                                : "resume-quiz-button"
                                            }
                                          >
                                            {item.is_attempted === 0
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
                                  ) : item.item_type === "mock_test" ? (
                                    <div
                                      className={
                                        item.is_attempted === 1
                                          ? item.is_attempted === 2
                                            ? "all-courses-card-image-attempt-resume"
                                            : "all-courses-card-image-attempt-solution"
                                          : item.is_attempted === 2
                                          ? "all-courses-card-image-attempt-resume"
                                          : "all-courses-card-image-attempt-start"
                                      }
                                    >
                                      {item.is_attempted === 0 && (
                                        <div
                                          onClick={(e) =>
                                            this.triggedMockButton(
                                              e,
                                              "start",
                                              item.id
                                            )
                                          }
                                        >
                                          <img alt="start" src={start_banner} />
                                          <div className="all-courses-card-image-attempt-content">
                                            <span className="quiz-start-content-text">
                                              {CommonService.getMockCountandtime(
                                                item
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                      {item.is_attempted === 1 && (
                                        <div>
                                          <img
                                            alt="solution_banner"
                                            src={solution_banner}
                                          />
                                          <div className="all-courses-card-image-attempt-content">
                                            <span className="quiz-attempted-content-text">
                                              {CommonService.getMockCountandtime(
                                                item
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                      {item.is_attempted === 2 && (
                                        <div
                                          onClick={(e) =>
                                            this.triggedMockButton(
                                              e,
                                              "resume",
                                              item.id
                                            )
                                          }
                                        >
                                          <img
                                            alt="resume"
                                            src={resume_banner}
                                          />
                                          <div className="all-courses-card-image-attempt-content">
                                            <span className="quiz-resume-content-text">
                                              {CommonService.getMockCountandtime(
                                                item
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : item.item_type === "article" ? (
                                    <div
                                      onClick={(e) =>
                                        this.handleContents(e, item)
                                      }
                                    >
                                      <img
                                        alt="article"
                                        src={
                                          Env.getImageUrl(
                                            this.props.envupdate
                                              .react_app_assets_url +
                                              "course/" +
                                              item.item_type
                                          ) + item.item_image
                                        }
                                        className="article-feed-image"
                                      />
                                    </div>
                                  ) : (
                                    <div
                                      onClick={(e) =>
                                        this.handleContents(e, item)
                                      }
                                    >
                                      <img
                                        alt="article"
                                        src={
                                          Env.getImageUrl(
                                            this.props.envupdate
                                              .react_app_assets_url +
                                              item.item_type
                                          ) + item.item_image
                                        }
                                        className="article-feed-image"
                                      />
                                    </div>
                                  )}
                                </div>
                              }
                            >
                              {item.item_type === "mock_test" ? (
                                <div>
                                  <div className="feed-card-cover-content">
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <div className="feed-card-cover-inner-content">
                                        {item.title}
                                      </div>
                                      <div className="feed-card-action-columns">
                                        <span className="feed-card-action-text">
                                          {item.item_type === "quiz"
                                            ? CommonService.convertIntoKiloPrefix(
                                                item.quiz_records_count
                                              )
                                            : CommonService.convertIntoKiloPrefix(
                                                item.total_views
                                              )}{" "}
                                        </span>
                                        {item.item_type === "quiz"
                                          ? "Attempts"
                                          : "Views"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="feed-card-cover-content">
                                  <div className="feed-card-cover-inner-content">
                                    {item.title}
                                  </div>
                                  <Divider className="feed-card-divider" />
                                  <div className="feed-card-action-values">
                                    <div className="feed-card-action-columns">
                                      <span className="feed-card-action-text">
                                        {item.item_type === "quiz"
                                          ? CommonService.convertIntoKiloPrefix(
                                              item.quiz_records_count
                                            )
                                          : CommonService.convertIntoKiloPrefix(
                                              item.total_views
                                            )}{" "}
                                      </span>
                                      {item.item_type === "quiz"
                                        ? "Attempts"
                                        : "Views"}
                                    </div>
                                    <div className="feed-card-action-columns">
                                      <span className="feed-card-action-text">
                                        {CommonService.convertIntoKiloPrefix(
                                          item.total_votes
                                        )}{" "}
                                      </span>
                                      Likes
                                    </div>
                                    <div className="feed-card-action-columns">
                                      <span className="feed-card-action-text">
                                        {CommonService.convertIntoKiloPrefix(
                                          item.total_comments
                                        )}{" "}
                                      </span>
                                      Comments
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      </InfiniteScroll>
                    ) : (
                      <Skeletons type={"home"} />
                    )}
                    {this.state.feedData?.length === 0 &&
                      !this.state.activeLoader && (
                        <div
                          style={{
                            minHeight: "600px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "500",
                              fontSize: "20px",
                            }}
                          >
                            No Feeds Found.
                          </span>
                        </div>
                      )}

                    {this.state.activePage > 1 && <FloatButton.BackTop />}

                    <div>
                      {this.state.activeLoader === true &&
                        this.state.feedData.length !== 0 && (
                          <Skeletons type={"home"} />
                        )}
                    </div>
                  </Col>
                  <Col
                    className="feed-ads-block"
                    xs={6}
                    sm={6}
                    md={6}
                    lg={6}
                    xl={6}
                    xxl={6}
                  >
                    <div className="feed-ads-container">
                      <div className="feed-ads-inner-content">
                        <Button
                          href={this.props.envupdate.play_store_url}
                          target="_blank"
                          icon={
                            <img
                              src={playstore_icon}
                              alt="playstore_icon"
                              className="feed-playstore-icon-1"
                            />
                          }
                          type="primary"
                          className="feed-google-pay-button"
                        >
                          Google Play
                        </Button>
                      </div>
                      <div className="feed-ads-text-content">
                        <span className="feed-ads-link">
                          Download the CareersCloud Exam Preparation
                        </span>
                      </div>
                    </div>
                    <div className="feed-ads-box">
                      <img
                        src={
                          this.props.banner_update.support_banner
                            ? `${this.props.envupdate.react_app_assets_url}banner/images/` +
                              this.props.banner_update.support_banner
                            : ad_image
                        }
                        alt="support"
                        className="feed-ads-image"
                      />
                    </div>
                    <div className="feed-ads-list-content">
                      <List
                        className="feed-ads-list"
                        size="large"
                        header={null}
                        footer={null}
                        bordered
                        dataSource={this.state.featuredCourses}
                        renderItem={(item) => (
                          <List.Item style={{ cursor: "pointer" }}>
                            <RightOutlined className="feed-ads-list-icon" />
                            <a
                              href={`/course-details/${item.id}`}
                              className="feed-ads-list-title"
                            >
                              {item.title}
                            </a>
                          </List.Item>
                        )}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
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
            </Content>
          </Layout>
        </Layout>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    preferences: state.preferences,
    envupdate: state.envupdate,
    envendpoint: state.envendpoint,
    profile_update: state.profile_update,
    banner_update: state.banner_update,
  };
})(Home);
