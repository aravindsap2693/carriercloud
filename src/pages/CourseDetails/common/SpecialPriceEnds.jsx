import React, { Component } from "react";
import { Row, Col, Button } from "antd";
import clock from "../../../assets/svg-icons/subscription-clock.svg";
import "../../../assets/css/course-detail.css";
import { CommonService } from "../../../utilities/services/Common";
import CheckOut from "../../../components/subscription/Checkout";
import { connect } from "react-redux";

class SpecialPriceEnds extends Component {
  constructor() {
    super();
    this.state = {
      courseExpired: false,
      remainingDays: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
    };
  }

  componentDidMount() {
    this.props.courses && this.getRemainingTime();
  }

  getRemainingTime() {
    if (this.props.courses.special_price_end_date !== null) {
      let splittedData = this.props.courses.special_price_end_date.split("-");
      let formattedYear = splittedData[2];
      let formattedMonth = splittedData[1];
      let formattedDay = splittedData[0];
      let formattedDate = new Date(
        formattedYear,
        formattedMonth - 1,
        formattedDay,
        23,
        59,
        59
      );
      let interval = setInterval(() => {
        if (formattedDate > new Date()) {
          return this.setState({
            remainingDays: CommonService.getTimeRemaining(formattedDate),
          });
        } else {
          clearTimeout(interval);
          this.setState({ courseExpired: true });
        }
      }, 1000);
    } else {
      this.setState({ courseExpired: true });
    }
  }

  render() {
    return (
      <div className="special-price-container">
        <div className="content">
          {this.props.courses.special_price_valid === 1 ? (
            <Row align="middle" className="row">
              <Col
                xs={24}
                sm={24}
                md={4}
                lg={4}
                xl={4}
                xxl={4}
                className="clock-column"
              >
                <img src={clock} alt="clock" className="image" />
              </Col>
              <Col
                xs={24}
                sm={24}
                md={14}
                lg={14}
                xl={14}
                xxl={14}
                className="timer-column"
              >
                <Row className="time-row">
                  <span className="label">Special Price ends in</span>
                  <span className="text">
                    {this.state.remainingDays.days + "D"}
                  </span>
                  <span className="text">
                    {this.state.remainingDays.hours + "H"}
                  </span>
                  <span className="text">
                    {this.state.remainingDays.minutes + "M"}
                  </span>
                  <span className="text">
                    {this.state.remainingDays.seconds + "S"}
                  </span>
                </Row>
                <Row className="price-row">
                  <Col className="column">
                    <span className="save-span">
                      Save{" "}
                      {CommonService.getProductPercentage(
                        this.props.courses.course_period_all[0].cost_price,
                        this.props.courses.course_period_all[0].special_price
                      )}
                      %
                    </span>
                    <span className="price-text price-symbol">
                      ₹{" "}
                      {this.props.courses.course_period_all[0].special_price.toFixed(
                        2
                      )}
                    </span>
                    <span className="expire-text price-symbol">
                      ₹{" "}
                      {this.props.courses.course_period_all[0].offer_price.toFixed(
                        2
                      )}
                    </span>
                    <span className="expire-text price-symbol">
                      ₹{" "}
                      {this.props.courses.course_period_all[0].cost_price.toFixed(
                        2
                      )}
                    </span>
                  </Col>
                </Row>
              </Col>
              <Col
                xs={24}
                sm={24}
                md={6}
                lg={6}
                xl={6}
                xxl={6}
                className="button-column"
              >
                <Button
                  type="primary"
                  danger
                  className="button"
                  onClick={() =>
                    this.checkoutPopup.openModal(
                      this.props.courses,
                      this.props.routingProps,
                      this.props.envupdate
                    )
                  }
                >
                  Subscribe Now
                </Button>
              </Col>
            </Row>
          ) : (
            <Row align="middle" className="row">
              <Col
                className="clock-column"
                xs={{ span: 24, offset: 24 }}
                sm={{ span: 24, offset: 24 }}
                md={{ span: 4, offset: 4 }}
                lg={{ span: 4, offset: 4 }}
                xxl={{ span: 4, offset: 4 }}
              >
                {/* <img src={clock} className="image" /> */}
              </Col>
              <Col
                xs={24}
                sm={24}
                md={14}
                lg={14}
                xl={14}
                xxl={14}
                className="timer-column"
              >
                <Row className="price-row">
                  <Col className="column">
                    <span className="save-span">
                      Save{" "}
                      {CommonService.getProductPercentage(
                        this.props.courses.course_period_all[0].cost_price,
                        this.props.courses.course_period_all[0].offer_price
                      )}
                      %
                    </span>
                    <span className="price-text price-symbol">
                      ₹{" "}
                      {this.props.courses.course_period_all[0].offer_price.toFixed(
                        2
                      )}
                    </span>
                    <span className="expire-text price-symbol">
                      ₹{" "}
                      {this.props.courses.course_period_all[0].cost_price.toFixed(
                        2
                      )}
                    </span>
                  </Col>
                </Row>
              </Col>
              <Col
                xs={24}
                sm={24}
                md={6}
                lg={6}
                xl={6}
                xxl={6}
                className="button-column"
              >
                <Button
                  type="primary"
                  danger
                  className="button"
                  onClick={() => {
                    this.checkoutPopup.openModal(
                      this.props.courses,
                      this.props.routingProps,
                      this.props.envupdate
                    );
                  }}
                >
                  Subscribe Now
                </Button>
              </Col>
            </Row>
          )}
        </div>

        <CheckOut
          ref={(instance) => {
            this.checkoutPopup = instance;
          }}
        />
      </div>
    );
  }
}

export default connect((state) => {
  return {
    envupdate: state.envupdate,
  };
})(SpecialPriceEnds);

// export default SpecialPriceEnds;
