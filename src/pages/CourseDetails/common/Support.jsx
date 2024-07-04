import React, { Component } from "react";
import { Card, Row, Col } from "antd";
import "../../../assets/css/course-detail.css";
import support_email from "../../../assets/svg-images/email.svg";
import support_call from "../../../assets/svg-images/phone-voice.svg";
import support_chat from "../../../assets/svg-images/chat.svg";
import SupportContactPopup from "../../../components/SupportContactPopup";
import { connect } from "react-redux";
import { WhatsappShareButton } from "react-share";

class Support extends Component {
  render() {
    return (
      <div className="support-container">
        {Object.keys(this.props.courses).length !== 0 && (
          <div className="content">
            <Card bordered={false} className="card">
              <Row className="row">
                <Col
                  xs={12}
                  sm={12}
                  md={4}
                  lg={4}
                  xl={4}
                  xxl={4}
                  className="title-column"
                >
                  <div className="text">Support</div>
                </Col>
                {this.props.courses.support_email === 1 && (
                  <Col
                    xs={12}
                    sm={12}
                    md={4}
                    lg={4}
                    xl={4}
                    xxl={4}
                    className="support-column"
                  >
                    <div>
                      <img
                        className="icon"
                        alt="support_email"
                        src={support_email}
                        onClick={() =>
                          this.supportPopup.showSupportModal(
                            true,
                            "Mail",
                            this.props.preferences,
                            this.props.courses
                          )
                        }
                      />
                    </div>
                  </Col>
                )}
                {this.props.courses.support_call === 1 && (
                  <Col
                    xs={12}
                    sm={12}
                    md={4}
                    lg={4}
                    xl={4}
                    xxl={4}
                    className="support-column"
                  >
                    <div>
                      <img
                        className="icon"
                        alt="support_call"
                        src={support_call}
                        onClick={() =>
                          this.supportPopup.showSupportModal(
                            true,
                            "Call",
                            this.props.preferences,
                            this.props.courses
                          )
                        }
                      />
                    </div>
                  </Col>
                )}
                {this.props.courses.support_chat === 1 && (
                  <Col
                    xs={12}
                    sm={12}
                    md={4}
                    lg={4}
                    xl={4}
                    xxl={4}
                    className="support-column"
                  >
                    <div>
                      <WhatsappShareButton url={window.location.href}>
                        <img
                          className="icon"
                          alt="support_chat"
                          src={support_chat}
                        />
                      </WhatsappShareButton>
                    </div>
                  </Col>
                )}
              </Row>
            </Card>
          </div>
        )}

        <SupportContactPopup
          {...this.props}
          ref={(instance) => {
            this.supportPopup = instance;
          }}
        />
      </div>
    );
  }
}

export default connect((state) => {
  return {
    preferences: state.preferences,
    envendpoint: state.envendpoint,
  };
})(Support);
