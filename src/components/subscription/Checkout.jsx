import React, { Component } from "react";
import {
  Modal,
  Button,
  Radio,
  Space,
  Divider,
  Checkbox,
  Input,
  Spin,
} from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import Success from "./Success";
import Failed from "./Failed";
import StorageConfiguration from "../../utilities/services/StorageConfiguration";
import Env from "../../utilities/services/Env";
import coin_image from "../../assets/images/coin-icon.svg";
import { CommonService } from "../../utilities/services/Common";
import logo from "../../assets/images/logo.svg";
import { toast } from "react-toastify";
import "../../index.css";

class CheckOut extends Component {
  constructor() {
    super();
    this.state = {
      visible: false,
      coupon_code: "",
      coupon_code_discount: 0,
      coupon_code_discount_amount: 0,
      is_coupon_applied: false,
      courses: {},
      original_price: 0,
      special_price: 0,
      discount_amount: 0,
      user_coins: StorageConfiguration.sessionGetItem("user_coins"),
      payable_coins_amount: 0,
      payable_amount: 0,
      coin_percentage: 0,
      is_coin_used: false,
      payable_coins: 0,
      coupon_code_id: "",
      payment_status: "",
      validity_period: 0,
      primary_id: "",
      transaction_id: "",
      routing_props: {},
      activeLoader: false,
      order_id: null,
      razorpay_payment_key: "",
      user_id: StorageConfiguration.sessionGetItem("user_id"),
      selectedPeriod: null,
    };
    this.openModal = this.openModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleCouponCode = this.handleCouponCode.bind(this);
    this.submitPayment = this.submitPayment.bind(this);
    this.handleFirstCall = this.handleFirstCall.bind(this);
    this.handleSecondCall = this.handleSecondCall.bind(this);
    this.handleValidityMonths = this.handleValidityMonths.bind(this);
  }

  openModal(data, routing, props) {
    this.setState({
      razorpay_payment_key: props.react_app_razorpay_payment_key,
      routing_props: routing,
      visible: true,
      courses: data,
      selectedPeriod: data.course_period_all[0].id,
      original_price: data.course_period_all[0].cost_price,
      payable_amount:
        data.special_price_valid === 1
          ? data.course_period_all[0].special_price
          : data.course_period_all[0].offer_price,
      discount_amount:
        data.special_price_valid === 1
          ? data.course_period_all[0].cost_price -
            data.course_period_all[0].special_price
          : data.course_period_all[0].cost_price -
            data.course_period_all[0].offer_price,
      coin_percentage: data.coin_percentage,
      coupon_code_discount_amount: 0,
      payable_coins:
        data.special_price_valid == 1
          ? (data.course_period_all[0].special_price * data.coin_percentage) /
            10
          : (data.course_period_all[0].offer_price * data.coin_percentage) / 10,
      // payable_coins:
      //   data.special_price_valid === 1
      //     ? data.course_period_all[0].special_price
      //     : data.course_period_all[0].offer_price,
      special_price:
        data.special_price_valid === 1
          ? data.course_period_all[0].special_price
          : data.course_period_all[0].offer_price,
      validity_period: data.course_period_all[0].months,
    });
  }

  handleOk() {
    this.setState({
      visible: false,
      coupon_code: "",
      is_coupon_applied: false,
    });
  }

  handleCancel() {
    this.setState({
      visible: false,
      coupon_code: "",
      coupon_code_discount: 0,
      coupon_code_discount_amount: 0,
      is_coupon_applied: false,
      courses: {},
      original_price: 0,
      special_price: 0,
      discount_amount: 0,
      user_coins: StorageConfiguration.sessionGetItem("user_coins"),
      payable_coins_amount: 0,
      payable_amount: 0,
      coin_percentage: 0,
      is_coin_used: false,
      payable_coins: 0,
      coupon_code_id: "",
      payment_status: "",
      validity_period: 0,
      primary_id: "",
      transaction_id: "",
      routing_props: {},
      activeLoader: false,
      order_id: null,
      razorpay_payment_key: "",
      user_id: StorageConfiguration.sessionGetItem("user_id"),
      selectedPeriod: null,
    });
  }

  handleCouponCode() {
    if (this.state.coupon_code !== "") {
      const requestBody = {
        promo_code: this.state.coupon_code,
        product_type: "course",
        product_type_id: this.state.courses.id,
      };
      const postData = Env.post(
        this.state.routing_props.envendpoint + `promocode/validate`,
        requestBody
      );
      postData.then(
        (response) => {
          const data = response.data.response;
          toast("Promocode applied successfully!");
          this.setState({
            ...this.state,
            is_coupon_applied: true,
            coupon_code_discount: Math.round(data.discount_percentage),
            coupon_code_discount_amount: parseInt(
              (this.state.payable_amount * data.discount_percentage) / 100
            ),
            coupon_code_id: data.id,
            coupon_code: data.promo_code,
          });
        },
        (error) => {
          toast("Promocode invalid or expired!");
        }
      );
    } else {
      toast("Promocode field is empty!");
    }
  }

  handleValidityMonths(e) {
    const selectedMonth = e.target;
    const selectedPayment = this.state.courses.course_period_all.filter(
      (item) => item.id === selectedMonth.value
    );
    this.setState({
      original_price: selectedPayment[0].cost_price,
      payable_amount:
        this.state.courses.special_price_valid === 1
          ? selectedPayment[0].special_price
          : selectedPayment[0].offer_price,
      discount_amount:
        this.state.courses.special_price_valid === 1
          ? selectedPayment[0].cost_price - selectedPayment[0].special_price
          : selectedPayment[0].cost_price - selectedPayment[0].offer_price,
      payable_coins:
        this.state.courses.special_price_valid === 1
          ? selectedPayment[0].special_price
          : selectedPayment[0].offer_price,
      is_coin_used: this.state.is_coin_used,
      payable_coins_amount:
        this.state.is_coin_used === true
          ? parseInt(
              this.state.courses.special_price_valid === 1
                ? selectedPayment[0].special_price / 10
                : selectedPayment[0].offer_price / 10
            )
          : 0,
      coupon_code_discount_amount:
        this.state.is_coupon_applied === true
          ? parseInt(
              this.state.courses.special_price_valid === 1
                ? (selectedPayment[0].special_price *
                    this.state.coupon_code_discount) /
                    100
                : (selectedPayment[0].offer_price *
                    this.state.coupon_code_discount) /
                    100
            )
          : 0,
      is_coupon_applied: this.state.is_coupon_applied,
      coupon_code:
        this.state.is_coupon_applied === true ? this.state.coupon_code : "",
      special_price:
        this.state.courses.special_price_valid === 1
          ? selectedPayment[0].special_price
          : selectedPayment[0].offer_price,
      validity_period: selectedPayment[0].months,
      selectedPeriod: selectedMonth.value,
    });
  }

  handleCoinsCheckbox(e) {
    this.setState({
      ...this.state,
      is_coin_used: e.target.checked,
      payable_coins_amount:
        e.target.checked === true ? parseInt(this.state.payable_coins / 10) : 0,
    });
  }

  submitPayment() {
    {
      this.state.original_price -
        this.state.discount_amount -
        this.state.payable_coins_amount -
        this.state.coupon_code_discount_amount ===
      0
        ? this.handleFreeSubscribe()
        : this.handleFirstCall();
    }
  }

  // submitPayment() {
  //   this.handleFirstCall();
  // }

  openRazorpayConnection(primary_id, order_id, razorpay_id) {
    let options = {
      // key: process.env.REACT_APP_RAZORPAY_PAYMENT_KEY,
      key: this.state.razorpay_payment_key,
      amount:
        (this.state.original_price -
          this.state.discount_amount -
          this.state.payable_coins_amount -
          this.state.coupon_code_discount_amount) *
        100, // 2000 paise = INR 20, amount in paisa
      name: "CareersCloud",
      description: this.state.courses.title,
      image: logo,
      order_id: razorpay_id,
      handler: function (response) {
        this.handleSecondCall(response.razorpay_payment_id);
        this.setState({ activeLoader: true });
        rzp.close();
      }.bind(this),
      prefill: {
        name: StorageConfiguration.sessionGetItem("user_name"),
        email: StorageConfiguration.sessionGetItem("email_id"),
        contact: StorageConfiguration.sessionGetItem("mobile_number"),
      },
      notes: {
        id: primary_id,
        user_id: this.state.user_id,
        order_id: order_id,
        product_id: this.state.courses.id,
        product_title: this.state.courses.title,
        payment_status: "Pending",
        validity_period: this.state.validity_period,
        appversion_key: "1.34",
        version: "web",
      },
      theme: {
        color: "#0B649D",
      },
      modal: {
        ondismiss: function () {
          this.handlePaymentCancel();
          rzp.close();
        }.bind(this),
      },
    };
    let rzp = new window.Razorpay(options);
    rzp.open();
  }

  handlePaymentCancel() {
    const requestBody = {
      primary_order_id: this.state.primary_id,
      product_id: this.state.courses.id,
      payment_status: "Payment Cancelled",
      product_type: "course",
    };
    const postData = Env.post(
      this.state.routing_props.envendpoint + `subscribeweb`,
      requestBody
    );
    postData.then(
      (response) => {
        this.setState({ visible: false, activeLoader: false });
        this.handleCancel();
        this.failedPopup.openModal();
      },
      (error) => {
        console.error(error);
      }
    );
  }

  handleFirstCall() {
    const requestBody = {
      user_id: this.state.user_id,
      product_id: this.state.courses.id,
      product_type: "course",
      product_title: this.state.courses.title,
      price: this.state.original_price,
      special_price: this.state.special_price,
      final_price:
        this.state.original_price -
        this.state.discount_amount -
        this.state.payable_coins_amount -
        this.state.coupon_code_discount_amount,
      promo_code_id: this.state.coupon_code_id,
      promo_code: this.state.coupon_code,
      promo_discount_percentage: this.state.discount_percentage,
      payment_status: "Pending",
      coin_used: this.state.payable_coins,
      validity_months: this.state.validity_period,
      billing_email: StorageConfiguration.sessionGetItem("email_id"),
      billing_contact_no: StorageConfiguration.sessionGetItem("mobile_number"),
    };
    if (this.state.is_coupon_applied === false) {
      delete requestBody.promo_code_id;
      delete requestBody.promo_code;
      delete requestBody.promo_discount_percentage;
    }
    if (this.state.is_coin_used === false) {
      delete requestBody.coin_used;
    }
    const postData = Env.post(
      this.state.routing_props.envendpoint + `subscribeweb`,
      requestBody
    );
    postData.then(
      (response) => {
        this.setState(
          { primary_id: response.data.id, order_id: response.data.order_id },
          () =>
            this.openRazorpayConnection(
              response.data.id,
              response.data.order_id,
              response.data.razorpay_order_id
            )
        );
      },
      (error) => {
        console.error(error);
      }
    );
  }

  async handleSecondCall(order_id) {
    const requestBody = {
      primary_order_id: this.state.primary_id,
      product_id: this.state.courses.id,
      payment_status: "Completed",
      transaction_id: order_id,
      course_expiry_date: this.state.course_expiry_date,
      product_type: "course",
      order_id: this.state.order_id,
    };
    this.setState({ visible: false });
    this.successPopup.openModal(this.state, this.state.routing_props);
    const postData = Env.post(
      this.state.routing_props.envendpoint + `subscribeweb`,
      requestBody
    );
    await postData.then(
      (response) => {
        // this.setState({ activeLoader: false })
        toast("Course purchased successfully!");
      },
      (error) => {
        console.error(error);
      }
    );
  }

  handleFreeSubscribe = () => {
    const requestBody = {
      user_id: StorageConfiguration.sessionGetItem("user_id"),
      payment_status: "Completed",
      product_id: this.state.courses.id,
      product_title: this.state.courses.title,
      product_type: "course",
      validity_months: this.state.validity_period,
      billing_email: StorageConfiguration.sessionGetItem("email_id"),
      billing_contact_no: StorageConfiguration.sessionGetItem("mobile_number"),
      allow_coin_percentage: 1,
      coin_used: this.state.payable_coins,
    };
    const postData = Env.post(
      this.state.routing_props.envendpoint + `subscribeweb`,
      requestBody
    );
    postData.then(
      (response) => {
        toast("Course subscription successfull!");
        this.setState({ visible: false });
        this.successPopup.openModal(this.state, this.state.routing_props);
      },
      (error) => {
        console.error(error);
      }
    );
  };

  render() {
    return (
      <div>
        {this.state.activeLoader === false ? (
          <Modal
            centered
            open={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            width={500}
            footer={null}
            closeIcon={false}
            maskClosable={false}
            closable={false}
          >
            <div
              style={{
                padding: "30px",
                height: window.screen.height - 200,
                overflow: "hidden",
                overflowY: "scroll",
                paddingBottom: "100px",
              }}
              id="custom-scroll"
            >
              <div style={{ paddingBottom: "15px", fontWeight: "bold" }}>
                <span style={{ fontSize: "18px" }}>
                  {this.state.courses.title}
                </span>
                <span
                  style={{ float: "right" }}
                  onClick={() => this.handleCancel()}
                >
                  <CloseCircleOutlined
                    style={{ fontSize: "22px", cursor: "pointer" }}
                  />
                </span>
              </div>
              <div>
                {this.state.courses.course_period_all ? (
                  <Radio.Group
                    style={{ width: "100%" }}
                    onChange={(e) => this.handleValidityMonths(e)}
                    value={this.state.selectedPeriod}
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <div
                        style={{
                          border: "1px solid #E8ECFA",
                          padding: "30px 25px",
                          width: "100%",
                        }}
                      >
                        {this.state.courses.course_period_all.map(
                          (item, index) => (
                            <div key={index}>
                              <Radio value={item.id}>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      color: "#000",
                                      fontWeight: "normal",
                                      fontSize: "14px",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {item.months} Month Validity
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-around",
                                      alignItems: "center",
                                      width: "250px",
                                    }}
                                  >
                                    {this.state.courses.special_price_valid ===
                                    1 ? (
                                      <span
                                        style={{
                                          padding: "0px",
                                          fontWeight: 900,
                                          fontSize: "26px",
                                        }}
                                      >
                                        {item.special_price}
                                      </span>
                                    ) : (
                                      <span
                                        style={{
                                          margin: "0px 0px",
                                          fontWeight: 900,
                                          fontSize: "26px",
                                        }}
                                      >
                                        {item.offer_price}
                                      </span>
                                    )}
                                    {this.state.courses.special_price_valid ===
                                      1 && (
                                      <span
                                        style={{
                                          padding: "5px",
                                          fontWeight: 500,
                                          fontSize: "22px",
                                        }}
                                        className="expire-text"
                                      >
                                        {item.offer_price}
                                      </span>
                                    )}
                                    <span
                                      style={{
                                        padding: "5px",
                                        fontWeight: 500,
                                        fontSize: "22px",
                                      }}
                                      className="expire-text"
                                    >
                                      {item.cost_price}
                                    </span>
                                  </div>
                                  {/* <div>
                                                                        <span
                                                                            style={{
                                                                                color: "#000",
                                                                                fontWeight: "normal",
                                                                                fontSize: "14px",
                                                                                whiteSpace: "nowrap",
                                                                            }}
                                                                        >
                                                                            {item.months} Month Validity
                                                                        </span>
                                                                    </div>
                                                                    <div
                                                                        style={{
                                                                            color: "#000",
                                                                            padding: "0px 20px",
                                                                            textAlign: "center",
                                                                        }}
                                                                    >
                                                                        {this.state.courses.special_price_valid ===
                                                                            1 ? (
                                                                            <Text
                                                                                style={{
                                                                                    padding: "0px",
                                                                                    fontWeight: "bold",
                                                                                    fontSize: "26px",
                                                                                }}
                                                                            >
                                                                                {item.special_price}
                                                                            </Text>
                                                                        ) : (
                                                                            <Text
                                                                                style={{
                                                                                    margin: "0px 18px 0px 40px",
                                                                                    fontWeight: "bold",
                                                                                    fontSize: "20px",
                                                                                }}
                                                                            >
                                                                                {item.offer_price}
                                                                            </Text>
                                                                        )}
                                                                        {this.state.courses.special_price_valid ===
                                                                            1 && (
                                                                                <Text
                                                                                    style={{
                                                                                        padding: "0px 0px",
                                                                                        fontWeight: "normal",
                                                                                        fontSize: "16px",
                                                                                    }}
                                                                                    className="expire-text"
                                                                                >
                                                                                    {item.offer_price}
                                                                                </Text>
                                                                            )}
                                                                        <Text
                                                                            style={{
                                                                                padding: "0px",
                                                                                fontWeight: "normal",
                                                                                fontSize: "16px",
                                                                            }}
                                                                            className="expire-text"
                                                                        >
                                                                            {item.cost_price}.0
                                                                        </Text>
                                                                    </div> */}
                                </div>
                                {this.state.courses.special_price_valid ===
                                1 ? (
                                  <span
                                    style={{
                                      background: "#01A54E",
                                      color: "#fff",
                                      padding: "5px 10px",
                                      borderRadius: "90px",
                                      fontSize: "10px",
                                      fontWeight: "normal",
                                    }}
                                  >
                                    Save{" "}
                                    {CommonService.getProductPercentage(
                                      item.cost_price,
                                      item.special_price
                                    )}{" "}
                                    %
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      background: "#01A54E",
                                      color: "#fff",
                                      padding: "5px 10px",
                                      borderRadius: "90px",
                                      fontSize: "10px",
                                      fontWeight: "normal",
                                    }}
                                  >
                                    Save{" "}
                                    {CommonService.getProductPercentage(
                                      item.cost_price,
                                      item.offer_price
                                    )}{" "}
                                    %
                                  </span>
                                )}
                              </Radio>
                              {this.state.courses.course_period_all[
                                index + 1
                              ] && <Divider style={{ margin: "10px" }} />}
                            </div>
                          )
                        )}
                      </div>
                    </Space>
                  </Radio.Group>
                ) : null}
              </div>
              <div>
                <div
                  style={{
                    border: "1px solid #E8ECFA",
                    marginTop: "20px",
                    padding: "15px 50px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      padding: "5px",
                    }}
                  >
                    <div style={{ width: "50%" }}>Price</div>
                    <div style={{ width: "50%", textAlign: "center" }}>
                      Rs. {this.state.original_price}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      padding: "5px",
                    }}
                  >
                    <div style={{ width: "50%" }}>Discount</div>
                    <div
                      style={{
                        width: "50%",
                        color: "#029346",
                        textAlign: "center",
                      }}
                    >
                      -Rs. {this.state.discount_amount}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      padding: "5px",
                    }}
                  >
                    <div style={{ width: "50%" }}>Coin</div>
                    <div
                      style={{
                        width: "50%",
                        color: "#029346",
                        textAlign: "center",
                      }}
                    >
                      -Rs. {this.state.payable_coins_amount}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      padding: "5px",
                    }}
                  >
                    <div style={{ width: "50%" }}>Coupon</div>
                    <div
                      style={{
                        width: "50%",
                        color: "#029346",
                        textAlign: "center",
                      }}
                    >
                      -Rs. {this.state.coupon_code_discount_amount}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    padding: "20px 20px 0px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "50%",
                      fontWeight: "bold",
                      fontSize: "18px",
                    }}
                  >
                    AMOUNT PAYABLE
                  </div>
                  <div
                    style={{
                      width: "50%",
                      fontWeight: "bold",
                      fontSize: "18px",
                    }}
                  >
                    Rs.{" "}
                    {this.state.original_price -
                      this.state.discount_amount -
                      this.state.payable_coins_amount -
                      this.state.coupon_code_discount_amount}{" "}
                    /-
                  </div>
                  {/* {this.state.is_coin_used === true && <div style={{ width: '50%', fontWeight: 'bold', fontSize: '18px' }}>Rs. {Math.round(this.state.original_price - this.state.discount_amount - (this.state.payable_coins_amount / 10))}</div>} */}
                </div>
              </div>
              <div
                style={{
                  border: "1px dashed #EE2D3B",
                  borderStyle: "dashed",
                  borderRadius: "4px",
                  marginTop: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    padding: "20px",
                    textAlign: "center",
                    color: "#EE2D3B",
                    background: "#FEF0F2",
                  }}
                >
                  <div style={{ width: "70%", fontSize: "18px" }}>
                    <img
                      src={coin_image}
                      alt="coin_image"
                      style={{
                        width: "35px",
                        height: "35px",
                        margin: "0px 15px",
                      }}
                    />
                    Buy & Get Coins back
                  </div>
                  <div
                    style={{
                      width: "30%",
                      fontWeight: "bold",
                      fontSize: "20px",
                    }}
                  >
                    {this.state.original_price -
                      this.state.discount_amount -
                      this.state.payable_coins_amount -
                      this.state.coupon_code_discount_amount}
                  </div>
                </div>
              </div>
              <div
                style={{
                  border: "1px solid #FFE58F",
                  borderRadius: "4px",
                  marginTop: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    padding: "20px",
                    textAlign: "center",
                    background: "#FFF",
                  }}
                >
                  <div style={{ width: "70%", fontSize: "18px" }}>
                    <img
                      src={coin_image}
                      alt="coin_image"
                      style={{
                        width: "35px",
                        height: "35px",
                        margin: "0px 15px",
                      }}
                    />
                    Use Coins:{" "}
                    <span style={{ fontWeight: "bold" }}>
                      {this.state.payable_coins}
                    </span>
                  </div>
                  <div
                    style={{
                      width: "30%",
                      fontWeight: "bold",
                      fontSize: "20px",
                    }}
                  >
                    <Checkbox
                      name="is_coin_used"
                      value={this.state.is_coin_used}
                      defaultChecked={this.state.is_coin_used}
                      onChange={(e) => this.handleCoinsCheckbox(e)}
                      checked={this.state.is_coin_used}
                    />
                  </div>
                </div>
              </div>
              <span
                style={{
                  background: "#90A0B7",
                  padding: "3px 5px",
                  color: "#fff",
                  fontSize: "12px",
                  position: "relative",
                  top: "11px",
                  left: "40px",
                  borderRadius: "3px",
                }}
              >
                Coupon Code
              </span>
              <div
                style={{
                  border: "1px dashed #90A0B7",
                  borderRadius: "4px",
                  padding: "20px",
                }}
              >
                <div>
                  <Input
                    style={{
                      borderRadius: "4px",
                      height: "45px",
                      textTransform: "uppercase",
                    }}
                    placeholder="Enter coupon code"
                    suffix={
                      this.state.is_coupon_applied === false && (
                        <span
                          style={{
                            opacity: 1,
                            color:
                              this.state.coupon_code === ""
                                ? "rgba(238, 45, 59, 0.3)"
                                : "rgb(238, 45, 59)",
                            textTransform: "uppercase",
                            fontSize: "16px",
                            cursor: "pointer",
                            zIndex: 1999,
                          }}
                          onClick={this.handleCouponCode}
                        >
                          Apply
                        </span>
                      )
                    }
                    name="coupon_code"
                    value={this.state.coupon_code}
                    onChange={(e) =>
                      this.setState({
                        coupon_code: e.target.value.toUpperCase(),
                      })
                    }
                    disabled={this.state.is_coupon_applied}
                  />
                </div>
                {this.state.is_coupon_applied === true && (
                  <div
                    style={{
                      border: "1px dashed #01A54E",
                      borderStyle: "dashed",
                      borderRadius: "4px",
                      marginTop: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        padding: "15px",
                        textAlign: "center",
                        color: "#01A54E",
                        background: "#CCFFE4",
                      }}
                    >
                      <div
                        style={{
                          width: "50%",
                          fontSize: "18px",
                          textTransform: "uppercase",
                          fontWeight: "bold",
                        }}
                      >
                        {this.state.coupon_code}
                      </div>
                      <div
                        style={{
                          width: "50%",
                          fontSize: "20px",
                          textTransform: "uppercase",
                        }}
                      >
                        APPLIED
                      </div>
                      <CloseCircleOutlined
                        style={{
                          fontSize: "22px",
                          cursor: "pointer",
                          color: "#000",
                        }}
                        onClick={() =>
                          this.setState({
                            coupon_code: "",
                            coupon_code_discount_amount: 0,
                            is_coupon_applied: false,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
              <div
                style={{
                  marginTop: "20px",
                  textAlign: "center",
                  position: "absolute",
                  bottom: "0px",
                  width: "88%",
                  padding: "20px",
                  zIndex: 1999,
                  background: "#fff",
                }}
              >
                <Button
                  style={{
                    background: "#109CF1",
                    color: "#fff",
                    fontSize: "18px",
                    height: "45px",
                    borderRadius: "4px",
                    width: "100%",
                  }}
                  onClick={this.submitPayment}
                >
                  Continue
                </Button>
              </div>
            </div>
          </Modal>
        ) : (
          <Spin
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              minHeight: "500px",
            }}
            size="large"
          />
        )}

        <Success
          ref={(instance) => {
            this.successPopup = instance;
          }}
        />

        <Failed
          ref={(instance) => {
            this.failedPopup = instance;
          }}
        />
      </div>
    );
  }
}

export default CheckOut;
