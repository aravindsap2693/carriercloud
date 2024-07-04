import React, { Component } from "react";
import {
  Badge,
  Avatar,
  Button,
  Modal,
  Card,
  Upload,
  Radio,
  FloatButton,
} from "antd";
import { InfoCircleOutlined, AudioOutlined } from "@ant-design/icons";
import pause_icon from "../../../assets/svg-icons/quiz-pause.svg";
import Env, { profileImageUrl } from "../../../utilities/services/Env";
import StorageConfiguration from "../../../utilities/services/StorageConfiguration";
import "../../../assets/css/common.css";
import "../../../assets/css/doubts.css";
import "../../../assets/css/doubts-sidebar.css";
import CourseModulesMenu from "../../../components/CourseModulesMenu";
import follow from "../../../assets/svg-icons/follow.svg";
import followed from "../../../assets/svg-icons/followed.svg";
import share from "../../../assets/svg-icons/share.svg";
import Answer from "../../../assets/svg-icons/doubts_answer_icon.svg";
import { toast } from "react-toastify";
import DoubtsAnswer from "../../../components/Doubt/DoubtsAnswer";
import TextArea from "antd/lib/input/TextArea";
import { connect } from "react-redux";
import { disablePreference } from "../../../reducers/action";
import { CommonService } from "../../../utilities/services/Common";
import admin_mark from "../../../assets/svg-icons/admin_mark.svg";
import image_upload from "../../../assets/svg-icons/image_upload_btn.svg";
import send_doubts from "../../../assets/svg-icons/send_doubts.svg";
import ReactLoading from "react-loading";
import star from "../../../assets/svg-icons/Star.svg";
import CloseCircle from "../../../assets/svg-icons/Image_upload_cancel.svg";
import Close from "../../../assets/svg-icons/ans-close.svg";
import QuizSharePopup from "../../../components/QuizSharePopup";
import ImagePreview from "../../../components/ImagePreview";
import GeneralPopup from "../../../components/GeneralPopup";
// import AudioReactRecorder, { RecordState } from "audio-react-recorder";
import DeleteConfirmationPopup from "../../../components/DeleteConfirmationPopup";
import InfiniteScroll from "react-infinite-scroll-component";
import Skeletons from "../../../components/SkeletonsComponent";
import { analytics } from "../../../firebase-config";
import { logEvent } from "firebase/analytics";
import doubts_feeds from "../../../assets/images/doubts_feeds.jpg";
import pinicon from "../../../assets/svg-icons/pin-icon.svg";

class CourseDoubts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFollow: "",
      followStatus: true,
      doubtdata: [],
      coinDoubt: [],
      totalRecords: "",
      course_id: null,
      doubts_img_url: "",
      doubts_id: "",
      description: "",
      isModalVisible: false,
      activePage: 1,
      itemId: "",
      showMore: false,
      activeLoader: true,
      active_img_Loader: false,
      active_audio_Loader: false,
      total_answer: "",
      total_follows: "",
      is_follow: "",
      course_title: "",
      selectedTag: "all",
      active_Show_more: true,
      doubts_audio_url: null,
      audioStart: true,
      recordState: null,
      timer: 0,
      Dindex: 2,
    };
    this.myRef = React.createRef();
    this.points = React.createRef();
    this.getDoubtsList = this.getDoubtsList.bind(this);
    this.countRef = React.createRef();
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.props.dispatch(disablePreference(true));
    this.getDoubtsList("preference", 1);
    logEvent(analytics, "select_content", {
      page_title: "Course Doubts",
    });
  }

  componentDidUpdate() {
    if (this.state.isModalVisible && this.props.courses.is_subscribed === 1) {
      this.myRef.current.focus();
    }
    if (this.state.timer > 30) {
      this.stop();
    }
  }

  onImageChange = (e) => {
    this.setState({
      originalName: e.file.name,
    });
  };

  getCoinsDetails() {
    const getData = Env.get(this.props.envendpoint + `staticpages/doubt-coins`);
    getData.then((response) => {
      const data = response.data.response.cms[0];
      this.setState({ coinDoubt: data, activeloader: false });
      this.generalPopup.showModal(true, data.content);
    });
  }

  handlePaste = (e) => {
    if (e.clipboardData.files.length) {
      this.setState({
        active_img_Loader: true,
        originalName: e.clipboardData.files[0].name,
      });
      const image_src = e.clipboardData.files[0];
      const formData = new FormData();
      formData.append("file", image_src);
      formData.append("field_name", "support_box");
      formData.append("originalName", this.state.originalName);
      formData.append("posts", "");
      const UploadImage = Env.fileUpload(
        this.props.envendpoint + `images/upload/post`,
        formData
      );
      UploadImage.then(
        (response) => {
          const data = response.data.response.image_name;
          this.setState({
            doubts_img_url: data,
            active_img_Loader: false,
          });
          toast("Image uploaded successfully !");
        },
        (error) => {
          console.error(error);
        }
      );
    }
  };

  async handleImageUpload(e) {
    const formData = new FormData();
    if (e.type === "audio/mp3") {
      this.setState({
        active_audio_Loader: true,
      });
      const audeo_src = e.blob;
      formData.append("file", audeo_src);
      formData.append("field_type", "doubt_post");
      formData.append("originalName", this.state.audioName);
      formData.append("posts", "");
      const UploadImage = Env.fileUpload(
        this.props.envendpoint + `images/upload/post?files_type=audio`,
        formData
      );
      UploadImage.then(
        (response) => {
          const data = response.data.response.image_name;
          this.setState({
            doubts_audio_url: data,
            active_audio_Loader: false,
          });
          toast("Audio uploaded successfully !");
        },
        (error) => {
          console.error(error);
        }
      );
    } else {
      this.setState({
        active_img_Loader: true,
        originalName: e.name,
      });
      const image_src = e.file;
      formData.append("file", image_src);
      formData.append("field_name", "support_box");
      formData.append("originalName", this.state.originalName);
      formData.append("posts", "");
      const UploadImage = Env.fileUpload(
        this.props.envendpoint + `images/upload/post`,
        formData
      );
      UploadImage.then(
        (response) => {
          const data = response.data.response.image_name;
          this.setState({
            doubts_img_url: data,
            active_img_Loader: false,
          });
          toast("Image uploaded successfully !");
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }

  handleFollow = (id, isFollow, user_id) => {
    this.setState({ isFollow: isFollow, followStatus: false });
    const requestBody = {
      vote_type: "follow",
      vote_type_id: id,
    };
    if (user_id.toString() === StorageConfiguration.sessionGetItem("user_id")) {
      toast("you can not Follow your own doubt");
      this.setState({ followStatus: true });
    } else {
      const Followata = Env.post(this.props.envendpoint + `votes`, requestBody);
      Followata.then(
        (response) => {
          const data = response.data.response.follow;
          this.state.doubtdata.filter((item) => {
            if (item.id === id) {
              item.total_follows =
                data.status === 1
                  ? item.total_follows + 1
                  : item.total_follows - 1;
              item.is_follow = data.status;
            }
          });
          this.toggleAnswerPopup();
          this.setState({
            isFollow: data.status,
          });
          toast(
            response.data.response.follow.status === 1
              ? "successfully Followed !"
              : "successfully UnFollowed !"
          );
        },
        (error) => {
          console.error(error);
        }
      );
    }
  };

  togglecloseDoubtsPopup = () => {
    this.setState({ isModalVisible: true });
  };

  onChangeSel = (value) => {
    this.setState({
      course_id: value,
    });
  };

  handleTagChange = (e) => {
    this.setState(
      {
        selectedTag: e.target.value,
        activeLoader: true,
        doubtdata: [],
        activePage: 1,
      },
      () => this.getDoubtsList()
    );
  };

  async getDoubtsList(type, page, ext) {
    const courseId = this.props.courseId;
    let getdoubts = "";
    if (this.props.courses.is_subscribed === 1) {
      getdoubts = Env.get(
        this.props.envendpoint +
          this.getDominantApi() +
          `?page=${!page ? 1 : page}&preference_id[]=${
            this.props.preferences.id
          }${
            this.state.selectedTag === "follow"
              ? `&course_id=${courseId}`
              : `&filters[course_id]=${courseId}`
          }${
            this.state.selectedTag === "answers" ? "&user_type=myanswers" : ""
          }${
            this.state.selectedTag === "solved"
              ? "&filters[is_solved]=1"
              : this.state.selectedTag === "unsolved"
              ? "&filters[is_solved]=0"
              : ""
          }`
      );
    } else {
      getdoubts = Env.get(
        this.props.envendpoint +
          this.getDominantApi() +
          `?course_id[]=${courseId}&page=${!page ? 1 : page}${
            this.state.selectedTag !== "follow"
              ? `&filters[category_id][]=${this.props.preferences.id}`
              : ""
          }${
            this.state.selectedTag === "answers" ? "&user_type=myanswers" : ""
          }${
            this.state.selectedTag === "solved"
              ? "&filters[is_solved]=1"
              : this.state.selectedTag === "unsolved"
              ? "&filters[is_solved]=0"
              : ""
          }`
      );
    }
    await getdoubts.then(
      (response) => {
        const data = response.data.response.posts.data;
        this.setState({
          doubtdata:
            type === "paginate" ? this.state.doubtdata.concat(data) : data,
          activeLoader: false,
          active_Show_more: false,
          totalRecords: response.data.response.posts.total,
          Dindex: 2,
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getDominantApi() {
    var tag = this.state.selectedTag;
    var api = "";
    switch (tag) {
      case "my":
        api = "user/posts";
        return api;
      case "follow":
        api = "follow/posts";
        return api;
      case "answers":
        api = "user/posts";
        return api;
      default:
        api = "posts";
        return api;
    }
  }

  closeDoubts = (data) => {
    this.setState({
      course_id: "",
      isModalVisible: false,
      doubts_img_url: "",
      doubts_audio_url: null,
      description: data,
      // recordState: RecordState.STOP,
    });
  };

  getDoubtsID = (
    id,
    answer,
    follow,
    is_follow,
    issolved,
    is_active,
    course_title
  ) => {
    this.setState({
      doubts_id: id,
      total_answer: answer,
      total_follows: follow,
      is_follow: is_follow,
      issolved: issolved,
      is_active: is_active,
      Dindex: is_active === 1 ? 2 : this.state.Dindex + 1,
      course_title: course_title,
    });
  };

  toggleAnswerPopup = () => {
    this.setState({
      activeLoader: true,
      activePage: 1,
      active_Show_more: false,
      followStatus: !this.state.followStatus,
    });
    this.getDoubtsList("preference", this.state.activePage);
  };

  adddoubts = (id) => {
    let payload = {
      orientation: 0,
      description: this.state.description,
      course_id: id,
      image_url: this.state.doubts_img_url,
      post_type: "query",
      audio_url: this.state.doubts_audio_url,
    };
    const addpost = Env.post(this.props.envendpoint + `posts/add`, payload);
    addpost.then(
      (response) => {
        toast("Doubt has been created successfully");
        this.toggleAnswerPopup();
        this.setState({
          doubts_img_url: "",
          doubts_audio_url: null,
          description: "",
          course_id: "",
          isModalVisible: false,
        });
      },
      (error) => {
        if (error.response.data.status === 300) {
          toast(error.response.data.message);
        } else {
          toast(error.response.data.message.description[0]);
        }
        this.setState({
          doubts_img_url: "",
          doubts_audio_url: null,
          description: "",
          course_id: "",
          isModalVisible: false,
        });
        console.error(error);
      }
    );
  };

  handleRefresh = () => {
    window.scrollTo(0, 0);
    this.setState(
      {
        activeLoader: true,
        doubtdata: [],
        activePage: 1,
      },
      () => this.getDoubtsList()
    );
  };

  getDiscardImage = (data, type) => {
    let payload = {
      file_name: data,
    };
    const getDiscardImage = Env.post(
      this.props.envendpoint + `delete/image/post`,
      payload
    );
    getDiscardImage.then(
      (res) => {
        const response = res.data.response.delete_status;
        if (type === "Image") {
          this.setState({
            doubts_img_url: response ? null : data,
            active_img_Loader: false,
          });
        }
        if (type === "Audio") {
          this.setState({
            doubts_audio_url: response ? null : data,
            active_audio_Loader: false,
          });
        }
        toast(
          response
            ? `${type} is discarded successfully`
            : `${type} is failed to discarded`
        );
        this.DeleteConfirmation.toggleModal(false);
      },
      (error) => {
        console.error(error);
      }
    );
  };

  start = () => {
    const getNavigator = navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    });
    getNavigator.then((stream) => {
      this.setState({
        // recordState: RecordState.START,
        audioStart: false,
        timer: this.state.timer + 1,
      });
      this.countRef.current = setInterval(() => {
        this.setState({
          timer: this.state.timer + 1,
        });
      }, 1000);
    });
    getNavigator.catch((err) => {
      toast("Pls connect the audio device for the record");
      console.error("err", err.message);
    });
  };

  stop = () => {
    this.setState({
      // recordState: RecordState.STOP,
      audioStart: true,
    });
  };

  //audioData contains blob and blobUrl
  onStop = (audioData) => {
    clearInterval(this.countRef.current);
    this.setState({
      // recordState: RecordState.STOP,
      timer: 0,
    });
    this.handleImageUpload(audioData);
  };

  loadMore = () => {
    if (this.props.activeTabIndex.toString() === "8") {
      this.setState(
        (prev) => {
          return { activePage: prev.activePage + 1 };
        },
        () => this.getDoubtsList("paginate", this.state.activePage)
      );
    }
  };

  render() {
    // const { recordState } = this.state;
    const { doubtdata } = this.state;
    this.state.doubts_id !== "" &&
      doubtdata.filter((item) => {
        if (item.id === this.state.doubts_id) {
          item.total_comments = this.state.total_answer;
          item.total_follows = this.state.total_follows;
          item.is_follow = this.state.is_follow;
          item.is_solved = this.state.issolved;
          item.is_active = this.state.is_active;
          if (item.course) {
            item.course.title = this.state.course_title;
          }
        }
        this.setState({
          doubts_id: "",
        });
      });

    return (
      <div className="quiz-container">
        <div className="course-modules-quiz-group-buttons">
          <Radio.Group
            defaultValue="2"
            onChange={this.handleTagChange}
            value={this.state.selectedTag}
            name="selectedTag"
          >
            <Radio.Button
              className="all-courses-quiz-toggle-buttons"
              style={{ margin: "10px" }}
              value="all"
            >
              All Doubts
            </Radio.Button>
            <Radio.Button
              className="all-courses-quiz-toggle-buttons"
              value="my"
              style={{ margin: "10px" }}
            >
              My Doubts
            </Radio.Button>
            <Radio.Button
              className="all-courses-quiz-toggle-buttons"
              value="answers"
              style={{ margin: "10px" }}
            >
              My Answered
            </Radio.Button>
            <Radio.Button
              className="all-courses-quiz-toggle-buttons"
              value="follow"
              style={{ margin: "10px" }}
            >
              Followed
            </Radio.Button>
          </Radio.Group>
        </div>
        <>
          <Modal
            open={this.state.isModalVisible}
            footer={null}
            closable={false}
            width={800}
          >
            <div>
              <div
                style={{
                  position: "absolute",
                  right: "-26px",
                  background: "#0B649D",
                  borderRadius: "0px 20px 20px 0px",
                  padding: "6px 10px",
                  top: "15px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  this.closeDoubts("");
                }}
              >
                <img
                  alt="Close"
                  src={Close}
                  style={{
                    width: "100%",
                    height: "100%",
                    cursor: "pointer",
                  }}
                />
              </div>
              <div>
                <div
                  className="doubts-card-content"
                  style={{ background: "#0B649D", padding: "15px 18px" }}
                >
                  <div className="doubts-card-inner-content">
                    <div className="doubts-card-avatar">
                      <Badge
                        count={
                          this.props.profile_update.role_id !== 5 ? (
                            <img
                              src={admin_mark}
                              alt="admin_mark"
                              className="admin_Check"
                            />
                          ) : this.props.profile_update.level_points ===
                            "No star" ? (
                            ""
                          ) : (
                            <div
                              style={{
                                marginTop: "46px",
                                right: "6px",
                              }}
                            >
                              <img
                                src={star}
                                alt="star"
                                style={{
                                  width: "24px",
                                }}
                              />
                              <span
                                className="doubts-level-count"
                                style={{
                                  right:
                                    this.props.profile_update.level_points === 1
                                      ? "14px"
                                      : this.props.profile_update.level_points >
                                        10
                                      ? "17px"
                                      : "15px",
                                }}
                              >
                                {this.props.profile_update.level_points}
                              </span>
                            </div>
                          )
                        }
                        offset={[0, 30]}
                      >
                        {/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
                          this.props.profile_update.profile_image
                        ) &&
                        !this.props.profile_update.profile_image.includes(
                          "data"
                        ) &&
                        !this.props.profile_update.profile_image.includes(
                          "prtner"
                        ) ? (
                          <Avatar
                            size={45}
                            src={
                              profileImageUrl +
                              this.props.profile_update.profile_image
                            }
                          />
                        ) : (
                          <Avatar
                            style={{
                              color: "#0B649D",
                              background: "#E0F3FF",
                            }}
                            size={45}
                          >
                            {this.props.profile_update.first_name &&
                              this.props.profile_update.first_name
                                .charAt(0)
                                .toUpperCase()}
                          </Avatar>
                        )}
                      </Badge>
                    </div>

                    <div
                      className="add-doubts-card-title"
                      style={{ padding: "10px" }}
                    >
                      {this.props.profile_update.first_name !== undefined &&
                        CommonService.getUppercase(
                          this.props.profile_update.first_name
                        )}{" "}
                      Doubts.....!
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "25px 10px 25px 25px",
                    background: "#E0F3FF",
                    borderRadius:'8px'
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    {this.state.active_img_Loader === true ? (
                      <div
                        style={{
                          background: "rgba(92, 92, 93, 0.68)",
                          borderRadius: "6px",
                          height: "75px",
                          width: "95px",
                          margin: "0px 20px",
                          padding: "6px 97px 6px 35px",
                        }}
                      >
                        <ReactLoading type="spokes" color="#fff" size="small" />
                      </div>
                    ) : (
                      <div className="createdoubts-post-image">
                        {this.state.doubts_img_url && (
                          <>
                            <ImagePreview
                              data={
                                `${this.props.envupdate.react_app_assets_url}posts/images/` +
                                this.state.doubts_img_url
                              }
                              width={"130px"}
                            />
                            <>
                              {this.state.active_img_Loader !== true && (
                                <span
                                  className="Create-closer"
                                  onClick={() => {
                                    this.DeleteConfirmation.toggleModal(
                                      true,
                                      "Image",
                                      this.state.doubts_img_url
                                    );
                                  }}
                                >
                                  <img alt="CloseCircle" src={CloseCircle} />
                                </span>
                              )}
                            </>
                          </>
                        )}
                      </div>
                    )}
                    {this.state.active_audio_Loader === true ? (
                      <div
                        style={{
                          background: "rgba(92, 92, 93, 0.68)",
                          borderRadius: "6px",
                          height: "75px",
                          width: "95px",
                          margin: "0px 20px",
                          padding: "6px 97px 6px 35px",
                        }}
                      >
                        <ReactLoading type="spokes" color="#fff" size="small" />
                      </div>
                    ) : (
                      <div className="createdoubts-post-image">
                        {this.state.doubts_audio_url && (
                          <>
                            <audio
                              controls
                              controlsList="nodownload noplaybackrate"
                            >
                              <source
                                src={
                                  `${this.props.envupdate.react_app_assets_url}posts/images/` +
                                  this.state.doubts_audio_url
                                }
                              />
                            </audio>
                            {this.state.active_audio_Loader !== true && (
                              <span
                                className="Create-audio-closer"
                                onClick={() => {
                                  this.DeleteConfirmation.toggleModal(
                                    true,
                                    "Audio",
                                    this.state.doubts_audio_url
                                  );
                                }}
                              >
                                <img alt="CloseCircle" src={CloseCircle} />
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div
                    className="boubt-btn-flex"
                    onPaste={(e) => this.handlePaste(e)}
                  >
                    <TextArea
                      value={this.state.description}
                      placeholder="Write your Doubts & Just paste(Ctrl+v) your cropped image here"
                      onChange={(e) => {
                        this.setState({
                          description: e.target.value,
                        });
                      }}
                      ref={this.myRef}
                      style={{
                        height: "120px",
                        background: "#fff",
                        width: "85%",
                        borderRadius: "12px",
                      }}
                    />
                    <div className="add-boubt-btn-flex">
                      <Upload
                        customRequest={(e) => this.handleImageUpload(e)}
                        onChange={(e) => this.onImageChange(e)}
                        accept="image/png,image/jpg,image/webp,image/jpeg"
                        showUploadList={false}
                      >
                        <img
                          alt="image_upload"
                          src={image_upload}
                          style={{
                            fontSize: "20px",
                            cursor: "pointer",
                          }}
                        />
                      </Upload>
                      {this.props.courses.is_audio === 1 && (
                        <div
                          style={{
                            margin: "0px 0px 0px 0px",
                            padding: "1px 0px 1px 15px",
                          }}
                        >
                          <div style={{ display: "none" }}>
                            {/* <AudioReactRecorder
                              state={recordState}
                              canvasWidth="0"
                              canvasHeight="0"
                              backgroundColor={false}
                              foregroundColor={false}
                              autoPlay
                              type="audio/mp3"
                              onStop={this.onStop}
                            /> */}
                          </div>
                          {this.state.audioStart == true ? (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-evenly",
                              }}
                            >
                              <Button
                                onClick={this.start}
                                type="primary"
                                shape="circle"
                                icon={<AudioOutlined />}
                                size={"large"}
                              />
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-evenly",
                                alignItems: "center",
                              }}
                            >
                              <div>
                                <img
                                  alt="pause_icon"
                                  src={pause_icon}
                                  style={{
                                    margin: "0px 10px 0px 10px",
                                  }}
                                  onClick={this.stop}
                                />
                              </div>
                              <h1
                                style={{
                                  margin: "0px",
                                }}
                              >
                                |
                              </h1>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "start",
                                  justifyContent: "start",
                                  padding: "1px 0px 10px 6px",
                                }}
                              >
                                <span
                                  style={{
                                    width: "16.5px",
                                    height: "16px",
                                    border: "6px solid #f50202",
                                    borderRadius: "50%",
                                    marginTop: "10px",
                                    color: "red",
                                  }}
                                ></span>
                                <span
                                  style={{
                                    fontWeight: "bold",
                                    paddingLeft: "5px",
                                    marginTop: "8px",
                                  }}
                                >
                                  {CommonService.handleStartTimer(
                                    this.state.timer
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <div style={{ padding: "0px 1px 0px 18px" }}>
                        <img
                          alt="send_doubts"
                          src={send_doubts}
                          style={{
                            fontSize: "20px",
                            color: "#0B649D",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            this.state.description == ""
                              ? this.setState({ isModalVisible: true }, () =>
                                  toast("Doubt content field is empty")
                                )
                              : this.state.active_img_Loader
                              ? toast("Doubt Image is still Loading")
                              : !this.state.audioStart
                              ? toast("Doubt Audio is still Recording")
                              : this.setState(
                                  {
                                    isModalVisible: !this.state.isModalVisible,
                                  },
                                  () => this.adddoubts(this.props.courseId)
                                );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
          {this.state.selectedTag == "all" && (
            <div className="doubts-section">
              <Card
                className="doubts-cards"
                cover={
                  <div className="add-doubts-cards">
                    <p
                      style={{
                        fontSize: "25px",
                        color: " #0B649D",
                        margin: "0",
                      }}
                    >
                      Hi{" "}
                      {this.props.profile_update.first_name !== undefined &&
                        CommonService.getUppercase(
                          this.props.profile_update.first_name
                        )}
                      , Post your doubts...
                    </p>
                    <div
                      style={{
                        padding: "15px",
                        color: " #0B649D",
                      }}
                    >
                      <Button
                        type="primary"
                        className="add-doubts-btn"
                        onClick={() =>
                          this.props.profile_update.comment_block !== 1
                            ? this.props.courses.is_subscribed === 1
                              ? this.setState({
                                  isModalVisible: !this.state.isModalVisible,
                                })
                              : toast("Please subscribe the course!")
                            : toast("This user is blocked")
                        }
                      >
                        Create
                      </Button>
                    </div>
                  </div>
                }
              ></Card>
            </div>
          )}
          {this.state.selectedTag == "my" &&
            this.state.doubtdata.length !== 0 && (
              <div
                style={{
                  background: "rgb(204 255 238 / 70%)",
                  border: "1px solid rgb(167 229 208)",
                  borderRadius: "8px",
                  padding: "25px",
                  margin: "auto",
                  fontWeight: "500",
                }}
              >
                <InfoCircleOutlined />
                {"  "}
                You must choose Best Answer for your doubts
              </div>
            )}
          {this.state.doubtdata.length > 0 ? (
            <InfiniteScroll
              dataLength={this.state.doubtdata.length}
              next={this.loadMore}
              hasMore={this.state.totalRecords > this.state.doubtdata.length}
              loader={<Skeletons type={"doubts"} />}
              scrollableTarget="scrollableDiv"
            >
              {this.state.doubtdata.map((item, index) => (
                <div key={index}>
                  {item.is_active == 1 && (
                    <>
                      {index === this.state.Dindex && (
                        <div
                          className="doubts-section"
                          style={{ cursor: "pointer" }}
                          key={item.id}
                          onClick={() => {
                            this.getCoinsDetails();
                          }}
                        >
                          <Card
                            style={{
                              width: "100%",
                              margin: "20px auto",
                              boxShadow: "0px 2px 10px rgb(90 114 200 / 10%)",
                            }}
                            cover={
                              <img
                                src={
                                  this.props.banner_update.doubts_banner
                                    ? `${this.props.envupdate.react_app_assets_url}banner/images/` +
                                      this.props.banner_update.doubts_banner
                                    : doubts_feeds
                                }
                                alt="doubts_feeds"
                              />
                            }
                          />
                        </div>
                      )}
                      <div className="doubts-section">
                        <Card
                          key={index}
                          className="doubts-cards"
                          title={
                            <a className="doubts-card-content">
                              <div className="doubts-card-inner-content">
                                <div className="doubts-card-avatar">
                                  {/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
                                    item.user.profile_image
                                  ) &&
                                  !item.user.profile_image.includes("data") &&
                                  !item.user.profile_image.includes(
                                    "prtner"
                                  ) ? (
                                    <Badge
                                      count={
                                        item.user.role_permission_id !== 5 ? (
                                          <img
                                            src={admin_mark}
                                            className="admin_Check"
                                            alt="admin_mark"
                                          />
                                        ) : item.user.level_points ==
                                          "No star" ? (
                                          ""
                                        ) : (
                                          <div
                                            style={{
                                              marginTop: "46px",
                                              right: "6px",
                                            }}
                                          >
                                            <img
                                              alt="star"
                                              src={star}
                                              style={{
                                                width: "24px",
                                              }}
                                            />
                                            <span
                                              className="doubts-level-count"
                                              style={{
                                                right:
                                                  item.user.level_points == 1
                                                    ? "14px"
                                                    : item.user.level_points >
                                                      10
                                                    ? "17px"
                                                    : "15px",
                                              }}
                                            >
                                              {item.user.level_points}
                                            </span>
                                          </div>
                                        )
                                      }
                                      offset={[0, 30]}
                                    >
                                      <Avatar
                                        size={50}
                                        src={
                                          profileImageUrl +
                                          item.user.profile_image
                                        }
                                      />
                                    </Badge>
                                  ) : (
                                    <Badge
                                      count={
                                        item.user.role_permission_id !== 5 ? (
                                          <img
                                            alt="admin_mark"
                                            src={admin_mark}
                                            className="admin_Check"
                                          />
                                        ) : item.user.level_points ===
                                          "No star" ? (
                                          ""
                                        ) : (
                                          <div
                                            style={{
                                              marginTop: "46px",
                                              right: "6px",
                                            }}
                                          >
                                            <img
                                              alt="star"
                                              src={star}
                                              style={{
                                                width: "24px",
                                              }}
                                            />
                                            <span
                                              className="doubts-level-count"
                                              style={{
                                                right:
                                                  this.props.profile_update
                                                    .level_points == 1
                                                    ? "14px"
                                                    : this.props.profile_update
                                                        .level_points > 10
                                                    ? "17px"
                                                    : "15px",
                                              }}
                                            >
                                              {item.user.level_points}
                                            </span>
                                          </div>
                                        )
                                      }
                                      offset={[0, 30]}
                                    >
                                      <Avatar
                                        style={{ background: "#0b649d" }}
                                        size={50}
                                      >
                                        {item.user.first_name
                                          .charAt(0)
                                          .toUpperCase()}
                                      </Avatar>
                                    </Badge>
                                  )}
                                </div>
                                <div className="doubts-card-title">
                                  {item.user.first_name !== undefined &&
                                    CommonService.getUppercase(
                                      item.user.first_name
                                    )}{" "}
                                  {item.user.last_name}
                                  {item.is_pin === 1 && (
                                    <span style={{ padding: "0px 12px" }}>
                                      <img
                                        alt="pinicon"
                                        src={pinicon}
                                        style={{
                                          width: "17px",
                                        }}
                                      />
                                    </span>
                                  )}
                                </div>
                                <div className="doubts-card-publish">
                                  {CommonService.getDoubtPostedTime(
                                    item.created_at
                                  )}{" "}
                                  {this.props.courses.is_subscribed === 1
                                    ? `| ${item.course.title}`
                                    : null}
                                </div>
                              </div>
                              <div className="doubts-Menu">
                                <CourseModulesMenu
                                  {...this.props}
                                  type="post"
                                  item={item}
                                  handle_type="doubts"
                                  id={item.id}
                                  is_favourite={item.is_favourite}
                                  is_pin={
                                    this.state.selectedTag === "all"
                                      ? item.is_pin
                                      : null
                                  }
                                  toggleDoubtsPopup={this.toggleAnswerPopup}
                                  getDoubtsID={this.getDoubtsID}
                                  refresh={this.handleRefresh}
                                />
                              </div>
                            </a>
                          }
                          cover={
                            <div className="doubts-card-body">
                              <>
                                <div className="doubts-card-discubtion">
                                  {this.state.showMore === true &&
                                  this.state.itemId === item.id ? (
                                    <p
                                      id="append"
                                      style={{
                                        margin: "0",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                      }}
                                      className="doubts-card-text"
                                    >
                                      {item.description}
                                      <span
                                        onClick={() => {
                                          this.setState({
                                            showMore: false,
                                          });
                                        }}
                                        style={{
                                          color: "#13558f",
                                          cursor: "pointer",
                                          fontSize: "16px",
                                        }}
                                      >
                                        {"  "}...Read less
                                      </span>
                                    </p>
                                  ) : (
                                    <p
                                      id="append"
                                      style={{
                                        margin: "0",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                      }}
                                      className="doubts-card-text"
                                    >
                                      {item.description.length > 520
                                        ? CommonService.getShowLess(
                                            item.description
                                          )
                                        : item.description}
                                      {item.description.length > 620 && (
                                        <span
                                          onClick={() => {
                                            this.setState({
                                              showMore: true,
                                              itemId: item.id,
                                            });
                                          }}
                                          style={{
                                            color: "#13558f",
                                            cursor: "pointer",
                                            fontSize: "16px",
                                          }}
                                        >
                                          Read more
                                        </span>
                                      )}
                                    </p>
                                  )}
                                </div>
                                {item.image_url !== "" &&
                                  item.image_url !== null && (
                                    <div className="doubts-post-image">
                                      <ImagePreview
                                        data={
                                          Env.getImageUrl(
                                            `${this.props.envupdate.react_app_assets_url}posts`
                                          ) + item.image_url
                                        }
                                        width={"300px"}
                                        class="doubts-cover-image"
                                      />
                                    </div>
                                  )}
                                {item.audio_url !== "" &&
                                  item.audio_url !== null && (
                                    <div className="doubts-post-image">
                                      <audio
                                        controls
                                        controlsList="nodownload noplaybackrate"
                                      >
                                        <source
                                          src={
                                            `${this.props.envupdate.react_app_assets_url}posts/images/` +
                                            item.audio_url
                                          }
                                        />
                                      </audio>
                                    </div>
                                  )}
                              </>
                              <div className="doubts-card-action-bar">
                                <div className="doubts-card-action">
                                  <div className="doubts-card-action-columns">
                                    <span
                                      className="doubts-card-action-text"
                                      onClick={(e) => {
                                        this.state.followStatus &&
                                          this.handleFollow(
                                            item.id,
                                            item.is_follow,
                                            item.user_id
                                          );
                                      }}
                                    >
                                      <img
                                        src={
                                          item.is_follow == 1
                                            ? followed
                                            : follow
                                        }
                                        style={{
                                          width: "20px",
                                        }}
                                        alt="follow"
                                      />
                                      <span className="doubts-card-action-values">
                                        {item.total_follows}
                                        {item.total_follows <= 1
                                          ? " Follow"
                                          : " Follows"}
                                      </span>
                                    </span>
                                  </div>
                                  <div
                                    className="doubts-card-action-columns"
                                    onClick={() => {
                                      this.props.courses.is_subscribed === 1
                                        ? this.DoubtsAnswer.showModal(
                                            "My Doubts Ans",
                                            item
                                          )
                                        : toast("Please subscribe the course!");
                                    }}
                                  >
                                    <span className="doubts-card-action-text">
                                      <img
                                        alt="Answer"
                                        src={Answer}
                                        style={{
                                          margin: "0px",
                                        }}
                                        id="comments-icon"
                                      />
                                      <span className="doubts-card-action-values">
                                        {item.total_comments}
                                        {item.total_comments <= 1
                                          ? " Answer"
                                          : " Answers"}
                                      </span>
                                    </span>
                                  </div>
                                  <div className="doubts-card-action-columns">
                                    <span
                                      className="doubts-card-action-text"
                                      onClick={() =>
                                        this.quizSharePopup.showModal(
                                          "post",
                                          item.id
                                        )
                                      }
                                    >
                                      <img
                                        alt="share"
                                        src={share}
                                        style={{ width: "16px" }}
                                      />
                                      <span className="doubts-card-action-values">
                                        Share
                                      </span>
                                    </span>
                                  </div>
                                </div>
                                {item.is_solved == 1 ? (
                                  <div
                                    className="doubts-details-lable"
                                    onClick={() =>
                                      this.props.courses.is_subscribed === 1
                                        ? this.DoubtsAnswer.showModal(
                                            "Doubts Solved",
                                            item
                                          )
                                        : toast("Please subscribe the course!")
                                    }
                                  >
                                    Doubt Solved
                                  </div>
                                ) : (
                                  <div>
                                    <Button
                                      type="primary"
                                      className="btn-answer"
                                      onClick={() =>
                                        this.props.courses.is_subscribed === 1
                                          ? this.DoubtsAnswer.showModal(
                                              "My Doubts",
                                              item
                                            )
                                          : toast(
                                              "Please subscribe the course!"
                                            )
                                      }
                                    >
                                      Answer
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          }
                        ></Card>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </InfiniteScroll>
          ) : (
            this.state.activeLoader === true && (
              <>
                <Skeletons type={"doubts"} />
              </>
            )
          )}

          {this.state.activePage > 1 && (
            <div style={{ right: "384px" }}>
              <FloatButton.BackTop />
            </div>
          )}

          {this.state.activeLoader === false &&
            this.state.doubtdata.length === 0 && (
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
                  No Doubts Found.
                </span>
              </div>
            )}
        </>
        <DeleteConfirmationPopup
          ref={(instance) => {
            this.DeleteConfirmation = instance;
          }}
          dispachDelete={this.getDiscardImage}
          {...this.props}
        />
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
        <DoubtsAnswer
          ref={(instance) => {
            this.DoubtsAnswer = instance;
          }}
          closeDoubts={this.closeDoubts}
          toggleDoubtsPopup={this.toggleAnswerPopup}
          togglecloseDoubtsPopup={this.togglecloseDoubtsPopup}
          getDoubtsID={this.getDoubtsID}
          handleFollow={this.handleFollow}
          preferences_id={this.props.preferences.id}
          {...this.props}
        />
      </div>
    );
  }
}

export default connect((state) => {
  return {
    preferences: state.preferences,
    profile_update: state.profile_update,
    envupdate: state.envupdate,
    envendpoint: state.envendpoint,
    banner_update: state.banner_update,
  };
})(CourseDoubts);
