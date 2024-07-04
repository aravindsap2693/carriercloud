import React, { Component } from "react";
import { Tabs, Spin, Breadcrumb } from "antd";
import FAQ from "./common/FAQ";
import Instructor from "./common/Instructor";
import Description from "./common/Description";
import Features from "./common/Features";
import WhatYouWillGet from "./common/WhatYouWillGet";
import Support from "./common/Support";
import CourseDetailsBanner from "./common/CourseDetailsBanner";
import Quiz from "./quiz";
import Ebooks from "./ebooks";
import Articles from "./articles";
import Videos from "./videos";
import FreeSubscription from "./common/FreeSubscription";
import FreeUnSubscription from "./common/FreeUnSubscription";
import PriceUnSubscribe from "./common/PriceUnSubscribe";
import SpecialPriceEnds from "./common/SpecialPriceEnds";
import "../../assets/css/course-detail.css";
import Env from "../../utilities/services/Env";
import {
  currentCourse,
  currentPageRouting,
  currentTabIndex,
  disablePreference,
  quizSolution,
  updateCourseDetails,
} from "../../reducers/action";
import { connect } from "react-redux";
import Path2 from "./paths/path";
import CourseDoubts from "./doubts/index";
import CourseFilterComponents from "../../components/courseActions/CourseFilterComponents";
import Bundle from "./bundle";
import FreeContent from "./FreeContent";
import { analytics } from "../../firebase-config";
import { logEvent } from "firebase/analytics";
import Mocktest from "./mocktest";
import { CommonService } from "../../utilities/services/Common";
import { toast, ToastContainer } from "react-toastify";
import $ from "jquery";
//import "react-toastify/dist/ReactToastify.css";

const { TabPane } = Tabs;

class CourseDetails extends Component {
  constructor(props) {
    super(props);
    {
      this.state = {
        courses: [],
        activeTabIndex: 0,
        activeLoader: true,
        showMore: false,
        text_length: 250,
        subjects: [],
        topic: [],
        tagfilter: [],
        countshow: [],
        tag: [],
        startDate: null,
        endDate: null,
        filters: null,
        tagfilterstatus: false,
      };
    }
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.props.dispatch(quizSolution(false));
    this.props.dispatch(disablePreference(true));
    this.props.dispatch(currentPageRouting(null));
    this.getCourseDetails();
    logEvent(analytics, "select_content", {
      page_title: "Courses Details",
    });
    const { location } = this.props;
    if (location.state && location.state.message) {
      toast.error(location.state.message, {
        position: "top-right",
       
        closeOnClick: true,
      });
    }

    if (window.location.search !== "") {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const sharedUrl = urlParams.get("shared");

      if (sharedUrl) {
        const matchParams = sharedUrl.match(/\/(\d+)\/mocktest\/(\d+)/);
        if (matchParams && matchParams.length === 3) {
          const id = matchParams[1]; 
          const mock_id = matchParams[2]; 
           window.opener = window.open(
            `${process.env.PUBLIC_URL}/course-details/${id}/mocktest/${mock_id}`,
            "_blank",
            `toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=${window.screen.width},height=${window.screen.height}`
          );
          if(window.opener!= null){
            window.opener.focus();
            window.opener.addEventListener(
              "unload",
              function (event) {
                if ( window.opener.closed) {
                  this.setState(
                    (prev) => {
                      return { activePage: 1 };
                    },
                    
                  );
                }
               
                $("#root").toggle();
              }.bind(this)
            );

          }
        }
      }
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.update_course_details === true) {
      this.setState({ activeLoader: true });
      this.getCourseDetails();
      this.props.dispatch(updateCourseDetails(false));
    }
    if (
      newProps.current_tab_index !== null &&
      newProps.current_tab_index !== this.props.current_tab_index
    ) {
      this.setState({ activeTabIndex: newProps.current_tab_index });
    }
  }

  getCourseDetails() {
    const id = this.props.match.params.id;
    const getCoursesData = Env.get(
      this.props.envendpoint + `courses/view/${id}`
    );
    getCoursesData.then(
      (response) => {
        const data = response.data.response.course;
        this.props.dispatch(currentCourse(data));
        if (this.props.current_tab_index === null) {
          if (data.is_subscribed === 0) {
            this.props.dispatch(currentTabIndex(1));
          } else {
            if (data.course_structured === 2) {
              this.props.dispatch(currentTabIndex(2));
            } else {
              if (data.is_article_web_shown === 1) {
                this.props.dispatch(currentTabIndex(3));
              } else {
                if (data.is_video_web_shown === 1) {
                  this.props.dispatch(currentTabIndex(4));
                } else {
                  if (data.is_quiz_shown_web === 1) {
                    this.props.dispatch(currentTabIndex(5));
                  } else {
                    if (data.is_ebook_web_shown === 1) {
                      this.props.dispatch(currentTabIndex(6));
                    } else {
                      if (data.is_doubt_shown === 1) {
                        this.props.dispatch(currentTabIndex(8));
                      } else {
                        if (data.is_free_tab === 1) {
                          this.props.dispatch(currentTabIndex(10));
                        } else {
                          if (data.course_structured === 4) {
                            this.props.dispatch(currentTabIndex(9));
                          } else {
                            this.props.dispatch(currentTabIndex(1));
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        let tagfilter = [];
        data.date_filter === 1 && tagfilter.push({ id: 7, name: "Date" });
        data.tag_filter === 1 && tagfilter.push({ id: 6, name: "Tag" });
        data.topic_filter === 1 && tagfilter.push({ id: 8, name: "Topic" });
        data.subject_filter === 1 && tagfilter.push({ id: 9, name: "Subject" });

        let countshow = [];
        data.is_article_count_shown === 1 &&
          countshow.push({ name: "is_article_count_shown" });
        data.is_quiz_count_shown === 1 &&
          countshow.push({ name: "is_quiz_count_shown" });
        data.is_question_count_shown === 1 &&
          countshow.push({ name: "is_question_count_shown" });
        data.is_ebook_count_shown === 1 &&
          countshow.push({ name: "is_ebook_count_shown" });
        data.is_video_count_shown === 1 &&
          countshow.push({ name: "is_video_count_shown" });
        data.is_doubt_count_shown === 1 &&
          countshow.push({ name: "is_doubt_count_shown" });
        data.course_count < 0 && countshow.push({ name: "course_count" });

        this.setState({
          courses: data,
          activeTabIndex: this.props.current_tab_index,
          activeLoader: false,
          tagfilter: tagfilter,
          countshow: countshow,
        });
      },
      (error) => {
        CommonService.hendleError(error, this.props);
      }
    );
  }

  handleTagFilters = (extraParams) => {
    this.setState({
      filters: extraParams,
      tagfilterstatus: extraParams !== "" && extraParams !== null,
    });
  };

  render() {
    return (
      <div className="course-detail-container">
        <div className="breadcrumb-container">
          <Breadcrumb
            separator=""
            items={[
              {
                onClick: () => {
                  this.props.navigate(-1);
                },
                title: "Course",
              },
              {
                type: "separator",
              },
              {
                title: this.state.courses.title,
              },
            ]}
          />
        </div>

        {this.state.activeLoader === false ? (
          <div className="content">
            {/* ## course title card ## */}

            <CourseDetailsBanner
              courses={this.state.courses}
              routingProps={this.props}
            />

            {/* ## free subscribe now ## */}

            {this.state.courses.subscription_type &&
              this.state.courses.subscription_type.name === "Free" &&
              this.state.courses.is_subscribed === 0 && (
                <FreeSubscription
                  courses={this.state.courses}
                  {...this.props}
                />
              )}

            {/* ## special price end ## */}

            {this.state.courses.subscription_type &&
              this.state.courses.subscription_type.name === "Paid" &&
              this.state.courses.is_subscribed === 0 && (
                <SpecialPriceEnds
                  courses={this.state.courses}
                  routingProps={this.props}
                />
              )}

            {this.state.courses.notify_box === 1 &&
              this.state.courses.notify_text !== null && (
                <div className="course-details-notify-box">
                  {this.state.courses.notify_text.slice(
                    0,
                    this.state.text_length
                  )}{" "}
                  {this.state.courses.notify_text.length > 300 ? (
                    this.state.showMore === true ? (
                      <span
                        onClick={() =>
                          this.setState({
                            showMore: !this.state.showMore,
                            text_length: 250,
                          })
                        }
                        style={{
                          color: "#0B649D",
                          cursor: "pointer",
                          fontWeight: 400,
                        }}
                      >
                        show less
                      </span>
                    ) : (
                      <span
                        onClick={() =>
                          this.setState({
                            showMore: !this.state.showMore,
                            text_length: this.state.courses.notify_text.length,
                          })
                        }
                        style={{
                          color: "#0B649D",
                          cursor: "pointer",
                          fontWeight: 400,
                        }}
                      >
                        ...show more
                      </span>
                    )
                  ) : null}
                </div>
              )}

            <div className="course-details-tabs">
              <Tabs
                activeKey={this.state.activeTabIndex.toString()}
                onChange={(e) => {
                  this.setState({ activeTabIndex: e });
                  this.props.dispatch(currentTabIndex(e));
                }}
                tabBarExtraContent={
                  this.state.activeTabIndex.toString() !== "1" &&
                  this.state.activeTabIndex.toString() !== "2" &&
                  this.state.activeTabIndex.toString() !== "8" &&
                  this.state.activeTabIndex.toString() !== "10" &&
                  this.state.courses.is_subscribed === 1 &&
                  this.state.tagfilter.length > 0 && (
                    <CourseFilterComponents
                      handleTagFilters={this.handleTagFilters}
                      showFilterOptions={this.state.showFilters}
                      tag_filter={1}
                      data={this.state.tagfilter}
                      datalist={this.state.courses}
                      {...this.props}
                      courseId={this.props.match.params.id}
                      activeTabIndex={this.state.activeTabIndex}
                      showActiveFilter={this.state.tagfilterstatus}
                    />
                  )
                }
              >
                {/* ## course detail tabs ## */}
                {this.state.courses.is_subscribed === 0 && (
                  <TabPane
                    tab="Details"
                    key="1"
                    disabled={this.state.tagfilterstatus}
                  >
                    <div className="course-details-tabs-tab-pane">
                      {/* ## free unsubscribe ## */}

                      {this.state.courses.subscription_type_id === 1 &&
                        this.state.courses.is_subscribed === 1 && (
                          <FreeUnSubscription
                            courses={this.state.courses}
                            {...this.props}
                          />
                        )}

                      {/* ## price unsubscribe ## */}

                      {this.state.courses.subscription_type_id === 2 &&
                        this.state.courses.subscribed_info && (
                          <PriceUnSubscribe
                            courses={this.state.courses}
                            routingProps={this.props}
                          />
                        )}

                      {/* ## support ## */}
                      {(this.state.courses.support_call !== 0 ||
                        this.state.courses.support_chat !== 0 ||
                        this.state.courses.support_email !== 0) && (
                        <Support
                          courses={this.state.courses}
                          routingProps={this.props}
                        />
                      )}

                      {/* ## course features 1 ## */}

                      {this.state.courses.course_feature === 1 &&
                        this.state.courses.is_coursefeatures_shown_web ===
                          1 && (
                          <Features
                            {...this.state.courses}
                            routingProps={this.props}
                          />
                        )}

                      {/* ## why you will get ## */}
                      {this.state.countshow.length > 0 && (
                        <WhatYouWillGet
                          {...this.state.courses}
                          routingProps={this.props}
                        />
                      )}
                      {/* ## description ## */}

                      <Description
                        {...this.state.courses}
                        routingProps={this.props}
                      />

                      {/* ## instructor ## */}

                      <Instructor
                        courses={this.state.courses}
                        routingProps={this.props}
                      />

                      {/* ## faq ## */}

                      <FAQ
                        courseId={this.props.match.params.id}
                        routingProps={this.props}
                      />
                    </div>
                  </TabPane>
                )}

                {this.state.courses.course_structured === 2 && (
                  <TabPane
                    tab="Paths"
                    key="2"
                    disabled={this.state.tagfilterstatus}
                  >
                    {/* <Paths courses={this.state.courses} routingProps={this.props} /> */}
                    <Path2
                      courses={this.state.courses}
                      routingProps={this.props}
                      extraParams={this.state.filters}
                    />
                  </TabPane>
                )}

                {this.state.courses.course_structured === 2
                  ? this.state.courses.is_subscribed === 1 &&
                    this.state.courses.is_article_web_shown === 1 && (
                      <TabPane tab="Articles" key="3">
                        <Articles
                          extraParams={this.state.filters}
                          {...this.props}
                          activeTabIndex={this.state.activeTabIndex}
                        />
                      </TabPane>
                    )
                  : this.state.courses.is_article_web_shown === 1 && (
                      <TabPane tab="Articles" key="3">
                        <Articles
                          extraParams={this.state.filters}
                          {...this.props}
                          activeTabIndex={this.state.activeTabIndex}
                        />
                      </TabPane>
                    )}

                {this.state.courses.course_structured === 2
                  ? this.state.courses.is_subscribed === 1 &&
                    this.state.courses.is_video_web_shown === 1 && (
                      <TabPane tab="Videos" key="4">
                        <Videos
                          {...this.props}
                          extraParams={this.state.filters}
                          activeTabIndex={this.state.activeTabIndex}
                        />
                      </TabPane>
                    )
                  : this.state.courses.is_video_web_shown === 1 && (
                      <TabPane tab="Videos" key="4">
                        <Videos
                          {...this.props}
                          extraParams={this.state.filters}
                          activeTabIndex={this.state.activeTabIndex}
                        />
                      </TabPane>
                    )}

                {this.state.courses.course_structured === 2
                  ? this.state.courses.is_subscribed === 1 &&
                    this.state.courses.is_quiz_shown_web === 1 && (
                      <TabPane tab="Quizzes" key="5">
                        <Quiz
                          courseId={this.props.match.params.id}
                          {...this.props}
                          extraParams={this.state.filters}
                          activeTabIndex={this.state.activeTabIndex}
                        />
                      </TabPane>
                    )
                  : this.state.courses.is_quiz_shown_web === 1 && (
                      <TabPane tab="Quizzes" key="5">
                        <Quiz
                          courseId={this.props.match.params.id}
                          {...this.props}
                          extraParams={this.state.filters}
                          activeTabIndex={this.state.activeTabIndex}
                        />
                      </TabPane>
                    )}

                {this.state.courses.course_structured === 2
                  ? this.state.courses.is_subscribed === 1 &&
                    this.state.courses.is_ebook_web_shown === 1 && (
                      <TabPane tab="Ebooks" key="6">
                        <Ebooks
                          {...this.props}
                          extraParams={this.state.filters}
                          activeTabIndex={this.state.activeTabIndex}
                        />
                      </TabPane>
                    )
                  : this.state.courses.is_ebook_web_shown === 1 && (
                      <TabPane tab="Ebooks" key="6">
                        <Ebooks
                          {...this.props}
                          extraParams={this.state.filters}
                          activeTabIndex={this.state.activeTabIndex}
                        />
                      </TabPane>
                    )}

                {/* ## My Doubts ## */}
                {this.state.courses.course_structured === 2
                  ? this.state.courses.is_subscribed === 1 &&
                    this.state.courses.is_doubt_shown === 1 && (
                      <TabPane
                        tab="Doubts"
                        key="8"
                        disabled={this.state.tagfilterstatus}
                      >
                        <CourseDoubts
                          courseId={this.props.match.params.id}
                          activeTabIndex={this.state.activeTabIndex}
                          courses={this.state.courses}
                        />
                      </TabPane>
                    )
                  : this.state.courses.is_doubt_shown === 1 && (
                      <TabPane
                        tab="Doubts"
                        key="8"
                        disabled={this.state.tagfilterstatus}
                      >
                        <CourseDoubts
                          courseId={this.props.match.params.id}
                          activeTabIndex={this.state.activeTabIndex}
                          courses={this.state.courses}
                        />
                      </TabPane>
                    )}

                {this.state.courses.course_structured === 4 && (
                  <TabPane
                    tab="Bundle"
                    key="9"
                    disabled={this.state.tagfilterstatus}
                  >
                    <Bundle
                      extraParams={this.state.filters}
                      {...this.props}
                      activeTabIndex={this.state.activeTabIndex}
                    />
                  </TabPane>
                )}
                {this.state.courses.is_free_tab === 1 && (
                  <TabPane
                    tab="Free"
                    key="10"
                    disabled={this.state.tagfilterstatus}
                  >
                    <FreeContent
                      extraParams={this.state.filters}
                      {...this.props}
                      activeTabIndex={this.state.activeTabIndex}
                      courses={this.state.courses}
                    />
                  </TabPane>
                )}

                {this.state.courses.course_structured === 2
                  ? this.state.courses.is_subscribed === 1 &&
                    this.state.courses.is_mock_test_web === 1 && (
                      <TabPane tab="MockTest" key="11">
                        <Mocktest
                          {...this.props}
                          courseId={this.props.match.params.id}
                          extraParams={this.state.filters}
                          activeTabIndex={this.state.activeTabIndex}
                        />
                      </TabPane>
                    )
                  : this.state.courses.is_mock_test_web === 1 && (
                      <TabPane tab="MockTest" key="11">
                        <Mocktest
                          {...this.props}
                          courseId={this.props.match.params.id}
                          extraParams={this.state.filters}
                          activeTabIndex={this.state.activeTabIndex}
                        />
                      </TabPane>
                    )}

                {this.state.courses.is_subscribed === 1 && (
                  <TabPane
                    tab="Details"
                    key="1"
                    disabled={this.state.tagfilterstatus}
                  >
                    <div className="course-details-tabs-tab-pane">
                      {/* ## free unsubscribe ## */}

                      {this.state.courses.subscription_type_id === 1 &&
                        this.state.courses.is_subscribed === 1 && (
                          <FreeUnSubscription
                            courses={this.state.courses}
                            {...this.props}
                          />
                        )}

                      {/* ## price unsubscribe ## */}

                      {this.state.courses.subscription_type_id === 2 &&
                        this.state.courses.subscribed_info && (
                          <PriceUnSubscribe
                            courses={this.state.courses}
                            routingProps={this.props}
                          />
                        )}

                      {/* ## support ## */}
                      {(this.state.courses.support_call !== 0 ||
                        this.state.courses.support_chat !== 0 ||
                        this.state.courses.support_email !== 0) && (
                        <Support
                          courses={this.state.courses}
                          routingProps={this.props}
                        />
                      )}

                      {/* ## course features ## */}

                      {this.state.courses.course_feature === 1 &&
                        this.state.courses.is_coursefeatures_shown_web ===
                          1 && (
                          <Features
                            {...this.state.courses}
                            routingProps={this.props}
                          />
                        )}

                      {/* ## why you will get ## */}

                      <WhatYouWillGet
                        {...this.state.courses}
                        routingProps={this.props}
                      />

                      {/* ## description ## */}

                      <Description
                        {...this.state.courses}
                        routingProps={this.props}
                      />

                      {/* ## instructor ## */}

                      <Instructor
                        courses={this.state.courses}
                        routingProps={this.props}
                      />

                      {/* ## faq ## */}

                      <FAQ
                        courseId={this.props.match.params.id}
                        routingProps={this.props}
                      />
                    </div>
                  </TabPane>
                )}
                {/* <TabPane tab="Path2" key="7">
                  <Path2 courses={this.state.courses} routingProps={this.props}/>
                </TabPane> */}
              </Tabs>
            </div>
          </div>
        ) : (
          <Spin className="app-spinner" size="large" />
        )}
      </div>
    );
  }
}

export default connect((state) => {
  return {
    quiz_solution: state.quiz_solution,
    current_tab_index: state.current_tab_index,
    update_course_details: state.update_course_details,
    envendpoint: state.envendpoint,
  };
})(CourseDetails);
