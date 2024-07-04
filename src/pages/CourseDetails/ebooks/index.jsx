import React, { Component } from "react";
import Env from "../../../utilities/services/Env";
import { Row, Col, Card, Spin, Button, FloatButton } from "antd";
import validity_calendar from "../../../assets/svg-images/calendar-icon.svg";
import language_image from "../../../assets/svg-images/language-icon.svg";
import likes from "../../../assets/svg-images/like-icon.svg";
import views from "../../../assets/svg-images/attempted-icon.svg";
import NoRecords from "../../../components/NoRecords";
import CourseModulesMenu from "../../../components/CourseModulesMenu";
import { CommonService } from "../../../utilities/services/Common";
import { connect } from "react-redux";
import "../../../assets/css/ebook.css";
import Skeletons from "../../../components/SkeletonsComponent";
import InfiniteScroll from "react-infinite-scroll-component";
import { analytics } from "../../../firebase-config";
import { logEvent } from "firebase/analytics";
import CCTitle from "../../../components/Antd/CCTitle";

class Ebooks extends Component {
  constructor() {
    super();
    this.state = {
      ebooks: [],
      activeLoader: true,
      totalRecords: 0,
      activePage: 1,
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.getEbookList("preference", this.props.extraParams);
    logEvent(analytics, "select_content", {
      page_title: "Ebook List",
    });
  }

  componentWillReceiveProps(props) {
    if (props.extraParams != null) {
      if (props.activeTabIndex.toString() === "6") {
        this.setState({ activeLoader: true, activePage: 1 }, () =>
          this.getEbookList("preference", props.extraParams)
        );
      }
    }
  }

  async getEbookList(type, extraParams) {
    const courseId = this.props.match.params.id;
    const getEbookData = Env.get(
      this.props.envendpoint +
        `ebooks?course_id=${courseId}&orderByFieldName=&sortOrder=&page=${
          this.state.activePage
        }${!extraParams ? " " : extraParams}`
    );
    await getEbookData.then(
      (response) => {
        const data = response.data.response.ebooks.data;
        this.setState({
          ebooks: type !== "paginate" ? data : this.state.ebooks.concat(data),
          activeLoader: false,
          totalRecords: response.data.response.ebooks.total,
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  loadMore = () => {
    if (this.props.activeTabIndex.toString() === "6") {
      this.setState(
        (prev) => {
          return { activePage: prev.activePage + 1 };
        },
        () => this.getEbookList("paginate", this.props.extraParams)
      );
    }
  };

  detailPageRedirection(props, type, item) {
    CommonService.contentRedirectionFunction(props, type, item);
  }

  render() {
    const { ebooks } = this.state;
    return (
      <div
        className="ebook-container"
        // style={{ height: this.state.ebooks.length !== 0 ? "auto" : "100vh" }}
        style={{
          height: "auto",
        }}
      >
        {this.state.ebooks.length !== 0 && (
          <InfiniteScroll
            dataLength={this.state.ebooks.length}
            next={this.loadMore}
            hasMore={this.state.ebooks.length < this.state.totalRecords}
            loader={<Skeletons type={"course"} />}
            scrollableTarget="scrollableDiv"
          >
            <Row className="row">
              {ebooks.map((item, index) => (
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  lg={8}
                  xl={8}
                  xxl={8}
                  key={index}
                  className="column"
                >
                  <div className="main-container">
                    <Card className="card">
                      <div className="card-content">
                        <div
                          onClick={() =>
                            this.detailPageRedirection(
                              this.props,
                              "Ebook",
                              item
                            )
                          }
                          className="image-container"
                        >
                          <div className="content">
                            <img
                              alt="ebook"
                              src={
                                Env.getImageUrl(
                                  `${this.props.envupdate.react_app_assets_url}course/ebook`
                                ) + item.image
                              }
                              className="image1"
                            />
                          </div>
                          <img
                            alt="ebook"
                            src={
                              Env.getImageUrl(
                                `${this.props.envupdate.react_app_assets_url}course/ebook`
                              ) + item.image
                            }
                            className="image2"
                          />
                        </div>
                        <div className="body-content">
                          <div className="inner-content">
                            <Row align="middle" className="nowrap-content">
                              <Col
                                xs={23}
                                sm={23}
                                md={23}
                                lg={23}
                                xl={23}
                                xxl={23}
                                className="column"
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
                                className="column"
                              >
                                <CourseModulesMenu
                                  {...this.props}
                                  type="ebook"
                                  id={item.id}
                                  is_favourite={item.is_favourite}
                                  course_id={item.course_id}
                                />
                              </Col>
                            </Row>
                          </div>
                          <div className="body-footer">
                            <Row className="nowrap-content">
                              <Col
                                xs={12}
                                sm={12}
                                md={6}
                                lg={12}
                                xl={7}
                                xxl={7}
                                className="column"
                              >
                                <img
                                  alt="language_image"
                                  src={language_image}
                                  className="language-image"
                                />
                                <span className="image-label">English</span>
                              </Col>
                              <Col
                                xs={12}
                                sm={12}
                                md={6}
                                lg={12}
                                xl={5}
                                xxl={5}
                                className="column"
                              >
                                <img
                                  src={likes}
                                  alt="likes"
                                  className="like-image"
                                />
                                <span className="image-label">
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
                                className="column"
                              >
                                <img
                                  src={views}
                                  alt="views"
                                  className="view-image"
                                />
                                <span className="image-label">
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
                                className="column"
                              >
                                <img
                                  alt="validity_calendar"
                                  src={validity_calendar}
                                  className="calendar-image"
                                />
                                <span className="image-label">
                                  {CommonService.getDate(
                                    item.published_at,
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

                                  "Ebook",
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

        <div>
          {this.state.activeLoader ? (
            <Skeletons type={"course"} />
          ) : (
            ebooks.length === 0 && <NoRecords />
          )}
        </div>

        {this.state.activePage > 1 && <FloatButton.BackTop />}

        {this.props.active_Show_more && (
          <Spin size="large" className="feed-ads-spinner" />
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
})(Ebooks);
