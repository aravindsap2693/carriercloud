import React, { Component } from "react";
import { Layout, Menu, List, Avatar, Tooltip, Divider } from "antd";
import "../../App.css";
import MyNotesSvg from "../../assets/js-icons/MyNotes";
import MyNotesActiveSvg from "../../assets/js-icons/MyNotesActive";
import InviteSvg from "../../assets/js-icons/Invite";
import InviteActiveSvg from "../../assets/js-icons/InviteActive";
import MyCoinsSvg from "../../assets/js-icons/MyCoins";
import MyCoinsActiveSvg from "../../assets/js-icons/MyCoinsActive";
import MyPointsSvg from "../../assets/js-icons/MyPoints";
import MyPointsActiveSvg from "../../assets/js-icons/MyPointsActive";
import MyQuestionSvg from "../../assets/js-icons/MyQuestion";
import MyQuestionActiveSvg from "../../assets/js-icons/MyQuestionActive";
import MyPurchaseSvg from "../../assets/js-icons/MyPurchase";
import MyPurchaseActiveSvg from "../../assets/js-icons/MyPurchaseActive";
import RateSvg from "../../assets/js-icons/Rate";
import RateActiveSvg from "../../assets/js-icons/RateActive";
import { Link, NavLink } from "react-router-dom";
import StorageConfiguration from "../../utilities/services/StorageConfiguration";
import EditProfile from "../../pages/Profile/Profile";
import Env, { profileImageUrl } from "../../utilities/services/Env";
import { connect } from "react-redux";
import jennifer from "../../assets/images/profile.jpg";
import MenuItem from "antd/es/menu/MenuItem";
import { setActiveMenu } from "../../reducers/action";
import { currentPageRouting } from "../../reducers/action";
const { Sider } = Layout;

const data = [
  {
    title: "Jennifer Lo'pez",
  },
];

class AppSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedKeys: props.active_menu === null ? "0" : props.active_menu,
      collapsed: false,
      Staticlink: null,
      menuList: [
        {
          id: 1,
          label: "My Notes",
          key: "1",
          icon: <MyNotesSvg />,
          activeIcon: <MyNotesActiveSvg />,
          is_active: true,
          type: null,
          path: "/my-notes",
        },
        {
          id: 2,
          label: "My Questions",
          key: "2",
          icon: <MyQuestionSvg />,
          activeIcon: <MyQuestionActiveSvg />,
          is_active: false,
          type: null,
          path: "/my-questions",
        },
        {
          id: 3,
          label: "My E-books",
          key: "3",
          icon: <MyNotesSvg />,
          activeIcon: <MyNotesActiveSvg />,
          is_active: false,
          type: null,
          path: "/my-ebooks",
        },
        {
          id: 4,
          label: "My Coins",
          key: "4",
          icon: <MyCoinsSvg />,
          activeIcon: <MyCoinsActiveSvg />,
          is_active: false,
          type: null,
          path: "/my-coins",
        },
        {
          id: 5,
          label: "My Points",
          key: "5",
          icon: <MyPointsSvg />,
          activeIcon: <MyPointsActiveSvg />,
          is_active: false,
          type: null,
          path: "/my-points",
        },
        {
          id: 6,
          label: "Invite Friends",
          key: "6",
          icon: <InviteSvg />,
          activeIcon: <InviteActiveSvg />,
          is_active: false,
          type: "divider",
          path: "/invite",
        },
        {
          id: 7,
          label: "Rate App ( V1.5.53 )",
          key: "7",
          icon: <RateSvg />,
          activeIcon: <RateActiveSvg />,
          is_active: false,
          type: null,
          path: null,
        },
        {
          id: 8,
          label: "My Purchase",
          key: "8",
          icon: <MyPurchaseSvg />,
          activeIcon: <MyPurchaseActiveSvg />,
          is_active: false,
          type: null,
          path: "/my-order",
        },
        {
          id: 9,
          label: "Hire us",
          key: "9",
          icon: <InviteSvg />,
          activeIcon: <InviteActiveSvg />,
          is_active: false,
          type: null,
          path: null,
        },
      ],
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.active_menu === null) {
      return { selectedKeys: "0" };
    } else if (prevState.selectedKeys !== nextProps.active_menu) {
      return { selectedKeys: nextProps.active_menu };
    }
    return null;
  }

  componentDidMount() {
    this.getStaticLink();
  }

  onCollapse = (collapsed) => {
    this.setState({ collapsed });
  };

  handleMenuChange = (e) => {
    this.props.dispatch(setActiveMenu(e.key));
    this.setState(
      (prevState) => {
        return {
          ...prevState,
          selectedKeys: e.key,
        };
      },
      () => {
        if (e.key === "7") {
          window.open(this.props.envupdate.play_store_url, "_blank");
          this.props.dispatch(currentPageRouting(null));
        }
        if (e.key === "9") {
          window.open(
            "https://docs.google.com/forms/d/e/1FAIpQLSfHpHPsdsOf0UIrDyd4-WtffO_-42bYcEA1n4w_yAWLhlm5_Q/viewform",
            "_blank"
          );
          this.props.dispatch(currentPageRouting(null));
        }
      }
    );
  };

  getStaticLink() {
    const getStaticLink = Env.get(this.props.envendpoint + "get/staticlink");
    getStaticLink.then(
      (response) => {
        const data = response.data.response.link_page.content;
        this.setState({ Staticlink: data });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  render() {
    const { collapsed } = this.state;
    return (
      <div>
        <Sider
          collapsed={collapsed}
          onCollapse={this.onCollapse}
          inlineCollapsed={this.onCollapse}
          breakpoint="xl"
          style={{ boxShadow: "6px 0px 18px rgba(0, 0, 0, 0.06)" }}
          width={250}
        >
          <List
            style={{ padding: "5px 10px 0px 10px", marginTop: "10px" }}
            dataSource={data}
            renderItem={(item) => (
              <List.Item
                style={{
                  overflow: "hidden",
                  background: "#E0F3FF",
                  padding: "0px",
                  borderRadius: "6px",
                }}
              >
                <div style={{ padding: collapsed ? "0px " : "0px 5px" }}>
                  <List
                    itemLayout="horizontal"
                    dataSource={data}
                    renderItem={(item) => (
                      <List.Item>
                        <NavLink style={{ margin: "0px" }} to="/profile">
                          <List.Item.Meta
                            avatar={
                              /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
                                this.props.profile_image
                              ) &&
                              !this.props.profile_image.includes("data") &&
                              !this.props.profile_image.includes("prtner") ? (
                                <span style={{ cursor: "pointer" }}>
                                  {collapsed === false ? (
                                    <Avatar
                                      src={
                                        profileImageUrl +
                                        this.props.profile_image
                                      }
                                      size={50}
                                    />
                                  ) : (
                                    <Avatar
                                      src={
                                        profileImageUrl +
                                        this.props.profile_image
                                      }
                                      size={50}
                                      style={{ marginLeft: "7px" }}
                                    />
                                  )}
                                </span>
                              ) : (
                                <span style={{ cursor: "pointer" }}>
                                  <Avatar src={jennifer} size={50} />
                                </span>
                              )
                            }
                            title={
                              collapsed === false && (
                                <Tooltip
                                  title={StorageConfiguration.sessionGetItem(
                                    "user_name"
                                  )}
                                  placement="rightBottom"
                                >
                                  <span
                                    style={{
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      textTransform: "capitalize",
                                      fontSize: "12px",
                                      color: "#0b649d",
                                      fontWeight: 900,
                                    }}
                                  >
                                    {this.props.profile_update.user_name ===
                                    null
                                      ? StorageConfiguration.sessionGetItem(
                                          "user_name"
                                        )
                                      : this.props.profile_update
                                          .user_name}{" "}
                                  </span>
                                </Tooltip>
                              )
                            }
                            description={
                              collapsed === false && (
                                <Tooltip
                                  title={
                                    this.props.profile_update.email_id === null
                                      ? StorageConfiguration.sessionGetItem(
                                          "email_id"
                                        )
                                      : this.props.profile_update.email_id
                                  }
                                  placement="rightBottom"
                                >
                                  <span
                                    style={{
                                      textOverflow: "ellipsis",
                                      fontSize: "10px",
                                      paddingRight: "5px",
                                    }}
                                  >
                                    {this.props.profile_update.email_id === null
                                      ? StorageConfiguration.sessionGetItem(
                                          "email_id"
                                        )
                                      : this.props.profile_update.email_id}
                                  </span>
                                </Tooltip>
                              )
                            }
                          />
                        </NavLink>
                      </List.Item>
                    )}
                  />
                </div>
              </List.Item>
            )}
          />

          <Menu
            onClick={this.handleMenuChange}
            defaultSelectedKeys={[this.state.selectedKeys]}
            mode="inline"
            inlineCollapsed={collapsed}
            selectedKeys={this.state.selectedKeys}
            style={{ padding: "0px 0px 0px 10px" }}
          >
            {this.state.menuList.map((menu, index) => (
              <>
                <MenuItem
                  key={menu.key}
                  icon={
                    menu.key !== this.state.selectedKeys
                      ? menu.icon
                      : menu.activeIcon
                  }
                  id={menu.key}
                >
                  {menu.path !== null ? (
                    <Link to={menu.path}>{menu.label}</Link>
                  ) : (
                    menu.label
                  )}
                </MenuItem>
                {menu.type === "divider" ? <Divider /> : null}
              </>
            ))}
          </Menu>
        </Sider>

        <EditProfile
          ref={(instance) => {
            this.profilePopup = instance;
          }}
          routingProps={this.props}
        />
      </div>
    );
  }
}

export default connect((state) => {
  return {
    profile_update: state.profile_update,
    profile_image: state.profile_image,
    envupdate: state.envupdate,
    envendpoint: state.envendpoint,
    active_menu: state.active_menu,
  };
})(AppSidebar);
