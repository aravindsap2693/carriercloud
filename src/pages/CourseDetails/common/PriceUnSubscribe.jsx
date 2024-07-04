import React, { Component } from "react";
import { Typography, Row, Col, Button } from "antd";
import validity_calendar from "../../../assets/svg-icons/subscription-calendar.svg";
import shopping_cart from "../../../assets/svg-icons/subscription-cart.svg";
import "../../../assets/css/course-detail.css";
import moment from "moment";
import UnSubscribePopup from "./UnSubscribePopup";

const { Text } = Typography;

class PriceUnSubscribe extends Component {
  render() {
    return (
      <div className="price-container">
        {Object.keys(this.props).length !== 0 && (
          <div className="content">
            <Row align="middle" className="row">
              <Col
                xs={24}
                sm={24}
                md={4}
                lg={4}
                xl={4}
                xxl={4}
                className="price-column"
              >
                <Text level={1} type="success" className="text price-symbol">
                  {Math.round(
                    this.props.courses.subscribed_info.final_price
                  ) === 0
                    ? "Add-on"
                    : "₹" +
                      Math.round(
                        this.props.courses.subscribed_info.final_price
                      )}
                </Text>
              </Col>

              <Col
                xs={24}
                sm={12}
                md={7}
                lg={7}
                xl={6}
                xxl={6}
                className="date-column"
              >
                <span className="image-span">
                  <img
                    className="image"
                    alt="shopping_cart"
                    src={shopping_cart}
                  />
                </span>
                <span className="text-span">
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
                sm={12}
                md={7}
                lg={7}
                xl={6}
                xxl={6}
                className="date-column"
              >
                <span className="image-span">
                  <img
                    className="image"
                    alt="validity_calendar"
                    src={validity_calendar}
                  />
                </span>
                <span className="text-span">
                  Validity end on{" "}
                  <span className="text">
                    {moment(
                      this.props.courses.subscribed_info
                        .course_validity_expires_on
                    ).format("DD MMM YYYY")}
                  </span>
                </span>
              </Col>
              <Col
                xs={24}
                sm={24}
                md={5}
                lg={5}
                xl={8}
                xxl={8}
                className="button-column"
              >
                <Button
                  className="button"
                  onClick={() =>
                    this.unsubscribePopup.showUnsubscribeModal(
                      true,
                      this.props.courses.id,
                      this.props.routingProps
                    )
                  }
                >
                  Unsubscribe
                </Button>
              </Col>
            </Row>
          </div>
        )}

        <UnSubscribePopup
          ref={(instance) => (this.unsubscribePopup = instance)}
        />
      </div>
    );
  }
}

export default PriceUnSubscribe;
