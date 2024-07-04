import React, { Component } from "react";
import {
  Badge,
  Avatar,
  Button,
  Modal,
  Tabs,
  Card,
  Upload,
  Layout,
  FloatButton,
} from "antd";
import {
  InfoCircleOutlined,
  RightOutlined,
  LeftOutlined,
  AudioOutlined,
} from "@ant-design/icons";
import CloseCircle from "../../assets/svg-icons/Image_upload_cancel.svg";
import Close from "../../assets/svg-icons/ans-close.svg";
import Env, { profileImageUrl } from "../../utilities/services/Env";
import StorageConfiguration from "../../utilities/services/StorageConfiguration";
import "../../assets/css/common.css";
import "../../assets/css/doubts.css";
import CourseModulesMenu from "../../components/CourseModulesMenu";
import follow from "../../assets/svg-icons/follow.svg";
import followed from "../../assets/svg-icons/followed.svg";
import share from "../../assets/svg-icons/share.svg";
import QuizSharePopup from "../../components/QuizSharePopup";
import Answer from "../../assets/svg-icons/doubts_answer_icon.svg";
import { toast } from "react-toastify";
import DoubtsAnswer from "../../components/Doubt/DoubtsAnswer";
import TextArea from "antd/lib/input/TextArea";
import { connect } from "react-redux";
import { disablePreference } from "../../reducers/action";
import { CommonService } from "../../utilities/services/Common";
import $ from "jquery";
import Points from "../Points";
import { Content } from "antd/lib/layout/layout";
import DoubtRightSidebar from "./DoubtRightSidebar";
import DoubtsLeftSidebar from "./DoubtsLeftSidebar";
import image_upload from "../../assets/svg-icons/image_upload_btn.svg";
import pause_icon from "../../assets/svg-icons/quiz-pause.svg";
import send_doubts from "../../assets/svg-icons/send_doubts.svg";
import pinicon from "../../assets/svg-icons/pin-icon.svg";
import doubts_feeds from "../../assets/images/doubts_feeds.jpg";
import "../../assets/css/doubts-sidebar.css";
import ReactLoading from "react-loading";
import star from "../../assets/svg-icons/Star.svg";
import ImagePreview from "../../components/ImagePreview";
import DoubtsCoures from "../../components/Doubt/DoubtsCoures";
import DoubtsFilterComponents from "../../components/courseActions/DoubtsFilterComponents";
import admin_mark from "../../assets/svg-icons/admin_mark.svg";
// import AudioReactRecorder, { RecordState } from "audio-react-recorder";
import GeneralPopup from "../../components/GeneralPopup";
import DeleteConfirmationPopup from "../../components/DeleteConfirmationPopup";
import InfiniteScroll from "react-infinite-scroll-component";
import Skeletons from "../../components/SkeletonsComponent";
import _ from "lodash";
import { analytics } from "../../firebase-config";
import { logEvent } from "firebase/analytics";

class MyDoubts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFollow: "",
      followStatus: true,
      alldoubtdata: [],
      alldoubtTdata: 0,
      mydoubtsdata: [],
      mydoubtsTdata: 0,
      myAnswerdata: [],
      myAnswerTdata: 0,
      followdatalist: [],
      followTdatalist: 0,
      filterExams: [],
      filterSubjects: [],
      coinDoubt: [],
      course_details: [],
      course_data: "",
      followcourse_data: "",
      course_id: null,
      filter_course_id: null,
      is_active: "",
      doubts_img_url: "",
      doubts_id: null,
      doubts_audio_url: null,
      course_title: "",
      activePage: 1,
      preferencesId: props.preferences.id,
      description: "",
      isModalVisible: false,
      originalName: "",
      audioName: "",
      img: "",
      imgList: "",
      ALactivePage: 1,
      MYactivePage: 1,
      FLactivePage: 1,
      ANSactivePage: 1,
      itemId: "",
      audioStart: true,
      showMore: false,
      activeLoader: true,
      active_img_Loader: false,
      active_audio_Loader: false,
      total_answer: "",
      total_follows: "",
      is_follow: "",
      activeTabIndex: "1",
      timer: 0,
      active_Show_more: true,
      filter_type: "",
      followfilter_type: "",
      userId: "",
      doubtsdetails: [],
      searchInput: "",
      recordState: null,
    };
    this.mydesRef = React.createRef();
    this.points = React.createRef();
    this.dropRef = React.createRef();
    this.countRef = React.createRef();
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.props.dispatch(disablePreference(false));
    if (this.props && this.props.match.params.id) {
      this.getAnswer(this.props.match.params.id);
      logEvent(analytics, "select_content", {
        page_title: "Share Doubts",
      });
    } else {
      this.getalldoubtsdata("preference");
      logEvent(analytics, "select_content", {
        page_title: "All Doubts",
      });
    }
    if (this.state.isModalVisible) {
      let div = this.dropRef.current;
      div.addEventListener("drop", this.handleDrop);
    }
  }

  componentDidUpdate() {
    if (this.state.isModalVisible) {
      this.mydesRef.current.focus();
    }
    if (this.state.isModalVisible) {
      let div = this.dropRef.current;
      div.addEventListener("drop", this.handleDrop);
    }
    if (this.state.timer > 30) {
      this.stop();
    }
    $(function () {
      $(window).resize(function () {
        if (window.outerWidth < 1345) {
          $(".doubt-right-sidebar").css({ display: "none" });
        }
        if (window.outerWidth > 1344) {
          $(".doubt-right-sidebar").css({
            display: "block",
          });
        }
        if (window.outerWidth > 1400) {
          $(".doubt-right-sidebar").css({ right: "0px" });
        }
        if (window.outerWidth < 1024) {
          $(".doubt-left-sidebar").css("display", "none");
        }
        if (window.outerWidth > 1024) {
          $(".doubt-left-sidebar").css("display", "block");
        }
      });
    });
  }

  callbackOnchange = (event) => {
    const re = /^[0-9\b]+$/;
    if (event.target.value === "" || re.test(event.target.value)) {
      this.setState({ searchInput: event.target.value });
    }
  };

  componentWillReceiveProps(newProps) {
    if (this.props.preferences.id !== newProps.preferences.id) {
      this.setState({ preferencesId: newProps.preferences.id }, () => {
        this.getalldoubtsdata("preference");
        this.getmydoubtsdata("preference");
        this.getmyAnswerdata("preference");
        this.getfollowDetialdata("preference");
      });
    }
  }

  getCoinsDetails() {
    const getData = Env.get(this.props.envendpoint + `staticpages/doubt-coins`);
    getData.then((response) => {
      const data = response.data.response.cms[0];
      this.setState({ coinDoubt: data, activeloader: false });
      this.generalPopup.showModal(true, data.content);
    });
  }

  getAnswer = async (id) => {
    const getAnswer = Env.get(
      this.props.envendpoint +
        `post/comment/answer/${id}?page=1&rowsPerPage=100`
    );
    await getAnswer.then(
      (response) => {
        const data = response.data.response.userpost;
        this.setState({
          doubtsdetails: data,
          activeLoader: false,
        });
        data.is_active === 1 && data.is_subscribed === 1
          ? this.props.match.params.id &&
            this.DoubtsAnswer?.showModal("Share Doubts Ans", data)
          : this.props.navigate("/doubts");
      },
      (error) => {
        console.error(error);
        if (error.response && error.response.status === 404) {
          this.props.navigate("/not-found");
        }
      }
    );
  };

  onImageChange = (e) => {
    this.setState({
      img: e.file.originFileObj,
      imgList: e.fileList[e.fileList.length - 1],
      originalName: e.file.name,
    });
  };

  handlePaste = (e) => {
    if (e.clipboardData.files.length) {
      this.setState({
        active_img_Loader: true,
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

  getalldoubtsdata = (type, page, id, ext, userId) => {
    this.setState({
      activeLoader: true,
    });
    const getdoubts = Env.get(
      this.props.envendpoint +
        `posts?page=${!page ? 1 : page}&preference_id[]=${
          this.state.preferencesId
        }${!id ? "" : id}${!userId ? "" : "&filters[user_id]=" + userId}${
          !ext ? "" : ext
        }`
    );
    getdoubts.then(
      (response) => {
        const data = response.data.response.posts.data;
        this.setState({
          alldoubtdata:
            type !== "paginate" ? data : this.state.alldoubtdata.concat(data),
          alldoubtTdata: response.data.response.posts.total,
        });
        setTimeout(() => {
          this.setState({
            active_Show_more: false,
            activeLoader: false,
          });
        }, 1000);
      },
      (error) => {
        console.error(error);
      }
    );
  };

  getfollowDetialdata(type, page, id, extras, userId) {
    this.setState({
      activeLoader: true,
    });
    const getfollowDoubts = Env.get(
      this.props.envendpoint +
        `follow/posts?page=${!page ? 1 : page}&filters[category_id][]=${
          this.state.preferencesId
        }${!extras ? "" : extras}${!id ? "" : id}${
          !userId ? "" : "&user_id=" + userId
        }`
    );
    getfollowDoubts.then(
      (response) => {
        const data = response.data.response.posts.data;
        this.setState({
          followdatalist:
            type !== "paginate" ? data : this.state.followdatalist.concat(data),
          followTdatalist: response.data.response.posts.total,
        });
        setTimeout(() => {
          this.setState({
            activeLoader: false,
            active_Show_more: false,
          });
        }, 1000);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getmyAnswerdata(type, page, id, ext, userId) {
    this.setState({
      activeLoader: true,
    });
    const getmyAnswerdata = Env.get(
      this.props.envendpoint +
        `user/posts?page=${!page ? 1 : page}&preference_id[]=${
          this.state.preferencesId
        }${!id ? "" : id}&user_type=myanswers${!ext ? "" : ext}${
          !userId ? "" : "&filters[user_id]=" + userId
        }`
    );
    getmyAnswerdata.then(
      (response) => {
        const data = response.data.response.posts.data;
        this.setState({
          myAnswerdata:
            type !== "paginate" ? data : this.state.myAnswerdata.concat(data),
          myAnswerTdata: response.data.response.posts.total,
        });
        setTimeout(() => {
          this.setState({
            activeLoader: false,
            active_Show_more: false,
          });
        }, 1000);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getmydoubtsdata(type, page, id, ext, userId) {
    this.setState({
      activeLoader: true,
    });
    const getmydoubtsdata = Env.get(
      this.props.envendpoint +
        `user/posts?page=${!page ? 1 : page}&preference_id[]=${
          this.state.preferencesId
        }${!id ? "" : id}${!ext ? "" : ext}${
          !userId ? "" : "&user_id=" + userId
        }`
    );
    getmydoubtsdata.then(
      (response) => {
        const data = response.data.response.posts.data;
        this.setState({
          mydoubtsdata:
            type !== "paginate" ? data : this.state.mydoubtsdata.concat(data),
          mydoubtsTdata: response.data.response.posts.total,
        });
        setTimeout(() => {
          this.setState({
            activeLoader: false,
            active_Show_more: false,
          });
        }, 1000);
      },
      (error) => {
        console.error(error);
      }
    );
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
          this.state.alldoubtdata.filter((item) => {
            if (item.id === id) {
              item.total_follows =
                data.status === 1
                  ? item.total_follows + 1
                  : item.total_follows - 1;
              item.is_follow = data.status;
            }
          });
          this.toggleDoubtsPopup(false);
          // this.getfollowDetialdata(
          //   "preference",
          //   this.state.FLactivePage,
          //   this.state.followcourse_data,
          //   this.state.followfilter_type,
          //   this.state.userId
          // );
          this.setState({
            isFollow: data.status,
            doubtsdetails: {
              ...this.state.doubtsdetails,
              total_follows:
                data.status === 1
                  ? this.state.doubtsdetails.total_follows + 1
                  : this.state.doubtsdetails.total_follows - 1,
            },
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

  toggleDoubtsPopup = (status = true) => {
    let type = status ? "paginate" : "preference";
    switch (parseInt(this.state.activeTabIndex)) {
      case 1:
        this.getalldoubtsdata(
          type,
          this.state.ALactivePage,
          this.state.course_data,
          this.state.userId
        );
        break;
      case 2:
        this.getmydoubtsdata(
          type,
          this.state.MYactivePage,
          this.state.course_data,
          this.state.userId
        );
        break;
      case 3:
        this.getmyAnswerdata(
          type,
          this.state.ANSactivePage,
          this.state.course_data,
          this.state.userId
        );
        break;
      case 4:
        this.getfollowDetialdata(
          type,
          this.state.FLactivePage,
          this.state.followcourse_data,
          this.state.userId
        );
        break;
      case 5:
        this.points.getPointsDetails(this.state.userId);
        break;
      default:
        break;
    }
    this.setState({ followStatus: !this.state.followStatus });
  };

  toggleFilterDoubtsPopup = (extraParams, extra, user) => {
    window.scrollTo(0, 0);
    switch (parseInt(this.state.activeTabIndex)) {
      case 1:
        this.setState(
          {
            alldoubtdata: [],
            ALactivePage: 1,
          },
          () =>
            this.getalldoubtsdata(
              "preference",
              this.state.ALactivePage,
              this.state.course_data,
              extraParams,
              user
            )
        );
        break;
      case 2:
        this.setState(
          {
            mydoubtsdata: [],
            MYactivePage: 1,
          },
          () =>
            this.getmydoubtsdata(
              "preference",
              this.state.MYactivePage,
              this.state.course_data,
              extraParams,
              user
            )
        );
        break;
      case 3:
        this.setState(
          {
            myAnswerdata: [],
            ANSactivePage: 1,
          },
          () =>
            this.getmyAnswerdata(
              "preference",
              this.state.ANSactivePage,
              this.state.course_data,
              extraParams,
              user
            )
        );
        break;
      case 4:
        this.setState(
          {
            followdatalist: [],
            FLactivePage: 1,
          },
          () =>
            this.getfollowDetialdata(
              "preference",
              this.state.FLactivePage,
              this.state.followcourse_data,
              extra,
              user
            )
        );
        break;
      case 5:
        this.points.getPointsDetails(user);
        break;
      default:
        break;
    }
    this.setState({
      filter_type: extraParams,
      followfilter_type: extra,
      userId: user,
    });
  };

  closeDoubts = (data) => {
    this.setState({
      course_id: "",
      isModalVisible: false,
      doubts_img_url: "",
      doubts_audio_url: null,
      description: !data ? "" : data,
    });
  };

  adddoubts = (id) => {
    let payload = {
      orientation: 0,
      description: this.state.description,
      course_id: id,
      image_url: this.state.doubts_img_url,
      audio_url: this.state.doubts_audio_url,
      post_type: "query",
    };
    const addpost = Env.post(this.props.envendpoint + `posts/add`, payload);
    addpost.then(
      (response) => {
        toast("Doubt has been created successfully");
        this.setState(
          {
            doubts_img_url: "",
            doubts_audio_url: null,
            audio_url: "",
            description: "",
            course_id: "",
            isModalVisible: false,
            ALactivePage: 1,
          },
          () =>
            this.getalldoubtsdata(
              "preference",
              1,
              this.state.course_data,
              this.state.userId
            )
        );
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
          audio_url: "",
          description: "",
          course_id: "",
          isModalVisible: false,
        });
        console.error(error);
      }
    );
  };

  changeCourse(id) {
    let payload = {
      course_id: id,
    };
    const AnswerData = Env.put(
      this.props.envendpoint + `post/coursechange/update/${this.state.id}`,
      payload
    );
    AnswerData.then((res) => {
      toast("The Doubts has been change the course.");
      this.props.toggleDoubtsPopup();
    });
  }

  handleTagChange(e) {
    this.setState({ searchInput: "" });
    if (!this.props.match.params.id) {
      switch (parseInt(e)) {
        case 1:
          this.setState(
            {
              ALactivePage: 1,
              alldoubtdata: [],
              activeLoader: true,
            },
            () =>
              this.getalldoubtsdata(
                "preference",
                this.state.ALactivePage,
                this.state.course_data,
                this.state.filter_type,
                this.state.userId
              )
          );
          break;
        case 2:
          this.setState(
            {
              MYactivePage: 1,
              mydoubtsdata: [],
              activeLoader: true,
            },
            () =>
              this.getmydoubtsdata(
                "preference",
                this.state.MYactivePage,
                this.state.course_data,
                this.state.filter_type,
                this.state.userId
              )
          );
          break;
        case 3:
          this.setState(
            {
              ANSactivePage: 1,
              myAnswerdata: [],
              activeLoader: true,
            },
            () =>
              this.getmyAnswerdata(
                "preference",
                this.state.ANSactivePage,
                this.state.course_data,
                this.state.filter_type,
                this.state.userId
              )
          );
          break;
        case 4:
          this.setState(
            {
              FLactivePage: 1,
              followdatalist: [],
              activeLoader: true,
            },
            () =>
              this.getfollowDetialdata(
                "preference",
                this.state.FLactivePage,
                this.state.followcourse_data,
                this.state.followfilter_type,
                this.state.userId
              )
          );
          break;
        default:
          break;
      }
      if (e === "5" && this.points.current !== null) {
        this.points.getPointsDetails(this.state.userId);
      }
    } else {
      this.props.navigate("/doubts");
    }
    this.setState({
      activeTabIndex: e,
    });
  }

  getFilterDoubts = (type, page, id, extras) => {
    window.scrollTo(0, 0);
    this.setState({
      activeLoader: true,
      followcourse_data: extras,
      course_data: id,
      filter_course_id: null,
    });
    if (!this.props.match.params.id) {
      switch (parseInt(this.state.activeTabIndex)) {
        case 1:
          this.setState(
            {
              alldoubtdata: [],
              activeLoader: true,
              ALactivePage: 1,
            },
            () =>
              this.getalldoubtsdata(
                type,
                page,
                id,
                this.state.filter_type,
                this.state.userId
              )
          );
          break;
        case 2:
          this.setState(
            {
              mydoubtsdata: [],
              activeLoader: true,
              MYactivePage: 1,
            },
            () =>
              this.getmydoubtsdata(
                type,
                page,
                id,
                this.state.filter_type,
                this.state.userId
              )
          );
          break;
        case 3:
          this.setState(
            {
              myAnswerdata: [],
              activeLoader: true,
              ANSactivePage: 1,
            },
            () =>
              this.getmyAnswerdata(
                type,
                page,
                id,
                this.state.filter_type,
                this.state.userId
              )
          );
          break;
        case 4:
          this.setState(
            {
              followdatalist: [],
              activeLoader: true,
              FLactivePage: 1,
            },
            () =>
              this.getfollowDetialdata(
                type,
                page,
                extras,
                this.state.followfilter_type,
                this.state.userId
              )
          );
          break;
        default:
          this.points.getPointsDetails(this.state.userId);
      }
    } else {
      this.props.navigate("/doubts");
    }
  };

  loadMore = () => {
    switch (parseInt(this.state.activeTabIndex)) {
      case 1:
        this.setState(
          (prev) => {
            return {
              activePage: prev.activePage + 1,
              ALactivePage: prev.ALactivePage + 1,
              active_Show_more: true,
            };
          },
          () =>
            this.getalldoubtsdata(
              "paginate",
              this.state.ALactivePage,
              this.state.course_data,
              this.state.filter_type,
              this.state.userId
            )
        );
        break;
      case 2:
        this.state.mydoubtsdata.length < this.state.mydoubtsTdata &&
          this.setState(
            (prev) => {
              return {
                MYactivePage: prev.MYactivePage + 1,
                activePage: prev.MYactivePage + 1,
                active_Show_more: true,
              };
            },
            () =>
              this.getmydoubtsdata(
                "paginate",
                this.state.MYactivePage,
                this.state.course_data,
                this.state.filter_type,
                this.state.userId
              )
          );
        break;
      case 3:
        this.state.myAnswerdata.length < this.state.myAnswerTdata &&
          this.setState(
            (prev) => {
              return {
                ANSactivePage: prev.ANSactivePage + 1,
                activePage: prev.ANSactivePage + 1,
                active_Show_more: true,
              };
            },
            () =>
              this.getmyAnswerdata(
                "paginate",
                this.state.ANSactivePage,
                this.state.course_data,
                this.state.filter_type,
                this.state.userId
              )
          );
        break;
      case 4:
        this.state.followdatalist.length < this.state.followTdatalist &&
          this.setState(
            (prev) => {
              return {
                FLactivePage: prev.FLactivePage + 1,
                activePage: prev.FLactivePage + 1,
                active_Show_more: true,
              };
            },
            () =>
              this.getfollowDetialdata(
                "paginate",
                this.state.FLactivePage,
                this.state.followcourse_data,
                this.state.followfilter_type,
                this.state.userId
              )
          );
        break;
      default:
        return false;
    }
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
      course_title: course_title,
      is_active: is_active,
    });
  };

  handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ drag: false });
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      this.setState({
        active_img_Loader: true,
        img: e.dataTransfer.files[0],
        originalName: e.dataTransfer.files[0].name,
      });
      const image_src = e.dataTransfer.files[0];
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

  display(data, TData) {
    let Sid = null;
    let indexs = null;
    if (this.state.doubts_id) {
      data.filter((item, index) => {
        if (item.id === this.state.doubts_id) {
          indexs = index;
          Sid = item.id;
          item.total_comments = this.state.total_answer;
          item.total_follows = this.state.total_follows;
          item.is_follow = this.state.is_follow;
          item.is_solved = this.state.issolved;
          item.is_active = this.state.is_active;
          item.course.title = this.state.course_title;
        }
        this.setState({
          doubts_id: null,
        });
      });
      if (Sid === this.state.doubts_id && this.state.is_active === 0) {
        data.splice(indexs, 1);
      }
    }
    return (
      <>
        {this.state.activeLoader && data.length === 0 ? (
          <Skeletons type={"doubts"} />
        ) : !this.state.activeLoader && data.length === 0 ? (
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
        ) : (
          data.length > 0 && (
            <InfiniteScroll
              dataLength={data.length}
              hasMore={data.length < TData}
              next={this.loadMore}
              loader={<Skeletons type={"doubts"} />}
              scrollableTarget="scrollableDiv"
            >
              {data.map((item, index) => (
                <div key={index}>
                  {index === 2 && (
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
                            alt="doubts_feeds"
                            src={
                              this.props.banner_update.doubts_banner
                                ? `${this.props.envupdate.react_app_assets_url}banner/images/` +
                                  this.props.banner_update.doubts_banner
                                : doubts_feeds
                            }
                          />
                        }
                      />
                    </div>
                  )}
                  <div className="doubts-section" key={index}>
                    <Card
                      className="doubts-cards"
                      title={
                        <div className="doubts-card-content">
                          <div className="doubts-card-inner-content">
                            <>
                              {item.user.level_points !== "No star" &&
                                item.user.role_permission_id.toString() ===
                                  "5" && (
                                  <div className="doubts-level-content">
                                    <img
                                      src={star}
                                      style={{
                                        width: "24px",
                                      }}
                                      alt="star"
                                    />
                                    <span
                                      className="doubts-level-count"
                                      style={{
                                        right:
                                          item.user.level_points == 1
                                            ? "14px"
                                            : item.user.level_points == 10
                                            ? "17px"
                                            : "15px",
                                      }}
                                    >
                                      {item.user.level_points}
                                    </span>
                                  </div>
                                )}
                            </>
                            <div className="doubts-card-avatar">
                              <Badge
                                count={
                                  item.user.role_permission_id !== 5 ? (
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
                                  item.user.profile_image
                                ) &&
                                !item.user.profile_image.includes("data") &&
                                !item.user.profile_image.includes("prtner") ? (
                                  <Avatar
                                    size={45}
                                    src={
                                      profileImageUrl + item.user.profile_image
                                    }
                                  />
                                ) : (
                                  <Avatar
                                    style={{ background: "#0b649d" }}
                                    size={45}
                                  >
                                    {CommonService.getInitialUppercase(
                                      item.user.first_name
                                    )}
                                  </Avatar>
                                )}
                              </Badge>
                            </div>
                            <div className="doubts-card-title">
                              {item.user.first_name !== undefined &&
                                CommonService.getUppercase(
                                  item.user.first_name
                                )}{" "}
                              {item.user.last_name}
                              {this.props.profile_update.role_id !== 5 && (
                                <>
                                  &nbsp;&bull;&nbsp;
                                  <span
                                    onDoubleClick={(e) => {
                                      CommonService.handleCopy(e);
                                    }}
                                  >
                                    {item.user.id}
                                  </span>
                                </>
                              )}{" "}
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
                              |{" "}
                              <span
                                onClick={() => {
                                  this.setState({
                                    filter_course_id: item.course.id,
                                  });
                                }}
                              >
                                {item.course !== null && item.course.title}
                                <RightOutlined />
                              </span>
                            </div>
                          </div>
                          <div className="doubts-Menu">
                            <CourseModulesMenu
                              {...this.props}
                              type="post"
                              id={item.id}
                              item={item}
                              handle_type="doubts"
                              is_pin={
                                parseInt(this.state.activeTabIndex) === 1
                                  ? item.is_pin
                                  : null
                              }
                              is_favourite={item.is_favourite}
                              toggleDoubtsPopup={this.toggleDoubtsPopup}
                              getDoubtsID={this.getDoubtsID}
                              refresh={this.handleRefresh}
                            />
                          </div>
                        </div>
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
                                      item.is_follow === 1 ? followed : follow
                                    }
                                    style={{
                                      width: "20px",
                                    }}
                                    alt="followed"
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
                                  this.DoubtsAnswer.showModal(
                                    "My Doubts Ans",
                                    item
                                  );
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
                            {item.is_solved === 1 ? (
                              <div
                                className="doubts-details-lable"
                                onClick={() =>
                                  this.DoubtsAnswer.showModal(
                                    "Doubts Solved",
                                    item
                                  )
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
                                    this.DoubtsAnswer.showModal(
                                      "My Doubts",
                                      item
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
                </div>
              ))}
            </InfiniteScroll>
          )
        )}
      </>
    );
  }

  displayDetails(data) {
    if (this.state.doubts_id) {
      if (data.id === this.state.doubts_id) {
        data.total_comments = this.state.total_answer;
        data.total_follows = this.state.total_follows;
        data.is_follow = this.state.is_follow;
        data.is_solved = this.state.issolved;
        data.is_active = this.state.is_active;
        data.course.title = this.state.course_title;
      }
      this.setState({
        doubts_id: null,
      });
    }
    return (
      <>
        {data.is_active !== 0 && !_.isEmpty(data) && (
          <div className="doubts-section">
            <Card
              className="doubts-cards"
              title={
                <div className="doubts-card-content">
                  <div className="doubts-card-inner-content">
                    <>
                      {data.user.level_points !== "No star" &&
                        data.user.role_permission_id !== 1 && (
                          <div className="doubts-level-content">
                            <img
                              src={star}
                              style={{
                                width: "24px",
                              }}
                              alt="star"
                            />
                            <span
                              className="doubts-level-count"
                              style={{
                                right:
                                  data.user.level_points == 1
                                    ? "14px"
                                    : data.user.level_points > 10
                                    ? "17px"
                                    : "15px",
                              }}
                            >
                              {data.user.level_points}
                            </span>
                          </div>
                        )}
                    </>
                    <div className="doubts-card-avatar">
                      <Badge
                        count={
                          data.user.role_permission_id !== 5 ? (
                            <img
                              src={admin_mark}
                              alt="admin_mark"
                              className="admin_Check"
                            />
                          ) : (
                            ""
                          )
                        }
                      >
                        {/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
                          data.user.profile_image
                        ) &&
                        !data.user.profile_image.includes("data") &&
                        !data.user.profile_image.includes("prtner") ? (
                          <Avatar
                            size={45}
                            src={profileImageUrl + data.user.profile_image}
                          />
                        ) : (
                          <Avatar style={{ background: "#0b649d" }} size={45}>
                            {CommonService.getInitialUppercase(
                              data.user.first_name
                            )}
                          </Avatar>
                        )}
                      </Badge>
                    </div>
                    <div className="doubts-card-title">
                      {data.user.first_name !== undefined &&
                        CommonService.getUppercase(data.user.first_name)}{" "}
                      {data.user.last_name}
                      {this.props.profile_update.role_id !== 5 && (
                        <>
                          &nbsp;&bull;&nbsp;
                          <span
                            onDoubleClick={(e) => {
                              CommonService.handleCopy(e);
                            }}
                          >
                            {data.user.id}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="doubts-card-publish">
                      {CommonService.getDoubtPostedTime(data.created_at)} |{" "}
                      {data.course.title}
                    </div>
                  </div>
                  <div className="doubts-Menu">
                    <CourseModulesMenu
                      {...this.props}
                      type="post"
                      id={data.id}
                      item={data}
                      handle_type="doubts"
                      is_pin={null}
                      is_favourite={data.is_favourite}
                      toggleDoubtsPopup={this.toggleDoubtsPopup}
                      getDoubtsID={this.getDoubtsID}
                      refresh={this.handleRefresh}
                    />
                  </div>
                </div>
              }
              cover={
                <div className="doubts-card-body">
                  <>
                    <div className="doubts-card-discubtion">
                      {this.state.showMore === true &&
                      this.state.itemId === data.id ? (
                        <p
                          id="append"
                          style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                          className="doubts-card-text"
                        >
                          {data.description}
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
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                          className="doubts-card-text"
                        >
                          {data.description.length > 520
                            ? CommonService.getShowLess(data.description)
                            : data.description}
                          {data.description.length > 620 && (
                            <span
                              onClick={() => {
                                this.setState({
                                  showMore: true,
                                  itemId: data.id,
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
                    {data.image_url !== "" && data.image_url !== null && (
                      <div className="doubts-post-image">
                        <ImagePreview
                          data={
                            Env.getImageUrl(
                              `${this.props.envupdate.react_app_assets_url}posts`
                            ) + data.image_url
                          }
                          width={"300px"}
                        />
                      </div>
                    )}
                    {data.audio_url !== "" && data.audio_url !== null && (
                      <audio controls controlsList="nodownload noplaybackrate">
                        <source
                          src={
                            `${this.props.envupdate.react_app_assets_url}posts/images/` +
                            data.audio_url
                          }
                          type="audio/mpeg"
                        />
                      </audio>
                    )}
                  </>
                  <div className="doubts-card-action-bar">
                    <div className="doubts-card-action">
                      <div className="doubts-card-action-columns">
                        <span
                          className="doubts-card-action-text"
                          onClick={(e) => {
                            this.handleFollow(
                              data.id,
                              data.is_follow,
                              data.user_id
                            );
                          }}
                        >
                          <img
                            src={data.is_follow === 1 ? followed : follow}
                            style={{
                              width: "20px",
                            }}
                            alt="followed"
                          />
                          <span className="doubts-card-action-values">
                            {data.total_follows}
                            {data.total_follows <= 1 ? " Follow" : " Follows"}
                          </span>
                        </span>
                      </div>
                      <div
                        className="doubts-card-action-columns"
                        onClick={() => {
                          this.DoubtsAnswer.showModal("Share Doubts Ans", data);
                        }}
                      >
                        <span className="doubts-card-action-text">
                          <img
                            src={Answer}
                            style={{
                              margin: "0px",
                            }}
                            alt="Answer"
                            id="comments-icon"
                          />
                          <span className="doubts-card-action-values">
                            {data.total_comments}
                            {data.total_comments <= 1 ? " Answer" : " Answers"}
                          </span>
                        </span>
                      </div>
                      <div className="doubts-card-action-columns">
                        <span
                          className="doubts-card-action-text"
                          onClick={() =>
                            this.quizSharePopup.showModal("doubts", data.id)
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
                    {data.is_solved !== 0 ? (
                      <div
                        className="doubts-details-lable"
                        onClick={() =>
                          this.DoubtsAnswer.showModal("Share Doubts Ans", data)
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
                            this.DoubtsAnswer.showModal("My Doubts", data)
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
        )}
      </>
    );
  }

  diaplayAllDoubts() {
    // const { recordState } = this.state;
    return (
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
                this.setState({
                  course_id: "",
                  isModalVisible: false,
                  doubts_img_url: "",
                  doubts_audio_url: null,
                  description: "",
                  // recordState: RecordState.STOP,
                  audioStart: true,
                  active_img_Loader: false,
                  active_audio_Loader: false,
                });
              }}
            >
              <img
                src={Close}
                style={{
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                }}
                alt="Close"
              />
            </div>
            <div>
              <div
                className="doubts-card-content"
                style={{
                  background: "#0B649D",
                  padding: "17px 20px",
                }}
              >
                <div className="doubts-card-inner-content">
                  {this.props.profile_update.level_points !== "No star" &&
                    this.props.profile_update.role_id !== 1 && (
                      <div className="doubts-level-content-creat">
                        <img
                          src={star}
                          style={{
                            width: "24px",
                          }}
                          alt="star"
                        />
                        <span
                          className="doubts-level-count"
                          style={{
                            right:
                              this.props.profile_update.level_points === 1
                                ? "14px"
                                : this.props.profile_update.level_points > 10
                                ? "17px"
                                : "15px",
                          }}
                        >
                          {this.props.profile_update.level_points}
                        </span>
                      </div>
                    )}
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
                            color: "#E0F3FF",
                            background: "#0B649D",
                          }}
                          size={45}
                        >
                          {this.props.profile_update.first_name !== undefined &&
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
                  borderRadius: "8px",
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
                          {this.state.active_img_Loader !== true && (
                            <span
                              style={{ cursor: "pointer" }}
                              className="Create-closer"
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
                              <img src={CloseCircle} alt="CloseCircle" />
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div
                  className="boubt-btn-flex"
                  ref={this.dropRef}
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
                    ref={this.mydesRef}
                    style={{
                      height: "120px",
                      background: "#fff",
                      width: "85%",
                      borderRadius: "12px",
                    }}
                  />
                  <div className="add-boubt-btn-flex">
                    <div>
                      <Upload
                        customRequest={(e) => this.handleImageUpload(e)}
                        onChange={(e) => this.onImageChange(e)}
                        accept="image/png,image/jpg,image/webp,image/jpeg"
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
                    </div>
                    {this.state.course_details.is_audio === 1 && (
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
                                style={{
                                  margin: "0px 10px 0px 10px",
                                }}
                                alt="pause_icon"
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
                        src={send_doubts}
                        style={{
                          fontSize: "20px",
                          color: "#0B649D",
                          cursor: "pointer",
                        }}
                        alt="send_doubts"
                        onClick={() => {
                          this.state.description === ""
                            ? this.setState(
                                {
                                  isModalVisible: true,
                                },
                                () => toast("Doubt content field is empty")
                              )
                            : this.state.active_img_Loader
                            ? toast("Doubt Image is still Loading")
                            : !this.state.audioStart
                            ? toast("Doubt Audio is still Recording")
                            : this.setState(
                                {
                                  isModalVisible: !this.state.isModalVisible,
                                },
                                () =>
                                  this.adddoubts(this.state.course_details.id)
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
        {!this.props.match.params.id && (
          <div className="doubts-section ">
            <Card
              className="doubts-cards "
              cover={
                <div className="add-doubts-cards ">
                  <span
                    style={{
                      fontSize: "25px",
                      color: " #0B649D",
                      marginBottom: "0em",
                      fontWeight: "700",
                    }}
                  >
                    Hi{" "}
                    {this.props.profile_update.first_name !== undefined &&
                      CommonService.getUppercase(
                        this.props.profile_update.first_name
                      )}
                    , Post your doubts...
                  </span>
                  <div
                    style={{
                      padding: "15px",
                      color: " #0B649D",
                    }}
                  >
                    <Button
                      type="primary"
                      className="add-doubts-btn"
                      onClick={() => {
                        this.props.profile_update.comment_block !== 1
                          ? this.DoubtsCoures.showModal(
                              "Add Doubts",
                              this.state.preferencesId,
                              ""
                            )
                          : toast("This user is blocked");
                      }}
                    >
                      Create
                    </Button>
                  </div>
                </div>
              }
            ></Card>
          </div>
        )}
        {this.props.match.params.id ? (
          <>{this.displayDetails(this.state.doubtsdetails)}</>
        ) : (
          <>{this.display(this.state.alldoubtdata, this.state.alldoubtTdata)}</>
        )}
      </>
    );
  }

  createDoubts = (id) => {
    this.setState({
      isModalVisible: !this.state.isModalVisible,
      course_details: id,
    });
  };

  handleTabIndex(a) {
    let counts = parseInt(this.state.activeTabIndex) + a;
    counts = counts.toString();
    this.setState({
      activeTabIndex: counts,
    });
    this.handleTagChange(counts);
  }

  handleRefresh = () => {
    window.scrollTo(0, 0);
    this.handleTagChange(this.state.activeTabIndex);
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
      timer: 0,
    });
    this.handleImageUpload(audioData);
  };

  render() {
    const TabItems = [
      {
        key: "1",
        label: "All Doubts",
        children: this.diaplayAllDoubts(),
      },
      {
        key: "2",
        label: "My Doubts",
        children: (
          <>
            {this.state.mydoubtsTdata !== 0 && (
              <div
                style={{
                  background: "rgba(204, 255, 238, 0.7)",
                  border: "1px solid rgb(167, 229, 208)",
                  borderRadius: "8px",
                  color: "#004085",
                  padding: "25px",
                  margin: "auto",
                  fontSize: "15px",
                  fontWeight: "500",
                }}
              >
                <InfoCircleOutlined />
                &nbsp;&nbsp; You must choose Best Answer for your doubts
              </div>
            )}
            {this.display(this.state.mydoubtsdata, this.state.mydoubtsTdata)}
          </>
        ),
      },
      {
        key: "3",
        label: "My Answered",
        children: (
          <>{this.display(this.state.myAnswerdata, this.state.myAnswerTdata)}</>
        ),
      },
      {
        key: "4",
        label: "Followed",
        children: (
          <>
            {this.display(
              this.state.followdatalist,
              this.state.followTdatalist
            )}
          </>
        ),
      },
      {
        key: "5",
        label: "My Points",
        children: (
          <>
            <Points
              ref={(instance) => {
                this.points = instance;
              }}
              {...this.props}
            />
          </>
        ),
      },
    ];
    return (
      <>
        <Layout>
          <DoubtsLeftSidebar
            {...this.props}
            getFilterDoubts={this.getFilterDoubts}
            filter_course_id={this.state.filter_course_id}
          />
          <Layout>
            <Content>
              <div className="doubts-main-content">
                <div className="doubts-tabs">
                  {!this.props.match.params.id &&
                    this.props.profile_update.role_id !== 5 && (
                      <DoubtsFilterComponents
                        toggleFilterDoubtsPopup={this.toggleFilterDoubtsPopup}
                        callbackOnchange={this.callbackOnchange}
                        searchInput={this.state.searchInput}
                        activeTabIndex={parseInt(this.state.activeTabIndex)}
                      />
                    )}
                  <span className="doubts-tabs-nagation">
                    {this.state.activeTabIndex > 1 && (
                      <LeftOutlined
                        onClick={() => {
                          this.handleTabIndex(-1);
                        }}
                        style={{
                          position: "absolute",
                          top: "12px",
                          left: "-20px",
                        }}
                      />
                    )}
                    {this.state.activeTabIndex < 5 && (
                      <RightOutlined
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "-20px",
                        }}
                        onClick={() => {
                          this.handleTabIndex(1);
                        }}
                      />
                    )}
                  </span>
                  <Tabs
                    defaultActiveKey={this.state.activeTabIndex}
                    activeKey={this.state.activeTabIndex}
                    items={TabItems}
                    onChange={(e) => {
                      this.handleTagChange(e);
                    }}
                  />
                </div>
                <DoubtsAnswer
                  ref={(instance) => {
                    this.DoubtsAnswer = instance;
                  }}
                  changeCourse={this.changeCourse}
                  doubtsCourse={this.createDoubts}
                  closeDoubts={this.closeDoubts}
                  toggleDoubtsPopup={this.toggleDoubtsPopup}
                  togglecloseDoubtsPopup={this.togglecloseDoubtsPopup}
                  getDoubtsID={this.getDoubtsID}
                  handleFollow={this.handleFollow}
                  activeTabIndex={this.state.activeTabIndex}
                  {...this.props}
                />
                <GeneralPopup
                  ref={(instance) => {
                    this.generalPopup = instance;
                  }}
                />
                <DeleteConfirmationPopup
                  ref={(instance) => {
                    this.DeleteConfirmation = instance;
                  }}
                  dispachDelete={this.getDiscardImage}
                  {...this.props}
                />
                <DoubtsCoures
                  ref={(instance) => {
                    this.DoubtsCoures = instance;
                  }}
                  changeCourse={this.changeCourse}
                  doubtsCourse={this.createDoubts}
                  closeDoubts={this.closeDoubts}
                  toggleDoubtsPopup={this.toggleDoubtsPopup}
                  togglecloseDoubtsPopup={this.togglecloseDoubtsPopup}
                  getDoubtsID={this.getDoubtsID}
                  {...this.props}
                />
                <QuizSharePopup
                  {...this.props}
                  ref={(instance) => {
                    this.quizSharePopup = instance;
                  }}
                />
                {parseInt(this.state.activeTabIndex) === 1 &&
                  this.state.ALactivePage > 1 && (
                    <div style={{ right: "384px" }}>
                      <FloatButton.BackTop />
                    </div>
                  )}
                {parseInt(this.state.activeTabIndex) === 2 &&
                  this.state.MYactivePage > 1 && (
                    <div style={{ right: "384px" }}>
                      <FloatButton.BackTop />
                    </div>
                  )}
                {parseInt(this.state.activeTabIndex) === 3 &&
                  this.state.ANSactivePage > 1 && (
                    <div style={{ right: "384px" }}>
                      <FloatButton.BackTop />
                    </div>
                  )}
                {parseInt(this.state.activeTabIndex) === 4 &&
                  this.state.FLactivePage > 1 && (
                    <div style={{ right: "384px" }}>
                      <FloatButton.BackTop />
                    </div>
                  )}
              </div>
            </Content>
          </Layout>
          <DoubtRightSidebar
            {...this.props}
            activePage={this.state.activePage}
          />
        </Layout>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    preferences: state.preferences,
    profile_update: state.profile_update,
    envupdate: state.envupdate,
    envendpoint: state.envendpoint,
    banner_update: state.banner_update,
  };
};

export default connect(mapStateToProps)(MyDoubts);
