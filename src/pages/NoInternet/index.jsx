import React, { Component } from "react";
import { Button, Result } from "antd";

export default class NoInternet extends Component {
  render() {
    return (
      <div style={{ height: "90vh" }}>
        <Result
          style={{
            fontSize: "22px",
            padding: "160px 130px",
          }}
          status="error"
          title="Network Failed"
          subTitle="Please check the internet connection."
          extra={[
            <Button
              onClick={() => {
                this.props.navigate(-1);
              }}
              style={{
                fontSize: "18px",
                width: "25%",
                height: "8%",
                padding: "15px 13px",
              }}
              className="try-again"
            >
              Try Again
            </Button>,
          ]}
        ></Result>
      </div>
    );
  }
}
