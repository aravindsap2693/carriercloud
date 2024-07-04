import React from "react";
import { List, Typography } from "antd";
import { CommonService } from "../utilities/services/Common";
import view from "../assets/svg-icons/view.svg";

const { Text } = Typography;

const RecentPost = (props) => {
  return (
    <div
      className="main-layout"
      style={{
        margin: "10px 15px",
        padding: "15px",
        borderRadius: "4px",
      }}
    >
      <Text
        style={{
          padding: "10px",
          borderBottom: "1px solid #f0f0f0",
          fontWeight: 600,
          color: "#0B649D",
          textTransform: "capitalize",
        }}
      >
        Recent {props.type}
      </Text>
      <List
        size="small"
        header={null}
        footer={null}
        dataSource={props.recentpost}
        renderItem={(item) => (
          <a
            href={`/course-details/${item.course_id}/${props.type}/${item.id}`}
            className="feed-ads-list-title"
          >
            <div
              style={{
                padding: "10px",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <div>{item.title}</div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  color: "grey",
                  padding: "5px 0px",
                }}
              >
                <div>
                  {CommonService.getDate(item.published_at, "DD MMM Y")}
                </div>
                <div>
                  <img alt="view" src={view} className="eye" />
                  <span
                    className="value"
                    style={{ padding: "0px 10px", fontSize: "15px" }}
                  >
                    {item.total_views}
                  </span>
                </div>
              </div>
            </div>
          </a>
        )}
      />
    </div>
  );
};

export default RecentPost;
