import React from "react";
import { Typography } from "antd";
import accuracy from "../../assets/svg-images/mocktest-accuracy.svg";
import analysisTime from "../../assets/svg-images/mocktest-analysis-time.svg";
import percentile from "../../assets/svg-images/mocktest-percentile.svg";
import mocktestRank from "../../assets/svg-images/mocktest-rank.svg";
import scored from "../../assets/svg-images/mocktest-scored.svg";
import { CommonService } from "../../utilities/services/Common";

const { Title } = Typography;

const MocktestPerformance = (props) => {
  return (
    <div className="mocktest-analysis-grid">
      <div className="mocktest-analysis-grid-item-flex">
        <div>
          <img alt="mocktestRank" src={mocktestRank} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "0px 0px 0px 15px",
          }}
        >
          <span
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "baseline",
            }}
          >
            <Title level={3}>
              {CommonService.convertIntoKiloPrefix(props.performance.rank)}
            </Title>
            <span>
              {" "}
              /{" "}
              {CommonService.convertIntoKiloPrefix(
                props.performance.attendees_count
              )}
            </span>
          </span>
          <span style={{ background: "#FFE4EB" }}>Rank</span>
        </div>
      </div>
      <div className="mocktest-analysis-grid-item-flex">
        <div>
          <img alt="scored" src={scored} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "0px 0px 0px 15px",
          }}
        >
          <span
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "baseline",
            }}
          >
            <Title level={3}>
              {CommonService.convertIntoDecimalPrefix(
                props.performance.marks_scored
              )}
            </Title>
            <span>
              {" "}
              /
              {CommonService.convertIntoDecimalPrefix(
                props.performance.mock_test_total_mark
              )}{" "}
            </span>
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "baseline",
            }}
          >
            <span style={{ background: "#C4FFE1" }}>Scored</span>
            <Title style={{ padding: "0px 0px 0px 8px" }} level={5}>
              Avg:
            </Title>
            <Title level={5}>
              {CommonService.convertIntoDecimalPrefix(
                props.performance.marks_scored_average
              )}
            </Title>
          </div>
        </div>
      </div>
      <div className="mocktest-analysis-grid-item-flex">
        <div className="mocktest-analysis-grid-item-flex-icon">
          <img alt="accuracy" src={accuracy} />
        </div>
        <div className="mocktest-analysis-grid-item-flex-count">
          <Title level={3}>
            {CommonService.convertIntoDecimalPrefix(props.performance.accuracy)}
            %
          </Title>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "baseline",
            }}
          >
            <span style={{ background: "#D0F8FF" }}>Accuracy</span>
            <Title style={{ padding: "0px 0px 0px 8px" }} level={5}>
              Avg:
            </Title>
            <Title level={5}>
              {CommonService.convertIntoDecimalPrefix(
                props.performance.user_accuracy_average
              )}
              %
            </Title>
          </div>
        </div>
      </div>
      <div className="mocktest-analysis-grid-item-flex">
        <div>
          <img alt="percentile" src={percentile} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "0px 0px 0px 15px",
          }}
        >
          <Title level={3}>
            {" "}
            {CommonService.convertIntoDecimalPrefix(
              props.performance.percentile
            )}
            %
          </Title>
          <span style={{ background: "#FFE5D5" }}>Percentile</span>
        </div>
      </div>
      <div className="mocktest-analysis-grid-item-flex">
        <div>
          <img alt="analysisTime" src={analysisTime} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "0px 0px 0px 10px",
          }}
        >
          <span
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "baseline",
            }}
          >
            <Title level={3}>
              {Math.ceil(props.performance.mock_test_overall_time_taken / 60)}
            </Title>{" "}
            {props.performance.mock_test_overall_time > 0 && (
              <span> / {props.performance.mock_test_overall_time} min</span>
            )}
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "baseline",
            }}
          >
            <span style={{ background: "#E5E4FF" }}>Time</span>
            <Title style={{ padding: "0px 0px 0px 8px" }} level={5}>
              Avg:
            </Title>
            <Title level={5}>
              {Math.ceil(props.performance.time_average / 60)} min
            </Title>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MocktestPerformance;
