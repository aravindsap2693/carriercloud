import React, { Component } from "react";
import { Layout, Typography, Button, Input, Card } from "antd";
import { SearchOutlined, CloseOutlined, MenuOutlined } from "@ant-design/icons";
import "../../App.css";
import Env from "../../utilities/services/Env";
import Skeletons from "../../components/SkeletonsComponent";
import $ from "jquery";

const { Sider } = Layout;
const { Text } = Typography;

class DoubtsLeftSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      course: [],
      filterExams: [],
      filterSubjects: [],
      selectedFilterTypeId: 1,
      selectedFilterOptions: false,
      preferencesId: props.preferences.id,
      activeLoader: true,
      toggleSidebar: true,
      search: "",
      sideWidth: "",
      course_id: "",
    };
  }

  componentDidMount() {
    this.getCourseList();
    width();
    window.addEventListener("resize", width);
    function width() {
      let screenwidth = "";
      screenwidth = document.documentElement.clientWidth;
      return screenwidth;
    }
    let screenwidth = width();
    this.setState({ sideWidth: screenwidth });
    if (screenwidth < 1020) {
      $(".doubt-left-sidebar").fadeToggle();
      $(".doubt-left-sidebar").css({ display: "none" });
    }
    if (screenwidth > 1020) {
      $(".doubt-left-sidebar").css({
        display: "block",
      });
    }
  }

  componentWillReceiveProps(newProps) {
    if (this.props.preferences.id !== newProps.preferences.id) {
      this.setState({ preferencesId: newProps.preferences.id }, () =>
        this.getCourseList()
      );
    }
    if (
      newProps.filter_course_id !== null &&
      newProps.filter_course_id !== this.props.filter_course_id
    ) {
      this.handleCoursePositionChange(newProps.filter_course_id);
    }
  }

  handleCoursePositionChange = (course_id) => {
    let data = this.state.course;
    let test = data.filter((item) => item.id === course_id);
    if (test.length > 0) {
      data = data.filter((item) => item.id !== test[0].id);
      data.unshift(test[0]);
    }
    this.setState({
      course: data,
    });
    this.getCourseid(course_id);
  };

  handleType(value, id) {
    this.setState({
      selectedFilterTypeId: id,
      course_id: "",
      selectedFilterOptions: false,
    });
    let extraParams = "";
    let extras = "";
    let data = [];
    if (value === "Exams") {
      this.state.filterExams.forEach((ele) => {
        data.push(ele.id);
      });
      extraParams =
        extraParams +
        `&filters[exam_ids]=[${data}]&filters[sub_category_type_id]=2`;
      extras = extras + `&filters[exam_ids]=[${data}]&sub_category_type_id=2`;
    } else if (value === "All") {
      extraParams = extraParams + ` `;
    } else {
      this.state.filterSubjects.forEach((ele) => {
        data.push(ele.id);
      });
      extraParams =
        extraParams +
        `&filters[subject_ids]=[${data}]&filters[sub_category_type_id]=1`;
      extras =
        extras + `&filters[subject_ids]=[${data}]&sub_category_type_id=1`;
    }
    this.props.getFilterDoubts("preference", 1, extraParams, extras);
    this.getCourseList(extraParams);
  }

  getCourseList = (Params) => {
    let search =
      this.state.search !== "" ? `&filters[keyword]=${this.state.search}` : " ";
    const getMyCourse = Env.get(
      this.props.envendpoint +
        `courses/subscribedlistnew?page=1&filters[category_id][]=${
          this.props.preferences.id
        }${!Params ? "" : Params}${search}&post_type=post&rowPerPage=50`
    );
    getMyCourse.then((response) => {
      let data = response.data.response.courses.data;
      let exams = response.data.response.courses.filter_exams;
      let subjects = response.data.response.courses.filter_subjects;
      this.setState({
        filterExams: exams,
        filterSubjects: subjects,
        course: data,
        activeLoader: false,
        // search: "",
      });
    });
  };

  getCourseid(id) {
    this.setState({
      course_id: id,
      selectedFilterTypeId: 0,
    });
    let extraParams = "";
    let extras = "";
    if (this.state.course_id !== id) {
      extraParams = `&filters[course_id]=${id}`;
      extras = `&course_id=${id}`;
      this.props.getFilterDoubts("preference", 1, extraParams, extras);
      this.setState({
        selectedFilterOptions: true,
      });
    } else {
      extraParams = ``;
      this.props.getFilterDoubts("preference", 1, extraParams);
      this.setState({
        selectedFilterOptions: false,
        course_id: "",
        selectedFilterTypeId: 1,
      });
    }
    if (this.state.course_id === id) {
      this.getCourseList(extraParams);
    }
  }

  toggleSidebar = () => {
    const sidebarElement = document.getElementById("left-sidebar");
    const iconElement = document.getElementById("left-sidebar-icon");
    sidebarElement.style.display =
      sidebarElement.style.display === "" ? "none" : "";
    iconElement.style.left =
      iconElement.style.left === "300px" ? "0px" : "300px";
    sidebarElement.style.position =
      sidebarElement.style.position === "" ? "absolute" : "";
    this.setState({ toggleSidebar: sidebarElement.style.display !== "" });
  };

  render() {
    return (
      <div>
        <span
          style={{ position: "absolute", left: "0px" }}
          id="left-sidebar-icon"
        >
          {this.state.toggleSidebar ? (
            <MenuOutlined
              style={{
                fontSize: "24px",
                padding: "5px",
                background: "#fff",
                cursor: "pointer",
              }}
              onClick={this.toggleSidebar}
            />
          ) : (
            <CloseOutlined
              style={{
                fontSize: "24px",
                padding: "5px",
                background: "#fff",
                cursor: "pointer",
              }}
              onClick={this.toggleSidebar}
            />
          )}
        </span>
        <Sider
          className="doubt-left-sidebar"
          style={{
            boxShadow: "6px 0px 18px rgba(0, 0, 0, 0.06)",
            background: "#fff",
            zIndex: "2",
          }}
          width={300}
          id="left-sidebar"
        >
          <div
            style={{
              position: "sticky",
              top: "0",
            }}
          >
            <div className="doubt-sidebar-header">
              <div className="doubt-left-sidebar-filter">
                <span className="doubt-left-sidebar-filter-title">Filter</span>
                <div className="doubt-left-sidebar-filter-search">
                  <Input
                    placeholder="Search Your Course here"
                    name="comments2"
                    value={this.state.search}
                    className="doubt-left-sidebar-filter-searchbox"
                    onChange={(e) =>
                      this.setState({
                        search: e.target.value,
                      })
                    }
                    onPressEnter={() =>
                      this.getCourseList("", this.state.search)
                    }
                    prefix={
                      <SearchOutlined
                        style={{
                          fontSize: "20px",
                          cursor: "pointer",
                        }}
                        onClick={(e) =>
                          this.getCourseList("", this.state.search)
                        }
                      />
                    }
                  />
                </div>
              </div>
              <div className="doubt-left-sidebar-filter-btn_box">
                {filterOptions.map((item, key) => (
                  <div
                    style={{
                      padding: "5px",
                    }}
                    key={key}
                  >
                    <Button
                      className="doubt-left-sidebar-filter-btn"
                      style={{
                        background:
                          !this.props.match.params.id &&
                          this.state.selectedFilterTypeId === item.id
                            ? "#0b649d"
                            : "#e4e5e7",
                        color:
                          !this.props.match.params.id &&
                          this.state.selectedFilterTypeId === item.id
                            ? "#fff"
                            : "#000",
                      }}
                      onClick={() => {
                        this.handleType(item.name, item.id);
                      }}
                    >
                      {item.name}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div id="doubt-sidebar-body">
              {this.state.course.length > 0 ? (
                <>
                  {this.state.course.map((item, index) => (
                    <div key={index}>
                      {item.is_doubt_shown === 1 && (
                        <Card
                          className="doubt-left-sidebar-course"
                          onClick={() => {
                            this.getCourseid(item.id);
                          }}
                        >
                          <div
                            className="doubt-left-sidebar-course-body"
                            style={{
                              background:
                                this.state.course_id === item.id &&
                                this.state.selectedFilterOptions
                                  ? "#E0F3FF"
                                  : "#fff",
                              border:
                                this.state.course_id === item.id &&
                                this.state.selectedFilterOptions
                                  ? " 1px solid #0B649D"
                                  : "none",
                              borderRadius: "4px",
                            }}
                          >
                            <img
                              alt="course"
                              src={
                                Env.getImageUrl(
                                  `${this.props.envupdate.react_app_assets_url}course`
                                ) + item.course_image
                              }
                              className="doubt-left-sidebar-course-banner"
                            />
                            <div
                              style={{
                                padding: "12px",
                              }}
                            >
                              <div>
                                <Text className="doubt-left-sidebar-course-title">
                                  {item.title}
                                </Text>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <div>
                  {this.state.activeLoader === false &&
                    this.state.course.length === 0 && (
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
                          No Course Found.
                        </span>
                      </div>
                    )}
                  {this.state.activeLoader &&
                    this.state.course.length === 0 && (
                      <Skeletons type={"doubtsCourse"} />
                    )}
                </div>
              )}
            </div>
          </div>
        </Sider>
      </div>
    );
  }
}
export default DoubtsLeftSidebar;

const filterOptions = [
  {
    id: 1,
    name: "All",
  },
  {
    id: 2,
    name: "Subjects",
  },
  {
    id: 3,
    name: "Exams",
  },
];
