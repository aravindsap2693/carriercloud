import React, { Component } from "react";
import { Row, Col, Card, FloatButton, Button } from "antd";
import "../../../assets/css/article.css";
import validity_calendar from "../../../assets/svg-images/calendar-icon.svg";
import Env from "../../../utilities/services/Env";
import language_label from "../../../assets/svg-images/language-icon.svg";
import views from "../../../assets/svg-images/attempted-icon.svg";
import likes from "../../../assets/svg-images/like-icon.svg";
import NoRecords from "../../../components/NoRecords";
import CourseModulesMenu from "../../../components/CourseModulesMenu";
import { connect } from "react-redux";
import { CommonService } from "../../../utilities/services/Common";
import InfiniteScroll from "react-infinite-scroll-component";
import Skeletons from "../../../components/SkeletonsComponent";
import { analytics } from "../../../firebase-config";
import { logEvent } from "firebase/analytics";
import CCTitle from "../../../components/Antd/CCTitle";

class Articles extends Component {
  constructor() {
    super();
    this.state = {
      articles: [],
      activeLoader: true,
      activePage: 1,
      totalRecords: 0,
    };
  }

  loadMore = () => {
    if (this.props.activeTabIndex.toString() === "3") {
      this.setState(
        (prev) => {
          return { activePage: prev.activePage + 1 };
        },
        () => this.getArticleList("paginate", this.props.extraParams)
      );
    }
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    this.getArticleList("preference", this.props.extraParams);
    logEvent(analytics, "select_content", {
      page_title: "Articles list",
    });
  }

  componentWillReceiveProps(props) {
    if (props.extraParams != null) {
      if (props.activeTabIndex.toString() === "3") {
        this.setState({ activeLoader: true, activePage: 1 }, () =>
          this.getArticleList("preference", props.extraParams)
        );
      }
    }
  }

  async getArticleList(type, extraParams) {
    const courseId = this.props.match.params.id;
    const getArticleData = Env.get(
      this.props.envendpoint +
        `articles/article_list?course_id=${courseId}&page=${
          this.state.activePage
        }${!extraParams ? " " : extraParams}`
    );
    await getArticleData.then(
      (response) => {
        const data = response.data.response.articles.data;
        this.setState({
          articles:
            type !== "paginate" ? data : this.state.articles.concat(data),
          activeLoader: false,
          totalRecords: response.data.response.articles.total,
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  detailPageRedirection(props,type, item) {
    CommonService.contentRedirectionFunction(props, type, item);
  }

  render() {
    const { articles } = this.state;
    return (
      <div
        className="article-list-container"
        // style={{ height: this.state.articles.length !== 0 ? "auto" : "100vh" }}
        style={{
          height: "auto",
        }}
      >
        {this.state.articles.length !== 0 && (
          <InfiniteScroll
            dataLength={this.state.articles.length}
            next={this.loadMore}
            hasMore={this.state.articles.length < this.state.totalRecords}
            loader={<Skeletons type={"course"} />}
            scrollableTarget="scrollableDiv"
          >
            <Row className="row">
              {articles.map((item, index) => (
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
                        <div className="image-container">
                          <span
                            onClick={() =>
                              this.detailPageRedirection(
                                this.props,
                                
                                "Article",
                                item
                          
                              )
                            }
                            className="content"
                          >
                            <img
                              alt="article"
                              src={
                                Env.getImageUrl(
                                  `${this.props.envupdate.react_app_assets_url}course/article`
                                ) + item.article_image
                              }
                              className="image1"
                            />
                          </span>
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
                                  type="article"
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
                                  src={language_label}
                                  alt="language_label"
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
                                
                                "Article",
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

        {this.state.activeLoader === true ? (
          <Skeletons type={"course"} />
        ) : (
          articles.length === 0 && <NoRecords />
        )}

        {this.state.activePage > 1 && <FloatButton.BackTop />}
      </div>
    );
  }
}

export default connect((state) => {
  return {
    envupdate: state.envupdate,
    envendpoint: state.envendpoint,
  };
})(Articles);
