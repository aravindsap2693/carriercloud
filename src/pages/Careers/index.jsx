import React, { Component } from "react";
import { connect } from "react-redux";
import "../../assets/css/common.css";
import Env from "../../utilities/services/Env";

class Careers extends Component {
  constructor() {
    super();
    this.state = {
      careersData: [],
    };
  }

  componentDidMount() {
    const getData = Env.get(this.props.envendpoint + `staticpages/hire-us`);
    getData.then((response) => {
      const data = response.data.response.cms[0];
      this.setState({ careersData: data });
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
            Careers
          </span>
          <div>
            <div
              dangerouslySetInnerHTML={{
                __html: this.state.careersData.content,
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
})(Careers);
