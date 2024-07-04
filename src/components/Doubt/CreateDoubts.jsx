import React from "react";
import { Badge, Avatar, Modal } from "antd";
import Close from "../../assets/svg-icons/ans-close.svg";
import Env, { profileImageUrl } from "../../utilities/services/Env";
import "../../assets/css/common.css";
import "../../assets/css/doubts.css";
import { toast } from "react-toastify";
import TextArea from "antd/lib/input/TextArea";
import { CommonService } from "../../utilities/services/Common";
import send_doubts from "../../assets/svg-icons/send_doubts.svg";
import "../../assets/css/doubts-sidebar.css";
import ReactLoading from "react-loading";
import star from "../../assets/svg-icons/Star.svg";
import admin_mark from "../../assets/svg-icons/admin_mark.svg";
import ImagePreview from "../ImagePreview";
import DoubtsCoures from "./DoubtsCoures";

export default class CreateDoubts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      props: [],
      form: [],
      doubts_img_url: "",
      active_img_Loader: false,
      originalName: "",
      description: "",
      Course_id: "",
      show_loader: false,
      is_doubt_shown: 0,
    };
  }

  toggleModal(state, course_id, is_doubt_shown) {
    this.setState({
      visible: !this.state.visible,
      form: state,
      Course_id: course_id,
      is_doubt_shown: is_doubt_shown,
    });
    this.handleImageUpload(state);
  }

  async handleImageUpload(temp) {
    this.setState({
      show_loader: true,
      active_img_Loader: true,
      originalName: temp.name,
    });
    const image_src = temp;
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

  adddoubts = (id) => {
    let payload = {
      orientation: 0,
      description: this.state.description,
      course_id: id,
      image_url: this.state.doubts_img_url,
      post_type: "query",
    };
    const addpost = Env.post(this.props.envendpoint + `posts/add`, payload);
    addpost.then(
      (response) => {
        toast("Doubt has been created successfully");
        this.setState({
          doubts_img_url: "",
          description: "",
          Course_id: "",
          visible: false,
          show_loader: false,
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
          description: "",
          course_id: "",
          visible: false,
        });
        console.error(error);
      }
    );
  };

  handleType(value) {
    // if (this.state.is_doubt_shown) {
    this.adddoubts(this.state.Course_id);
    // } else {
    //   this.DoubtsCoures.showModal("Add Doubts", this.props.preferences.id, "");
    // }
  }

  closeDoubts = () => {
    this.setState({
      course_id: "",
      visible: !false,
    });
  };

  togglecloseDoubtsPopup = () => {
    this.setState({ isModalVisible: true });
  };

  render() {
    return (
      <div>
        {this.state.visible && (
          <Modal
            open={this.state.visible}
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
                  this.setState({
                    doubts_img_url: "",
                    description: "",
                    show_loader: false,
                    visible: !this.state.visible,
                  });
                }}
              >
                <img
                  src={Close}
                  alt="Close"
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
                  style={{
                    background: "#0B649D",
                    padding: "20px",
                    borderRadius: "8px 8px 0px 0px",
                  }}
                >
                  <div className="doubts-card-inner-content">
                    <>
                      {this.props.profile_update.level_points !== "No star" &&
                        this.props.profile_update.role_id !== 1 && (
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
                        )}
                    </>
                    <div className="doubts-card-avatar">
                      <Badge
                        count={
                          this.props.profile_update.role_id !== 5 ? (
                            <img
                              src={admin_mark}
                              alt="admin_mark"
                              className="admin_Check"
                            />
                          ) : (
                            ""
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
                              color: "rgb(11, 100, 157)",
                              background: "rgb(224, 243, 255)",
                            }}
                            size={45}
                          >
                            {this.props.profile_update.first_name !==
                              undefined &&
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
                    padding: "25px",
                    borderRadius: "8px 8px 0px 0px",
                    background: "#E0F3FF",
                  }}
                >
                  <>
                    {this.state.active_img_Loader ? (
                      <div
                        style={{
                          background: "rgba(92, 92, 93, 0.68)",
                          borderRadius: "6px",
                          height: "80px",
                          width: "100px",
                          margin: "0px 20px",
                          padding: "6px 97px 6px 35px",
                        }}
                      >
                        <ReactLoading type="spokes" color="#fff" size="small" />
                      </div>
                    ) : (
                      <div className="createdoubts-post-image">
                        <ImagePreview
                          data={
                            `${this.props.envupdate.react_app_assets_url}posts/images/` +
                            this.state.doubts_img_url
                          }
                          width={"128px"}
                        />
                      </div>
                    )}
                  </>
                  <div className="boubt-btn-flex">
                    <TextArea
                      value={this.state.description}
                      placeholder="Write your Doubts & Just paste(Ctrl+v) your cropped image here"
                      onChange={(e) => {
                        this.setState({
                          description: e.target.value,
                        });
                      }}
                      style={{
                        height: "120px",
                        background: "#fff",
                        width: "100%",
                        borderRadius: "12px",
                      }}
                    />
                    <div className="add-boubt-btn-flex">
                      <div style={{ padding: "0px 20px" }}>
                        <img
                          src={send_doubts}
                          alt="send_doubts"
                          style={{
                            fontSize: "20px",
                            color: "#0B649D",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            this.state.description === ""
                              ? this.setState(
                                  {
                                    visible: true,
                                  },
                                  () => toast("Doubt content field is empty")
                                )
                              : this.state.active_img_Loader === false
                              ? this.setState(
                                  {
                                    visible: !this.state.visible,
                                  },
                                  () => this.handleType("All")
                                )
                              : toast("Doubt Image is still Loading");
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}
        <DoubtsCoures
          ref={(instance) => {
            this.DoubtsCoures = instance;
          }}
          doubtsCourse={this.adddoubts}
          closeDoubts={this.closeDoubts}
          togglecloseDoubtsPopup={this.togglecloseDoubtsPopup}
          {...this.props}
        />
      </div>
    );
  }
}
