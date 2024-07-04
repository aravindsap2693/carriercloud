import React, { Component } from "react";
import { Menu, Dropdown } from "antd";
import bookmarked from "../assets/svg-icons/quiz-bookmarked.svg";
import share from "../assets/svg-icons/quiz-share.svg";
import report from "../assets/svg-icons/quiz-solution.svg";
import "../assets/css/common.css";
import QuizReportPopup from "./QuizReportPopup";
import QuizSharePopup from "./QuizSharePopup";
import Env from "../utilities/services/Env";
import {
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  PushpinOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import DoubtsCoures from "./Doubt/DoubtsCoures";
import DeleteConfirmationPopup from "./DeleteConfirmationPopup";

class CourseModulesMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      delete_loader: false,
      pass: null,
      selectId: 0,
      is_favourite:
        props.is_favourite === null ? "0" : props.is_favourite.toString(),
    };
  }

  doubtsDelete() {
    this.setState({
      delete_loader: true,
    });
    const requestBody = {
      is_active: 0,
    };
    const postData = Env.put(
      this.props.envendpoint + `post/doubt/delete/${this.props.id}`,
      requestBody
    );
    postData.then((res) => {
      toast("Doubts has been Deleted !");
      this.setState({
        delete_loader: false,
      });
      this.DeleteConfirmation.toggleModal(false);
      if (this.props.handle_type === "doubtspopup") {
        this.props.closeDoubtAnswer(false);
      } else {
        this.props.getDoubtsID(
          this.props.item.id,
          this.props.item.total_comments,
          this.props.item.total_follows,
          this.props.item.is_follow,
          this.props.item.is_solved,
          0,
          this.props.item.course ? this.props.item.course.title : null
        );
      }
    });
  }

  doubtsAnswerDelete() {
    const requestBody = {
      is_active: 0,
      user_post_id: this.props.user_post_id,
    };
    const postData = Env.put(
      this.props.envendpoint + `post/doubtanswer/delete/${this.props.id}`,
      requestBody
    );
    postData.then((res) => {
      toast("Answer has been Deleted !");
      this.DeleteConfirmation.toggleModal(false);
      this.props.toggleDoubtsAnswerPopup(this.props.user_post_id);
    });
  }

  saveMyNotes() {
    const requestBody = {
      note_type: this.props.type,
      note_type_id: this.props.id,
    };
    if (["/my-notes", "/my-ebooks"].includes(this.props.location.pathname)) {
      this.setState({ selectId: this.props.id });
    }
    const postData = Env.post(this.props.envendpoint + `mynotes`, requestBody);
    postData.then(
      (response) => {
        let data = response.data.response.note;
        if (
          !["/my-notes", "/my-ebooks"].includes(this.props.location.pathname)
        ) {
          this.setState({ is_favourite: data.status.toString() });
        } else {
          this.setState({
            is_favourite: "1",
          });
        }
        data.status === 1
          ? toast("My notes added successfully !")
          : toast("My notes removed successfully !");
        this.props.handleRefresh && this.props.handleRefresh();
      },
      (error) => {
        console.error(error);
      }
    );
  }

  handlePinDoubts() {
    const requestBody = {
      doubt_post_id: this.props.id,
      doubt_post_user_id: this.props.item.user_id,
      is_pin: this.props.is_pin === 0 ? 1 : 0,
    };
    const postData = Env.post(
      this.props.envendpoint + `doubt_pin/add`,
      requestBody
    );
    postData.then(
      (response) => {
        let data = response.data.response.data;
        toast(
          data === 1
            ? "This doubt is Pinned successfully !"
            : "This doubt is Unpinned successfully !"
        );
        this.props.refresh && this.props.refresh();
      },
      (error) => {
        console.error(error);
      }
    );
  }

  handleDeleteButton = (d, type) => {
    if (type === "Answer") {
      this.doubtsAnswerDelete(true);
    }
    if (type === "Doubt") {
      this.doubtsDelete();
    }
  };

  render() {
    const menu = (
      <Menu>
        {[
          "article",
          "ebook",
          "quiz",
          "mocktest",
          "App\\Models\\MockTest",
          "video",
        ].includes(this.props.type) && (
          <Menu.Item
            key="1"
            disabled={this.props.id === this.state.selectId}
            icon={
              <img
                className="course-details-article-bookmark-menu-icon"
                src={bookmarked}
                alt="bookmarked"
              />
            }
            className="course-details-article-menu-item"
            onClick={() => this.saveMyNotes()}
          >
            {this.state.is_favourite.toString() === "0"
              ? `Save to My ${this.props.type === "ebook" ? "Ebook" : "Notes"}`
              : `Remove My  ${this.props.type === "ebook" ? "Ebook" : "Notes"}`}
          </Menu.Item>
        )}
        {this.props.type !== "answer" && (
          <Menu.Item
            key="2"
            icon={
              <img
                alt="share"
                className="course-details-article-menu-icon"
                src={share}
              />
            }
            className="course-details-article-menu-item"
            onClick={() =>
              this.quizSharePopup.showModal(
                this.props.type,
                this.props.id,
                this.props.course_id
              )
            }
          >
            Share
          </Menu.Item>
        )}
        <Menu.Item
          key="3"
          icon={
            <img
              alt="report"
              className="course-details-article-menu-icon"
              src={report}
            />
          }
          className="course-details-article-menu-item"
          onClick={() => {
            this.reportPopup.showModal();
          }}
        >
          Report
        </Menu.Item>

        {this.props.profile_update.role_id !== 8 &&
          this.props.profile_update.role_id !== 5 &&
          this.props.type === "post" && (
            <Menu.Item
              key="4"
              icon={<DeleteOutlined />}
              className="course-details-article-menu-item"
              onClick={() => {
                this.DeleteConfirmation.toggleModal(true, "Doubt");
              }}
            >
              Delete
            </Menu.Item>
          )}
        {this.props.profile_update.role_id !== 8 &&
          this.props.profile_update.role_id !== 5 &&
          this.props.type === "post" && (
            <Menu.Item
              key="5"
              icon={<EditOutlined />}
              className="course-details-article-menu-item"
              onClick={() =>
                this.DoubtsCoures.showModal(
                  "Change Doubts",
                  this.props.preferences.id,
                  this.props.id
                )
              }
            >
              Course change
            </Menu.Item>
          )}
        {this.props.profile_update.role_id !== 8 &&
          this.props.profile_update.role_id !== 5 &&
          this.props.type === "post" &&
          this.props.is_pin !== null && (
            <Menu.Item
              key="6"
              icon={<PushpinOutlined />}
              className="course-details-article-menu-item"
              onClick={() => this.handlePinDoubts()}
            >
              {this.props.is_pin === 0 ? "Pin" : "Unpin"}
            </Menu.Item>
          )}
        {this.props.type === "answer" &&
          this.props.profile_update.role_id !== 8 &&
          this.props.profile_update.role_id !== 5 && (
            <Menu.Item
              key="7"
              icon={<DeleteOutlined />}
              className="course-details-article-menu-item"
              onClick={() => {
                this.DeleteConfirmation.toggleModal(true, "Answer");
              }}
            >
              Delete Answer
            </Menu.Item>
          )}
      </Menu>
    );

    return (
      <div>
        <Dropdown dropdownRender={(e) => menu} trigger={["click"]}>
          <a href="" onClick={(e) => e.preventDefault()}>
            {this.props.homeFeed ? (
              <EllipsisOutlined
                style={{
                  fontSize: "18px",
                  color: "#0B649D",
                  cursor: "pointer",
                }}
              />
            ) : (
              <MoreOutlined
                style={{
                  fontSize: "18px",
                  color: "#0B649D",
                  cursor: "pointer",
                }}
              />
            )}
          </a>
        </Dropdown>
        <DeleteConfirmationPopup
          ref={(instance) => {
            this.DeleteConfirmation = instance;
          }}
          dispachDelete={this.handleDeleteButton}
          {...this.props}
        />
        <QuizReportPopup
          ref={(instance) => {
            this.reportPopup = instance;
          }}
          {...this.props}
        />
        <DoubtsCoures
          ref={(instance) => {
            this.DoubtsCoures = instance;
          }}
          handle_type={this.props.handle_type}
          toggleDoubtsPopup={this.props.toggleDoubtsPopup}
          changecourseTitle={this.props.changecourseTitle}
          getDoubtsID={this.props.getDoubtsID}
          doubts={this.props.item}
          {...this.props}
        />
        <QuizSharePopup
          ref={(instance) => {
            this.quizSharePopup = instance;
          }}
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
  };
})(CourseModulesMenu);
