import React, { Component } from "react";
import { Typography, Button, Card, Modal, Input, Tooltip } from "antd";
import Env from "../../utilities/services/Env";
import { LeftOutlined, SearchOutlined } from "@ant-design/icons";
import QuizSharePopup from "../QuizSharePopup";
import "../../assets/css/doubt-answer.css";
import { toast } from "react-toastify";
import Close from "../../assets/svg-icons/ans-close.svg";
import NoRecords from "../NoRecords";
import "../../assets/css/course-list.css";
import doubts_exclamation from "../../assets/svg-icons/doubts_exclamation.svg";
import Skeletons from "../SkeletonsComponent";

const { Text } = Typography;

class DoubtsCoures extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalcourseVisible: false,
      type: "",
      id: "",
      is_solved: null,
      data: [],
      filterExams: [],
      filterSubjects: [],
      activePage: 1,
      course: [],
      course_details: {},
      search: "",
      activeLoader: true,
      active_Doubt_Loader: true,
      selectedFilterTypeId: 1,
      Uploadtype: "",
      is_follow: null,
      preferences_id: "",
    };
    this.myRef = React.createRef();
  }

  showModal = (VALUe, DATA, PARAMS, url) => {
    if (VALUe === "Change Doubts") {
      this.setState(
        {
          isModalcourseVisible: true,
          selectedFilterTypeId: 1,
          type: VALUe,
          id: PARAMS,
          asset_url: url,
          course_details: {},
        },
        () => this.getCourse("", DATA)
      );
    } else {
      this.setState(
        {
          isModalcourseVisible: true,
          selectedFilterTypeId: 1,
          type: VALUe,
          id: PARAMS,
          asset_url: url,
          course_details: {},
        },
        () => this.getCourse(PARAMS, DATA)
      );
    }
  };

  getAnswer(id) {
    const getPoints = Env.get(
      this.props.envendpoint +
        `post/comment/answer/${id}?page=1&rowsPerPage=100`
    );
    getPoints.then(
      (response) => {
        const data = response.data.response.userpost.replies;
        this.setState({
          data: data,
          activeLoader: false,
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  handleType(value, id) {
    this.setState({
      selectedFilterTypeId: id,
    });
    let extraParams = "";
    let data = [];
    if (value === "Exams") {
      this.state.filterExams.forEach((ele) => {
        data.push(ele.id);
      });
      extraParams = extraParams + `&filters[exam_ids]=[${data}]`;
    } else if (value === "All") {
      extraParams = extraParams + ` `;
    } else {
      this.state.filterSubjects.forEach((ele) => {
        data.push(ele.id);
      });
      extraParams = extraParams + `&filters[subject_ids]=[${data}]`;
    }
    this.getCourse(extraParams, this.props.preferences.id);
  }

  getCourse = (Params, ids) => {
    const id = ids !== undefined ? ids : this.state.preferences_id;
    const getMyCourse = Env.get(
      this.props.envendpoint +
        `courses/subscribedlistnew?page=1&filters[category_id][]=${id}${
          !Params ? "" : Params
        }&post_type=post`
    );
    getMyCourse.then((response) => {
      let data = response.data.response.courses.data;
      let exams = response.data.response.courses.filter_exams;
      let subjects = response.data.response.courses.filter_subjects;
      this.setState({
        filterExams: exams,
        filterSubjects: subjects,
        course: data,
        active_Doubt_Loader: false,
        preferences_id: id,
      });
    });
  };

  changeCourse(id, name) {
    this.setState({ active_Doubt_Loader: true });
    let payload = {
      course_id: id,
    };
    const CourseData = Env.put(
      this.props.envendpoint + `post/coursechange/update/${this.state.id}`,
      payload
    );
    CourseData.then((res) => {
      let data = res.data.response.data;
      const items = this.state.course_details;
      items["id"] = id;
      items["name"] = name;
      if (data) {
        this.setState({
          course_details: { id: id, name: name },
          isModalcourseVisible: false,
          course_name: name,
          active_Doubt_Loader: false,
        });
        toast("Course has been change Sucessfully for this Doubts.");
      } else {
        toast("Please select the Different Course to this Doubts.");
      }
      if (data) {
        this.props.handle_type === "doubtspopup"
          ? this.props.changecourseTitle(name)
          : this.props.getDoubtsID(
              this.props.doubts.id,
              this.props.doubts.total_comments,
              this.props.doubts.total_follows,
              this.props.doubts.is_follow,
              this.props.doubts.is_solved,
              this.props.doubts.is_active,
              name
            );
      }
    });
  }

  getCourseid(item) {
    this.setState({
      course_details: {
        id: item.id,
        name: item.title,
        is_audio: item.is_audio,
      },
    });
  }

  getSearchCourse(Params) {
    let extraParams = `&filters[keyword]=${Params}`;
    this.getCourse(extraParams, this.props.preferences.id);
  }

  closeDoubtAnswer = (callback_data) => {
    this.setState({ isModalcourseVisible: callback_data }, () =>
      this.props.toggleDoubtsPopup()
    );
  };

  render() {
    const { isModalcourseVisible } = this.state;
    return (
      <div>
        <Modal
          open={isModalcourseVisible}
          footer={null}
          closable={false}
          centered={true}
          className={
            this.state.type !== "Add Doubts"
              ? "doubt-answer-share"
              : "add-doubt-answer"
          }
        >
          {this.state.isModalcourseVisible && (
            <div
              className="doubt1"
              style={{
                background: "#0B649D",
                borderRadius: "8px",
              }}
            >
              <div
                className="doubt-answer-btn"
                onClick={() => {
                  this.state.type !== "Change Doubts"
                    ? this.setState({ isModalcourseVisible: false }, () =>
                        this.props.closeDoubts()
                      )
                    : this.setState({ isModalcourseVisible: false });
                }}
              >
                <img
                  src={Close}
                  alt="Close"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <>
                <div
                  className="doubts-card-content"
                  style={{
                    background: "#0B649D",
                    color: "#fff",
                    justifyContent: "space-between",
                    padding: "20px",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      color: "#fff",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    {this.state.type !== "Change Doubts" && (
                      <div>
                        <LeftOutlined
                          className="back-icon"
                          onClick={() =>
                            this.setState(
                              { isModalcourseVisible: false }
                              // this.props.togglecloseDoubtsPopup()
                            )
                          }
                        />
                      </div>
                    )}
                    <div
                      style={{
                        color: "#fff",
                        fontSize: "18px",
                        fontWeight: "600",
                      }}
                    >
                      Select course from your subscribed
                    </div>
                  </div>
                  <div>
                    <Tooltip placement="leftBottom" title={"prompt Info"}>
                      <img src={doubts_exclamation} alt="doubts_exclamation" />
                    </Tooltip>
                  </div>
                </div>
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "0px 0px 8px 8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "start",
                      alignItems: "center",
                      padding: "15px 25px",
                      borderBottom: "2px solid rgba(90, 114, 200, 0.1",
                    }}
                  >
                    {filterOptions.map((item, index) => (
                      <div
                        style={{
                          padding: "5px 15px",
                        }}
                        key={index}
                      >
                        <Button
                          style={{
                            background:
                              this.state.selectedFilterTypeId === item.id
                                ? "#0b649d"
                                : "#e4e5e7",
                            color:
                              this.state.selectedFilterTypeId === item.id
                                ? "#fff"
                                : "#000",
                            borderRadius: "10px",
                            padding: "5px 15px",
                            cursor: "pointer",
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
                  <>
                    <div
                      style={{
                        flex: 1,
                        margin: "0px 10px",
                        padding: "10px",
                        borderBottom: "2px solid rgba(90, 114, 200, 0.1",
                      }}
                    >
                      <Input
                        placeholder="Search Your Course here"
                        name="comments2"
                        value={this.state.search}
                        ref={this.myRef}
                        onChange={(e) =>
                          this.setState({
                            search: e.target.value,
                          })
                        }
                        onPressEnter={() =>
                          this.getSearchCourse(this.state.search)
                        }
                        prefix={
                          <SearchOutlined
                            style={{
                              fontSize: "20px",
                              cursor: "pointer",
                            }}
                            onClick={(e) =>
                              this.getSearchCourse(this.state.search)
                            }
                          />
                        }
                        style={{
                          borderRadius: "20px",
                          background: "#F5F6FA",
                          color: "#334D6E",
                          fontSize: "10px",
                          height: "42px",
                          border: "1px solid transparent",
                          padding: "0px 20px",
                          // boxShadow: "6px 0px 18px rgba(0, 0, 0, 0.06)",
                        }}
                      />
                    </div>
                  </>
                  <div className="all-courses-scroll">
                    {this.state.course.length > 0 ? (
                      <>
                        {this.state.course.map((item, index) => (
                          <Card
                            className="all-courses-card"
                            onClick={() => {
                              this.getCourseid(item);
                            }}
                            key={index}
                          >
                            <div
                              className="doubt2"
                              style={{
                                padding: "16px 18px ",
                                display: "flex",
                                background:
                                  this.state.course_details.id == item.id
                                    ? "#E0F3FF"
                                    : "#fff",
                                flexDirection: "row",
                                border:
                                  this.state.course_details.id == item.id
                                    ? " 1px solid #0B649D"
                                    : "none",
                                justifyContent: "start",
                                alignItems: "start",
                              }}
                            >
                              <img
                                alt="course"
                                src={
                                  Env.getImageUrl(
                                    this.props.envupdate.react_app_assets_url +
                                      "course"
                                  ) + item.course_image
                                }
                                style={{
                                  width: "220px",
                                  height: "140px",
                                  borderRadius: "8px",
                                }}
                              />
                              <div
                                style={{
                                  padding: "10px 32px 0px",
                                }}
                              >
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
                                    Created by:{" "}
                                    <span style={{ color: "#F9873C" }}>
                                      {item.creator_name}
                                    </span>
                                  </Text>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </>
                    ) : (
                      <div>
                        {!this.state.active_Doubt_Loader &&
                          this.state.course.length === 0 && <NoRecords />}
                        {this.state.active_Doubt_Loader &&
                          this.state.course.length === 0 && (
                            <Skeletons type={"courseList"} />
                          )}
                      </div>
                    )}
                  </div>
                  <div
                    className="doubt3"
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "end",
                      alignItems: "center",
                      padding: "15px",
                      background: "#EBF7FF",
                      borderRadius: "0px 0px 8px 8px",
                    }}
                  >
                    {this.state.type === "Change Doubts" ? (
                      <div
                        style={{
                          padding: "5px 15px",
                        }}
                      >
                        <Button
                          type="primary"
                          className="btn-answer"
                          style={{
                            borderRadius: "10px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            !this.state.course_details.id
                              ? toast("Please select the course")
                              : this.changeCourse(
                                  this.state.course_details.id,
                                  this.state.course_details.name
                                );
                          }}
                        >
                          Change Course
                        </Button>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: "5px 15px",
                        }}
                      >
                        <Button
                          type="primary"
                          className="btn-answer"
                          style={{
                            borderRadius: "10px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            !this.state.course_details.id
                              ? toast("Please select the course")
                              : this.setState(
                                  {
                                    isModalcourseVisible: false,
                                  },
                                  () =>
                                    this.props.doubtsCourse(
                                      this.state.course_details
                                    )
                                );
                          }}
                        >
                          Post Doubts
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            </div>
          )}

          <QuizSharePopup
            ref={(instance) => {
              this.quizSharePopup = instance;
            }}
          />
        </Modal>
      </div>
    );
  }
}

export default DoubtsCoures;

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
