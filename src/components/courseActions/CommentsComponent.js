import React, { Component } from "react";
import { Input, Badge, Avatar, Spin, Skeleton } from "antd";
import { SendOutlined } from "@ant-design/icons";
import Env, { profileImageUrl } from "../../utilities/services/Env";
import admin_mark from "../../assets/svg-icons/admin_mark.svg";
import return_icon from "../../assets/svg-icons/return.svg";
import "../../assets/css/article-detail.css";
import { CommonService } from "../../utilities/services/Common";
import { toast } from "react-toastify";
import InfiniteScroll from "react-infinite-scroll-component";

export default class CommentsComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedComment: 0,
      openReplies: false,
      commentsData: [],
      comments1: "",
      comments2: "",
      repliesFlag: false,
      disableSendAction: true,
      error: false,
      rowsperpage: 5,
      totalcomments: 0,
    };
  }

  componentDidMount() {
    this.getComments(this.state.rowsperpage);
  }

  loadMore = () => {
    setTimeout(() => {
      this.setState(
        (prev) => {
          return { rowsperpage: prev.rowsperpage + 5 };
        },
        () => this.getComments(this.state.rowsperpage)
      );
    }, 1000);
  };

  getComments(row) {
    const commentsData = Env.get(
      this.props.envendpoint +
        `${this.props.types}/comments?id=${this.props.id}&rowsPerPage=${row}`
    );
    commentsData.then(
      (response) => {
        const data = response.data.response.comments.data;
        this.setState({
          commentsData: data.reverse(),
          comments1: "",
          comments2: "",
          totalcomments: response.data.response.comments.total,
          // disableSendAction: false,
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  sendComments = (id, comment) => {
    // event.preventDefault();
    if (this.state.disableSendAction) {
      if (comment !== "") {
        this.setState({
          disableSendAction: false,
        });
        let payload;
        if (this.props.types === "ebook") {
          payload = {
            comments: comment,
            parent_id: id,
            ebook_id: this.props.id,
          };
        } else if (this.props.types === "video") {
          payload = {
            comments: comment,
            parent_id: id,
            video_id: this.props.id,
          };
        } else if (this.props.types === "quiz") {
          payload = {
            comments: comment,
            parent_id: id,
            quiz_id: this.props.id,
          };
        } else {
          payload = {
            comments: comment,
            parent_id: id,
            article_id: this.props.id,
          };
        }
        const commentsData = Env.post(
          this.props.envendpoint + `${this.props.types}/comments/add`,
          payload
        );

        commentsData.then(
          (response) => {
            this.setState({
              disableSendAction: true,
              comments1: "",
              comments2: "",
            });
            if (id === 0) {
              toast("Comments added successfully");
            } else {
              toast("Reply added successfully");
            }
            this.getComments(this.state.rowsperpage);
          },
          (error) => {
            if (error.response !== undefined && error.response.status === 300) {
              toast(error.response.data.message);
            } else if (error.response !== undefined) {
              toast(error.response.message);
            }
            this.setState({
              disableSendAction: true,
              comments1: "",
              comments2: "",
            });
            console.error(error);
          }
        );
      } else {
        toast("Comments field is empty");
      }
    }
  };

  render() {
    return (
      <div className="main-layout">
        <div
          style={{
            color: "#0B649D",
            fontSize: "20px",
            fontWeight: 900,
            padding: "20px 0px",
          }}
        >
          Comments
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            padding: "25px 0px 10px",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <div>
            {/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
              this.props.profile_update.profile_image
            ) &&
            !this.props.profile_update.profile_image.includes("data") &&
            !this.props.profile_update.profile_image.includes("prtner") ? (
              <Avatar
                 size={45}
                src={profileImageUrl + this.props.profile_update.profile_image}
              />
            ) : (
              <Avatar style={{ background: "#0b649d" }} size={45}>
                {this.props.profile_update.first_name !== undefined &&
                  CommonService.getInitialUppercase(
                    this.props.profile_update.first_name
                  )}
              </Avatar>
            )}
          </div>
          <div style={{ flex: 1, margin: "0px 15px" }}>
            <Input
              placeholder="Write a Comment"
              name="comments1"
              value={this.state.comments1}
              onChange={(e) => this.setState({ comments1: e.target.value })}
              onPressEnter={() => this.sendComments(0, this.state.comments1)}
              suffix={
                <SendOutlined
                  style={{ fontSize: "20px", cursor: "pointer" }}
                  onClick={(e) => this.sendComments(0, this.state.comments1)}
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
              }}
            />
          </div>
        </div>
        <InfiniteScroll
          dataLength={this.state.commentsData.length}
          next={this.loadMore}
          hasMore={this.state.commentsData.length < this.state.totalcomments}
          loader={
            <Skeleton
              avatar
              paragraph={{
                rows: 1,
              }}
              active
            />
          }
          scrollableTarget="scrollableDiv"
        >
          {this.state.commentsData.map((element, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "start",
                padding: "20px 0px",
              }}
            >
              <div>
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
                      ) : // <CheckCircleFilled style={{ color: "green" }} />
                      null
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
                      ) : null
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
              <div style={{ flex: 1, margin: "0px 15px" }}>
                <div
                  style={{
                    background: "#F5F6FA",
                    padding: "15px 25px",
                    borderRadius: "25px",
                    display: "inline-block",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>
                    {element.user.first_name + " " + element.user.last_name}{" "}
                    &bull;{" "}
                    <span
                      style={{
                        color: "grey",
                        fontWeight: 500,
                        fontSize: "13px",
                      }}
                    >
                      {CommonService.getPostedTime(element.created_at)}
                    </span>
                  </div>
                  <div>{element.comments}</div>
                </div>
                <div
                  style={{
                    position: "relative",
                    top: "8px",
                    left: "30px",
                    color: "#0B649D",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    this.setState({
                      selectedComment: element.id,
                      openReplies: !this.state.openReplies,
                      repliesFlag:
                        this.state.openReplies === false ? false : true,
                      comments1: "",
                      comments2: "",
                    })
                  }
                >
                  <img src={return_icon} alt="return_icon" /> Reply
                </div>
                <div>
                  {this.state.selectedComment === element.id && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        padding: "25px 0px 10px",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        {/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
                          this.props.profile_update.profile_image
                        ) &&
                        !this.props.profile_update.profile_image.includes(
                          "data"
                        ) &&
                        !this.props.profile_update.profile_image.includes(
                          "prtner"
                        ) ? (
                          <Badge
                            count={
                              this.props.profile_update.role_id !== 5 ? (
                                <img
                                  src={admin_mark}
                                  alt="admin_mark"
                                  className="admin_Check"
                                />
                              ) : null
                            }
                            offset={[0, 30]}
                          >
                            <Avatar
                               size={45}
                              src={
                                profileImageUrl +
                                this.props.profile_update.profile_image
                              }
                            />
                          </Badge>
                        ) : (
                          <Badge
                            count={
                              this.props.profile_update.role_id !== 5 ? (
                                <img
                                  src={admin_mark}
                                  alt="admin_mark"
                                  className="admin_Check"
                                />
                              ) : null
                            }
                            offset={[0, 30]}
                          >
                            <Avatar style={{ background: "#0b649d" }} size={45}>
                              {this.props.profile_update.first_name !==
                                undefined &&
                                CommonService.getInitialUppercase(
                                  this.props.profile_update.first_name
                                )}
                            </Avatar>
                          </Badge>
                        )}
                      </div>
                      <div style={{ flex: 1, margin: "0px 15px" }}>
                        <Input
                          placeholder="Write a Reply"
                          name="comments2"
                          value={this.state.comments2}
                          onChange={(e) =>
                            this.setState({
                              disable: true,
                              comments2: e.target.value,
                            })
                          }
                          onPressEnter={() =>
                            this.sendComments(element.id, this.state.comments2)
                          }
                          suffix={
                            <SendOutlined
                              style={{
                                fontSize: "20px",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                this.sendComments(
                                  element.id,
                                  this.state.comments2
                                )
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
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    {this.state.repliesFlag === true ? (
                      <div>
                        {element.replies.map((replies, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "start",
                              padding: "20px 0px",
                            }}
                          >
                            <div>
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
                                    ) : null
                                  }
                                  offset={[0, 30]}
                                >
                                  <Avatar
                                     size={35}
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
                                    ) : null
                                  }
                                  offset={[0, 30]}
                                >
                                  <Avatar
                                    style={{ background: "#0b649d" }}
                                    size={35}
                                  >
                                    {replies.user.first_name !== undefined &&
                                      CommonService.getInitialUppercase(
                                        replies.user.first_name
                                      )}
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
                                  background: "#F5F6FA",
                                  padding: "15px 25px",
                                  borderRadius: "25px",
                                  display: "inline-block",
                                }}
                              >
                                <div style={{ fontWeight: 900 }}>
                                  {replies.user.first_name +
                                    " " +
                                    replies.user.last_name}{" "}
                                  &bull;{" "}
                                  <span
                                    style={{
                                      color: "grey",
                                      fontWeight: 500,
                                      fontSize: "13px",
                                    }}
                                  >
                                    {CommonService.getPostedTime(
                                      replies.created_at
                                    )}
                                  </span>
                                </div>
                                <div>{replies.comments}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        {element.replies.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "start",
                              padding: "20px 0px",
                            }}
                          >
                            <div>
                              {/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
                                element.replies[0].user.profile_image
                              ) &&
                              !element.replies[0].user.profile_image.includes(
                                "data"
                              ) &&
                              !element.replies[0].user.profile_image.includes(
                                "prtner"
                              ) ? (
                                <Badge
                                  count={
                                    element.replies[0].user
                                      .role_permission_id !== 5 ? (
                                      <img
                                        src={admin_mark}
                                        alt="admin_mark"
                                        className="admin_Check"
                                      />
                                    ) : null
                                  }
                                  offset={[0, 30]}
                                >
                                  <Avatar
                                     size={35}
                                    src={
                                      profileImageUrl +
                                      element.replies[0].user.profile_image
                                    }
                                  />
                                </Badge>
                              ) : (
                                <Badge
                                  count={
                                    element.replies[0].user
                                      .role_permission_id !== 5 ? (
                                      <img
                                        src={admin_mark}
                                        alt="admin_mark"
                                        className="admin_Check"
                                      />
                                    ) : null
                                  }
                                  offset={[0, 30]}
                                >
                                  <Avatar
                                    style={{ background: "#0b649d" }}
                                    size={35}
                                  >
                                    {element.replies[0].user.first_name !==
                                      undefined &&
                                      CommonService.getInitialUppercase(
                                        element.replies[0].user.first_name
                                      )}
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
                                  background: "#F5F6FA",
                                  padding: "15px 25px",
                                  borderRadius: "25px",
                                  display: "inline-block",
                                }}
                              >
                                <div style={{ fontWeight: 900 }}>
                                  {element.replies[0].user.first_name +
                                    " " +
                                    element.replies[0].user.last_name}{" "}
                                  &bull;{" "}
                                  <span
                                    style={{
                                      color: "grey",
                                      fontWeight: 500,
                                      fontSize: "13px",
                                    }}
                                  >
                                    {CommonService.getPostedTime(
                                      element.replies[0].created_at
                                    )}
                                  </span>
                                </div>
                                <div>{element.replies[0].comments}</div>
                              </div>
                              {element.replies[1] && (
                                <div
                                  onClick={() =>
                                    this.setState({
                                      repliesFlag: !this.state.repliesFlag,
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
                                  {element.replies.length - 1} more replies..
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </InfiniteScroll>
        {this.props.active_Show_more && (
          <>
            <Spin size="large" className="feed-ads-spinner" />
          </>
        )}
      </div>
    );
  }
}
