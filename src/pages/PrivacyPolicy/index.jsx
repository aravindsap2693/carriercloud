import React, { Component } from "react";
import { connect } from "react-redux";
import "../../assets/css/common.css";
import Env from "../../utilities/services/Env";

class PrivacyPolicy extends Component {
  constructor() {
    super();
    this.state = {
      privacyData: [],
    };
  }

  componentDidMount() {
    const getData = Env.get(
      this.props.envendpoint + `staticpages/privacy-policies`
    );
    getData.then((response) => {
      const data = response.data.response.cms[0];
      this.setState({ privacyData: data });
    });
  }

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
            Privacy Policy
          </span>
          <div>
            <div
              dangerouslySetInnerHTML={{
                __html: this.state.privacyData.content,
              }}
              style={{ fontSize: "20px", marginTop: "30px" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    envendpoint: state.envendpoint,
  };
})(PrivacyPolicy);
