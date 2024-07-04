import React, { Component } from "react";
import { Layout, Button, Skeleton } from "antd";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import "../../App.css";
import $ from "jquery";
import SideLogo from "../../assets/svg-images/AffairsCloudmainLOGO.svg";
import Env from "../../utilities/services/Env";
import playstore_icon from "../../assets/svg-icons/download_googleplay.svg";
import GeneralPopup from "../../components/GeneralPopup";

const { Sider } = Layout;

class DoubtRightSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeLoader: true,
      banners: [],
      toggleSidebar: true,
      preferencesId: props.preferences.id,
      activePage: props.activePage,
    };
    this.myRefscroll = React.createRef();
  }

  componentDidMount() {
    this.getBanners();
    width();
    window.addEventListener("resize", width);
    function width() {
      let screenwidth = "";
      screenwidth = document.documentElement.clientWidth;
      return screenwidth;
    }
    let screenwidth = width();
    this.setState({ sideWidth: screenwidth });
    if (screenwidth < 1345) {
      $(".doubt-right-sidebar").fadeToggle();
      $(".doubt-right-sidebar").css({ display: "none" });
    }
    if (screenwidth > 1344) {
      $(".doubt-right-sidebar").css({
        display: "block",
      });
    }
    if (screenwidth > 1400) {
      $(".doubt-right-sidebar").css({ right: "0px" });
    }
  }

  componentWillReceiveProps(newProps) {
    if (this.props.preferences.id !== newProps.preferences.id) {
      this.setState({ preferencesId: newProps.preferences.id }, () =>
        this.getBanners()
      );
    }
    if (this.props.activePage < newProps.activePage) {
      this.myRefscroll.current.scrollTo(
        0,
        this.myRefscroll.current.scrollHeight
      );
    }
  }

  getBanners = () => {
    const getBanners = Env.get(
      this.props.envendpoint +
        `banners/doubtbanners?category_id=${this.state.preferencesId}`
    );
    getBanners.then((response) => {
      let data = response.data.response.banners;
      this.setState({
        banners: data,
        activeLoader: false,
      });
    });
  };

  toggleSidebar = () => {
    width();
    window.addEventListener("resize", width);
    function width() {
      let screenwidth = "";
      screenwidth = document.documentElement.clientWidth;
      return screenwidth;
    }
    const sidebarElement = document.getElementById("right-sidebar");
    const iconElement = document.getElementById("right-sidebar-icon");
    sidebarElement.style.display =
      sidebarElement.style.display === "" ? "none" : "";
    sidebarElement.style.position =
      sidebarElement.style.position === "" ? "absolute" : "";
    iconElement.style.right =
      iconElement.style.right === "300px" ? "0px" : "300px";
    this.setState({ toggleSidebar: sidebarElement.style.display !== "" });
  };

  handleBannerRedirection(e, data) {
    e.preventDefault();
    if (data.banner_type === 1) {
      this.props.navigate(`/course-details/${data.course_id}`);
    }
    if (data.banner_type === 3) {
      this.generalPopup.showModal(true, data.banner_content);
    }
  }

  showLoader = () => {
    return (
      <>
        {Skeletons.map((itms, index) => (
          <div key={index} className="doubts-sidebar-banner">
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "7px",
              }}
            >
              <Skeleton.Button
                active
                size={"large"}
                style={{ width: "270px", height: "150px" }}
              />
            </div>
          </div>
        ))}
      </>
    );
  };

  render() {
    return (
      <div>
        <span
          style={{
            position: "absolute",
            right: "0px",
          }}
          id="right-sidebar-icon"
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
          className="doubt-right-sidebar"
          style={{
            boxShadow: "6px 0px 18px rgba(0, 0, 0, 0.06)",
            background: "#fff",
            zIndex: "1",
            right: (this.state.sideWidth >= 1400) & "0px",
          }}
          width={300}
          // breakpoint="lg"
          // collapsedWidth="0"
          id="right-sidebar"
        >
          <div
            style={{
              position: "sticky",
              top: "0",
            }}
          >
            <div
              style={{
                padding: "20px",
              }}
              className="doubt-sidebar-header"
            >
              <img
                alt="SideLogo"
                className="doubt-sidebar-Logo"
                src={SideLogo}
              />
              <p className="doubt-sidebar-title">CareersCloud App</p>
              <p className="doubt-sidebar-text">LEARN TO LEAD</p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Button
                  href={this.props.envupdate.play_store_url}
                  target="_blank"
                  icon={
                    <img
                      alt="playstore_icon"
                      src={playstore_icon}
                      style={{
                        position: "relative",
                        top: "-4px",
                        left: "-15px",
                        borderRadius: "6px",
                      }}
                    />
                  }
                  style={{
                    background: " #01875F",
                    color: "#fff",
                    width: "150px",
                    display: "flex",
                  }}
                >
                  <span
                    style={{
                      padding: "0px 15px",
                    }}
                  >
                    Install
                  </span>
                </Button>
              </div>
            </div>
            <div
              ref={this.myRefscroll}
              style={{
                overflowY: "scroll",
                height: "80vh",
                scrollBehavior: "smooth",
              }}
            >
              {this.state.banners.length > 0 ? (
                <>
                  {this.state.banners.map((item, key) => (
                    <div
                      key={key}
                      onClick={(e) => this.handleBannerRedirection(e, item)}
                      className="doubts-sidebar-banner"
                    >
                      <img
                        src={
                          item.banner_image.includes("assets.careerscloud.in")
                            ? item.banner_image
                            : Env.getImageUrl(
                                `${this.props.envupdate.react_app_assets_url}banner`
                              ) + item.banner_image
                        }
                        alt={item.banner_image}
                        key={key}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "7px",
                        }}
                      />
                    </div>
                  ))}
                </>
              ) : (
                <div>
                  {this.state.activeLoader === false &&
                    this.state.banners.length === 0 && (
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
                          No Banners Found.
                        </span>
                      </div>
                    )}
                  {this.state.activeLoader &&
                    this.state.banners.length === 0 && <>{this.showLoader()}</>}
                </div>
              )}
            </div>
          </div>
        </Sider>
        <GeneralPopup
          ref={(instance) => {
            this.generalPopup = instance;
          }}
        />
      </div>
    );
  }
}

export default DoubtRightSidebar;

const Skeletons = [
  {
    id: 0,
  },
  {
    id: 1,
  },
  {
    id: 2,
  },
  {
    id: 3,
  },
  {
    id: 4,
  },
  {
    id: 5,
  },
];
