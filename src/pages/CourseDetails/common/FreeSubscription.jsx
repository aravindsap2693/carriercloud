import React, { Component } from "react";
import { Button } from "antd";
import discount_image from "../../../assets/images/discount_image.png";
import "../../../assets/css/course-detail.css";
import Env from "../../../utilities/services/Env";
import StorageConfiguration from "../../../utilities/services/StorageConfiguration";
import { updateCourseDetails } from "../../../reducers/action";
import { toast } from "react-toastify";

class FreeSubscription extends Component {
  constructor() {
    super();
    this.state = {
      subscribed: 1,
      activeLoader: true,
    };
    this.handleSubscription = this.handleSubscription.bind(this);
  }

  handleSubscription() {
    const requestBody = {
      user_id: StorageConfiguration.sessionGetItem("user_id"),
      payment_status: "completed",
      product_id: this.props.courses.id,
      product_title: this.props.courses.title,
      product_type: "course",
      course_expiry_date: this.props.courses.validity_end_date,
      billing_email: StorageConfiguration.sessionGetItem("email_id"),
      billing_contact_no: StorageConfiguration.sessionGetItem("mobile_number"),
    };
    const postData = Env.post(
      this.props.envendpoint + `subscribe`,
      requestBody
    );
    postData.then(
      (response) => {
        toast("Course subscription successfull!");
        this.props.dispatch(updateCourseDetails(true));
        this.props.navigate(`/course-details/${this.props.courses.id}`);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  render() {
    return (
      <div className="free-container">
        <div
          className="content"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span className="inner-content">
            <img alt="discount_image" src={discount_image} className="image" />
            <span className="text">Free</span>
          </span>
          <span className="inner-content">
            <Button
              type="primary"
              danger
              className="button"
              onClick={this.handleSubscription}
            >
              Subscribe Now
            </Button>
          </span>
        </div>
      </div>
    );
  }
}

export default FreeSubscription;
