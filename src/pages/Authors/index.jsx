import React, { Component } from "react";
import "../../assets/css/common.css";

class Authors extends Component {
  render() {
    return (
      <div className="all-course-main main-content">
        <div className="all-course-title">
          <span
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#334d6e",
            }}
          >
            Authors
          </span>
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

export default Authors;
