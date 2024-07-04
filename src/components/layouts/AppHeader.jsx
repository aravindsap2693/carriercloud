import React, { Component } from "react";
import {
  Menu,
  Select,
  Badge,
  Row,
  Col,
  Avatar,
  List,
  Drawer,
  Modal,
  Image,
  Dropdown,
  Switch,
} from "antd";
import Icon, {
  FilterOutlined,
  PlusOutlined,
  MenuOutlined,
  ProfileOutlined,
  BellOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import "../../assets/css/layout.css";
import NotificationsDrawer from "../NotificationsDrawer";
import { NavLink } from "react-router-dom";
import Env, { profileImageUrl } from "../../utilities/services/Env";
import logo from "../../assets/images/full-logo.svg";
import notification from "../../assets/svg-icons/header-notification.svg";
import { connect } from "react-redux";
import {
  bannerUpdate,
  currentPageRouting,
  preferences,
  preferenceUpdate,
  userLogOut,
} from "../../reducers/action";
import StorageConfiguration from "../../utilities/services/StorageConfiguration";
import $ from "jquery";
import HomeSvg from "../../assets/js-icons/HomeFeed.js";
import MyCourseSvg from "../../assets/js-icons/MyCourse.js";
import AllCourseSvg from "../../assets/js-icons/AllCourse.js";
import DoubtSvg from "../../assets/js-icons/Doubt.js";
import home from "../../assets/svg-icons/home.svg";
import my_course from "../../assets/svg-icons/my-course.svg";
import all_course from "../../assets/svg-icons/all-course.svg";
import doubt from "../../assets/svg-icons/doubt.svg";
import ConfirmationPopup from "../ConfirmationPopup";
import { toast } from "react-toastify";
import { envEndpoint, envUpdate } from "../../reducers/action";
import jennifer from "../../assets/images/profile.jpg";

const HomeIcon = (props) => <Icon component={HomeSvg} {...props} />;
const MyCourseIcon = (props) => <Icon component={MyCourseSvg} {...props} />;
const AllCourseIcon = (props) => <Icon component={AllCourseSvg} {...props} />;
const DoubtIcon = (props) => <Icon component={DoubtSvg} {...props} />;

const { Option } = Select;

class AppHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPreference: "",
      preferenceOptions: [],
      selectedKeys: props.current_page_routing
        ? props.current_page_routing.selectedKeys
        : "0",
      showFullImage: true,
      visibleMenu: false,
      visibleFilter: false,
      unopenedNotifications: 0,
      url: " ",
      Switch:
        this.props.envendpoint === "https://testapi.careerscloud.in/api/"
          ? false
          : true,
    };
    this.checkAuth(props) // tempary code need remove this code after v1.6 and mocktest to live
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.current_page_routing === null) {
      return { selectedKeys: "0" }; // <- this is setState equivalent
    } else if (
      prevState.selectedKeys !== nextProps.current_page_routing.selectedKeys
    ) {
      return { selectedKeys: nextProps.current_page_routing.selectedKeys };
    }
    return null;
  }

  componentDidMount() {
    !this.props.is_new_user && this.getPreferenceList();
  }

  componentDidUpdate(nextProps) {
    if (nextProps.preference_update) {
      this.getPreferenceList();
      this.props.dispatch(preferenceUpdate(false));
    }
  }

  checkAuth(nextProps) {
    if (nextProps.current_page_routing === '/home-feed') {
      this.props.dispatch(userLogOut(undefined));
      StorageConfiguration.sessionRemoveAllItem();
      sessionStorage.clear();
      this.props.navigate("/login");
    }
  }

  getPreferenceList() {
    const data = [];
    const getPreferenceList = Env.get(
      this.props.envendpoint +
      `preferences?device_name=${this.props.profileUpdate.device_name}&session_id=${this.props.profileUpdate.session_id}`
    );
    getPreferenceList.then(
      (response) => {
        let responseData = response.data.response.preferences.data;
        const banner = {
          doubts_banner: response.data.response.doubt_banner,
          support_banner: response.data.response.support_banner,
        };
        this.props.dispatch(bannerUpdate(banner));
        if (responseData.length !== 0) {
          responseData.forEach((element) => {
            data.push({
              name: element.category.name,
              id: element.category.id,
            });
          });
          const payload = {
            id: responseData[0].category.id,
            name: responseData[0].category.name,
          };
          this.props.preferences.id === null &&
            this.props.dispatch(preferences(payload.id, payload.name));
          this.setState({
            preferenceOptions: data,
            selectedPreference:
              this.props.preferences.id === null
                ? data[0].id
                : this.props.preferences.id,
          });
        }
      },
      (error) => {
        if (error.response !== undefined && error.response.status === 401) {
          this.props.dispatch(userLogOut(undefined));
          StorageConfiguration.sessionRemoveAllItem();
          sessionStorage.clear();
          this.props.navigate("/login");
          toast("Logged out successfully ");
        }
        console.error(error);
      }
    );
  }

  onChange = (value, e) => {
    this.setState({ selectedPreference: value });
    this.props.dispatch(preferences(value, e.children));
  };

  myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
      x.className += " responsive";
    } else {
      x.className = "topnav";
    }
  }

  handleSwitch = (e) => {
    let url = "";
    if (e) {
      url = "https://api.careerscloud.in/api/";
    } else {
      url = "https://testapi.careerscloud.in/api/";
    }
    this.setState(
      {
        url: url,
      },
      () => this.handleLogout(url)
    );
    toast(`Switch to ${e ? "Live " : "Test "} api successfully`);
  };

  handleLogout(url) {
    const requestBody = {
      device_token: "",
    };
    const logoutData = Env.put(
      this.props.envendpoint + "users/update/devicetokens",
      requestBody
    );
    logoutData.then((response) => {
      let data = response.data.response;
      if (data) {
        this.setState({ visible: false }, () =>
          this.props.dispatch(userLogOut(undefined))
        );
        StorageConfiguration.sessionRemoveAllItem();
        sessionStorage.clear();
        this.props.navigate("/login");
        this.getGeneralSettings(url);
        toast("Logged out successfully ");
      }
    });
  }

  getGeneralSettings = (url) => {
    const getEnv = Env.get(url + `settings/general_settings_web`);
    getEnv.then((response) => {
      let data = response.data.response.data;
      data = window.atob(window.atob(data));
      data = JSON.parse(data).settings;
      this.props.dispatch(envUpdate(data));
      this.props.dispatch(envEndpoint(url));
    });
  };

  handleMenu = () => {
    $(".app-header-responsive-menu").fadeToggle();
    $(".app-header-responsive-menu").css("display", "block");
    this.setState({ visibleMenu: !this.state.visibleMenu });
  };

  handleFilter = () => {
    this.setState({ visibleFilter: !this.state.visibleFilter });
  };

  getNotificationData = (propsValue) => {
    this.setState({ unopenedNotifications: propsValue });
  };

  render() {
    const HeaderMenuList = [
      {
        label: (
          <NavLink
            to="/home-feed"
            style={{ whiteSpace: "nowrap", color: "#0b649d" }}
          >
            Home
          </NavLink>
        ),
        key: 1,
        path: "/home-feed",
        icon: <HomeIcon className="icon" style={{ position: "relative" }} />,
      },
      {
        label: (
          <NavLink
            to="/my-courses"
            style={{ whiteSpace: "nowrap", color: "#0b649d" }}
          >
            My Course
          </NavLink>
        ),
        key: 2,
        path: "/my-courses",
        icon: <MyCourseIcon />,
      },
      {
        label: (
          <NavLink
            to="/all-courses"
            style={{ whiteSpace: "nowrap", color: "#0b649d" }}
          >
            All Course
          </NavLink>
        ),
        path: "/all-courses",
        key: 3,
        icon: <AllCourseIcon />,
      },
      {
        label: (
          <NavLink
            to="/doubts"
            style={{ whiteSpace: "nowrap", color: "#0b649d" }}
          >
            Doubts
          </NavLink>
        ),
        path: "/doubts",
        key: 4,
        icon: <DoubtIcon className="icon" style={{ position: "relative" }} />,
      },
    ];
    const ResponsiveHeaderMenuList = [
      {
        name: "Home",
        path: "/home-feed",
        icon: <Image preview={false} src={home} className="icon" />,
      },
      {
        name: "My Course",
        path: "/my-courses",
        icon: (
          <Image
            preview={false}
            src={my_course}
            className="icon"
            style={{ position: "relative", top: "5px" }}
          />
        ),
      },
      {
        name: "All Course",
        path: "/all-courses",
        icon: (
          <Image
            preview={false}
            src={all_course}
            className="icon"
            style={{ position: "relative", top: "5px" }}
          />
        ),
      },
      {
        name: "Doubts",
        path: "/doubts",
        icon: (
          <Image
            preview={false}
            src={doubt}
            className="icon"
            style={{ position: "relative", top: "5px" }}
          />
        ),
      },
      { name: "My Profile", path: "/profile", icon: <ProfileOutlined /> },
      { name: "Notifications", path: "/profile", icon: <BellOutlined /> },
      { name: "Switch Over", path: "/home-feed", icon: <BellOutlined /> },
      { name: "Log Out", path: "/login", icon: <LogoutOutlined /> },
    ];

    const dropDownMenuList = (
      <Menu style={{ width: "190px" }}>
        <Menu.Item key="1">
          <NavLink to="/profile" style={{ whiteSpace: "nowrap" }}>
            My Profile
          </NavLink>
        </Menu.Item>
        {process.env.REACT_APP_ENV === "dev" && (
          <Menu.Item key="2">
            <span style={{ padding: "0px 18px 0px  0px" }}>Switch Over</span>
            <Switch
              defaultChecked={this.state.Switch}
              onChange={this.handleSwitch}
              size="small"
              className="Visibility"
              style={{
                color: "#000",
                background: this.state.Switch ? "#e2f2ff" : "#fff",
              }}
            />
          </Menu.Item>
        )}
        <Menu.Item key="3">
          <NavLink to="/my-order" style={{ whiteSpace: "nowrap" }}>
            My Purchase
          </NavLink>
        </Menu.Item>
        <Menu.Item key="4">
          <NavLink to="/settings" style={{ whiteSpace: "nowrap" }}>
            Settings
          </NavLink>
        </Menu.Item>
        <Menu.Item key="5">
          <NavLink to="/help-center" style={{ whiteSpace: "nowrap" }}>
            Help Center
          </NavLink>
        </Menu.Item>
        <Menu.Item
          onClick={() => this.confirmationPopup.toggleModal(true, this.props)}
          key="6"
        >
          Logout
        </Menu.Item>
      </Menu>
    );
    return (
      <div className="header-container">
        <NotificationsDrawer
          ref={(instance) => {
            this.menu = instance;
          }}
          {...this.props}
          handleResponseCallback={this.getNotificationData}
        />

        <Drawer
          placement="right"
          closable={true}
          onClose={() =>
            this.setState({ visibleMenu: !this.state.visibleMenu })
          }
          open={this.state.visibleMenu}
          className="drawer"
        >
          <List
            header={null}
            footer={null}
            bordered={false}
            className="drawer-list"
            dataSource={ResponsiveHeaderMenuList}
            renderItem={(item, key) => (
              <List.Item
                className="item"
                onClick={(e) => {
                  this.setState({
                    visibleMenu: !this.state.visibleMenu,
                  });
                }}
              >
                {item.name === "Notifications" && (
                  <div
                    onClick={() => {
                      this.menu.handleDrawer(false);
                    }}
                    id={key}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span style={{ color: "#0b649d" }}> {item.name}</span>
                  </div>
                )}
                {item.name === "Log Out" && (
                  <div
                    onClick={() => {
                      this.confirmationPopup.toggleModal(true, this.props);
                    }}
                    id={key}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span style={{ color: "#0b649d" }}> {item.name}</span>
                  </div>
                )}
                {process.env.REACT_APP_ENV === "dev" &&
                  item.name === "Switch Over" && (
                    <NavLink to={item.path} id={key}>
                      <span style={{ padding: "0px 18px 0px  0px" }}>
                        <Switch
                          defaultChecked={this.state.Switch}
                          onChange={this.handleSwitch}
                          size="small"
                          className="Visibility"
                          style={{
                            color: "#000",
                            background: this.state.Switch ? "#e2f2ff" : "#fff",
                          }}
                        />
                      </span>
                      <span style={{ padding: "0px 18px 0px  0px" }}>
                        {item.name}
                      </span>
                    </NavLink>
                  )}
                {item.name !== "Notifications" &&
                  item.name !== "Log Out" &&
                  item.name !== "Switch Over" && (
                    <NavLink to={item.path} id={key}>
                      <span className="menu-icon">{item.icon}</span>
                      {item.name}
                    </NavLink>
                  )}
              </List.Item>
            )}
          />
        </Drawer>

        <Modal
          title="Select Filter"
          open={this.state.visibleFilter}
          onOk={() =>
            this.setState({ visibleFilter: !this.state.visibleFilter })
          }
          footer={null}
          onCancel={() =>
            this.setState({ visibleFilter: !this.state.visibleFilter })
          }
          width={"400px"}
        >
          {this.state.preferenceOptions.length > 0 && (
            <div>
              <List
                header={null}
                footer={
                  <div className="modal-list-footer">
                    <NavLink
                      to="/preference"
                      onClick={() =>
                        this.setState({
                          visibleFilter: !this.state.visibleFilter,
                        })
                      }
                    >
                      <PlusOutlined /> Add Preference
                    </NavLink>
                  </div>
                }
                bordered={false}
                className="modal-list"
                dataSource={this.state.preferenceOptions}
                renderItem={(item) => (
                  <List.Item className="list-item">{item.name}</List.Item>
                )}
              />
            </div>
          )}
        </Modal>

        <div className="main-layout">
          <Row align="middle" className="row">
            <Col
              xs={20}
              sm={2}
              md={2}
              lg={3}
              xl={3}
              xxl={3}
              className="logo-column"
            >
              <span
                className="span"
                onClick={() =>
                  this.props.dispatch(
                    currentPageRouting({
                      path: "/home-feed",
                      selectedKeys: "1",
                    })
                  )
                }
              >
                {this.props.is_new_user === false ? (
                  <NavLink to="/home-feed">
                    <img src={logo} className="image" alt="logo" />
                  </NavLink>
                ) : (
                  <span>
                    <img src={logo} className="image" alt="logo" />
                  </span>
                )}
              </span>
            </Col>
            <Col
              xs={24}
              sm={22}
              md={16}
              lg={15}
              xl={15}
              xxl={15}
              className="menu-column1"
            >
              <Menu
                onClick={(e) => {
                  let PageRouting = e.item.props.path;
                  this.setState({ selectedKeys: e.key });
                  this.props.dispatch(
                    currentPageRouting({
                      path: PageRouting,
                      selectedKeys: e.key,
                    })
                  );
                }}
                selectedKeys={[this.state.selectedKeys.toString()]}
                mode="horizontal"
                items={HeaderMenuList}
              />
            </Col>
            <Col
              xs={24}
              sm={24}
              md={6}
              lg={6}
              xl={6}
              xxl={6}
              className="menu-column2"
            >
              {this.props.is_new_user === false && (
                <Row align="middle" justify="end" className="row bank">
                  <span className="preference-span">
                    <Select
                      className="preference"
                      size="large"
                      placeholder="Select a preference"
                      optionFilterProp="children"
                      onChange={this.onChange}
                      disabled={this.props.disable_preference}
                      name="selectedPreference"
                      value={this.state.selectedPreference}
                      dropdownRender={(menu) => (
                        <div>
                          <div>{menu}</div>
                          <div style={{ padding: "10px" }}>
                            <NavLink to="/preference">
                              <PlusOutlined /> Add Preference
                            </NavLink>
                          </div>
                        </div>
                      )}
                    >
                      {this.state.preferenceOptions.map((item, index) => (
                        <Option key={index} value={item.id}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </span>
                  <span className="notification-span">
                    <Badge
                      count={this.state.unopenedNotifications}
                      size="small"
                    >
                      <img
                        className="image"
                        src={notification}
                        alt="notification"
                        onClick={() => this.menu.handleDrawer(false)}
                      />
                    </Badge>
                  </span>
                  <span className="profile-span">
                    <Dropdown
                      dropdownRender={(e) => dropDownMenuList}
                      trigger={["click"]}
                    >
                      {/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(
                        this.props.profile_image
                      ) ? (
                        <Avatar
                          className="image"
                          src={profileImageUrl + this.props.profile_image}
                          size={45}
                        />
                      ) : (
                        <Avatar className="image" src={jennifer} size={45} />
                      )}
                    </Dropdown>
                  </span>
                </Row>
              )}
            </Col>
            <span className="toggle-menu">
              <MenuOutlined className="menu-icon" onClick={this.handleMenu} />
            </span>
            <span className="filter-menu">
              <FilterOutlined
                className="filter-icon"
                onClick={this.handleFilter}
              />
            </span>
          </Row>
        </div>
        <ConfirmationPopup
          ref={(instance) => {
            this.confirmationPopup = instance;
          }}
          {...this.props}
        />
      </div>
    );
  }
}

export default connect((state) => {
  return {
    is_new_user: state.is_new_user,
    preferences: state.preferences,
    preference_update: state.preference_update,
    disable_preference: state.disable_preference,
    profile_image: state.profile_image,
    envupdate: state.envupdate,
    envendpoint: state.envendpoint,
    profileUpdate: state.profile_update,
    current_page_routing: state.current_page_routing,
  };
})(AppHeader);
