import React from "react";
import { Table } from "antd";

const MocktestTable = (props) => {
  return (
    <Table
      columns={props.columns}
      dataSource={props.dataSource}
      bordered={true}
      pagination={false}
    />
  );
};

export default MocktestTable;
