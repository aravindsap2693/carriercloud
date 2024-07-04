import React, { useState } from "react";
import { Col, Row, Avatar, Button, Checkbox, Select } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import "../../assets/css/mocktestInstruction.css";
import success from "../../assets/images/success.png";
import purpleGreen from "../../assets/images/purpleGreen.png";
import fail from "../../assets/images/fail.png";
import whiteCircle from "../../assets/images/whiteCircle.png";
import purpleCircle from "../../assets/images/purpleCircle.png";
import StorageConfiguration from "../../utilities/services/StorageConfiguration";
import { profileImageUrl } from "../../utilities/services/Env";
import { useEffect } from "react";
import MocktestTable from "../Mocktest/Tables/Table";
import { toast } from "react-toastify";

const MocktestInstruction = (props) => {
  const [languageList, setLanguageList] = useState({});
  const [showNext, setShowNext] = useState(true);
  const [isdeclaration, setIsdeclaration] = useState(false);
  const [language, setLanguage] = useState({
    id: null,
    language: "",
    name: "",
  });

  const overallColumns = [
          {
            title: "Section",
            dataIndex: "sort_order",
            key: "sort_order",
            align: "center",
          },
          {
            title: "Section Name",
            dataIndex: "section_name",
            key: "section_name",
            align: "center",
          },
          {
            title: "Number of Questions",
            dataIndex: "section_question_count",
            key: "section_question_count",
            align: "center",
          },
          {
            title: "Max Score",
            dataIndex: "accurancy",
            key: "accurancy",
            align: "center",
            render: (text, record) => {
              if (record.accurancy !== undefined) {
                return record.accurancy;
              } else {
                return "-";
              }
            },
          },
          {
            title: "Time",
            dataIndex: "section_time",
            key: "section_time",
            align: "center",
      onCell: (_, index) => {
        if (props.mocktest.is_section_timer === 0) {
          if (index === 0) {
            return {
              rowSpan: props.mocktest.mocktest_section.length,
            };
          } else {
            return {
              rowSpan: 0,
            };
          }
        } else {
          return {
            rowSpan: 1,
          };
              }
            },
      render: (_, record) => {
        const minutes =
          props.mocktest.is_section_timer === 1
            ? record.section_time
            : props.mocktest.overall_time;
              if (minutes < 59) {
                return `${minutes} Min`;
              } else {
                const hours = Math.floor(minutes / 60);
                return `${minutes} Min (${hours} Hours)`;
              }
            },
          },
        ];

  useEffect(() => {
    getLanguageList(props.languageList);
  }, [props.languageList]);

  const getLanguageList = (data) => {
    if (data.length > 1) {
      setLanguageList(data);
    } else {
      setLanguageList(data);
      setLanguage({
        id: data[0].id,
        language: data[0].language,
        name: data[0].name,
      });
    }
  };

  const handleLanguageChange = (value) => {
    let language = languageList.find((item) => item.id === value);
    setLanguage({
      id: value,
      language: language.language,
      name: language.name,
    });
  };

  const handleStart = () => {
    if (languageList.length > 1) {
      language.id !== null
        ? props.handleStart(1, language, languageList)
        : toast("Please select your default language");
    } else {
      props.handleStart(1, language, languageList);
    }
  };

  const displayTime = (props) => {
    const overallTime = props.overall_time;
    const sectionTime = props.section_time_overall;
    const isSectionTimer = props.is_section_timer === 0;
    const time = isSectionTimer ? overallTime : sectionTime;
    const minutes = time % 60;
    let hour = Math.floor(time / 60);
    if (time > 59) {
      if (minutes === 0) {
        return `${time} Minutes (${hour} hour)`;
      } else {
        return `${time} Minutes (${hour} hour ${minutes} Minutes)`;
      }
    } else {
      return `${time} Minutes`;
    }
  };

  return (
    <div className="mocktest-instructionall-main mocktest-main-content">
      <Row align="middle" className="row-header">
        <Col
          xs={24}
          sm={16}
          md={18}
          lg={18}
          xl={20}
          xxl={20}
          className="title-column"
        >
          {showNext ? (
            <>
              <div className="mock-general-instruction">
                <div>
                  <div
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <h3 className="mocktest-subtitle">
                      PLEASE READ THE FOLLOWING INSTRUCTION
                    </h3>
                  </div>

                  <div className="mocktest-content">
                    <p>
                      {" "}
                      Total Number of Questions:{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {props.mocktest.mocktest_question_count}
                      </span>
                    </p>

                    <p>
                      Total Time You Have:{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {displayTime(props.mocktest)}
                      </span>
                    </p>
                  </div>
                  <div className="mocktestinstruction mock-popup-modal-timer-content">
                    <MocktestTable
                      columns={overallColumns}
                      dataSource={props.mocktest.mocktest_section}
                    />
                  </div>
                  <div className="mocktest-icons-container">
                    <Row>
                      <Col xs={24} sm={12} md={12} lg={8} xl={8} xxl={6}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <img src={success} alt="success" />
                          <div
                            style={{
                              marginLeft: "0.5em",
                              color: "#3C4852",
                              fontWeight: "400",
                            }}
                          >
                            You have answered the question
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={12} md={12} lg={8} xl={8} xxl={6}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <img src={fail} alt="fail" />
                          <div
                            style={{
                              marginLeft: "0.5em",
                              color: "#3C4852",
                              fontWeight: "400",
                            }}
                          >
                            You have not answered the question
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col
                        xs={24}
                        sm={12}
                        md={12}
                        lg={8}
                        xl={8}
                        xxl={6}
                        style={{ marginTop: "1.2em" }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <img src={whiteCircle} alt="whiteCircle" />
                          <div
                            style={{
                              marginLeft: "0.5em",
                              color: "#3C4852",
                              fontWeight: "400",
                            }}
                          >
                            You have not visited the question yet.
                          </div>
                        </div>
                      </Col>
                      <Col
                        xs={24}
                        sm={12}
                        md={12}
                        lg={8}
                        xl={8}
                        xxl={6}
                        style={{ marginTop: "1.2em" }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <img src={purpleCircle} alt="purpleCircle" />
                          <div
                            style={{
                              marginLeft: "0.5em",
                              color: "#3C4852",
                              fontWeight: "400",
                              lineHeight: "16.8px",
                            }}
                          >
                            You have NOT answered the question, but have marked
                            the question for review.
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col
                        xs={24}
                        sm={12}
                        md={12}
                        lg={8}
                        xl={8}
                        xxl={6}
                        style={{ marginTop: "1.2em" }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <img src={purpleGreen} alt="purpleGreen" />
                          <div
                            style={{
                              marginLeft: "0.5em",
                              color: "#3C4852",
                              fontWeight: "400",
                              lineHeight: "16.8px",
                            }}
                          >
                            The question(s) "Answered and Marked for Review"
                            will be considered for evaluation.
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: props.Instruction.instruction1_text,
                  }}
                  style={{
                    fontSize: "15px",
                    padding: "10px",
                    overflow: "auto",
                  }}
                ></div>
              </div>
              <div className="mock-general-footer mock-general-flex-row">
                {props.showInstructions ? (
                  <>
                    <div>
                      <Button
                        type="button"
                        onClick={() => props.handleMockInfo()}
                        className="next-doubts-btn"
                      >
                        Back
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      {/* <Button
                        type="link"
                        onClick={() => props.navigate(-1)}
                        style={{
                          color: "#3C4852",
                          fontWeight: "800",
                          marginTop: "5px",
                        }}
                      >
                        <ArrowLeftOutlined />
                        Go back
                      </Button> */}
                    </div>
                    <div>
                      <Button
                        type="button"
                        onClick={() => {
                          setShowNext(false);
                        }}
                        disabled={props.mocktest.mocktest_section.length === 0}
                        className="next-doubts-btn"
                      >
                        Next
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="mock-test-instruction">
                <div>
                  <h3 className="mocktest-subtitle">
                    Other important Instructions
                  </h3>
                </div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: props.Instruction.instruction2_text,
                  }}
                  style={{ fontSize: "16px", padding: "10px" }}
                ></div>
              </div>
              <div className="mock-general-footer">
                <div
                  style={{
                    padding: "6px",
                    marginTop: "0px",
                  }}
                >
                  <div
                    style={{
                      background: "#ffff",
                      padding: "6px",
                    }}
                  >
                    <h3 className="language-choose">
                      Choose your default language:{" "}
                      <Select
                        defaultValue={language.id}
                        disabled={languageList.length === 1}
                        style={{
                          width: 100,
                          fontWeight: 500,
                          textTransform: "capitalize",
                        }}
                        placeholder="Select"
                        onChange={handleLanguageChange}
                        options={languageList.map((province) => ({
                          label: province.name,
                          value: province.id,
                        }))}
                      />
                    </h3>
                    <div
                      style={{
                        color: "red",
                        marginTop: "10px",
                      }}
                    >
                      Please note all questions will appear in your default
                      language. This language can be changed for a particular
                      question later on.
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#ffff",
                      padding: "6px",
                      marginTop: "0px",
                    }}
                  >
                    <div className="declaration">
                      <Checkbox
                        onChange={(e) => setIsdeclaration(e.target.checked)}
                      >
                        I have read and understood the instructions. All
                        computer hardware allotted to me are in proper working
                        condition. I declare that I am not in possession of /
                        not wearing / not carrying any prohibited gadget like
                        mobile phone, Bluetooth devices etc. /any prohibited
                        material with me into the Examination Hall.I agree that
                        in case of not adhering to the instructions, I shall be
                        liable to be debarred from this Test and/or to
                        disciplinary action, which may include ban from future
                        Tests / Examinations
                      </Checkbox>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    background: "#ffff",
                    padding: "12px 15px",
                    borderTop: "1px solid #d9d9d9",
                    marginTop: "0px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowNext(true);
                        setIsdeclaration(false);
                      }}
                      className="previous-btn"
                    >
                      Previous
                    </Button>
                  </div>
                  <div>
                    <Button
                      type="button"
                      disabled={!isdeclaration}
                      onClick={() => handleStart()}
                      className="previous-btn"
                    >
                      I'm ready to begin
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </Col>
        <Col
          xs={0}
          sm={8}
          md={6}
          lg={6}
          xl={4}
          xxl={4}
          className="icon-column"
          style={{ textAlign: "center", background: "#f9f9fd" }}
        >
          <div style={{ textAlign: "center" }}>
            {/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(props.profile_image) &&
            !props.profile_image.includes("data") &&
            !props.profile_image.includes("prtner") ? (
              <Avatar
                style={{
                  borderRadius: "90px",
                }}
                size={145}
                src={
                  profileImageUrl +
                  (props.profile_image === null
                    ? StorageConfiguration.sessionGetItem("profile_image")
                    : props.profile_image)
                }
              />
            ) : (
              <Avatar
                style={{
                  color: "#E0F3FF",
                  background: "#0B649D",
                  fontSize: "90px",
                }}
                size={145}
              >
                {props.profile_update.first_name !== undefined &&
                  props.profile_update.first_name.charAt(0).toUpperCase()}
              </Avatar>
            )}
          </div>
          <div
            style={{
              flex: 2,
              padding: "10px 24px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "18px",
            }}
          >
            <div
              style={{
                color: "#0B649D",
                fontWeight: 600,
                whiteSpace: "break-spaces",
              }}
            >
              {props.profile_update.user_name === null
                ? StorageConfiguration.sessionGetItem("user_name")
                : props.profile_update.user_name}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default MocktestInstruction;
