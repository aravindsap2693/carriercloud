import React, { Component } from "react";
import { Badge, Avatar, Typography, Button, Upload } from "antd";
import { AudioOutlined } from "@ant-design/icons";
import Env, { profileImageUrl } from "../../utilities/services/Env";
import "../../assets/css/article-detail.css";
import { CommonService } from "../../utilities/services/Common";
import { toast } from "react-toastify";
import return_icon from "../../assets/svg-icons/return.svg";
import StorageConfiguration from "../../utilities/services/StorageConfiguration";
import TextArea from "antd/lib/input/TextArea";
import image_upload from "../../assets/svg-icons/image_upload_btn.svg";
import send_doubts from "../../assets/svg-icons/send_doubts.svg";
import award from "../../assets/svg-icons/award.svg";
import clapping from "../../assets/svg-icons/hands-clapping-light.svg";
import doubts_undo from "../../assets/svg-icons/doubts_undo.svg";
import ReactLoading from "react-loading";
import CloseCircle from "../../assets/svg-icons/Image_upload_cancel.svg";
import star from "../../assets/svg-icons/Star.svg";
import pause_icon from "../../assets/svg-icons/quiz-pause.svg";
import like from "../../assets/svg-icons/home-like.svg";
import liked from "../../assets/svg-icons/home-liked.svg";
import CourseModulesMenu from "../CourseModulesMenu";
import ImagePreview from "../ImagePreview";
import admin_mark from "../../assets/svg-icons/admin_mark.svg";
// import AudioReactRecorder, { RecordState } from "audio-react-recorder";
import DeleteConfirmationPopup from "../DeleteConfirmationPopup";

const { Text } = Typography;

class DoubtsAnswerComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedAnswer: 0,
      selectedReply: 0,
      openReplies: false,
      AnswerData: [],
      doubts_img_url: "",
      repliesFlag: false,
      recordState: null,
      best_answer: 0,
      doubtsData: props.data,
      description: "",
      originalName: "",
      Liked_id: "",
      showMore: false,
      itemId: "",
      active_img_Loader: false,
      active_audio_Loader: false,
      activeLoader: false,
      show_loader: false,
      disableBestAnswer: true,
      disableUndo: true,
      doubts_audio_url: null,
      audioStart: true,
      disableSendAction: true,
      timer: 0,
    };
    this.countRef = React.createRef();
  }

  componentDidUpdate() {
    if (this.state.timer > 30) {
      this.stop();
    }
  }

  onImageChange = (e) => {
    this.setState({
      show_loader: true,
      img_src: e.file.originFileObj,
      active_img_Loader: true,
      originalName: e.file.name,
    });
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
        // audioName: e.file.name,
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

  sendAnswer = (id, comment, img) => {
    if (this.state.disableSendAction) {
      if (comment !== "" || img !== "") {
        this.setState({ disableSendAction: false });
        let payload = {
          orientation: 0,
          comments: this.state.description,
          parent_id: id,
          image_url: this.state.doubts_img_url,
          user_post_id: this.props.id,
          audio_url: this.state.doubts_audio_url,
        };
        const AnswerData = Env.post(
          this.props.envendpoint + `post/answer/add`,
          payload
        );
        AnswerData.then(
          (response) => {
            this.setState({
              description: "",
              doubts_img_url: "",
              show_loader: false,
              activeLoader: false,
              disableSendAction: true,
              active_img_Loader: false,
              doubts_audio_url: null,
              active_audio_Loader: false,
            });
            toast("Reply added successfully");
            this.props.toggleDoubtsAnswerPopup(this.props.id);
          },
          (error) => {
            if (error.response.data.status === 300) {
              toast(error.response.data.message);
            } else {
              toast(error.response.data.message.description[0]);
            }
            this.setState({
              description: "",
              doubts_img_url: "",
              show_loader: false,
              activeLoader: false,
              disableSendAction: true,
              active_img_Loader: false,
              doubts_audio_url: null,
              active_audio_Loader: false,
            });
            console.error(error);
          }
        );
      } else {
        toast("Reply field is empty");
      }
    }
  };

  handleLike = (is_like) => {
    const requestBody = {
      vote_type: "answer",
      vote_type_id: this.state.Liked_id,
    };
    this.handleLikeCount(is_like, this.state.Liked_id);
    const likeData = Env.post(this.props.envendpoint + `votes`, requestBody);
    likeData.then(
      (response) => {
        toast(
          response.data.response.vote.status === 1 ? "Liked !" : "Unliked !"
        );
        this.props.toggleDoubtsAnswerPopup(this.props.id);
      },
      (error) => {
        console.error(error);
      }
    );
  };

  handleLikeCount = (is_like, Liked_id) => {
    let doubtsData = this.state.doubtsData.map((element, index) => {
      if (element.id === Liked_id) {
        element.total_votes =
          is_like === 0 ? element.total_votes + 1 : element.total_votes - 1;
        element.is_like = is_like === 1 ? 0 : 1;
      }
      return element;
    });
    this.setState({ doubtsData: doubtsData });
  };

  hendlelable(uid, id, v) {
    this.setState({
      best_answer: v,
      isModalVisible: false,
      activeLoader: true,
    });
    let getPoints = "";
    if (v !== 0) {
      getPoints = Env.post(
        this.props.envendpoint +
          `post/best_answer?answer_id=${id}&user_id=${uid}&user_post_id=${
            this.props.id
          }&best_answer=${v}${
            this.props.profile_update.role_id !== 5 ? `&is_admin=${v}` : ``
          }`
      );
    } else {
      getPoints = Env.post(
        this.props.envendpoint +
          `post/best_answer?answer_id=${id}&user_id=${uid}&user_post_id=${this.props.id}&best_answer=${v}&is_admin=${v}`
      );
    }
    getPoints.then(
      (response) => {
        this.props.toggleDoubtsAnswerPopup(this.props.id);
        toast(v === 0 ? "Doubt is Unsolved !" : "Doubt is Solved !");
        this.props.undoCallback();
        this.setState({
          activeLoader: false,
          disableUndo: !this.state.disableBestAnswer,
          disableBestAnswer: !this.state.disableUndo,
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }

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
    let data = this.state.doubtsData;
    let test = data.filter((item) => item.best_answer === 1);
    if (test.length > 0) {
      data = data.filter((item) => item.id !== test[0].id);
      data.unshift(test[0]);
    }
    return (
      <>
        <div className="main-layout">
          {data.slice(0, this.props.visible).map((element, index) => (
            <div
              key={index}
              className="doubts-answer-row"
              style={{
                borderBottom:
                  index < this.state.doubtsData.length - 1
                    ? "1px solid rgba(0, 0, 0, 0.06)"
                    : "",
              }}
            >
              <div className="doubts-ans-card-avatar">
                {/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
                  element.user.profile_image
                ) &&
                !element.user.profile_image.includes("data") &&
                !element.user.profile_image.includes("prtner") ? (
                  <Badge
                    count={
                      element.user.role_permission_id !== 5 ? (
                        <img
                          src={admin_mark}
                          alt="admin_mark"
                          className="admin_Check"
                        />
                      ) : element.user.level_points === "No star" ? (
                        ""
                      ) : (
                        <div
                          style={{
                            marginTop: "43px",
                            right: "8px",
                          }}
                        >
                          <img
                            src={star}
                            alt="star"
                            style={{
                              width: "26px",
                            }}
                          />
                          <span
                            className="doubts-level-count"
                            style={{
                              right:
                                element.user.level_points.toString() === "1"
                                  ? "15px"
                                  : element.user.level_points < 10
                                  ? "17px"
                                  : "15px",
                            }}
                          >
                            {element.user.level_points}
                          </span>
                        </div>
                      )
                    }
                    offset={[0, 30]}
                  >
                    <Avatar
                      size={45}
                      src={profileImageUrl + element.user.profile_image}
                    />
                  </Badge>
                ) : (
                  <Badge
                    count={
                      element.user.role_permission_id !== 5 ? (
                        <img
                          src={admin_mark}
                          alt="admin_mark"
                          className="admin_Check"
                        />
                      ) : element.user.level_points === "No star" ? (
                        ""
                      ) : (
                        <div
                          style={{
                            marginTop: "43px",
                            right: "8px",
                          }}
                        >
                          <img
                            src={star}
                            alt="star"
                            style={{
                              width: "26px",
                            }}
                          />
                          <span
                            className="doubts-level-count"
                            style={{
                              right:
                                element.user.level_points.toString() === "1"
                                  ? "15px"
                                  : element.user.level_points < 10
                                  ? "17px"
                                  : "15px",
                            }}
                          >
                            {element.user.level_points}
                          </span>
                        </div>
                      )
                    }
                    offset={[0, 30]}
                  >
                    <Avatar style={{ background: "#0b649d" }} size={45}>
                      {element.user.first_name !== undefined &&
                        CommonService.getInitialUppercase(
                          element.user.first_name
                        )}
                    </Avatar>
                  </Badge>
                )}
              </div>
              <div
                style={{
                  background: element.best_answer === 1 && "#EFFFF4",
                  padding: "0px 10px 2px 11px",
                  width: "100%",
                }}
              >
                <div className="doubts-answer-flex-col">
                  <div className="doubts-answer-flex">
                    <div
                      style={{
                        padding: "5px",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div className="doubts-answer-user">
                        {element.user.first_name !== undefined &&
                          CommonService.getUppercase(element.user.first_name)}
                        {" " + element.user.last_name}

                        <span className="doubts-answer-published">
                          {" | "}
                          {CommonService.getDoubtPostedTime(element.created_at)}
                        </span>
                        {this.props.profile_update.role_id !== 5 && (
                          <>
                            &nbsp;&bull;&nbsp;
                            <span
                              onDoubleClick={(e) => {
                                CommonService.handleCopy(e);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              {element.user.id}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {this.props.is_solved === 0 && (
                    <div className="doubts-details-Menu">
                      <CourseModulesMenu
                        {...this.props}
                        type="answer"
                        id={element.id}
                        is_favourite={element.is_like}
                        user_post_id={this.props.id}
                        toggleDoubtsAnswerPopup={
                          this.props.toggleDoubtsAnswerPopup
                        }
                      />
                    </div>
                  )}
                  {element.best_answer === 1 && (
                    <div className="doubts-answer-col">
                      <div
                        className="doubt-best-answer"
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "start",
                          padding: "10px 0px",
                        }}
                      >
                        <img src={clapping} alt="clapping" />
                        <>
                          {element.user_id.toString() ===
                            StorageConfiguration.sessionGetItem("user_id") &&
                            "Your answer is "}
                          Marked as Best Answer By
                          {element.is_admin.toString() === "1"
                            ? " Admin"
                            : " Author"}
                        </>
                      </div>
                      {(this.props.doubts_user.toString() ===
                        StorageConfiguration.sessionGetItem("user_id") ||
                        (this.props.profile_update.role_id !== 5 &&
                          this.props.profile_update.role_id !== 8)) && (
                        <div
                          onClick={() => {
                            if (this.state.disableUndo) {
                              this.hendlelable(element.user_id, element.id, 0);
                            }

                            this.setState({
                              disableUndo: false,
                            });
                          }}
                        >
                          <img src={doubts_undo} alt="doubts_undo" />
                          <Text
                            className="ant-breadcrumb-link"
                            style={{ padding: "10px", fontWeight: "bold" }}
                          >
                            Undo
                          </Text>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: "10px 0px",
                    width: "100%",
                    wordBreak: "break-all",
                  }}
                >
                  {element.comments !== "" && element.comments !== null && (
                    <div
                      style={{
                        background: element.best_answer !== 1 && "#F5F6FA",
                        border:
                          element.best_answer === 1
                            ? "2px solid #01A54E "
                            : "none",
                        padding: "13px 28px",
                        borderRadius: "25px",
                        fontSize: "15px",
                        display: "inline-block",
                      }}
                    >
                      {this.state.showMore &&
                      this.state.itemId === element.id ? (
                        <div
                          style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {element.comments}{" "}
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
                        </div>
                      ) : (
                        <div
                          style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {element.comments.length > 520
                            ? CommonService.getShowLess(element.comments)
                            : element.comments}
                          {element.comments.length > 620 && (
                            <span
                              onClick={() => {
                                this.setState({
                                  showMore: true,
                                  itemId: element.id,
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
                        </div>
                      )}
                    </div>
                  )}
                  {element.image_url !== "" && element.image_url !== null && (
                    <div className="doubts-post-image">
                      <ImagePreview
                        data={
                          Env.getImageUrl(
                            `${this.props.envupdate.react_app_assets_url}posts`
                          ) + element.image_url
                        }
                        width={"250px"}
                      />
                    </div>
                  )}
                  {element.audio_url !== "" && element.audio_url !== null && (
                    <div className="doubts-post-image">
                      <audio controls controlsList="nodownload noplaybackrate">
                        <source
                          src={
                            `${this.props.envupdate.react_app_assets_url}posts/images/` +
                            element.audio_url
                          }
                          type="audio/mpeg"
                        />
                      </audio>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          top: "8px",
                          left: "30px",
                          color: "#0B649D",
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          this.setState({
                            selectedAnswer:
                              this.state.selectedAnswer === element.id
                                ? ""
                                : element.id,
                            openReplies: !this.state.openReplies,
                          })
                        }
                      >
                        <img src={return_icon} alt="return_icon" /> Reply
                      </div>
                      <div
                        onClick={() => {
                          this.setState({ Liked_id: element.id }, () =>
                            this.handleLike(element.is_like)
                          );
                        }}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer",
                          padding: "0px 10px 0px 15px",
                        }}
                      >
                        {element.is_like === 0 ? (
                          <img
                            src={like}
                            className="unlike"
                            alt="liked"
                            style={{ padding: "0px 10px" }}
                          />
                        ) : (
                          <img
                            src={liked}
                            className="like"
                            alt="liked"
                            style={{ padding: "0px 10px" }}
                          />
                        )}
                        <span>
                          {CommonService.convertIntoKiloPrefix(
                            element.total_votes
                          ) + " "}
                        </span>
                        <span
                          style={{ padding: "10px 10px" }}
                          className="action-text"
                        >
                          {"  "} {element.total_votes <= 1 ? " Like" : " Likes"}
                        </span>
                      </div>
                    </div>
                    {this.props.is_solved === 0 && (
                      <>
                        {element.user_id !== this.props.doubts_user && (
                          <>
                            {element.best_answer !== 1 &&
                              (this.props.doubts_user.toString() ===
                                StorageConfiguration.sessionGetItem(
                                  "user_id"
                                ) ||
                                (this.props.profile_update.role_id !== 5 &&
                                  this.props.profile_update.role_id !== 8)) && (
                                <div
                                  style={{
                                    cursor: "pointer",
                                    color: " #0B649D",
                                  }}
                                  onClick={() => {
                                    this.setState({
                                      disableBestAnswer: false,
                                    });
                                    this.state.disableBestAnswer &&
                                      this.hendlelable(
                                        element.user_id,
                                        element.id,
                                        1
                                      );
                                  }}
                                >
                                  <span>
                                    <img src={award} alt="award" />
                                  </span>
                                  Marked as Best Answer
                                </div>
                              )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                  {this.state.selectedAnswer === element.id && (
                    <>
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
                                      className="Create-closer"
                                      onClick={() => {
                                        this.DeleteConfirmation.toggleModal(
                                          true,
                                          "Image",
                                          this.state.doubts_img_url
                                        );
                                      }}
                                    >
                                      <img
                                        src={CloseCircle}
                                        alt="CloseCircle"
                                      />
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
                                      <img
                                        src={CloseCircle}
                                        alt="CloseCircle"
                                      />
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
                        style={{
                          borderBottom:
                            element.comments_data.length > 0 &&
                            "2px solid rgba(90, 114, 200, 0.1",
                        }}
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
                          <div className="doubts-card-avatar">
                            <Avatar
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
                        <div
                          style={{ flex: 1, margin: "0px -20px 0px 0px" }}
                          onPaste={(e) => this.handlePaste(e)}
                        >
                          <TextArea
                            id="reply_text"
                            placeholder="Write your Reply"
                            value={this.state.description}
                            onChange={(e) =>
                              this.setState({
                                description: e.target.value,
                              })
                            }
                            style={{
                              borderRadius: "20px",
                              background: "#F5F6FA",
                              color: "#334D6E",
                              fontSize: "15px",
                              height: "40px",
                              border: "1px solid transparent",
                              padding: "10px 20px",
                            }}
                          />
                        </div>
                        <div className="add-boubt-btn-flex">
                          <Upload
                            customRequest={(e) => this.handleImageUpload(e)}
                            onChange={this.onImageChange}
                            accept="image/png,image/jpg,image/webp"
                            showUploadList={false}
                          >
                            <img
                              src={image_upload}
                              style={{
                                fontSize: "20px",
                                cursor: "pointer",
                              }}
                              alt="image_upload"
                            />
                          </Upload>
                          {this.props.is_audio === 1 && (
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
                                      src={pause_icon}
                                      alt="pause_icon"
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
                                this.props.is_audio === 1
                                  ? "0px 10px 0px 13px"
                                  : "0px 20px",
                            }}
                          >
                            <img
                              src={send_doubts}
                              alt="send_doubts"
                              style={{
                                fontSize: "20px",
                                color: "#0B649D",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                this.sendAnswer(
                                  element.id,
                                  this.state.description,
                                  this.state.doubts_img_url
                                );
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  <>
                    {this.state.repliesFlag === true &&
                    this.state.selectedReply === element.id ? (
                      <>
                        {element.comments_data.map((replies) => (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "start",
                              padding: "15px 10px 0px 10px",
                            }}
                          >
                            <div className="doubts-ans-card-avatar">
                              {/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
                                replies.user.profile_image
                              ) &&
                              !replies.user.profile_image.includes("data") &&
                              !replies.user.profile_image.includes("prtner") ? (
                                <Badge
                                  count={
                                    replies.user.role_permission_id !== 5 ? (
                                      <img
                                        src={admin_mark}
                                        alt="admin_mark"
                                        className="admin_Check"
                                      />
                                    ) : replies.user.level_points ===
                                      "No star" ? (
                                      ""
                                    ) : (
                                      <div
                                        style={{
                                          marginTop: "43px",
                                          right: "8px",
                                        }}
                                      >
                                        <img
                                          src={star}
                                          alt="star"
                                          style={{
                                            width: "26px",
                                          }}
                                        />
                                        <span
                                          className="doubts-level-count"
                                          style={{
                                            right:
                                              replies.user.level_points.toString() ===
                                              "1"
                                                ? "15px"
                                                : replies.user.level_points < 10
                                                ? "17px"
                                                : "15px",
                                          }}
                                        >
                                          {replies.user.level_points}
                                        </span>
                                      </div>
                                    )
                                  }
                                  offset={[0, 30]}
                                >
                                  <Avatar
                                    size={45}
                                    src={
                                      profileImageUrl +
                                      replies.user.profile_image
                                    }
                                  />
                                </Badge>
                              ) : (
                                <Badge
                                  count={
                                    replies.user.role_permission_id !== 5 ? (
                                      <img
                                        src={admin_mark}
                                        alt="admin_mark"
                                        className="admin_Check"
                                      />
                                    ) : replies.user.level_points ===
                                      "No star" ? (
                                      ""
                                    ) : (
                                      <div
                                        style={{
                                          marginTop: "43px",
                                          right: "8px",
                                        }}
                                      >
                                        <img
                                          src={star}
                                          alt="star"
                                          style={{
                                            width: "26px",
                                          }}
                                        />
                                        <span
                                          className="doubts-level-count"
                                          style={{
                                            right:
                                              replies.user.level_points.toString() ===
                                              1
                                                ? "15px"
                                                : replies.user.level_points < 10
                                                ? "17px"
                                                : "15px",
                                          }}
                                        >
                                          {replies.user.level_points}
                                        </span>
                                      </div>
                                    )
                                  }
                                  offset={[0, 30]}
                                >
                                  <Avatar
                                    style={{ background: "#0b649d" }}
                                    size={45}
                                  >
                                    {replies.user.first_name != null &&
                                      replies.user.first_name
                                        .charAt(0)
                                        .toUpperCase()}
                                  </Avatar>
                                </Badge>
                              )}
                            </div>
                            <div
                              style={{
                                flex: 1,
                                margin: "0px 10px",
                                width: "100%",
                              }}
                            >
                              <div style={{ fontWeight: 900 }}>
                                {element.comments_data[0].user.first_name !==
                                  undefined &&
                                  CommonService.getUppercase(
                                    replies.user.first_name
                                  )}
                                {" " + replies.user.last_name}
                                <span
                                  style={{
                                    color: "grey",
                                    fontWeight: 500,
                                    fontSize: "13px",
                                  }}
                                >
                                  {" | "}
                                  {CommonService.getDoubtPostedTime(
                                    replies.created_at
                                  )}
                                </span>
                                {this.props.profile_update.role_id !== 5 && (
                                  <>
                                    &nbsp;&bull;&nbsp;
                                    <span
                                      onDoubleClick={(e) => {
                                        CommonService.handleCopy(e);
                                      }}
                                      style={{ cursor: "pointer" }}
                                    >
                                      {replies.user.id}
                                    </span>
                                  </>
                                )}
                              </div>

                              <div style={{ padding: "12px 0px" }}>
                                {replies.comments !== "" &&
                                  replies.comments !== null && (
                                    <div
                                      style={{
                                        background:
                                          element.best_answer !== 1 &&
                                          "#F5F6FA",
                                        border:
                                          element.best_answer.toString() === "1"
                                            ? "2px solid #01A54E "
                                            : "none",
                                        padding: "15px 25px",
                                        borderRadius: "25px",
                                        fontSize: "16px",
                                        display: "inline-block",
                                      }}
                                    >
                                      {this.state.showMore === true &&
                                      this.state.itemId === replies.id ? (
                                        <div
                                          style={{
                                            whiteSpace: "pre-wrap",
                                            wordBreak: "break-word",
                                          }}
                                        >
                                          {replies.comments}
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
                                        </div>
                                      ) : (
                                        <div
                                          style={{
                                            whiteSpace: "pre-wrap",
                                            wordBreak: "break-word",
                                          }}
                                        >
                                          {" "}
                                          {replies.comments.length > 520
                                            ? CommonService.getShowLess(
                                                replies.comments
                                              )
                                            : replies.comments}
                                          {replies.comments.length > 620 && (
                                            <span
                                              onClick={() => {
                                                this.setState({
                                                  showMore: true,
                                                  itemId: replies.id,
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
                                        </div>
                                      )}
                                    </div>
                                  )}
                                {replies.image_url !== "" &&
                                  replies.image_url !== null && (
                                    <div className="doubts-post-image">
                                      <ImagePreview
                                        data={
                                          Env.getImageUrl(
                                            `${this.props.envupdate.react_app_assets_url}posts`
                                          ) + replies.image_url
                                        }
                                        width={"250px"}
                                      />
                                    </div>
                                  )}
                                {replies.audio_url !== "" &&
                                  replies.audio_url !== null && (
                                    <div className="doubts-post-image">
                                      <audio
                                        controls
                                        controlsList="nodownload noplaybackrate"
                                      >
                                        <source
                                          src={
                                            `${this.props.envupdate.react_app_assets_url}posts/images/` +
                                            replies.audio_url
                                          }
                                          type="audio/mpeg"
                                        />
                                      </audio>
                                    </div>
                                  )}
                              </div>
                              <div
                                onClick={() => {
                                  this.setState({ Liked_id: replies.id }, () =>
                                    this.handleLike()
                                  );
                                }}
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "center",
                                  cursor: "pointer",
                                }}
                              >
                                {replies.is_like === 0 ? (
                                  <img
                                    src={like}
                                    className="unlike"
                                    alt="liked"
                                    style={{ padding: "0px 10px" }}
                                  />
                                ) : (
                                  <img
                                    src={liked}
                                    className="like"
                                    alt="liked"
                                    style={{ padding: "0px 10px" }}
                                  />
                                )}
                                <span>
                                  {CommonService.convertIntoKiloPrefix(
                                    replies.total_votes
                                  ) + " "}
                                </span>
                                <span
                                  style={{ padding: "10px 10px" }}
                                  className="action-text"
                                >
                                  {"  "}
                                  {replies.total_votes <= 1
                                    ? " Like"
                                    : " Likes"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div>
                        {element.comments_data.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "start",
                              padding: "20px 10px",
                            }}
                          >
                            <div>
                              {/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
                                element.comments_data[0].user.profile_image
                              ) &&
                              !element.comments_data[0].user.profile_image.includes(
                                "data"
                              ) &&
                              !element.comments_data[0].user.profile_image.includes(
                                "prtner"
                              ) ? (
                                <Badge
                                  count={
                                    element.comments_data[0].user
                                      .role_permission_id !== 5 ? (
                                      <img
                                        src={admin_mark}
                                        alt="admin_mark"
                                        className="admin_Check"
                                      />
                                    ) : element.comments_data[0].user
                                        .level_points === "No star" ? (
                                      ""
                                    ) : (
                                      <div
                                        style={{
                                          marginTop: "43px",
                                          right: "8px",
                                        }}
                                      >
                                        <img
                                          src={star}
                                          alt="star"
                                          style={{
                                            width: "26px",
                                          }}
                                        />
                                        <span
                                          className="doubts-level-count"
                                          style={{
                                            right:
                                              element.comments_data[0].user.level_points.toString() ===
                                              "1"
                                                ? "15px"
                                                : element.comments_data[0].user
                                                    .level_points < 10
                                                ? "17px"
                                                : "15px",
                                          }}
                                        >
                                          {
                                            element.comments_data[0].user
                                              .level_points
                                          }
                                        </span>
                                      </div>
                                    )
                                  }
                                  offset={[0, 30]}
                                >
                                  <Avatar
                                    size={45}
                                    src={
                                      profileImageUrl +
                                      element.comments_data[0].user
                                        .profile_image
                                    }
                                  />
                                </Badge>
                              ) : (
                                <Badge
                                  count={
                                    element.comments_data[0].user
                                      .role_permission_id !== 5 ? (
                                      <img
                                        src={admin_mark}
                                        alt="admin_mark"
                                        className="admin_Check"
                                      />
                                    ) : element.comments_data[0].user
                                        .level_points === "No star" ? (
                                      ""
                                    ) : (
                                      <div
                                        style={{
                                          marginTop: "43px",
                                          right: "8px",
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
                                              element.comments_data[0].user.level_points.toString() ===
                                              "1"
                                                ? "15px"
                                                : element.comments_data[0].user
                                                    .level_points < 10
                                                ? "17px"
                                                : "15px",
                                          }}
                                        >
                                          {
                                            element.comments_data[0].user
                                              .level_points
                                          }
                                        </span>
                                      </div>
                                    )
                                  }
                                  offset={[0, 30]}
                                >
                                  <Avatar
                                    style={{ background: "#0b649d" }}
                                    size={45}
                                  >
                                    {element.comments_data[0].user.first_name !=
                                      null &&
                                      element.comments_data[0].user.first_name
                                        .charAt(0)
                                        .toUpperCase()}
                                  </Avatar>
                                </Badge>
                              )}
                            </div>
                            <div
                              style={{
                                flex: 1,
                                margin: "0px 15px",
                              }}
                            >
                              <div
                                style={{
                                  width: "100%",
                                  borderRadius: "25px",
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <div style={{ fontWeight: 900 }}>
                                  {element.comments_data[0].user.first_name !==
                                    undefined &&
                                    CommonService.getUppercase(
                                      element.comments_data[0].user.first_name
                                    )}
                                  {" " +
                                    element.comments_data[0].user
                                      .last_name}{" "}
                                  <span
                                    style={{
                                      color: "grey",
                                      fontWeight: 500,
                                      fontSize: "13px",
                                    }}
                                  >
                                    {" | "}
                                    {CommonService.getDoubtPostedTime(
                                      element.comments_data[0].created_at
                                    )}
                                  </span>
                                  {this.props.profile_update.role_id !== 5 && (
                                    <>
                                      &nbsp;&bull;&nbsp;
                                      <span
                                        onDoubleClick={(e) => {
                                          CommonService.handleCopy(e);
                                        }}
                                        style={{ cursor: "pointer" }}
                                      >
                                        {element.comments_data[0].user.id}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <div style={{ padding: "12px 0px" }}>
                                  {element.comments_data[0].comments !== "" && (
                                    <div
                                      style={{
                                        background:
                                          element.best_answer !== 1 &&
                                          "#F5F6FA",
                                        border:
                                          element.best_answer === 1
                                            ? "2px solid #01A54E "
                                            : "none",
                                        padding: "15px 25px",
                                        borderRadius: "25px",
                                        fontSize: "16px",
                                        display: "inline-block",
                                      }}
                                    >
                                      {this.state.showMore &&
                                      this.state.itemId ===
                                        element.comments_data[0].id ? (
                                        <div
                                          style={{
                                            whiteSpace: "pre-wrap",
                                            wordBreak: "break-word",
                                          }}
                                        >
                                          {" "}
                                          {element.comments_data[0].comments}
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
                                        </div>
                                      ) : (
                                        <div
                                          style={{
                                            whiteSpace: "pre-wrap",
                                            wordBreak: "break-word",
                                          }}
                                        >
                                          {" "}
                                          {element.comments_data[0].comments
                                            .length > 520
                                            ? CommonService.getShowLess(
                                                element.comments_data[0]
                                                  .comments
                                              )
                                            : element.comments_data[0].comments}
                                          {element.comments_data[0].comments
                                            .length > 620 && (
                                            <span
                                              onClick={() => {
                                                this.setState({
                                                  showMore: true,
                                                  itemId:
                                                    element.comments_data[0].id,
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
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {element.comments_data[0].image_url !== "" &&
                                  element.comments_data[0].image_url !==
                                    null && (
                                    <div
                                      style={{
                                        borderRadius: "25px",
                                      }}
                                      className="doubts-post-image"
                                    >
                                      <ImagePreview
                                        data={
                                          Env.getImageUrl(
                                            `${this.props.envupdate.react_app_assets_url}posts`
                                          ) + element.comments_data[0].image_url
                                        }
                                        width={"250px"}
                                      />
                                    </div>
                                  )}
                                {element.comments_data[0].audio_url !== "" &&
                                  element.comments_data[0].audio_url !==
                                    null && (
                                    <div className="doubts-post-image">
                                      <audio
                                        controls
                                        controlsList="nodownload noplaybackrate"
                                      >
                                        <source
                                          src={
                                            `${this.props.envupdate.react_app_assets_url}posts/images/` +
                                            element.comments_data[0].audio_url
                                          }
                                          type="audio/mpeg"
                                        />
                                      </audio>
                                    </div>
                                  )}
                              </div>
                              <div
                                onClick={() => {
                                  this.setState(
                                    { Liked_id: element.comments_data[0].id },
                                    () => this.handleLike()
                                  );
                                }}
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "center",
                                  cursor: "pointer",
                                }}
                              >
                                {element.comments_data[0].is_like === 0 ? (
                                  <img
                                    src={like}
                                    className="unlike"
                                    alt="liked"
                                    style={{ padding: "0px 10px" }}
                                  />
                                ) : (
                                  <img
                                    src={liked}
                                    className="like"
                                    alt="liked"
                                    style={{ padding: "0px 10px" }}
                                  />
                                )}
                                <span>
                                  {CommonService.convertIntoKiloPrefix(
                                    element.comments_data[0].total_votes
                                  ) + " "}
                                </span>
                                <span
                                  style={{ padding: "10px 10px" }}
                                  className="action-text"
                                >
                                  {"  "}
                                  {element.comments_data[0].total_votes <= 1
                                    ? " Like"
                                    : " Likes"}
                                </span>
                              </div>
                              {element.comments_data[1] && (
                                <div
                                  onClick={() =>
                                    this.setState({
                                      repliesFlag: !this.state.repliesFlag,
                                      selectedReply: element.id,
                                    })
                                  }
                                  style={{
                                    position: "relative",
                                    top: "8px",
                                    left: "30px",
                                    color: "#0B649D",
                                    fontWeight: 900,
                                    cursor: "pointer",
                                  }}
                                >
                                  <img src={return_icon} alt="return_icon" />{" "}
                                  {element.comments_data.length - 1} more
                                  replies..
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                </div>
              </div>
            </div>
          ))}
          <DeleteConfirmationPopup
            ref={(instance) => {
              this.DeleteConfirmation = instance;
            }}
            dispachDelete={this.getDiscardImage}
            {...this.props}
          />
        </div>
      </>
    );
  }
}

export default DoubtsAnswerComponent;
