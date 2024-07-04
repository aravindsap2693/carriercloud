import React, { Component } from "react";
import { Row, Col, Card, Button, FloatButton } from "antd";
import "../../../assets/css/video.css";
import language_image from "../../../assets/svg-images/language-icon.svg";
import validity_calendar from "../../../assets/svg-images/calendar-icon.svg";
import likes from "../../../assets/svg-images/like-icon.svg";
import views from "../../../assets/svg-images/attempted-icon.svg";
import Env from "../../../utilities/services/Env";
import NoRecords from "../../../components/NoRecords";
import CourseModulesMenu from "../../../components/CourseModulesMenu";
import moment from "moment";
import { CommonService } from "../../../utilities/services/Common";
import InfiniteScroll from "react-infinite-scroll-component";
import Skeletons from "../../../components/SkeletonsComponent";
import { analytics } from "../../../firebase-config";
import { logEvent } from "firebase/analytics";
import CCTitle from "../../../components/Antd/CCTitle";

class Videos extends Component {
  constructor() {
    super();
    this.state = {
      videos: [],
      activeLoader: true,
      activePage: 1,
      totalRecords: 0,
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.getVideoList("preference", this.props.extraParams);
    logEvent(analytics, "select_content", {
      page_title: "Videos List",
    });
  }

  loadMore = () => {
    if (this.props.activeTabIndex.toString() === "4") {
      this.setState(
        (prev) => {
          return { activePage: prev.activePage + 1 };
        },
        () => this.getVideoList("paginate", this.props.extraParams)
      );
    }
  };

  componentWillReceiveProps(props) {
    if (props.extraParams != null) {
      if (props.activeTabIndex.toString() === "4") {
        this.setState({ activeLoader: true, activePage: 1 }, () =>
          this.getVideoList("preference", props.extraParams)
        );
      }
    }
  }

  async getVideoList(type, ext) {
    const courseId = this.props.match.params.id;
    const getVideoData = Env.get(
      this.props.envendpoint +
        `videos?course_id=${courseId}&orderByFieldName=&sortOrder=&page=${
          this.state.activePage
        }${!ext ? "" : ext}`
    );
    await getVideoData.then(
      (response) => {
        const data = response.data.response.videos.data;
        this.setState({
          videos: type !== "paginate" ? data : this.state.videos.concat(data),
          activeLoader: false,
          totalRecords: response.data.response.videos.total,
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  detailPageRedirection(props, type, item) {
    CommonService.contentRedirectionFunction(props, type, item);
  }

  urlDecode(url) {
    return url.replace("watch?v=", "embed/");
  }

  render() {
    const { videos } = this.state;
    return (
      <div
        className="video-container"
        style={{
          height: "auto",
        }}
      >
        {this.state.videos.length !== 0 && (
          <InfiniteScroll
            dataLength={this.state.videos.length}
            next={this.loadMore}
            hasMore={this.state.videos.length < this.state.totalRecords}
            loader={<Skeletons type={"course"} />}
            scrollableTarget="scrollableDiv"
          >
            <Row gutter={[20, 20]} className="video-container-row">
              {videos.map((item, index) => (
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  lg={8}
                  xl={8}
                  xxl={8}
                  key={index}
                  className="video-container-column"
                >
                  <div className="video-content">
                    <Card className="video-card">
                      <div className="video-card-content">
                        <div className="video-card-inner-content">
                          <span
                            onClick={() =>
                              this.detailPageRedirection(
                                this.props,
                                
                                "Video",
                                item
                              )
                            }
                            className="video-iframe-span"
                          >
                            <iframe
                              src={this.urlDecode(item.video_url)}
                              frameborder="0"
                              title="video"
                              className="video-iframe"
                            />
                            <div className="video-overlay"></div>
                          </span>
                        </div>
                        <div className="video-body-content">
                          <div className="video-body-inner-content">
                            <Row className="video-body-content-row">
                              <Col
                                xs={23}
                                sm={23}
                                md={23}
                                lg={23}
                                xl={23}
                                xxl={23}
                                className="video-title-column"
                              >
                                <CCTitle
                                  title={item.title}
                                  is_pin={item.is_pin}
                                />
                              </Col>
                              <Col
                                xs={1}
                                sm={1}
                                md={1}
                                lg={1}
                                xl={1}
                                xxl={1}
                                className="video-menu-column"
                              >
                                <CourseModulesMenu
                                  {...this.props}
                                  type="video"
                                  id={item.id}
                                  course_id={item.course_id}
                                  is_favourite={item.is_favourite}
                                />
                              </Col>
                            </Row>
                          </div>
                          <div className="video-actions">
                            <Row className="video-actions-row">
                              <Col
                                xs={12}
                                sm={12}
                                md={6}
                                lg={12}
                                xl={7}
                                xxl={7}
                                className="video-language-column"
                              >
                                <img
                                  src={language_image}
                                  alt="language_image"
                                  className="video-language-image"
                                />
                                <span className="video-language-text">
                                  English
                                </span>
                              </Col>
                              <Col
                                xs={12}
                                sm={12}
                                md={6}
                                lg={12}
                                xl={5}
                                xxl={5}
                                className="video-votes-column"
                              >
                                <img
                                  src={likes}
                                  alt="likes"
                                  className="video-votes-image"
                                />
                                <span className="video-votes-value">
                                  {CommonService.convertIntoKiloPrefix(
                                    item.total_votes
                                  )}
                                </span>
                              </Col>
                              <Col
                                xs={12}
                                sm={12}
                                md={6}
                                lg={12}
                                xl={5}
                                xxl={5}
                                className="video-view-column"
                              >
                                <img
                                  src={views}
                                  alt="views"
                                  className="video-view-image"
                                />
                                <span className="video-view-value">
                                  {CommonService.convertIntoKiloPrefix(
                                    item.total_views
                                  )}
                                </span>
                              </Col>
                              <Col
                                xs={12}
                                sm={12}
                                md={6}
                                lg={12}
                                xl={7}
                                xxl={7}
                                className="video-valitity-column"
                              >
                                <img
                                  src={validity_calendar}
                                  alt="validity_calendar"
                                  className="video-calendar-image"
                                />
                                <span className="video-validity-date">
                                  {moment(item.published_at).format(
                                    "MMM DD YYYY"
                                  )}
                                </span>
                              </Col>
                            </Row>
                          </div>
                          <div>
                            <Button
                              block
                              type="ghost"
                              className="card-view-button"
                              onClick={() =>
                                this.detailPageRedirection(
                                 this.props,
                                
                                "Video",
                                item
                                )
                              }
                            >
                              VIEW {">"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </Col>
              ))}
            </Row>
          </InfiniteScroll>
        )}

        {this.state.activePage > 1 && <FloatButton.BackTop />}

        <div>
          {this.state.activeLoader === true ? (
            <Skeletons type={"course"} />
          ) : (
            videos.length === 0 && <NoRecords />
          )}
        </div>
      </div>
    );
  }
}

export default Videos;
