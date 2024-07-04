import React, { Component } from "react";
import { FloatButton, Col, Row } from "antd";
import "../../assets/css/myorder.css";
import Env from "../../utilities/services/Env";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";
import NoRecords from "../../components/NoRecords";
import InfiniteScroll from "react-infinite-scroll-component";
import { CommonService } from "../../utilities/services/Common";
import Skeletons from "../../components/SkeletonsComponent";
import { analytics } from "../../firebase-config";
import { logEvent } from "firebase/analytics";
import { currentPageRouting } from "../../reducers/action";

class MyPurchase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderData: [],
      rowsPerPage: 15,
      activeLoader: true,
      TotalOrder: 5,
      active_Show_more: false,
    };
  }

  componentDidMount() {
    this.getPurchaselist();
    this.props.dispatch(currentPageRouting(null));
    logEvent(analytics, "select_content", {
      page_title: "My Purchase",
    });
  }

  getPurchaselist = () => {
    const getPurchaselist = Env.get(
      this.props.envendpoint +
        `orderhistory/getorderhistory/${this.props.profile_update.user_id}?rowsPerPage=${this.state.rowsPerPage}`
    );
    getPurchaselist.then(
      (response) => {
        const data = response.data.response;
        setTimeout(() => {
          this.setState({
            orderData: data.order_hisotory.data,
            TotalOrder: data.order_hisotory.total,
            activeLoader: false,
            active_Show_more: false,
          });
        }, 1500);
      },
      (error) => {
        CommonService.hendleError(error, this.props, "main");
      }
    );
  };

  loadMore = () => {
    this.setState(
      (prev) => {
        return { rowsPerPage: prev.rowsPerPage + 15 };
      },
      () => this.getPurchaselist("paginate", this.state.rowsPerPage)
    );
  };

  render() {
    return (
      <div className="my-order-main-content">
        <div className="my-order-content-border">
          <h2 className="my-order-titel">Payment History</h2>
          <p style={{ fontSize: "16px" }}>
            Need more help? Check out our{" "}
            <NavLink to="/help-center" className="my-order-link-text">
              help center
            </NavLink>{" "}
            and{" "}
            <NavLink to="/refund-policies" className="my-order-link-text">
              refund policies
            </NavLink>
            .
          </p>
        </div>
        <div>
          <Row className="my-order-row">
            <Col xs={9} sm={9} md={9} lg={9} xl={9} xxl={9}>
              Purchase
            </Col>
            <Col
              xs={5}
              sm={5}
              md={5}
              lg={5}
              xl={5}
              xxl={5}
              style={{
                textAlign: "center",
              }}
            >
              Amount
            </Col>
            <Col
              xs={5}
              sm={5}
              md={5}
              lg={5}
              xl={5}
              xxl={5}
              style={{
                textAlign: "center",
              }}
            >
              Payment Date
            </Col>
            <Col
              xs={5}
              sm={5}
              md={5}
              lg={5}
              xl={5}
              xxl={5}
              style={{
                textAlign: "center",
              }}
            >
              Payment Status
            </Col>
          </Row>
          {this.state.orderData.length > 0 ? (
            <InfiniteScroll
              dataLength={this.state.orderData.length}
              next={this.loadMore}
              hasMore={this.state.orderData.length < this.state.TotalOrder}
              loader={<Skeletons type={"MyPurchase"} />}
              scrollableTarget="scrollableDiv"
            >
              {this.state.orderData.map((item, key) => (
                <Row className="my-order-content-row" key={key}>
                  <Col
                    xs={9}
                    sm={9}
                    md={9}
                    lg={9}
                    xl={9}
                    xxl={9}
                    className="my-order-content-col"
                  >
                    <div style={{ padding: " 0px 0px 0px 12px" }}>
                      <h2
                        style={{
                          margin: "0px",
                          fontSize: "24px",
                        }}
                      >
                        {item.product_title}
                      </h2>
                      <p
                        style={{
                          margin: "0px",
                          fontSize: "13px",
                          color: "#3C4852",
                        }}
                      >
                        Order ID: {item.order_id}
                      </p>
                    </div>
                  </Col>
                  <Col
                    xs={5}
                    sm={5}
                    md={5}
                    lg={5}
                    xl={5}
                    xxl={5}
                    className="my-order-content-col my-order-amount "
                  >
                    <div
                      style={{
                        textAlign: "center",
                        padding: "18px",
                      }}
                    >
                      <span className="price-symbol">₹</span>
                      {item.final_price}
                    </div>
                  </Col>
                  <Col
                    xs={5}
                    sm={5}
                    md={5}
                    lg={5}
                    xl={5}
                    xxl={5}
                    className="my-order-content-col my-order-amount "
                    style={{
                      textAlign: "center",
                      color: "#3C4852",
                    }}
                  >
                    <div
                      style={{
                        textAlign: "center",
                        padding: "18px",
                      }}
                    >
                      {CommonService.getDate(
                        item.order_initial_date,
                        "DD MMM Y"
                      )}
                    </div>
                  </Col>
                  <Col
                    xs={5}
                    sm={5}
                    md={5}
                    lg={5}
                    xl={5}
                    xxl={5}
                    className="my-order-amount "
                    style={{
                      textAlign: "center",
                      color: "#3C4852",
                    }}
                  >
                    <div
                      style={{
                        textAlign: "center",
                        padding: "18px",
                      }}
                    >
                      {item.payment_status}
                    </div>
                  </Col>
                </Row>
              ))}
            </InfiniteScroll>
          ) : this.state.activeLoader ? (
            <Skeletons type={"MyPurchase"} />
          ) : (
            <NoRecords />
          )}
          {this.state.orderData.length > 20 && <FloatButton.BackTop />}
        </div>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    profile_update: state.profile_update,
    envendpoint: state.envendpoint,
  };
})(MyPurchase);
