import React, { Component } from "react";
import { Card, Typography, Spin } from "antd";
import "../../../assets/css/course-detail.css";
import { connect } from "react-redux";
import Env from "../../../utilities/services/Env";

const { Text } = Typography;

class Instructor extends Component {
  constructor() {
    super();
    this.state = {
      instructorShowMore: false,
    };
  }

  render() {
    return (
      <div className="instructor-container">
        {Object.keys(this.props.courses).length !== 0 ? (
          <div className="content">
            <Card title="Instructors" bordered={false} className="card">
              <div className="content">
                {this.props.courses.assigned_instructors_list.map(
                  (item, index) => (
                    <div key={index} className="inner-content">
                      <img
                        src={
                          Env.getImageUrl(
                            `${this.props.envupdate.react_app_assets_url}users`
                          ) + item.profile_image
                        }
                        alt="profile"
                        className="image"
                      />
                      <span className="span">
                        <Text strong>
                          {item.first_name + " " + item.last_name}
                        </Text>
                      </span>
                    </div>
                  )
                )}
              </div>
            </Card>
          </div>
        ) : (
          <Spin className="app-spinner" size="large" />
        )}
      </div>
    );
  }
}

export default connect((state) => {
  return {
    envupdate: state.envupdate,
  };
})(Instructor);
