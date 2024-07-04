import React from "react";
import { Tooltip, Space, Flex, Typography } from "antd";
import pinicon from "../../assets/svg-icons/pin-icon.svg";

const { Text } = Typography;

const CCTitle = (props) => {
  return (
    <Flex justify="space-between" align="flex-start">
      <Space>
        <Tooltip title={props.title} placement="bottom">
          <Text className="title">{props.title}</Text>
        </Tooltip>
      </Space>
      {props.is_pin === 1 && (
        <Space style={{ padding: "0px 12px" }}>
          <img
            src={pinicon}
            alt="pinicon"
            style={{
              width: "17px",
            }}
          />
        </Space>
      )}
    </Flex>
  );
};

export default CCTitle;
