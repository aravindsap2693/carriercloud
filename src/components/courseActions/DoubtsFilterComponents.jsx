import React, { Component } from "react";
import "../../assets/css/doubts-sidebar.css";
import { Input, Radio } from "antd";
import { SearchOutlined } from "@ant-design/icons";

class DoubtsFilterComponents extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedAll: null,
      selectedSolved: null,
      selectedUnsolved: null,
      selectedRelevantFilter: 0,
      selectedFilterOptions: true,
      selectedTag: "All Doubts",
      searchId: "",
      extraParams: "",
      extra: "",
    };
  }

  handleRelavantFilter(item) {
    this.setState({
      selectedFilterOptions: true,
      selectedTag: item.name,
    });
    switch (item.name) {
      case "All Doubts":
        this.setState(
          {
            selectedAll: true,
            selectedSolved: null,
            selectedUnsolved: null,
            selectedRelevantFilter:
              this.state.selectedRelevantFilter === item.id ? null : item.id,
          },
          () => this.applyFilter()
        );
        break;
      case "Solved Doubts":
        this.setState(
          {
            selectedAll: null,
            selectedUnsolved: null,
            selectedSolved: true,
            selectedRelevantFilter:
              this.state.selectedRelevantFilter === item.id ? null : item.id,
          },
          () => this.applyFilter()
        );
        break;
      case "Unsolved Doubts":
        this.setState(
          {
            selectedAll: null,
            selectedUnsolved: true,
            selectedSolved: null,
            selectedRelevantFilter:
              this.state.selectedRelevantFilter === item.id ? null : item.id,
          },
          () => this.applyFilter()
        );
        break;
      default:
        this.setState(
          {
            selectedAll: null,
            selectedSolved: null,
            selectedUnsolved: [],
            selectedExams: [],
            selectedRelevantFilter:
              this.state.selectedRelevantFilter === filterOptions[0].id
                ? null
                : filterOptions[0].id,
          },
          () => this.applyFilter()
        );
    }
  }

  applyFilter() {
    this.getAllDoubts(
      this.state.selectedAll,
      this.state.selectedSolved,
      this.state.selectedUnsolved
    );
  }

  getAllDoubts = (selectedAll, selectedSolved, selectedUnsolved) => {
    this.setState({
      activeLoader: true,
    });
    let extraParams = "";
    let extra = ""; // for follow
    if (selectedAll) {
      extraParams = extraParams + ``;
      extra = extra + ``;
      this.getUserList(extraParams, extra);
    }
    if (selectedSolved) {
      extraParams = extraParams + `&filters[is_solved]=1`;
      extra = extra + `&is_solved=1`; // for follow
      this.getUserList(extraParams, extra);
    }
    if (selectedUnsolved) {
      extraParams = extraParams + `&filters[is_solved]=0`;
      extra = extra + `&is_solved=0`; // for follow
      this.getUserList(extraParams, extra);
    }
  };

  getUserList(extraParams, extra) {
    this.setState(
      {
        activeLoader: true,
        extraParams: extraParams,
        extra: extra,
      },
      () =>
        this.props.toggleFilterDoubtsPopup(
          this.state.extraParams,
          this.state.extra,
          this.state.searchId
        )
    );
  }

  render() {
    return (
      <div>
        <div className="doubts-filter-main">
          <div className="doubt-left-sidebar-filter-search">
            <Input
              placeholder="Search with user id "
              name="user id"
              value={this.state.searchId}
              className="doubt-filter-searchbox"
              onChange={(e) => {
                const re = /^[0-9\b]+$/;
                if (e.target.value === "" || re.test(e.target.value)) {
                  this.setState({
                    searchId: e.target.value,
                  });
                }
              }}
              onPressEnter={() => {
                this.props.toggleFilterDoubtsPopup(
                  this.state.extraParams,
                  this.state.extra,
                  this.state.searchId
                );
              }}
              prefix={
                <SearchOutlined
                  style={{
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    this.props.toggleFilterDoubtsPopup(
                      this.state.extraParams,
                      this.state.extra,
                      this.state.searchId
                    );
                  }}
                />
              }
            />
          </div>
          {this.props.activeTabIndex !== 5 && (
            <>
              {filterOptions.map((item, index) => (
                <Radio.Group
                  defaultValue="0"
                  key={index}
                  onChange={() => this.handleRelavantFilter(item)}
                  value={this.state.selectedTag}
                  name="selectedTag"
                >
                  <Radio.Button
                    className="doubts-filter-toggle-buttons"
                    style={{ margin: "10px" }}
                    value={item.name}
                  >
                    {item.name}
                  </Radio.Button>
                </Radio.Group>
              ))}
            </>
          )}
        </div>
      </div>
    );
  }
}

export default DoubtsFilterComponents;

const filterOptions = [
  {
    id: 0,
    name: "All Doubts",
  },
  {
    id: 1,
    name: "Solved Doubts",
  },
  {
    id: 2,
    name: "Unsolved Doubts",
  },
];
