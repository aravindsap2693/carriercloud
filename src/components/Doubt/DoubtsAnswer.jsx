import React, { Component } from "react";
import { Divider, Avatar, Card, Modal, Badge, Upload, Button } from "antd";
import { AudioOutlined } from "@ant-design/icons";
import Env, { profileImageUrl } from "../../utilities/services/Env";
import CourseModulesMenu from "../CourseModulesMenu";
import admin_mark from "../../assets/svg-icons/admin_mark.svg";
import follow from "../../assets/svg-icons/follow.svg";
import followed from "../../assets/svg-icons/followed.svg";
import share from "../../assets/svg-icons/share.svg";
import QuizSharePopup from "../QuizSharePopup";
import Answer from "../../assets/svg-icons/doubts_answer_icon.svg";
import "../../assets/css/doubt-answer.css";
import star from "../../assets/svg-icons/Star.svg";
import { toast } from "react-toastify";
import StorageConfiguration from "../../utilities/services/StorageConfiguration";
import Close from "../../assets/svg-icons/ans-close.svg";
import TextArea from "antd/lib/input/TextArea";
import ReactLoading from "react-loading";
import CloseCircle from "../../assets/svg-icons/Image_upload_cancel.svg";
import image_upload from "../../assets/svg-icons/image_upload_btn.svg";
import send_doubts from "../../assets/svg-icons/send_doubts.svg";
import DoubtsAnswerComponent from "../courseActions/DoubtsAnswerComponent";
import "../../assets/css/course-list.css";
import { CommonService } from "../../utilities/services/Common";
import $ from "jquery";
import ImagePreview from "../ImagePreview";
import pause_icon from "../../assets/svg-icons/quiz-pause.svg";
// import AudioReactRecorder, { RecordState } from "audio-react-recorder";
import InfiniteScroll from "react-infinite-scroll-component";
import DeleteConfirmationPopup from "../DeleteConfirmationPopup";
import Skeletons from "../SkeletonsComponent";

class DoubtsAnswer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalcourseVisible: false,
      type: "",
      visible: 10,
      action: true,
      is_solved: null,
      doubts_img_url: null,
      data: [],
      answerdata: [],
      filterExams: [],
      filterSubjects: [],
      activePage: 1,
      course_details: {},
      description: "",
      originalName: "",
      showMore: false,
      itemId: "",
      activeLoader: true,
      disableSendAction: true,
      active_img_Loader: false,
      active_audio_Loader: false,
      selectedFilterTypeId: 1,
      is_follow: null,
      doubts_audio_url: null,
      audioName: "",
      show_loader: false,
      user_id: StorageConfiguration.sessionGetItem("user_id"),
      course_title: "",
      audioStart: true,
      timer: 0,
      recordState: null,
      reply_count: null,
    };
    this.myRef = React.createRef();
    this.countRef = React.createRef();
  }

  componentDidUpdate() {
    if (this.state.answerdata.is_solved === 0) {
      if (this.state.action) {
        if (
          this.state.isModalcourseVisible &&
          this.state.type === "My Doubts"
        ) {
          this.myRef.current.focus();
        }
      }
    }
    if (this.state.timer > 30) {
      this.stop();
    }
  }

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

  loadMore = () => {
    this.setState((prev) => {
      return { visible: prev.visible + 5 };
    });
  };

  showModal = (Value, DATA) => {
    if (
      Value === "My Doubts" ||
      Value === "My Doubts Ans" ||
      Value === "Doubts Solved" ||
      Value === "Share Doubts Ans"
    ) {
      this.setState(
        {
          isModalcourseVisible: true,
          type: Value,
          answerdata: DATA,
          is_solved: DATA.is_solved,
          is_follow: DATA.is_follow,
        },
        () => this.getAnswer(this.state.answerdata.id)
      );
    }
  };

  getAnswer = (id) => {
    const getAnswer = Env.get(
      this.props.envendpoint + `post/comment/answer/${id}?rowsPerPage=100`
    );
    getAnswer.then(
      (response) => {
        const data = response.data.response.userpost;
        this.setState({
          data: data.replies,
          is_audio: data.course.is_audio,
          activeLoader: false,
          reply_count: data.reply_count,
        });
      },
      (error) => {
        console.error(error);
      }
    );
  };

  handlePaste = (e) => {
    if (e.clipboardData.files.length) {
      this.setState({
        active_img_Loader: true,
        show_loader: true,
        img: e.clipboardData.files[0],
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

  onImageChange = (e) => {
    this.setState({
      show_loader: true,
      img_src: e.file.originFileObj,
      originalName: e.file.name,
    });
  };

  handleFollow = (id, isFollow, user_id) => {
    const requestBody = {
      vote_type: "follow",
      vote_type_id: id,
    };
    if (user_id.toString() === StorageConfiguration.sessionGetItem("user_id")) {
      toast("you can not Follow your own doubt");
    } else {
      this.setState({
        is_follow: isFollow === 0 ? 1 : 0,
        action: false,
        answerdata: {
          ...this.state.answerdata,
          is_follow: isFollow === 0 ? 1 : 0,
          total_follows:
            isFollow === 0
              ? this.state.answerdata.total_follows + 1
              : this.state.answerdata.total_follows - 1,
        },
      });
      const Followata = Env.post(this.props.envendpoint + `votes`, requestBody);
      Followata.then(
        (response) => {
          const data = response.data.response.follow;
          // this.setState({
          //   is_follow: data.status,
          //   action: false,
          //   answerdata: {
          //     ...this.state.answerdata,
          //     is_follow: isFollow === 0 ? 1 : 0,
          //     total_follows:
          //       isFollow === 0
          //         ? this.state.answerdata.total_follows + 1
          //         : this.state.answerdata.total_follows - 1,
          //   },
          // });
          toast(
            data.status === 1
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

  changecourseTitle = (name) => {
    this.setState({
      course_title: name,
    });
  };

  sendAnswer(id, comment, img) {
    if (this.state.disableSendAction) {
      this.setState({ disableSendAction: false });
      if (comment !== "" || img !== "") {
        let payload = {
          comments: this.state.description,
          parent_id: 0,
          image_url: this.state.doubts_img_url,
          audio_url: this.state.doubts_audio_url,
          user_post_id: id,
          ebook_id: id,
        };
        const AnswerData = Env.post(
          this.props.envendpoint + `post/answer/add`,
          payload
        );
        AnswerData.then(
          (response) => {
            toast("Answer added successfully");
            this.setState({
              description: "",
              doubts_img_url: null,
              doubts_audio_url: null,
              show_loader: false,
              activeLoader: false,
              disableSendAction: true,
              answerdata: {
                ...this.state.answerdata,
                total_comments: this.state.answerdata.total_comments + 1,
              },
            });
            this.getAnswer(this.state.answerdata.id);
          },
          (error) => {
            if (error.response !== undefined && error.response.status === 300) {
              toast(error.response.data.message);
            } else {
              toast("The comments may not be greater than 2000 characters.");
            }
            this.setState({
              show_loader: false,
              description: "",
              doubts_img_url: null,
            });
            console.error(error);
          }
        );
      }
    }
  }

  undoCallback = () => {
    this.setState({
      answerdata: {
        ...this.state.answerdata,
        is_solved: this.state.answerdata.is_solved === 0 ? 1 : 0,
      },
    });
  };

  getCourseid(item) {
    this.setState({ course_details: { id: item.id, name: item.title } });
  }

  toggleDoubtsAnswerPopup = (id) => {
    this.getAnswer(id);
  };

  closeDoubtAnswer = (callback_data) => {
    this.setState({ isModalcourseVisible: callback_data }, () =>
      this.props.toggleDoubtsPopup()
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
      toast("Pls connect the audio device for the recording");
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
      uploadtype: true,
      show_loader: true,
      timer: 0,
    });
    this.handleImageUpload(audioData);
  };

  render() {
    // const { recordState } = this.state;
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
            <>
              <div
                className="doubt-answer-btn"
                onClick={() => {
                  if ($("#teatx-area-id").length !== 0) {
                    let height_num = parseInt(
                      $("#teatx-area-id")[0].style.height
                    );
                    if (height_num !== 40) {
                      $("#teatx-area-id").css("height", "40px");
                    }
                  }
                  this.setState({
                    isModalcourseVisible: false,
                    doubts_img_url: null,
                    description: "",
                    data: [],
                    visible: 10,
                    action: true,
                    show_loader: false,
                    activeLoader: true,
                    active_img_Loader: false,
                    active_audio_Loader: false,
                  });
                  this.props.getDoubtsID(
                    this.state.answerdata.id,
                    this.state.data.length,
                    this.state.answerdata.total_follows,
                    this.state.is_follow,
                    this.state.answerdata.is_solved,
                    this.state.answerdata.is_active,
                    this.state.course_title === ""
                      ? this.state.answerdata.course.title
                      : this.state.course_title
                  );
                }}
              >
                <img
                  src={Close}
                  alt="Close"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <div className="doubts-card-content">
                {this.state.answerdata.user !== undefined && (
                  <div className="doubts-card-inner-content">
                    <>
                      {this.state.answerdata.user.level_points !== "No star" &&
                        this.state.answerdata.user.role_permission_id !== 1 && (
                          <div className="doubts-level-content-creat">
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
                                  this.state.answerdata.user.level_points == 1
                                    ? "14px"
                                    : this.state.answerdata.user.level_points >
                                      10
                                    ? "17px"
                                    : "15px",
                              }}
                            >
                              {this.state.answerdata.user.level_points}
                            </span>
                          </div>
                        )}
                    </>
                    <div className="doubts-card-avatar">
                      <Badge
                        count={
                          this.state.answerdata.user.role_permission_id !==
                          5 ? (
                            <img
                              alt="admin_mark"
                              src={admin_mark}
                              className="admin_Check"
                            />
                          ) : (
                            ""
                          )
                        }
                        offset={[0, 30]}
                      >
                        {/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
                          this.state.answerdata.user.profile_image
                        ) &&
                        !this.state.answerdata.user.profile_image.includes(
                          "data"
                        ) &&
                        !this.state.answerdata.user.profile_image.includes(
                          "prtner"
                        ) ? (
                          <Avatar
                            size={45}
                            src={
                              profileImageUrl +
                              this.state.answerdata.user.profile_image
                            }
                          />
                        ) : (
                          <Avatar
                            style={{
                              color: "#E0F3FF",
                              background: "#0B649D",
                            }}
                            size={45}
                          >
                            {this.state.answerdata.user.first_name
                              .charAt(0)
                              .toUpperCase()}
                          </Avatar>
                        )}
                      </Badge>
                    </div>

                    <div className="doubts-card-title">
                      {this.state.answerdata.user.first_name !== undefined &&
                        CommonService.getUppercase(
                          this.state.answerdata.user.first_name
                        )}{" "}
                      {this.state.answerdata.user.last_name}
                      {this.props.profile_update.role_id !== 5 && (
                        <>
                          &nbsp;&bull;&nbsp;
                          <span
                            onDoubleClick={(e) => {
                              CommonService.handleCopy(e);
                            }}
                          >
                            {this.state.answerdata.user.id}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="doubts-card-publish">
                      {CommonService.getDoubtPostedTime(
                        this.state.answerdata.created_at
                      )}{" "}
                      |{" "}
                      {this.state.course_title !== ""
                        ? this.state.course_title
                        : this.state.answerdata.course.title}
                    </div>
                  </div>
                )}
                <div className="doubts-details-Menu">
                  <CourseModulesMenu
                    {...this.props}
                    type={
                      this.state.type === "Share Doubts Ans" ? "doubts" : "post"
                    }
                    id={this.state.answerdata.id}
                    item={this.state.answerdata}
                    is_pin={
                      parseInt(this.props.activeTabIndex) === 1
                        ? this.state.answerdata.is_pin
                        : null
                    }
                    handle_type="doubtspopup"
                    is_favourite={this.state.answerdata.is_favourite}
                    toggleDoubtsPopup={this.props.closeDoubts}
                    closeDoubtAnswer={this.closeDoubtAnswer}
                    changecourseTitle={this.changecourseTitle}
                  />
                </div>
              </div>

              <div
                className={
                  this.state.answerdata.is_solved !== 0
                    ? "solved-add-doubt-answer"
                    : "answer-doubts-popup"
                }
                id="doubt-answer-scroll1"
              >
                <InfiniteScroll
                  dataLength={this.state.visible}
                  hasMore={this.state.data.length > this.state.visible}
                  next={this.loadMore}
                  loader={<Skeletons type={"doubtsPop"} />}
                  scrollableTarget="doubt-answer-scroll1"
                  style={{ overflow: "hidden" }}
                >
                  <div
                    style={{
                      padding:
                        this.state.data.length < 3
                          ? "0px 0px 20px 0px"
                          : "0px 0px 30px 0px",
                    }}
                  >
                    <div className="doubts-section">
                      <Card
                        className="doubts-details-cards"
                        cover={
                          <div className="doubts-card-body">
                            <>
                              <div className="doubts-popup-card-discubtion">
                                {this.state.showMore &&
                                this.state.itemId ===
                                  this.state.answerdata.id ? (
                                  <p className="doubts-popup-card-discubtion-text">
                                    {this.state.answerdata.description}
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
                                      ...Read less
                                    </span>
                                  </p>
                                ) : (
                                  <p className="doubts-popup-card-discubtion-text">
                                    {this.state.answerdata.description.length >
                                    520
                                      ? CommonService.getShowLess(
                                          this.state.answerdata.description
                                        )
                                      : this.state.answerdata.description}
                                    {this.state.answerdata.description.length >
                                      620 && (
                                      <span
                                        onClick={() => {
                                          this.setState({
                                            showMore: true,
                                            itemId: this.state.answerdata.id,
                                          });
                                        }}
                                        style={{
                                          color: "#13558f",
                                          cursor: "pointer",
                                          fontSize: "16px",
                                        }}
                                      >
                                        ...Read more
                                      </span>
                                    )}
                                  </p>
                                )}
                              </div>
                              {this.state.answerdata.image_url !== "" &&
                                this.state.answerdata.image_url !== null && (
                                  <div className="doubts-post-image">
                                    <ImagePreview
                                      data={
                                        Env.getImageUrl(
                                          this.props.envupdate
                                            .react_app_assets_url + "posts"
                                        ) + this.state.answerdata.image_url
                                      }
                                      width={"300px"}
                                    />
                                  </div>
                                )}
                              {this.state.answerdata.audio_url !== "" &&
                                this.state.answerdata.audio_url !== null && (
                                  <div className="doubts-post-image">
                                    <audio
                                      controls
                                      controlsList="nodownload noplaybackrate"
                                    >
                                      <source
                                        src={
                                          `${this.props.envupdate.react_app_assets_url}posts/images/` +
                                          this.state.answerdata.audio_url
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
                                      this.handleFollow(
                                        this.state.answerdata.id,
                                        this.state.answerdata.is_follow,
                                        this.state.answerdata.user_id
                                      );
                                    }}
                                  >
                                    <img
                                      src={
                                        this.state.is_follow === 1
                                          ? followed
                                          : follow
                                      }
                                      style={{
                                        width: "20px",
                                      }}
                                      alt="follow"
                                    />
                                    <span className="doubts-card-action-values">
                                      {this.state.answerdata.total_follows}{" "}
                                      {this.state.answerdata.total_follows <= 1
                                        ? " Follow"
                                        : " Follows"}
                                    </span>
                                  </span>
                                </div>
                                <div className="doubts-card-action-columns">
                                  <span className="doubts-card-action-text">
                                    <img
                                      src={Answer}
                                      alt="Answer"
                                      style={{
                                        margin: "0px",
                                      }}
                                      id="comments-icon"
                                    />
                                    <span className="doubts-card-action-values">
                                      {this.state.answerdata.total_comments}{" "}
                                      {this.state.answerdata.total_comments <= 1
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
                                        this.state.type === "Share Doubts Ans"
                                          ? "doubts"
                                          : "post",
                                        this.state.answerdata.id
                                      )
                                    }
                                  >
                                    <img
                                      src={share}
                                      alt="share"
                                      style={{ width: "16px" }}
                                    />
                                    <span className="doubts-card-action-values">
                                      Share
                                    </span>
                                  </span>
                                </div>
                              </div>
                              {this.state.answerdata.is_solved == 1 && (
                                <div className="doubts-details-lable">
                                  Doubt Solved
                                </div>
                              )}
                            </div>
                          </div>
                        }
                      >
                        <div className="doubts-details-Divider">
                          <Divider />
                        </div>
                      </Card>
                    </div>
                    <div
                      style={{
                        padding: "0px 20px 20px 20px",
                      }}
                    >
                      {this.state.data.length > 0 ? (
                        <DoubtsAnswerComponent
                          {...this.props}
                          visible={this.state.visible}
                          type={this.state.type}
                          id={this.state.answerdata.id}
                          doubts_user={this.state.answerdata.user.id}
                          data={this.state.data}
                          toggleDoubtsAnswerPopup={this.toggleDoubtsAnswerPopup}
                          undoCallback={this.undoCallback}
                          is_solved={this.state.answerdata.is_solved}
                          is_audio={this.state.answerdata.course.is_audio}
                        />
                      ) : this.state.activeLoader ? (
                        <Skeletons type={"doubtsPop"} />
                      ) : (
                        <Card
                          className="doubts-details-cards"
                          cover={
                            <div className="doubts-card-body">
                              <div
                                style={{
                                  minHeight:
                                    this.state.answerdata.image_url !== "" &&
                                    this.state.answerdata.image_url !== null
                                      ? "40vh"
                                      : "40vh",
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
                                  Be the first one to answer.
                                </span>
                              </div>
                            </div>
                          }
                        />
                      )}
                    </div>
                  </div>
                </InfiniteScroll>
              </div>
              <div
                style={{
                  borderRadius: "0px 0px 8px 8px",
                  padding:
                    this.state.answerdata.is_solved == 1
                      ? "0px 0px 5px 0px"
                      : "0px",
                }}
              >
                {this.state.answerdata.is_solved == 0 && (
                  <div
                    style={{
                      padding: "20px",
                      background: "#E0F3FF",
                      borderRadius: "0px 0px 8px 8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                      }}
                    >
                      {this.state.active_img_Loader ? (
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
                          <ReactLoading
                            type="spokes"
                            color="#fff"
                            size="small"
                          />
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
                                {!this.state.active_img_Loader && (
                                  <span
                                    className="ans-closes"
                                    onClick={() => {
                                      this.DeleteConfirmation.toggleModal(
                                        true,
                                        "Image",
                                        this.state.doubts_img_url
                                      );
                                    }}
                                  >
                                    <img src={CloseCircle} alt="CloseCircle" />
                                  </span>
                                )}
                              </>
                            </>
                          )}
                        </div>
                      )}
                      {this.state.active_audio_Loader ? (
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
                          <ReactLoading
                            type="spokes"
                            color="#fff"
                            size="small"
                          />
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
                              <>
                                {!this.state.active_audio_Loader && (
                                  <span
                                    className="ans-closes"
                                    onClick={() => {
                                      this.DeleteConfirmation.toggleModal(
                                        true,
                                        "Audio",
                                        this.state.doubts_audio_url
                                      );
                                    }}
                                  >
                                    <img src={CloseCircle} alt="CloseCircle" />
                                  </span>
                                )}
                              </>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div
                      className="boubt-btn-flex"
                      onPaste={(e) => this.handlePaste(e)}
                    >
                      <div className="doubts-card-inner-content">
                        {/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
                          this.props.profile_update.profile_image
                        ) &&
                        !this.props.profile_update.profile_image.includes(
                          "data"
                        ) &&
                        !this.props.profile_update.profile_image.includes(
                          "prtner"
                        ) ? (
                          <div className="doubts-card-avatar">
                            <Avatar
                              style={{
                                color: "#E0F3FF",
                              }}
                              size={45}
                              src={
                                profileImageUrl +
                                this.props.profile_update.profile_image
                              }
                            />
                          </div>
                        ) : (
                          <div className="doubts-card-avatar">
                            <Avatar
                              style={{
                                color: "#E0F3FF",
                                background: "#0B649D",
                              }}
                              size={45}
                            >
                              {this.props.profile_update.first_name !==
                                undefined &&
                                this.props.profile_update.first_name
                                  .charAt(0)
                                  .toUpperCase()}
                            </Avatar>
                          </div>
                        )}
                      </div>
                      <TextArea
                        value={this.state.description}
                        placeholder="Write your Answer with Detail Explanation..."
                        onChange={(e) => {
                          this.setState({
                            description: e.target.value,
                          });
                        }}
                        className="doubts-card-add-answer"
                        id="teatx-area-id"
                        ref={this.myRef}
                        autoFocus
                        style={{
                          height: "40px",
                          background: "#fff",
                          width: "85%",
                          borderRadius: "12px",
                          padding: "10px",
                        }}
                      />
                      <div className="add-boubt-btn-flex">
                        <Upload
                          customRequest={(e) => this.handleImageUpload(e)}
                          onChange={(e) => this.onImageChange}
                          showUploadList={false}
                          accept="image/png,image/jpg,image/webp,image/jpeg"
                        >
                          <img
                            src={image_upload}
                            alt="upload"
                            style={{
                              fontSize: "20px",
                              cursor: "pointer",
                            }}
                          />
                        </Upload>
                        {this.state.answerdata.course.is_audio === 1 && (
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
                            {this.state.audioStart ? (
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
                        <div
                          style={{
                            padding:
                              this.state.answerdata.course.is_audio === 1
                                ? "0px 10px 0px 13px"
                                : "0px 20px",
                          }}
                        >
                          <img
                            src={send_doubts}
                            style={{
                              fontSize: "20px",
                              color: "#0B649D",
                              cursor: "pointer",
                            }}
                            alt="send_doubts"
                            onClick={() => {
                              this.state.description === "" &&
                              this.state.doubts_img_url === null
                                ? toast("Answer content field is empty")
                                : !this.state.active_img_Loader
                                ? this.sendAnswer(
                                    this.state.answerdata.id,
                                    this.state.description,
                                    this.state.doubts_img_url
                                  )
                                : toast("Answer Image is still Loading");
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

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
        </Modal>
      </div>
    );
  }
}

export default DoubtsAnswer;
