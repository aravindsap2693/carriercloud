import React, { Component } from "react";
import { Row, Col, Card, Typography, FloatButton } from "antd";
import "../../assets/css/course-list.css";
import "../../assets/css/layout.css";
import Env from "../../utilities/services/Env";
import NoRecords from "../../components/NoRecords";
import { connect } from "react-redux";
import {
  currentCourse,
  currentTabIndex,
  disablePreference,
  currentPageRouting,
} from "../../reducers/action";
import CourseFilterComponents from "../../components/courseActions/CourseFilterComponents";
import fearured_tag from "../../assets/svg-images/fearured-tag.png";
import InfiniteScroll from "react-infinite-scroll-component";
import Skeletons from "../../components/SkeletonsComponent";
import { analytics } from "../../firebase-config";
import { logEvent } from "firebase/analytics";
import { CommonService } from "../../utilities/services/Common";

const { Text } = Typography;

class MyCourse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      courses: [],
      activeLoader: true,
      catergoryId: props.preferences.id,
      activePage: 1,
      totalRecords: 0,
      Params: "",
      showFilters: false,
    };
  }

  componentDidMount() {
    this.props.dispatch(disablePreference(false));
    this.props.dispatch(currentCourse(null));
    this.props.dispatch(currentTabIndex(null));
    this.props.dispatch(
      currentPageRouting({
        path: "/my-courses",
        selectedKeys: "2",
      })
    );
    this.getCourses("preference");
    logEvent(analytics, "select_content", {
      page_title: "My Course",
    });
  }

  getCourses(type, Params = "") {
    let extraParams =
      Params + `&filters[category_id][]=${this.state.catergoryId}`;
    const getMyCourse = Env.get(
      this.props.envendpoint +
        `courses/subscribedlistnew?page=${
          this.state.activePage + extraParams
        }&logged_in_type=web`
    );
    getMyCourse.then(
      (response) => {
        let data = response.data.response.courses.data;
        this.setState({
          courses:
            type === "preference" ? data : this.state.courses.concat(data),
          activeLoader: false,
          totalRecords: response.data.response.courses.total,
        });
      },
      (error) => {
        CommonService.hendleError(error, this.props, "main");
      }
    );
  }

  componentWillReceiveProps(newProps) {
    if (
      newProps.preferences.id !== this.props.preferences.id &&
      newProps.preferences.id
    ) {
      this.setState(
        { catergoryId: newProps.preferences.id, activePage: 1 },
        () => this.getCourses("preference")
      );
    }
  }

  selectedFilters = (extraParams) => {
    this.setState(
      {
        Params: extraParams,
        activePage: 1,
        courses: [],
        activeLoader: true,
      },
      () => this.getCourses("preference", extraParams)
    );
  };

  loadMore = () => {
    this.setState(
      (prev) => {
        return { activePage: prev.activePage + 1 };
      },
      () => this.getCourses("paginate", this.state.Params)
    );
  };

  render() {
    const { courses } = this.state;
    return (
      <div className="main-content">
        <CourseFilterComponents
          selectedFilters={this.selectedFilters}
          showFilterOptions={this.state.showFilters}
          tag_filter={0}
          data={filterTypes}
          {...this.props}
        />

        {this.state.courses.length !== 0 ? (
          <InfiniteScroll
            dataLength={this.state.courses.length}
            next={this.loadMore}
            hasMore={this.state.courses.length < this.state.totalRecords}
            loader={<Skeletons type={"course"} />}
            scrollableTarget="scrollableDiv"
          >
            <Row className="all-courses-row">
              {courses.map((item, index) => (
                <Col key={index} xs={24} sm={24} md={12} lg={8} xl={8} xxl={8}>
                  <div
                    className="all-courses-main"
                    onClick={() =>
                      this.props.navigate("/course-details/" + item.id)
                    }
                  >
                    {item.is_featured === 1 && (
                      <div className="IsFeartured-tag">
                        <img
                          src={fearured_tag}
                          alt="fearured_tag"
                          style={{
                            width: "75px",
                            position: "absolute",
                            zIndex: "1",
                            left: "16px",
                          }}
                        />
                      </div>
                    )}

                    <Card className="all-courses-card">
                      <div className="all-courses-card-inner">
                        <div className="my-courses-card-inner-img-div">
                          <img
                            alt="course_image"
                            src={
                              Env.getImageUrl(
                                `${this.props.envupdate.react_app_assets_url}course`
                              ) + item.course_image
                            }
                            className="my-courses-banner-image"
                          />
                        </div>
                        <div className="all-courses-card-header2">
                          <div>
                            <Text className="all-courses-card-title">
                              {item.title}
                            </Text>
                          </div>
                          <div>
                            <Text
                              type="secondary"
                              className="all-courses-card-created-by"
                              style={{ fontSize: "14px" }}
                            >
                              by {item.creator_name}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </Col>
              ))}
            </Row>
          </InfiniteScroll>
        ) : (
          this.state.activeLoader && <Skeletons type={"course"} />
        )}

        {this.state.activePage > 1 && <FloatButton.BackTop />}

        <div>
          {this.state.activeLoader && courses.length !== 0 && (
            <Skeletons type={"course"} />
          )}
        </div>

        {!this.state.activeLoader && courses.length === 0 && <NoRecords />}
      </div>
    );
  }
}

export default connect((state) => {
  return {
    preferences: state.preferences,
    envupdate: state.envupdate,
    envendpoint: state.envendpoint,
  };
})(MyCourse);

const filterTypes = [
  {
    id: 1,
    name: "Price Type",
  },
  {
    id: 2,
    name: "Featured",
  },
  {
    id: 3,
    name: "Subjects",
  },
  {
    id: 4,
    name: "Exam",
  },
  {
    id: 5,
    name: "Coin Discount",
  },
];
