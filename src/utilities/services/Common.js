import moment from "moment";
import { toast } from "react-toastify";
import _ from "lodash";

export const CommonService = {
  getProductPercentage(principle_amount, discount_amount) {
    let percentage = principle_amount / 100;
    let difference = principle_amount - discount_amount;
    return Math.round(difference / percentage);
  },

  getTimeRemaining(endtime) {
    const total = Date.parse(endtime) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return {
      total,
      days,
      hours,
      minutes,
      seconds,
    };
  },

  pathRedirectionFunction(props, type, item) {
    if (props.courses.is_subscribed === 1) {
      switch (type) {
        case "Quiz":
          return props.routingProps.navigate(
            `/course-details/${props.courses.id}/quiz/${item.id}`
          );
        case "Ebook":
          return props.routingProps.navigate(
            `/course-details/${props.courses.id}/ebook/${item.id}`
          );
        case "Article":
          return props.routingProps.navigate(
            `/course-details/${props.courses.id}/article/${item.id}`
          );
        case "Video":
          return props.routingProps.navigate(
            `/course-details/${props.courses.id}/video/${item.id}`
          );
        default:
          return false;
      }
      // href={props.subscribed.is_subscribed === 1 ? (item.type === "Quiz" ? props.courseId+'/quiz/'+item.id : item.type === "Ebook" ? this.props.courseId+'/ebook/'+item.id : item.type === 'Article' ? this.props.courseId+'/article/'+item.id : this.props.courseId+'/video/'+item.id) : alert('Please subscribe')}
    } else {
      toast("Please subscribe the course!");
    }
  },

  contentRedirectionFunction(props,type,item) {
    if (item.is_subscribed === 1 || item.free_content === 1) {
      switch (type) {
        case "Quiz":
          return props.navigate(
            `/course-details/${props.match.params.id}/quiz/${item.id}`
          );
        case "Ebook":
          return props.navigate(
            `/course-details/${props.match.params.id}/ebook/${item.id}`
          );
        case "Article":
          return props.navigate(
            `/course-details/${props.match.params.id}/article/${item.id}`
          );
        case "Video":
          return props.navigate(
            `/course-details/${props.match.params.id}/video/${item.id}`
          );
        case "Bundle":
          return props.navigate(`/course-details/${item.id}`);
        default:
          return false;
      }
      // href={props.subscribed.is_subscribed === 1 ? (item.type === "Quiz" ? props.courseId+'/quiz/'+item.id : item.type === "Ebook" ? this.props.courseId+'/ebook/'+item.id : item.type === 'Article' ? this.props.courseId+'/article/'+item.id : this.props.courseId+'/video/'+item.id) : alert('Please subscribe')}
    } else {
      toast("Please subscribe the course!");
    }
  },

  getMinutesSeconds(time) {
    time = Number(time);
    var minutes = Math.floor((time % 3600) / 60);
    var seconds = Math.floor((time % 3600) % 60);

    return {
      minutes,
      seconds,
    };
  },

  convertIntoKiloPrefix(count) {
    if (count && count !== 0) {
      let countString = count.toString();
      if (countString.length === 7) {
        countString = count / 100000;
        countString = countString.toFixed(2);
        return countString + " M";
      } else if (countString.length === 6) {
        countString = count / 1000;
        countString = countString.toFixed(2);
        return countString + " K";
      } else if (countString.length === 5) {
        countString = count / 1000;
        countString = countString.toFixed(1);
        return countString + " K";
      } else if (countString.length === 4) {
        countString = count / 1000;
        countString = countString.toFixed(1);
        return countString + " K";
      } else {
        return count;
      }
    } else {
      return 0;
    }
  },

  getPostedTime(value) {
    let formattedDate = new Date(value);
    var currentDate = new Date();
    if (this.getLast48Hours(formattedDate, currentDate) < 48) {
      if (this.getMinutes(formattedDate, currentDate) === 0) {
        return "a mins ago";
      } else {
        return this.getLast48Hours(formattedDate, currentDate) + " hrs ago";
      }
    } else {
      return moment(value).format("DD MMM Y");
    }
  },

  getSeconds(date, today) {
    var dateDifference = date.valueOf() - today.valueOf();
    var minutes = Math.abs(dateDifference / 1000 / 60);
    return Math.round(minutes);
  },

  getMinutes(date, today) {
    var dateDifference = date.valueOf() - today.valueOf();
    var minutes = Math.abs(dateDifference / 1000 / 60 / 60);
    return Math.round(minutes);
  },

  getLast48Hours(date, today) {
    var dateDifference = date.valueOf() - today.valueOf();
    var hours = Math.abs(dateDifference / 1000 / 60 / 60);
    return Math.round(hours);
  },

  getShowLess(string) {
    return string.slice(0, 580) + "...";
  },

  getDoubtPostedTime(value) {
    let formattedDate = new Date(value);
    var currentDate = new Date();
    if (this.getLast48Hours(formattedDate, currentDate) < 48) {
      if (this.getMinutes(formattedDate, currentDate) === 0) {
        return `${this.getSeconds(formattedDate, currentDate)} mins ago`;
      } else {
        return this.getLast48Hours(formattedDate, currentDate) + " hrs ago";
      }
    } else {
      return moment(value).format("DD MMM Y");
    }
  },

  getInitialUppercase(str) {
    const Initialcapitalized = str.charAt(0).toUpperCase();
    return Initialcapitalized;
  },

  getUppercase(str) {
    const capitalized = this.getInitialUppercase(str) + str.slice(1);
    return capitalized;
  },

  getDate(date, format) {
    var DateFormat = moment(date).format(format);
    return DateFormat;
  },

  async handleCopy(e) {
    let text = e.target.innerText;
    await navigator.clipboard.writeText(text);
    toast("Userid is copied");
  },

  hendleError(error, props, type) {
    let state = null;
    let Url = window.location.pathname;
    if (type === "main") {
      state = null;
    } else {
      state = { path: "/all-courses", name: "Course" };
    }
    // if (error.response !== undefined && error.response.status === 404) {
    //   props.navigate("/not-found", { state: state });
    // } else if (_.isUndefined(error.response)) {
    //   props.navigate("/no-internet", { state: Url });
    // }
  },

  handleStartTimer(timer) {
    const minutes = Math.floor(timer / 60);
    const hours = Math.floor(minutes / 60);
    const seconds = timer % 60;
    const formattedHours = hours > 0 ? `${String(hours).padStart(2, "0")}` : "";
    const formattedMinutes = `${String(minutes % 60).padStart(2, "0")}`;
    const formattedSeconds = `${String(seconds).padStart(2, "0")}`;
    return `${formattedHours}${
      formattedHours ? " : " : ""
    }${formattedMinutes} : ${formattedSeconds}`;
  },

  handleTimeShow(timer) {
    const minutes = Math.floor(timer / 60);
    const hours = Math.floor(minutes / 60);
    const seconds = timer % 60;
    const formattedHours = hours > 0 ? `${hours} hrs` : "";
    const formattedMinutes = minutes > 0 ? `${minutes % 60} mins` : "";
    const formattedSeconds = seconds > 0 ? `${seconds} sec` : "";
    return `${formattedHours} ${formattedMinutes} ${formattedSeconds}`.trim();
  },

  convertIntoDecimalPrefix(count) {
    if (count % 1 !== 0) {
      let countString = parseFloat(count);
      countString = countString?.toFixed(2);
      return countString;
    } else if (typeof count === "string") {
      return parseInt(count);
    } else {
      return count;
    }
  },

  // Function to get mock test time and count
  getMockCountandtime(item) {
    let question_count = item.overall_question_count;
    let time = 0;
    if (item.is_section_timer === 1) {
      let mocktest_section = item.mocktest_section.filter(
        (sec) => sec.section_question_count > 0
      );
      mocktest_section.forEach((section) => {
        time += section.section_time;
      });
    } else {
      time = item.overall_time;
    }
    let getMockCountandtime = `${question_count} - Question & ${time} mins`;
    return getMockCountandtime;
  },
};
