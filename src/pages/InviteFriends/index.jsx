import React, { Component } from "react";
import "../../assets/css/common.css";
import { Layout, Breadcrumb } from "antd";
import { connect } from "react-redux";
import "../../assets/css/home-feed.css";
import { Content } from "antd/lib/layout/layout";
import AppSidebar from "../../components/layouts/AppSidebar";

class InviteFriends extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeLoader: false,
    };
  }

  render() {
    return (
      <Layout>
        <AppSidebar {...this.props} />
        <Layout>
          <Content>
            <div className="all-course-main main-content">
              <div style={{ padding: "10px" }}>
                <Breadcrumb items={[{ title: "Invite Friends" }]} />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "600px",
                  fontSize: "20px",
                  color: "grey",
                }}
              >
                Comming Soon.
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
export default connect((state) => {
  return {
    preferences: state.preferences,
    envupdate: state.envupdate,
    envendpoint: state.envendpoint,
  };
})(InviteFriends);
