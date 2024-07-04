import React, { Component } from "react";
import { Row, Col, Button } from "antd";
import validity_calendar from "../../../assets/svg-icons/subscription-calendar.svg";
import shopping_cart from "../../../assets/svg-icons/subscription-cart.svg";
import "../../../assets/css/course-detail.css";
import moment from "moment";
import UnSubscribePopup from "./UnSubscribePopup";

class FreeUnSubscription extends Component {
  render() {
    return (
      <div className="unsubscribe-container">
        <div className="content">
          <Row align="middle" className="row">
            <Col
              xs={24}
              sm={24}
              md={4}
              lg={4}
              xl={3}
              xxl={3}
              className="text-column"
            >
              <span className="text">Free</span>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={7}
              lg={7}
              xl={7}
              xxl={7}
              className="date-column"
            >
              <span className="image-span">
                <img className="image" src={shopping_cart} alt="Purchased" />
              </span>
              <span className="date-span">
                Purchased on{" "}
                <span className="text">
                  {moment(
                    this.props.courses.subscribed_info.purchased_date
                  ).format("DD MMM YYYY")}
                </span>
              </span>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={7}
              lg={7}
              xl={7}
              xxl={7}
              className="date-column"
            >
              <span className="image-span">
                <img className="image" src={validity_calendar} alt="Validity" />
              </span>
              <span className="date-span">
                Validity end on{" "}
                <span className="text">
                  {moment(
                    this.props.courses.subscribed_info.course_expiry_date
                  ).format("DD MMM YYYY")}
                </span>
              </span>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={5}
              lg={5}
              xl={7}
              xxl={7}
              className="button-column"
            >
              <Button
                className="button"
                size="large"
                onClick={() =>
                  this.unsubscribePopup.showUnsubscribeModal(
                    true,
                    this.props.courses.id,
                    this.props
                  )
                }
              >
                Unsubscribe
              </Button>
            </Col>
          </Row>
        </div>

        <UnSubscribePopup
          ref={(instance) => (this.unsubscribePopup = instance)}
        />
      </div>
    );
  }
}

export default FreeUnSubscription;
