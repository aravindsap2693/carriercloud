import {
  CURRENT_TAB_INDEX,
  ENV_UPDATE,
  PREFERENCE,
  QUIZ_REATTEMPT,
  QUIZ_SOLUTION,
  QUIZ_RESUME,
  QUIZ_START,
  QUIZ_START_TIMER,
  MOCKTEST_STATUS,
  MOCKTEST_REATTEMPT,
  PROFILE_UPDATE,
  IS_NEW_USER,
  PROFILE_IMAGE_UPDATE,
  PREFERENCE_UPDATE,
  DISABLE_PREFERENCE,
  UPDATE_COURSE_DETAILS,
  CURRENT_COURSE,
  CURRENT_PAGE_ROUTING,
  USER_LOGGED_OUT,
  ENV_ENDPOINT,
  ENV_REMOTECONFIG,
  BANNER_UPDATE,
  ACTIVE_MENU,
} from "./constants";

export function envUpdate(state) {
  let Payload = {};
  state.forEach((ele) => {
    if (
      ele.setting_name === "react_app_assets_url" &&
      ele.setting_value[ele.setting_value.length - 1] !== "/"
    ) {
      Payload[`${ele.setting_name}`] = ele.setting_value.concat("/");
    } else {
      Payload[`${ele.setting_name}`] = ele.setting_value;
    }
  });
  return {
    type: ENV_UPDATE,
    payload: Payload,
  };
}

export function envEndpoint(state) {
  return {
    type: ENV_ENDPOINT,
    payload: state,
  };
}

export function envRemoteConfig(state) {
  let payload = state;
  return {
    type: ENV_REMOTECONFIG,
    payload: payload,
  };
}

export function preferences(id, name) {
  return {
    type: PREFERENCE,
    payload: {
      id: id,
      name: name,
    },
  };
}

export function mocktestReattempt(state, id) {
  let payload = {
    state: state,
    id: id,
  };
  return {
    type: MOCKTEST_REATTEMPT,
    payload: payload,
  };
}

export function mocktestStatusUpdate(state, type) {
  let payload = {
    solution: false,
    start: false,
    start_timer: false,
    resume: false,
  };
  if (type !== "") {
    payload[type] = state;
  }
  if (type === "start") {
    payload["start"] = true;
  }
  if (type === "start_timer") {
    payload["start"] = true;
    payload["start_timer"] = true;
  }
  return {
    type: MOCKTEST_STATUS,
    payload: payload,
  };
}

export function quizSolution(state) {
  return {
    type: QUIZ_SOLUTION,
    payload: state,
  };
}

export function currentTabIndex(state) {
  return {
    type: CURRENT_TAB_INDEX,
    payload: state,
  };
}

export function quizReattempt(state, id) {
  return {
    type: QUIZ_REATTEMPT,
    payload: {
      state: state,
      id: id,
    },
  };
}

export function quizResume(state) {
  return {
    type: QUIZ_RESUME,
    payload: state,
  };
}

export function quizStart(state) {
  return {
    type: QUIZ_START,
    payload: state,
  };
}

export function quizStartTimer(state) {
  return {
    type: QUIZ_START_TIMER,
    payload: state,
  };
}

export function isNewUser(state) {
  return {
    type: IS_NEW_USER,
    payload: state,
  };
}

export function profileUpdate(state) {
  return {
    type: PROFILE_UPDATE,
    payload: state,
  };
}

export function profileImageUpdate(state) {
  return {
    type: PROFILE_IMAGE_UPDATE,
    payload: state,
  };
}

export function preferenceUpdate(state) {
  return {
    type: PREFERENCE_UPDATE,
    payload: state,
  };
}

export function disablePreference(state) {
  return {
    type: DISABLE_PREFERENCE,
    payload: state,
  };
}

export function updateCourseDetails(state) {
  return {
    type: UPDATE_COURSE_DETAILS,
    payload: state,
  };
}

export function currentCourse(state) {
  return {
    type: CURRENT_COURSE,
    payload: state,
  };
}

export function currentPageRouting(state) {
  return {
    type: CURRENT_PAGE_ROUTING,
    payload: state,
  };
}

export function userLogOut(state) {
  return {
    type: USER_LOGGED_OUT,
    payload: state,
  };
}

export function bannerUpdate(state) {
  return {
    type: BANNER_UPDATE,
    payload: state,
  };
}

export function setActiveMenu(state) {
  return {
    type: ACTIVE_MENU,
    payload: state,
  };
}
