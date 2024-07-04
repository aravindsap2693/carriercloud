import React, { Component } from "react";
import { Result } from "antd";
import { NavLink } from "react-router-dom";

export default class PageNotFound extends Component {
  render() {
    return (
      <div style={{ height: "90vh" }}>
        <Result
          style={{ padding: "160px 60px" }}
          status="404"
          title="404"
          subTitle="Sorry, the page you visited does not exist."
          extra={
            <NavLink
              to={
                this.props.location.state == null
                  ? "/home-feed"
                  : this.props.location.state.path
              }
            >
              Back
              {this.props.location.state == null
                ? " Home"
                : this.props.location.state.name}
            </NavLink>
          }
        />
      </div>
    );
  }
}
