import React, { useEffect, useState } from "react";

import { Skeleton, Row, Col, Card, Divider } from "antd";

function Skeletons(props) {
  const [sideWidth, usesideWidth] = useState("160px");
  useEffect(() => {
    width();
    window.addEventListener("resize", width);
    function width() {
      let screenwidth = "";
      screenwidth = document.documentElement.clientWidth;
      return screenwidth;
    }
    let screenwidth = width();
    let btn_width = sideWidth;
    if (screenwidth < 1344) {
      btn_width = "145px";
    }
    if (screenwidth < 1030) {
      btn_width = "125px";
    }
    if (screenwidth < 750) {
      btn_width = "100px";
    }
    if (screenwidth < 500) {
      btn_width = "70px";
    }
    setInterval(() => {
      usesideWidth(btn_width);
    }, 1000);
  }, [sideWidth]);

  return (
    <>
      {props.type === "course" ? (
        <Row className="all-courses-row">
          {SkeletonsC.map((itms) => (
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={8}
              xl={8}
              xxl={8}
              key={itms.id}
              className="column"
            >
              <div className="all-courses-main">
                <Card className="all-courses-card">
                  <div className="all-courses-card-inner">
                    <Skeleton.Image
                      active
                      size={"large"}
                      className="all-courses-card-inner-skeleton"
                    />
                    <br />
                    <br />
                    <Skeleton
                      active
                      direction="vertical"
                      style={{
                        width: "100%",
                      }}
                      size={16}
                    />
                  </div>
                </Card>
              </div>
            </Col>
          ))}
        </Row>
      ) : props.type === "home" ? (
        <>
          {SkeletonsC.map((itms) => (
            <div className="feed-section" key={itms.id}>
              <Card className="feed-cards">
                <div style={{ padding: "10px" }}>
                  <Skeleton
                    avatar
                    paragraph={{
                      rows: 0,
                    }}
                  />
                  <Skeleton.Image
                    active
                    size={"large"}
                    className="home-card-inner-skeleton"
                  />
                  <br />
                  <br />
                  <Skeleton
                    paragraph={{
                      rows: 1,
                    }}
                  />
                </div>
              </Card>
            </div>
          ))}
        </>
      ) : props.type === "mynotes" ? (
        <>
          <Row gutter={[60, 0]}>
            {SkeletonsC.map((itms) => (
              <Col
                key={itms.id}
                xs={24}
                sm={24}
                md={12}
                lg={12}
                xl={12}
                xxl={12}
                className="home-feed-content-column-1"
              >
                <Card className="feed-cards">
                  <div style={{ padding: "10px" }}>
                    <Skeleton
                      avatar
                      paragraph={{
                        rows: 0,
                      }}
                    />
                    <Skeleton.Image
                      active
                      size={"large"}
                      className="home-card-inner-skeleton"
                    />
                    <br />
                    <br />
                    <Skeleton
                      paragraph={{
                        rows: 1,
                      }}
                    />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      ) : props.type === "doubtsCourse" ? (
        <>
          {SkeletonsC.map((itms) => (
            <Card className="doubt-left-sidebar-course" key={itms.id}>
              <div className="doubt-left-sidebar-course-body">
                <div className="doubt-left-sidebar-course-banner">
                  <Skeleton.Button
                    active
                    size={"large"}
                    style={{ width: "150px", height: "100px" }}
                  />
                </div>
                <div
                  style={{
                    padding: "12px 26px",
                  }}
                >
                  <div className="doubt-left-sidebar-course-title">
                    <Skeleton.Button
                      active
                      size={"large"}
                      style={{ width: "100px" }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </>
      ) : props.type === "doubts" ? (
        <>
          {SkeletonsC.map((itms) => (
            <div className="doubts-section" key={itms.id}>
              <Card
                className="doubts-cards"
                title={
                  <Skeleton
                    avatar
                    paragraph={{
                      rows: 2,
                    }}
                    active
                  />
                }
                cover={
                  <div className="doubts-card-body">
                    <Divider />
                    <div className="doubts-card-action-bar">
                      <div className="doubts-card-action">
                        <div className="doubts-card-action-columns">
                          <Skeleton.Button
                            active
                            size={"large"}
                            style={{ width: sideWidth }}
                          />
                        </div>
                        <div className="doubts-card-action-columns">
                          <Skeleton.Button
                            active
                            size={"large"}
                            style={{ width: sideWidth }}
                          />
                        </div>
                        <div className="doubts-card-action-columns">
                          <Skeleton.Button
                            active
                            size={"large"}
                            style={{ width: sideWidth }}
                          />
                        </div>
                      </div>
                      <div className="doubts-card-action-columns">
                        <Skeleton.Button
                          active
                          size={"large"}
                          style={{ width: sideWidth }}
                        />
                      </div>
                    </div>
                  </div>
                }
              />
            </div>
          ))}
        </>
      ) : props.type === "courseList" ? (
        <>
          {SkeletonsC.map((itms) => (
            <div className="all-courses-main" key={itms.id}>
              <Card className="all-courses-card">
                <div
                  className="all-courses-card-inner"
                  style={{ display: "flex" }}
                >
                  <Skeleton.Image
                    active
                    size={"large"}
                    className="courses-card-inner-skeleton"
                  />
                  <Skeleton
                    active
                    direction="vertical"
                    style={{
                      width: "100%",
                    }}
                    size={16}
                  />
                </div>
              </Card>
            </div>
          ))}
        </>
      ) : props.type === "doubtsPop" ? (
        <>
          {SkeletonsC.map((itms) => (
            <div className="doubts-section" key={itms.id}>
              <div className="doubts-cards">
                <Skeleton
                  avatar
                  paragraph={{
                    rows: 2,
                  }}
                  active
                />
              </div>
            </div>
          ))}
        </>
      ) : props.type === "Carousel" ? (
        <div className="carousel-image-container">
          <Skeleton.Image
            active
            size={"large"}
            style={{
              fontSize: 80,
            }}
            className="carousel-image-Skeletons"
          />
        </div>
      ) : props.type === "MyPurchase" ? (
        <>
          {SkeletonsC.map((itms) => (
            <div className="my-order-content-border" key={itms.id}>
              <Row className="my-order-content-row">
                <Col
                  xs={9}
                  sm={9}
                  md={9}
                  lg={9}
                  xl={9}
                  xxl={9}
                  className="my-order-content-col"
                >
                  <Skeleton.Button
                    active
                    size={"large"}
                    style={{ width: "350px" }}
                  />
                </Col>
                <Col
                  xs={5}
                  sm={5}
                  md={5}
                  lg={5}
                  xl={5}
                  xxl={5}
                  className="my-order-content-col my-order-amount "
                >
                  <Skeleton.Button
                    active
                    size={"large"}
                    style={{ width: "150px" }}
                  />
                </Col>
                <Col
                  xs={5}
                  sm={5}
                  md={5}
                  lg={5}
                  xl={5}
                  xxl={5}
                  className="my-order-content-col my-order-amount "
                  style={{
                    textAlign: "center",
                    color: "#3C4852",
                  }}
                >
                  <Skeleton.Button
                    active
                    size={"large"}
                    style={{ width: "150px" }}
                  />
                </Col>
                <Col
                  xs={5}
                  sm={5}
                  md={5}
                  lg={5}
                  xl={5}
                  xxl={5}
                  className="my-order-amount "
                  style={{
                    textAlign: "center",
                    color: "#3C4852",
                  }}
                >
                  <Skeleton.Button
                    active
                    size={"large"}
                    style={{ width: "150px" }}
                  />
                </Col>
              </Row>
            </div>
          ))}
        </>
      ) : props.type === "Path" ? (
        <>
          {SkeletonsC.map((itms) => (
            <div key={itms.id}>
              <Row className="sub-sub-level-content">
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                  <div className="path-sub-content-row" key={itms.id}>
                    <Skeleton.Button
                      active
                      size={"large"}
                      className="path-content-Button"
                    />
                  </div>
                </Col>
              </Row>
            </div>
          ))}
        </>
      ) : props.type === "PathMain" ? (
        <>
          <Row>
            <Col
              xs={8}
              sm={8}
              md={8}
              lg={8}
              xl={8}
              xxl={8}
              style={{
                background: "#fff",
                borderRadius: "3px",
                padding: "20px",
              }}
            >
              {SkeletonsC.map((itms) => (
                <div className="path-content-row" key={itms.id}>
                  <Skeleton.Button
                    active
                    size={"large"}
                    className="path-content-Button"
                  />
                </div>
              ))}
            </Col>
            <Col xs={16} sm={16} md={16} lg={16} xl={16} xxl={16}>
              <div
                style={{
                  marginLeft: "20px",
                  background: "#fff",
                  borderRadius: "3px",
                  padding: "20px",
                  border: "1px solid rgba(90, 114, 200, 0.08)",
                }}
              >
                {SkeletonsC.map((itms) => (
                  <div className="path-content-row" key={itms.id}>
                    <Skeleton.Button
                      active
                      size={"large"}
                      className="path-content-Button"
                    />
                  </div>
                ))}{" "}
              </div>
            </Col>
          </Row>
        </>
      ) : null}
    </>
  );
}
export default Skeletons;

const SkeletonsC = [
  {
    id: 0,
  },
  {
    id: 1,
  },
  {
    id: 2,
  },
  {
    id: 3,
  },
  {
    id: 4,
  },
  {
    id: 5,
  },
];
