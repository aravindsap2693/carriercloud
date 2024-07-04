import React, { Component } from "react";
import { connect } from "react-redux";
import "../../assets/css/common.css";
// import CmsService from '../../utilities/services/CmsService';
import Env from "../../utilities/services/Env";

class FAQ extends Component {
  constructor() {
    super();
    this.state = {
      faqData: [],
    };
  }

  componentDidMount() {
    const getData = Env.get(this.props.envendpoint + `staticpages/coin_faq`);
    getData.then((response) => {
      const data = response.data.response.cms[0];
      this.setState({ faqData: data });
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
            FAQ
          </span>
          <div>
            <div
              dangerouslySetInnerHTML={{ __html: this.state.faqData.content }}
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
})(FAQ);
