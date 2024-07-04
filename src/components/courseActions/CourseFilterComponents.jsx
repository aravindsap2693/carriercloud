import React, { Component } from "react";
import {
  Divider,
  Dropdown,
  DatePicker,
  Radio,
  Space,
  Checkbox,
  Button,
} from "antd";
import course_filter from "../../assets/svg-images/course-filter.svg";
import course_filter_select from "../../assets/svg-images/course-filter-select.svg";
import CloseCircle from "../../assets/svg-images/closer.svg";
import Env from "../../utilities/services/Env";
import "../../assets/css/CourseFilterComponent.css";

class CourseFilterComponents extends Component {
  constructor(props) {
    super(props);
    this.state = {
      catergoryId: props.tag_filter === 1 ? 0 : props.preferences.id,
      filterList: [
        { id: 1, name: "Yes" },
        { id: 0, name: "No" },
      ],
      filterExams: [],
      filterTag: [],
      filterCoinDiscount: [],
      filterSubjects: [],
      filterPrice: [
        {
          id: 2,
          name: "Paid",
        },
        {
          id: 1,
          name: "Free",
        },
      ],
      showActiveFilter: true,
      showFilterOptions: false,
      selectedPrice: null,
      selectedFeatured: null,
      selectedFilterOptions: true,
      selectedSubjects: [],
      selectedcoinDiscount: null,
      selectedExams: [],
      selectedFilterTypeId: props.tag_filter === 1 ? props.data[0].id : 1,
      selectedRelevantFilter: 0,
      selectedtopic: [],
      selectedtag: [],
      selectedstartDate: null,
      selectedendDate: null,
    };
  }

  componentDidMount() {
    if (this.props.tag_filter === 0) {
      this.getSubjectsList();
      this.getCoins();
    }
  }

  getSubjectsList() {
    const getSubjects = Env.get(
      this.props.envendpoint +
        `courses/subscribedlistnew?page=1&filters[category_id][]=${this.state.catergoryId}&post_type=post`
    );
    getSubjects.then(
      (response) => {
        let exams = response.data.response.courses.filter_exams;
        let subjects = response.data.response.courses.filter_subjects;
        let tag = response.data.response.courses.filter_tags;
        this.setState({
          filterExams: exams,
          filterSubjects: subjects,
          filterTag: tag,
        });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getCoins() {
    const getSubjects = Env.get(
      this.props.envendpoint + `course_coin/coins_details`
    );
    getSubjects.then(
      (response) => {
        let Coins = response.data.response.coins_details;
        this.setState({ filterCoinDiscount: Coins });
      },
      (error) => {
        console.error(error);
      }
    );
  }

  handleRelavantFilter(item) {
    let data = [];
    this.setState({
      selectedFilterOptions: true,
    });
    switch (item.name) {
      case "Featured":
        this.setState(
          {
            selectedFeatured: this.state.selectedFeatured === 1 ? 0 : 1,
            selectedPrice: null,
            selectedSubjects: [],
            selectedExams: [],
            selectedcoinDiscount: null,
            selectedRelevantFilter:
              this.state.selectedRelevantFilter === item.id ? null : item.id,
            showFilterOptions: false,
            selectedFilterTypeId: 2,
          },
          () => this.applyFilter()
        );
        break;
      case "Exam":
        this.state.filterExams.forEach((ele) => {
          data.push(ele.id);
        });
        this.setState(
          {
            selectedFeatured: null,
            selectedPrice: null,
            selectedSubjects: [],
            selectedcoinDiscount: null,
            selectedExams: this.state.selectedExams.length === 0 ? data : [],
            selectedRelevantFilter:
              this.state.selectedRelevantFilter === item.id ? null : item.id,
            showFilterOptions: false,
            selectedFilterTypeId: 4,
          },
          () => this.applyFilter()
        );
        break;
      case "Subjects":
        this.state.filterSubjects.forEach((ele) => {
          data.push(ele.id);
        });
        this.setState(
          {
            selectedFeatured: null,
            selectedPrice: null,
            selectedcoinDiscount: null,
            selectedSubjects:
              this.state.selectedSubjects.length === 0 ? data : [],
            selectedExams: [],
            selectedRelevantFilter:
              this.state.selectedRelevantFilter === item.id ? null : item.id,
            showFilterOptions: false,
            selectedFilterTypeId: 3,
          },
          () => this.applyFilter()
        );
        break;
      case "Coin Discount":
        this.state.filterSubjects.forEach((ele) => {
          data.push(ele.id);
        });
        this.setState(
          {
            selectedFeatured: null,
            selectedPrice: null,
            selectedSubjects: [],
            selectedExams: [],
            selectedcoinDiscount: null,
            selectedRelevantFilter:
              this.state.selectedRelevantFilter === item.id ? null : item.id,
            showFilterOptions: false,
            selectedFilterTypeId: 3,
          },
          () => this.applyFilter()
        );
        break;
      case "Free":
        this.setState(
          {
            selectedFeatured: null,
            selectedPrice:
              this.state.selectedRelevantFilter === item.id ? null : item.id,
            selectedSubjects: [],
            selectedExams: [],
            selectedcoinDiscount: null,
            selectedRelevantFilter:
              this.state.selectedRelevantFilter === item.id ? null : item.id,
            showFilterOptions: false,
            selectedFilterTypeId: 1,
          },
          () => this.applyFilter()
        );
        break;
      case "Paid":
        this.setState(
          {
            selectedFeatured: null,
            selectedPrice:
              this.state.selectedRelevantFilter === item.id ? null : item.id,
            selectedSubjects: [],
            selectedExams: [],
            selectedcoinDiscount: null,
            selectedRelevantFilter:
              this.state.selectedRelevantFilter === item.id ? null : item.id,
            showFilterOptions: false,
            selectedFilterTypeId: 1,
          },
          () => this.applyFilter()
        );
        break;
      default:
        this.setState(
          {
            selectedFeatured: null,
            selectedPrice: null,
            selectedSubjects: [],
            selectedExams: [],
            selectedcoinDiscount: null,
            selectedRelevantFilter:
              this.state.selectedRelevantFilter === filterOptions[0].id
                ? null
                : filterOptions[0].id,
            showFilterOptions: false,
            selectedFilterTypeId: 1,
          },
          () => this.applyFilter()
        );
    }
  }

  applyFilter() {
    let selectedstartDate = this.state.selectedstartDate
      ? this.state.selectedstartDate.format("YYYY/MM/DD")
      : null;
    let selectedendDate = this.state.selectedendDate
      ? this.state.selectedendDate.format("YYYY/MM/DD")
      : null;
    this.setState({ showFilterOptions: false });
    if (this.props.tag_filter === 0) {
      this.handleCourseFilters(
        this.state.selectedPrice,
        this.state.selectedFeatured,
        this.state.selectedSubjects,
        this.state.selectedExams,
        this.state.selectedcoinDiscount
      );
    } else {
      this.handleTagFilters(
        this.state.selectedSubjects,
        this.state.selectedtopic,
        this.state.selectedtag,
        selectedstartDate,
        selectedendDate
      );
    }
  }

  handleCourseFilters = (
    price_type,
    featured_course,
    subjects,
    exams,
    coinDiscount
  ) => {
    let extraParams = "";
    if (featured_course !== null) {
      extraParams = extraParams + `&filters[is_featured]=${featured_course}`;
    }
    if (subjects.length !== 0) {
      extraParams = extraParams + `&filters[subject_ids]=[${subjects}]`;
    }
    if (coinDiscount !== null) {
      extraParams =
        extraParams + `&filters[coin_discount_id][]=${coinDiscount}`;
    }
    if (exams.length !== 0) {
      extraParams = extraParams + `&filters[exam_ids]=[${exams}]`;
    }
    if (price_type !== null) {
      extraParams =
        extraParams +
        `&filters[subscription_type]=${price_type === 1 ? "free" : "paid"}`;
    }
    this.setState({
      showActiveFilter: extraParams === "",
    });
    this.props.selectedFilters(extraParams);
  };

  handleTagFilters = (subjects, topic, tag, startDate, endDate) => {
    let extraParams = "";
    if (subjects.length !== 0) {
      extraParams = extraParams + `&filters[subject_ids]=[${subjects}] `;
    }
    if (tag.length !== 0) {
      extraParams = extraParams + `&filters[tag_ids]=[${tag}]`;
    }
    if (topic.length !== 0) {
      extraParams = extraParams + `&filters[topic_ids]=[${topic}]`;
    }
    if (startDate !== null) {
      extraParams = extraParams + `&filters[start_date]=${startDate}`;
    }
    if (endDate !== null) {
      extraParams = extraParams + `&filters[end_date]=${endDate}`;
    }
    this.setState({
      showActiveFilter: extraParams === "",
    });
    this.props.handleTagFilters(extraParams);
  };

  render() {
    const filterDrop = (
      <div className="filter-dropdown">
        <div className="filter-dropdown-option">
          <div className="filter-dropdown-menu">
            {this.props.data.map((item, index) => (
              <div
                key={index}
                onClick={() =>
                  this.setState({
                    selectedFilterTypeId: item.id,
                  })
                }
                className="dropdown-menu"
                style={{
                  background:
                    item.id === this.state.selectedFilterTypeId
                      ? "#fff"
                      : "transparent",
                  fontWeight:
                    item.id === this.state.selectedFilterTypeId ? 700 : 400,
                }}
              >
                {item.name}{" "}
                {item.id === 1 && this.state.selectedPrice !== null ? (
                  <span className="radioselected">
                    {this.state.selectedPrice.length}
                  </span>
                ) : item.id === 2 && this.state.selectedFeatured !== null ? (
                  <span className="radioselected">
                    {this.state.selectedFeatured.length}
                  </span>
                ) : item.id === 5 &&
                  this.state.selectedcoinDiscount !== null ? (
                  <span className="radioselected">
                    {this.state.selectedcoinDiscount.length}
                  </span>
                ) : (item.id === 3 || item.id === 9) &&
                  this.state.selectedSubjects.length > 0 ? (
                  <span className="selected">
                    {this.state.selectedSubjects.length}
                  </span>
                ) : item.id === 6 && this.state.selectedtag.length !== 0 ? (
                  <span className="selected">
                    {this.state.selectedtag.length}
                  </span>
                ) : item.id === 8 && this.state.selectedtopic.length !== 0 ? (
                  <span className="selected">
                    {this.state.selectedtopic.length}
                  </span>
                ) : (
                  this.state.selectedExams.length !== 0 &&
                  item.id === 4 && (
                    <span className="selected">
                      {this.state.selectedExams.length}
                    </span>
                  )
                )}
              </div>
            ))}
          </div>
          <div className="sub-dropdown">
            {this.state.selectedFilterTypeId === 1 && (
              <Radio.Group
                onChange={(event) =>
                  this.setState({
                    selectedFilterOptions: event.target.value !== null,
                    selectedPrice: event.target.value,
                    selectedRelevantFilter: event.target.value,
                  })
                }
                value={this.state.selectedPrice}
              >
                <Space direction="vertical">
                  {this.state.filterPrice.map((item, index) => (
                    <Radio
                      value={item.id}
                      key={index}
                      className="sub-dropdown-menu"
                    >
                      {item.name}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            )}
            {this.state.selectedFilterTypeId === 2 && (
              <Radio.Group
                onChange={(event) => {
                  this.setState({
                    selectedFilterOptions: true,
                    selectedRelevantFilter: event.target.value === 1 ? 3 : null,
                    selectedFeatured: event.target.value,
                  });
                }}
                value={this.state.selectedFeatured}
              >
                <Space direction="vertical">
                  {this.state.filterList.map((item, index) => (
                    <Radio
                      className="sub-dropdown-menu"
                      value={item.id}
                      key={index}
                    >
                      {item.name}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            )}
            {this.state.selectedFilterTypeId === 3 && (
              <Checkbox.Group
                onChange={(values) =>
                  this.setState({
                    selectedFilterOptions: values.length > 0,
                    selectedRelevantFilter: 4,
                    selectedSubjects: values,
                  })
                }
                value={this.state.selectedSubjects}
              >
                <Space direction="vertical">
                  {this.state.filterSubjects.map((item, index) => (
                    <Checkbox
                      value={item.id}
                      key={index}
                      className="sub-dropdown-menu"
                    >
                      {item.name}
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            )}
            {this.state.selectedFilterTypeId === 5 && (
              <Radio.Group
                onChange={(e) => {
                  this.setState({
                    selectedFilterOptions: e.target.value.length > 0,
                    selectedRelevantFilter: 6,
                    selectedcoinDiscount: e.target.value,
                  });
                }}
                value={this.state.selectedcoinDiscount}
              >
                <Space direction="vertical">
                  {this.state.filterCoinDiscount.map((item, index) => (
                    <Radio
                      value={item.id}
                      key={index}
                      className="sub-dropdown-menu"
                    >
                      {item.coin_content}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            )}
            {this.state.selectedFilterTypeId === 4 && (
              <Checkbox.Group
                onChange={(values) =>
                  this.setState({
                    selectedFilterOptions: values.length > 0,
                    selectedExams: values,
                    selectedRelevantFilter: 5,
                  })
                }
                value={this.state.selectedExams}
              >
                <Space direction="vertical">
                  {this.state.filterExams.map((item, index) => (
                    <Checkbox
                      value={item.id}
                      key={index}
                      className="sub-dropdown-menu"
                    >
                      {item.name}
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            )}
            {this.state.selectedFilterTypeId === 6 && (
              <Checkbox.Group
                onChange={(values) =>
                  this.setState({
                    selectedFilterOptions: values.length > 0,
                    selectedtag: values,
                    selectedRelevantFilter: 6,
                  })
                }
                value={this.state.selectedtag}
              >
                <Space direction="vertical">
                  {this.props.datalist.filter_tags.map((item, index) => (
                    <Checkbox
                      value={item.id}
                      key={index}
                      className="sub-dropdown-menu"
                    >
                      {item.name}
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            )}
            {this.state.selectedFilterTypeId === 7 && (
              <>
                <div style={{ paddingTop: "13px" }}>
                  <DatePicker
                    placeholder="Start Date"
                    onChange={(e, dateString) => {
                      this.setState({ selectedstartDate: e });
                    }}
                    value={this.state.selectedstartDate}
                  />
                </div>
                <div style={{ paddingTop: "13px" }}>
                  <DatePicker
                    placeholder="End Date"
                    onChange={(e, dateString) => {
                      this.setState({ selectedendDate: e });
                    }}
                    value={this.state.selectedendDate}
                  />
                </div>
              </>
            )}
            {this.state.selectedFilterTypeId === 8 && (
              <Checkbox.Group
                onChange={(values) =>
                  this.setState({
                    selectedFilterOptions: values.length > 0,
                    selectedtopic: values,
                    selectedRelevantFilter: 6,
                  })
                }
                value={this.state.selectedtopic}
              >
                <Space direction="vertical">
                  {this.props.datalist.filter_topics.map((item, index) => (
                    <Checkbox
                      value={item.id}
                      key={index}
                      className="sub-dropdown-menu"
                    >
                      {item.name}
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            )}
            {this.state.selectedFilterTypeId === 9 && (
              <Checkbox.Group
                onChange={(values) =>
                  this.setState({
                    selectedFilterOptions: values.length > 0,
                    selectedSubjects: values,
                    selectedRelevantFilter: 6,
                  })
                }
                value={this.state.selectedSubjects}
              >
                <Space direction="vertical">
                  {this.props.datalist.filter_subjects.map((item, index) => (
                    <Checkbox
                      value={item.id}
                      key={index}
                      className="sub-dropdown-menu"
                    >
                      {item.name}
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            )}

            <Divider />
            <div>
              <Button
                style={{
                  borderRadius: "7px",
                  color: "#0B649D",
                  border: "1px solid #0B649D",
                  fontWeight: 700,
                }}
                ghost
                onClick={() =>
                  this.setState(
                    {
                      selectedFeatured: null,
                      selectedExams: [],
                      selectedSubjects: [],
                      selectedcoinDiscount: null,
                      selectedPrice: null,
                      selectedFilterOptions: true,
                      selectedRelevantFilter: 0,
                      selectedtopic: [],
                      selectedtag: [],
                      selectedstartDate: null,
                      selectedendDate: null,
                      showActiveFilter: true,
                    },
                    () => this.applyFilter()
                  )
                }
              >
                Reset
              </Button>
              <Button
                style={{
                  marginLeft: "15px",
                  borderRadius: "7px",
                  color: "#0B649D",
                  border: "1px solid #0B649D",
                  fontWeight: 700,
                }}
                ghost
                onClick={() => this.applyFilter()}
              >
                Apply
              </Button>
            </div>
          </div>
          <div style={{ position: "absolute", right: "30px" }}>
            <img
              src={CloseCircle}
              alt="CloseCircle"
              className="CloseButton"
              onClick={() => this.setState({ showFilterOptions: false })}
            />
          </div>
        </div>
      </div>
    );
    return (
      <div className={this.props.tag_filter === 0 ? "course-filter" : null}>
        <div
          className={
            this.props.tag_filter === 0
              ? "course-filter-main"
              : "tag-filter-main"
          }
        >
          <div className="filter-img" style={{ width: "65px" }}>
            <Dropdown
              open={this.state.showFilterOptions}
              dropdownRender={(e) => filterDrop}
            >
              <img
                src={
                  this.state.showActiveFilter
                    ? course_filter
                    : course_filter_select
                }
                alt="course_filter"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.preventDefault();
                  this.setState({
                    showFilterOptions: !this.state.showFilterOptions,
                  });
                }}
              />
            </Dropdown>
          </div>
          {this.props.tag_filter === 0 && (
            <Divider type="vertical" style={{ height: "40px" }} />
          )}
          {this.props.tag_filter === 0 && (
            <>
              {filterOptions.map((item, index) => (
                <div
                  className="top-menu"
                  key={index}
                  onClick={() => this.handleRelavantFilter(item)}
                >
                  <div
                    className="menu-box"
                    style={{
                      background:
                        this.state.selectedRelevantFilter === item.id &&
                        this.state.selectedFilterOptions === true
                          ? "#e4e5e7"
                          : "transparent",
                    }}
                  >
                    {item.name}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    );
  }
}

export default CourseFilterComponents;

const filterOptions = [
  {
    id: 0,
    name: "All",
  },
  {
    id: 1,
    name: "Free",
  },
  {
    id: 2,
    name: "Paid",
  },
  {
    id: 3,
    name: "Featured",
  },
  {
    id: 4,
    name: "Subjects",
  },
  {
    id: 5,
    name: "Exam",
  },
];
