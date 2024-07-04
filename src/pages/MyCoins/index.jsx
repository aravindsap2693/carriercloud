import React, { Component } from "react";
import { Button, List, Col, Layout, Row } from "antd";
import "../../assets/css/common.css";
import "../../assets/css/coins.css";
import AppSidebar from "../../components/layouts/AppSidebar";
import { Content } from "antd/lib/layout/layout";
import {
  currentCourse,
  currentPageRouting,
  currentTabIndex,
  disablePreference,
} from "../../reducers/action";
import Env from "../../utilities/services/Env";
import playstore_icon from "../../assets/images/playstore_icon.svg";
import ad_image from "../../assets/images/For-support-banner-FINAL.jpg";
import cash_hand from "../../assets/svg-images/cash-in-hand.svg";
import idea from "../../assets/svg-images/idea-sharing.svg";
import key from "../../assets/svg-images/key.svg";
import pricing from "../../assets/svg-images/pricing.svg";
import faq from "../../assets/svg-images/faq.svg";
import { RightOutlined } from "@ant-design/icons";
import coins from "../../assets/svg-images/my-coin.svg";
import ViewEarnPoints from "../../components/Point/ViewEarnPoints";
import StorageConfiguration from "../../utilities/services/StorageConfiguration";
import { connect } from "react-redux";
import { analytics } from "../../firebase-config";
import { logEvent } from "firebase/analytics";

const images = [idea, key, cash_hand];

class Coins extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coinsData: {},
      featuredCourses: [],
      catergoryId: props.preferences.id,
    };
    this.getMyCoinsDetails = this.getMyCoinsDetails.bind(this);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.props.dispatch(disablePreference(false));
    this.props.dispatch(currentTabIndex(null));
    this.props.dispatch(currentPageRouting(null));
    this.props.dispatch(currentCourse(null));
    this.getMyCoinsDetails();
    this.getFeaturedcoins();
    logEvent(analytics, "select_content", {
      page_title: "My Coins",
    });
  }
  componentWillReceiveProps(newProps) {
    if (newProps.preferences.id !== this.props.preferences.id) {
      this.setState(
        { catergoryId: newProps.preferences.id, activePage: 1 },
        () => {
          this.getFeaturedcoins();
        }
      );
    }
  }

  getMyCoinsDetails = () => {
    const getData = Env.get(
      this.props.envendpoint +
        `users/coins-details/${StorageConfiguration.sessionGetItem("user_id")}`
    );
    getData.then(
      (response) => {
        const data = response.data.response;
        this.setState({ coinsData: data });
      },
      (error) => {
        console.error(error);
      }
    );
  };

  getFeaturedcoins = () => {
    const getData = Env.get(
      this.props.envendpoint +
        `allcourses?filters[is_featured]=1&page=1&filters[category_id][]=${this.state.catergoryId}&logged_in_type=web`
    );
    getData.then(
      (response) => {
        const data = response.data.response.courses.data;
        this.setState({ featuredCourses: data });
      },
      (error) => {
        console.error(error);
      }
    );
  };

  render() {
    return (
      <>
        <Layout>
          <AppSidebar {...this.props} />
          <Layout>
            <Content>
              <div className="coins-container" style={{ marginTop: "100px" }}>
                <Row>
                  <Col xs={24} sm={24} md={24} lg={16} xl={16} xxl={18}>
                    <div className="my-coins">
                      <img className="coin-img" src={coins} alt="coins" />
                    </div>
                    <div className="coin-inner-container">
                      <div className="coine-header">CareersCloud Coins</div>
                      <Row className="coins-row">
                        <Col
                          style={{ textAlign: "center" }}
                          className="coin-balance-container"
                          xs={24}
                          sm={12}
                          md={12}
                          lg={12}
                          xl={12}
                          xxl={12}
                        >
                          <div className="coin-balance-inner">
                            {this.state.coinsData.coins_balance}
                            <span className="inner-balance"> Balance</span>{" "}
                          </div>
                        </Col>
                        <Col
                          style={{ textAlign: "center" }}
                          className="coin-balance-container"
                          xs={24}
                          sm={12}
                          md={12}
                          lg={12}
                          xl={12}
                          xxl={12}
                        >
                          <div
                            className="coin-balance-inner"
                            style={{ marginRight: "20px" }}
                          >
                            {this.state.coinsData.coins_value}
                            <span className="inner-balance"> Worth</span>{" "}
                          </div>
                        </Col>
                      </Row>
                    </div>

                    <div className="coin-container">
                      <div style={{ marginTop: "20px" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            background: "#FFFFFF",
                            boxShadow: "0px 2px 10px rgba(90, 114, 200, 0.1)",
                            borderRadius: "4px",
                            padding: "20px 30px",
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            this.viewpoints.showModal("getCoins");
                          }}
                        >
                          <div style={{ flex: 2 }}>
                            <div className="card-text">Coin Earning</div>
                            <div className="card-text">
                              {this.state.coinsData.earned}
                            </div>
                          </div>
                          <div>
                            <RightOutlined />
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: "10px" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            background: "#FFFFFF",
                            boxShadow: "0px 2px 10px rgba(90, 114, 200, 0.1)",
                            borderRadius: "4px",
                            padding: "20px 30px",
                            alignItems: "center",
                          }}
                        >
                          <div style={{ flex: 2 }}>
                            <div className="card-text">Coins Spent</div>
                            <div className="card-text">
                              {this.state.coinsData.spent}
                            </div>
                          </div>
                          <div>
                            <RightOutlined />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="coine-title">
                          How to earn CareersCloud Coins?
                        </div>
                      </div>

                      {this.state.coinsData.earn_coins &&
                        this.state.coinsData.earn_coins.length > 0 && (
                          <div>
                            {this.state.coinsData.earn_coins.map(
                              (item, index) => (
                                <div key={index} style={{ marginTop: "10px" }}>
                                  <div className="earn-coins">
                                    <div>
                                      <img
                                        className="coin-img-column"
                                        src={images[index]}
                                        alt="coins"
                                      />
                                    </div>
                                    <div style={{ lineHeight: "30px" }}>
                                      <div className="cards-heading">
                                        {item.title}
                                      </div>
                                      <div className="card-text">
                                        {item.value}
                                      </div>
                                      <div className="card-text">
                                        {item.extra}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}

                      <div>
                        <div className="coine-title">How to use coins?</div>
                      </div>
                      <div>
                        <div className="use-coins">
                          <div>
                            <img
                              className="use-coin-img"
                              src={pricing}
                              alt="coins"
                            />
                          </div>
                          <div>
                            <div className="cards-heading">
                              Get Discount on Products
                            </div>
                            <div className="card-text">
                              Use coins to get auto discount on careerscloud
                              Product.
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <div className="cards-link">
                                  EXPLORE PRODUCTS
                                </div>
                                <RightOutlined />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="coine-title">How to use coins?</div>
                      </div>
                      <div>
                        <div className="use-coins">
                          <div>
                            <img
                              className="use-coin-img"
                              src={faq}
                              alt="coins"
                              style={{ padding: "15px 30px" }}
                            />
                          </div>
                          <div>
                            <div className="cards-heading">
                              Get Discount on Products
                            </div>
                            <div className="card-text">
                              Use coins to get auto discount on careerscloud
                              Product.
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <div className="cards-link">VIEW FAQs</div>
                                <RightOutlined />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} sm={24} md={16} lg={8} xl={8} xxl={6}>
                    <div className="coins-ads-container">
                      <div className="coins-ads-inner-content">
                        <Button
                          href={this.props.envupdate.play_store_url}
                          target="_blank"
                          icon={
                            <img
                              src={playstore_icon}
                              alt="playstore icon"
                              className="coins-ads-playstore-icon-1"
                            />
                          }
                          type="primary"
                          className="coins-ads-google-pay-button"
                        >
                          Google Play
                        </Button>
                      </div>
                      <div className="coin-ads-text-content">
                        <span className="coin-ads-link">
                          Download the CareersCloud Exam Preparation
                        </span>
                      </div>
                    </div>
                    <div className="coins-ads-box">
                      <img
                        src={ad_image}
                        alt="playstore icon"
                        className="coins-ads-image"
                      />
                    </div>
                    <div className="coins-ads-list-content">
                      <List
                        className="feed-ads-list"
                        size="large"
                        header={null}
                        footer={null}
                        bordered
                        dataSource={this.state.featuredCourses}
                        renderItem={(item) => (
                          <List.Item style={{ cursor: "pointer" }}>
                            <RightOutlined className="feed-ads-list-icon" />
                            <a
                              href={`/course-details/${item.id}`}
                              className="feed-ads-list-title"
                            >
                              {item.title}
                            </a>
                          </List.Item>
                        )}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            </Content>
          </Layout>
        </Layout>
        <ViewEarnPoints
          ref={(instance) => {
            this.viewpoints = instance;
          }}
          {...this.props}
        />
      </>
    );
  }
}

export default connect((state) => {
  return {
    preferences: state.preferences,
    envupdate: state.envupdate,
    envendpoint: state.envendpoint,
  };
})(Coins);
