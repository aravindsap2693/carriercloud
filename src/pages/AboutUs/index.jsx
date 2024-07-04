import React, { Component } from "react";
import { connect } from "react-redux";
import "../../assets/css/common.css";
import Env from "../../utilities/services/Env";
import { analytics } from "../../firebase-config";
import { logEvent } from "firebase/analytics";

class AboutUs extends Component {
  constructor() {
    super();
    this.state = {
      aboutUs: [],
    };
  }

  componentDidMount() {
    const getData = Env.get(this.props.envendpoint + `staticpages/about-us`);
    getData.then((response) => {
      const data = response.data.response.cms[0];
      this.setState({ aboutUs: data });
    });
    logEvent(analytics, "select_content", {
      page_title: "About-Us",
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
            About Us
          </span>
          <div>
            <div
              dangerouslySetInnerHTML={{ __html: this.state.aboutUs.content }}
              style={{ fontSize: "20px", marginTop: "30px" }}
            ></div>
          </div>
          {/* <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px', fontSize: '20px', color: 'grey'}}>Comming Soon.</div> */}
        </div>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    envendpoint: state.envendpoint,
  };
})(AboutUs);
