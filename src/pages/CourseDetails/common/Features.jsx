import React, { Component } from "react";
import { Card, List } from "antd";
import check from "../../../assets/svg-images/feature-checkbox.svg";
import "../../../assets/css/course-detail.css";
import _ from "lodash";

class Features extends Component {
  constructor(props) {
    super(props);
    this.state = {
      features: props.course_features,
    };
  }

  componentDidMount() {
    this.state.features.unshift({
      id: 1001,
      description:
        this.props.course_period_all.length === 0
          ? `Expire on ${this.props.validity_end_date}`
          : this.props.course_period_all.map((item, index) => {
              return _.isUndefined(this.props.course_period_all[index + 1])
                ? " " + item.months
                : item.months;
            }) + " Month Validity",
    });
    if (this.props.coin_percentage !== 0) {
      this.state.features.unshift({
        id: 1002,
        description: this.props.coin_percentage + " % Coin Discount",
      });
    }
    if (this.props.is_refund === 1) {
      this.state.features.unshift({
        id: 1003,
        description: this.props.is_refund === 0 && "Non Refundable",
      });
    }
    this.setState((prevState) => ({
      ...prevState,
    }));
  }

  render() {
    return (
      <div className="features-container">
        <div className="content">
          <Card title="Course Features" className="card">
            <List
              size="large"
              bordered={false}
              dataSource={this.state.features}
              renderItem={(item) => (
                <List.Item className="list-item">
                  <img src={check} alt="check" className="image" />
                  {item.description}
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>
    );
  }
}

export default Features;
