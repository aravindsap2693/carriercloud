import React, { Component } from "react";
import { Breadcrumb } from "antd";

export default class RefundPolicies extends Component {
  render() {
    return (
      <div className="all-course-main main-content">
        <div className="all-course-title">
          <div style={{ padding: "0px" }}>
            <Breadcrumb items={[{ title: "Refund Policies" }]} />
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
      </div>
    );
  }
}
