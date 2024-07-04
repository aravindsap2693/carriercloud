import React, { useState } from "react";
import { Card, Tabs } from "antd";
import { useEffect } from "react";
import _ from "lodash";
import MocktestPerformance from "./MocktestPerformance";
import MocktestTable from "./Tables/Table";

const sectionShowData = [
  {
    key: "1",
    status: "Total Attempt",
    person: "you",
    count: 23,
    time: "10 mins",
  },
  {
    key: "2",
    status: "Total Attempt",
    person: "Average",
    count: 23,
    time: "10 mins",
  },
  {
    key: "3",
    status: "Correct Answer",
    person: "you",
    count: 23,
    time: "10 mins",
  },
  {
    key: "4",
    status: "Correct Answer",
    person: "Average",
    count: 23,
    time: "10 mins",
  },
  {
    key: "5",
    status: "Wrong Answer",
    person: "you",
    count: 23,
    time: "10 mins",
  },
  {
    key: "6",
    status: "Wrong Answer",
    person: "Average",
    count: 23,
    time: "10 mins",
  },
  {
    key: "7",
    status: "Not Visited",
    person: "you",
    count: 23,
    time: "10 mins",
  },
  {
    key: "8",
    status: "Not Visited",
    person: "Average",
    count: 23,
    time: "10 mins",
  },
];

const sectioncolumns = [
  {
    title: "",
    dataIndex: "status",
    key: "status",
    onCell: (_, index) => {
      if (index % 2 === 0) {
        return {
          rowSpan: 2,
        };
      } else {
        return {
          rowSpan: 0,
        };
      }
    },
  },
  {
    title: "Person",
    dataIndex: "person",
    key: "person",
  },
  { title: "Count", dataIndex: "count", key: "count" },
  { title: "Time", dataIndex: "time", key: "time" },
];

const MocktestSectionComparison = (props) => {
  const [panesOne, setpanesOne] = useState([]);
  const [activesecTabIndex, setActivesecTabIndex] = useState(1);

  useEffect(() => {
    getSectiontab(props.mocktest_section);
  }, [props.mocktest_section]);

  const getSectiontab = (section) => {
    if (section) {
      section.sort(function (a, b) {
        return a.sort_order - b.sort_order;
      });
      section.forEach((item, index) => {
        let panesOne = {};
        _.assign(panesOne, {
          key: item.id,
          label: item.section_name,
          children: display(item.id),
        });
        setpanesOne(panesOne);
      });
    }
  };

  const display = () => {
    return (
      <Card
        bordered={true}
        style={{
          boxShadow: "6px 0px 18px rgba(90, 114, 200, 0.06)",
          width: "100%",
          padding: "20px",
          margin: "0px 0px 30px 0px",
        }}
      >
        <div
          style={{
            padding: "0px 50px",
          }}
        >
          <MocktestPerformance performance={props.sectionScoreDistribution} />
          <div style={{ padding: "20px 0px" }}>
            <MocktestTable
              columns={sectioncolumns}
              dataSource={sectionShowData}
            />
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="mocktest-instructionall-main mocktest-main-content">
      <Tabs
        onChange={(e) => {
          setActivesecTabIndex(e);
        }}
        defaultActiveKey={activesecTabIndex}
        items={panesOne}
      />
    </div>
  );
};

export default MocktestSectionComparison;
