import React from "react";
import { Radio, Space } from "antd";

const CCRadio = (props) => {
  return (
    <Space>
      <Radio.Group
      className="solutionPopup"
        name="selectedReportType"
        value={props.value}
        onChange={props.handleonChange}
      >
        <Space size='middle' direction="vertical" id="cc-radio">
          {props.list.map((item) => (
            <Radio
              className="popupCheckboxContent"
              value={item.id}
              key={item.id}
            >
              {item.name}
            </Radio>
          ))}
        </Space>
      </Radio.Group>
    </Space>
  );
};

export default CCRadio;
