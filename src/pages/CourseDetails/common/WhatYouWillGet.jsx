import React, { Component } from "react";
import { Card, Row, Col, Spin } from "antd";
import article from "../../../assets/svg-images/article.svg";
import quizzes from "../../../assets/svg-images/quiz.svg";
import questions from "../../../assets/svg-images/quiz-question.svg";
import ebook from "../../../assets/svg-images/ebook.svg";
import video from "../../../assets/svg-images/video.svg";
import "../../../assets/css/course-detail.css";
import { CommonService } from "../../../utilities/services/Common";

class WhatYouWillGet extends Component {
  render() {
    return (
      <div className="module-container" style={{ marginTop: "20px" }}>
        {Object.keys(this.props).length !== 0 ? (
          <div className="content">
            <Card title="What you'll get ?" bordered={false} className="card">
              <Row className="row">
                {this.props.is_article_count_shown === 1 ? (
                  <Col
                    xs={12}
                    sm={12}
                    md={6}
                    lg={6}
                    xl={4}
                    xxl={4}
                    className="column"
                  >
                    <div className="column-content">
                      <div>
                        <img className="image" alt="article" src={article} />
                      </div>
                      <div className="content">
                        <span className="value">
                          {CommonService.convertIntoKiloPrefix(
                            this.props.article_count
                          )}
                        </span>
                        <div className="title">Articles</div>
                      </div>
                    </div>
                  </Col>
                ) : null}
                {this.props.is_quiz_count_shown === 1 ? (
                  <Col
                    xs={12}
                    sm={12}
                    md={6}
                    lg={6}
                    xl={4}
                    xxl={4}
                    className="column"
                  >
                    <div className="column-content">
                      <div>
                        <img className="image" alt="quizzes" src={quizzes} />
                      </div>
                      <div className="content">
                        <span className="value">
                          {CommonService.convertIntoKiloPrefix(
                            this.props.quiz_count
                          )}
                        </span>
                        <div className="title">Quizzes</div>
                      </div>
                    </div>
                  </Col>
                ) : null}
                {this.props.is_question_count_shown === 1 ? (
                  <Col
                    xs={12}
                    sm={12}
                    md={6}
                    lg={6}
                    xl={4}
                    xxl={4}
                    className="column"
                  >
                    <div className="column-content">
                      <div>
                        <img
                          className="image"
                          alt="questions"
                          src={questions}
                        />
                      </div>
                      <div className="content">
                        <span className="value">
                          {CommonService.convertIntoKiloPrefix(
                            this.props.quiz_questions_count
                          )}
                        </span>
                        <div className="title">Questions</div>
                      </div>
                    </div>
                  </Col>
                ) : null}
                {this.props.is_ebook_count_shown === 1 ? (
                  <Col
                    xs={12}
                    sm={12}
                    md={6}
                    lg={6}
                    xl={4}
                    xxl={4}
                    className="column"
                  >
                    <div className="column-content">
                      <div>
                        <img className="image" alt="ebook" src={ebook} />
                      </div>
                      <div className="content">
                        <span className="value">
                          {CommonService.convertIntoKiloPrefix(
                            this.props.ebook_count
                          )}
                        </span>
                        <div className="title">Ebook</div>
                      </div>
                    </div>
                  </Col>
                ) : null}
                {this.props.is_video_count_shown === 1 ? (
                  <Col
                    xs={12}
                    sm={12}
                    md={6}
                    lg={6}
                    xl={4}
                    xxl={4}
                    className="column"
                  >
                    <div className="column-content">
                      <div>
                        <img className="image" alt="video" src={video} />
                      </div>
                      <div className="content">
                        <span className="value">
                          {CommonService.convertIntoKiloPrefix(
                            this.props.video_count
                          )}
                        </span>
                        <div className="title">Videos</div>
                      </div>
                    </div>
                  </Col>
                ) : null}
                {this.props.course_count ? (
                  <Col
                    xs={12}
                    sm={12}
                    md={6}
                    lg={6}
                    xl={4}
                    xxl={4}
                    className="column"
                  >
                    <div className="column-content">
                      <div>
                        <img className="image" alt="quizzes" src={quizzes} />
                      </div>
                      <div className="content">
                        <span className="value">
                          {CommonService.convertIntoKiloPrefix(
                            this.props.course_count
                          )}
                        </span>
                        <div className="title">Course</div>
                      </div>
                    </div>
                  </Col>
                ) : null}
                {this.props.is_doubt_count_shown === 1 ? (
                  <Col
                    xs={12}
                    sm={12}
                    md={6}
                    lg={6}
                    xl={4}
                    xxl={4}
                    className="column"
                  >
                    <div className="column-content">
                      <div>
                        <img className="image" alt="quizzes" src={quizzes} />
                      </div>
                      <div className="content">
                        <span className="value">
                          {CommonService.convertIntoKiloPrefix(
                            this.props.doubt_count
                          )}
                        </span>
                        <div className="title">Doubts</div>
                      </div>
                    </div>
                  </Col>
                ) : null}
                {this.props.is_mocktest_count_shown === 1 ? (
                  <Col
                    xs={12}
                    sm={12}
                    md={6}
                    lg={6}
                    xl={4}
                    xxl={4}
                    className="column"
                  >
                    <div className="column-content">
                      <div>
                        <img className="image" alt="quizzes" src={quizzes} />
                      </div>
                      <div className="content">
                        <span className="value">
                          {CommonService.convertIntoKiloPrefix(
                            this.props.mocktest_count
                          )}
                        </span>
                        <div className="title">Mocktest</div>
                      
                      </div>
                    </div>
                  </Col>
                ) : null}
                {this.props.is_mock_test_questions_count_shown === 1 ? (
                  <Col
                    xs={12}
                    sm={12}
                    md={6}
                    lg={6}
                    xl={4}
                    xxl={4}
                    className="column"
                  >
                    <div className="column-content">
                      <div>
                        <img
                          className="image"
                          alt="questions"
                          src={questions}
                        />
                      </div>
                      <div className="content">
                        <span className="value">
                          {CommonService.convertIntoKiloPrefix(
                            this.props.mock_test_questions_count
                          )}
                        </span>
                        <div className="title">
                          Mocktest <br />
                          Questions
                          
                        </div>
                      </div>
                    </div>
                  </Col>
                ) : null} 
              </Row>
            </Card>
          </div>
        ) : (
          <Spin className="app-spinner" size="large" />
        )}
      </div>
    );
  }
}

export default WhatYouWillGet;
