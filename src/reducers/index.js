import {
  CURRENT_TAB_INDEX,
  ENV_UPDATE,
  IS_NEW_USER,
  PREFERENCE,
  PREFERENCE_UPDATE,
  PROFILE_UPDATE,
  QUIZ_REATTEMPT,
  QUIZ_RESUME,
  QUIZ_SOLUTION,
  QUIZ_START,
  QUIZ_START_TIMER,
  MOCKTEST_REATTEMPT,
  MOCKTEST_STATUS,
  PROFILE_IMAGE_UPDATE,
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

const initialState = {
  preferences: {
    id: null,
    name: null,
  },
  envupdate: {
    react_app_google_client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  },
  quiz_solution: false,
  current_tab_index: null,
  quiz_reattempt: false,
  quiz_resume: false,
  quiz_start: false,
  quiz_start_timer: false,
  is_new_user: false,
  profile_update: {},
  profile_image: null,
  preference_update: false,
  disable_preference: false,
  update_course_details: false,
  current_course: null,
  current_page_routing: { path: "/home-feed", selectedKeys: 1 },
  envendpoint: process.env.REACT_APP_API_URL,
  envremoteConfig: [],
  mocktest_status: {
    solution: false,
    start: false,
    start_timer: false,
    resume: false,
  },
  mocktest_reattempt: false,
  banner_update: {},
  active_menu: "1",
};

const appReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case ENV_ENDPOINT:
      return Object.assign({}, state, {
        envendpoint: action.payload,
      });
    case ENV_REMOTECONFIG:
      return Object.assign({}, state, {
        envremoteConfig: action.payload,
      });
    case ENV_UPDATE:
      return Object.assign({}, state, {
        envupdate: action.payload,
      });
    case PREFERENCE:
      return Object.assign({}, state, {
        preferences: action.payload,
      });
    case QUIZ_SOLUTION:
      return Object.assign({}, state, {
        quiz_solution: action.payload,
      });
    case CURRENT_TAB_INDEX:
      return Object.assign({}, state, {
        current_tab_index: action.payload,
      });
    case QUIZ_REATTEMPT:
      return Object.assign({}, state, {
        quiz_reattempt: action.payload,
      });
    case QUIZ_RESUME:
      return Object.assign({}, state, {
        quiz_resume: action.payload,
      });
    case QUIZ_START:
      return Object.assign({}, state, {
        quiz_start: action.payload,
      });
    case QUIZ_START_TIMER:
      return Object.assign({}, state, {
        quiz_start_timer: action.payload,
      });
    case MOCKTEST_STATUS:
      return Object.assign({}, state, {
        mocktest_status: action.payload,
      });
    case MOCKTEST_REATTEMPT:
      return Object.assign({}, state, {
        mocktest_reattempt: action.payload,
      });
    case IS_NEW_USER:
      return Object.assign({}, state, {
        is_new_user: action.payload,
      });
    case PROFILE_UPDATE:
      return Object.assign({}, state, {
        profile_update: action.payload,
      });
    case PROFILE_IMAGE_UPDATE:
      return Object.assign({}, state, {
        profile_image: action.payload,
      });
    case PREFERENCE_UPDATE:
      return Object.assign({}, state, {
        preference_update: action.payload,
      });
    case DISABLE_PREFERENCE:
      return Object.assign({}, state, {
        disable_preference: action.payload,
      });
    case UPDATE_COURSE_DETAILS:
      return Object.assign({}, state, {
        update_course_details: action.payload,
      });
    case CURRENT_COURSE:
      return Object.assign({}, state, {
        current_course: action.payload,
      });
    case CURRENT_PAGE_ROUTING:
      return Object.assign({}, state, {
        current_page_routing: action.payload,
      });
    case BANNER_UPDATE:
      return Object.assign({}, state, {
        banner_update: action.payload,
      });
    case ACTIVE_MENU:
      return Object.assign({}, state, {
        active_menu: action.payload,
      });
    case USER_LOGGED_OUT:
      return (state = initialState);
    default:
      return Object.assign({}, state);
  }
};

export default appReducer;
