import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "../assets/css/layout.css";
// Import your pages/components
import AllCourses from "../pages/AllCourses";
import Home from "../pages/HomeFeed";
import MyCourse from "../pages/MyCourse";
import CourseDetails from "../pages/CourseDetails";
import ArticleDetails from "../pages/CourseDetails/articles/ArticleDetails";
import QuizQuestions from "../pages/CourseDetails/quiz/QuizQuestions";
import QuizResult from "../pages/CourseDetails/quiz/QuizResult";
import EbookDetails from "../pages/CourseDetails/ebooks/EbookDetails";
import VideoDetails from "../pages/CourseDetails/videos/VideoDetails";
import MocktestView from "../pages/CourseDetails/mocktest/MocktestView";
import MyNotes from "../pages/MyNotes";
import MyQuestions from "../pages/MyQuestions";
import Settings from "../pages/Settings";
import PrivateRoute from "./PrivateRoute";
import Profile from "../pages/Profile";
import Preference from "../pages/Preference";
import Loginpage from "../pages/Authentication/Login";
import Ebooks from "../pages/MyEbooks";
import Coins from "../pages/MyCoins";
import MyPoints from "../pages/Points/MyPoints";
import AboutUs from "../pages/AboutUs";
import Authors from "../pages/Authors";
import FAQ from "../pages/FAQ";
import TermsConditions from "../pages/TermsCondition";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import Careers from "../pages/Careers";
import PageNotFound from "../pages/PageNotFound";
import MyDoubts from "../pages/MyDoubts";
import MyQuestionDetails from "../pages/MyQuestions/QuestionDetails";
import PublicRoute from "./PublicRoute";
import { envEndpoint, envUpdate, envRemoteConfig } from "../reducers/action";
import { useDispatch, useSelector } from "react-redux";
import MyPurchase from "../pages/MyPurchase";
import { fetchAndActivate, getAll } from "@firebase/remote-config";
import { remoteConfig } from "../firebase-config";
import HelpCenter from "../pages/HelpCenter/HelpCenter";
import RefundPolicies from "../pages/RefundPolicies/RefundPolicies";
import Env from "../utilities/services/Env";
import NoInternet from "../pages/NoInternet";
import InviteFriends from "../pages/InviteFriends";
// import ErrorBoundary from "./ErrorBoundary";
import RouterProvider from "./RouterProvider";
import Maintenances from "../pages/Maintenance";
import MockQuestionDetails from "../pages/MyQuestions/MockQuestionDetails";
// Import your actions and any necessary Redux setup

function AppRoute() {
  const dispatch = useDispatch();

  const envendpoint = useSelector((state) => state.envendpoint);

  useEffect(() => {
    if (process.env.REACT_APP_ENV === "prod") {
      getFirebaseData();
    } else {
      getGeneralSettings();
    }
  }, []);

  const getFirebaseData = () => {
    let firebaseData = [];
    let link = [];
    fetchAndActivate(remoteConfig).then(
      (_res) => {
        remoteConfig.settings.minimumFetchIntervalMillis = 60000;
        const base_url = getAll(remoteConfig);
        Object.entries(base_url).forEach(([key, value]) => {
          firebaseData.push({ key: key, value: value._value });
          if (key === "assets_url" || key === "base_url") {
            link[key] = value._value.concat("/");
          } else {
            link[key] = value._value;
          }
        });
        dispatch(envEndpoint(link.base_url));
        dispatch(envRemoteConfig(link));
        getGeneralSettings();
        return firebaseData;
      },
      (err) => {
        console.error("error >>>>>", err);
      }
    );
  };

  const getGeneralSettings = () => {
    const getEnv = Env.get(envendpoint + `settings/general_settings_web`);
    getEnv.then((response) => {
      let data = response.data.response.data;
      data = window.atob(window.atob(data));
      data = JSON.parse(data).settings;
      dispatch(envUpdate(data));
    });
  };

  return (
    <div>
      {/* <ErrorBoundary> */}
      <Router>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route
              path="/"
              element={
                <RouterProvider path="/">
                  <Loginpage />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PublicRoute />}>
            <Route
              path="/login"
              element={
                <RouterProvider path="/login">
                  <Loginpage />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PublicRoute />}>
            <Route
              path="/maintenance"
              element={
                <RouterProvider path="/maintenance">
                  <Maintenances />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute path="/home-feed" />}>
            <Route
              path="/home-feed"
              element={
                <RouterProvider path="/home-feed">
                  <Home />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute path="/my-courses" />}>
            <Route
              path="/my-courses"
              element={
                <RouterProvider path="/my-courses">
                  <MyCourse />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute path="/all-courses" />}>
            <Route
              path="/all-courses"
              element={
                <RouterProvider path="/all-courses">
                  <AllCourses />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute path="/course-details/:id" />}>
            <Route
              path="/course-details/:id"
              element={
                <RouterProvider path="/course-details/:id">
                  <CourseDetails />
                </RouterProvider>
              }
            />
          </Route>
          <Route
            element={
              <PrivateRoute
                type="article"
                path="/course-details/:id/article/:article_id"
              />
            }
          >
            <Route
              path="/course-details/:id/article/:article_id"
              element={
                <RouterProvider path="/course-details/:id/article/:article_id">
                  <ArticleDetails />
                </RouterProvider>
              }
            />
          </Route>
          <Route
            element={
              <PrivateRoute
                type="quiz"
                path="/course-details/:id/quiz/:quiz_id"
              />
            }
          >
            <Route
              path="/course-details/:id/quiz/:quiz_id"
              element={
                <RouterProvider path="/course-details/:id/quiz/:quiz_id">
                  <QuizQuestions />
                </RouterProvider>
              }
            />
          </Route>
          <Route
            element={
              <PrivateRoute
                type="quiz"
                path="/course-details/:id/quiz/:quiz_id/result"
              />
            }
          >
            <Route
              path="/course-details/:id/quiz/:quiz_id/result"
              element={
                <RouterProvider path="/course-details/:id/quiz/:quiz_id/result">
                  <QuizResult />
                </RouterProvider>
              }
            />
          </Route>
          <Route
            element={
              <PrivateRoute
                type="ebook"
                path="/course-details/:id/ebook/:ebook_id"
              />
            }
          >
            <Route
              path="/course-details/:id/ebook/:ebook_id"
              element={
                <RouterProvider path="/course-details/:id/ebook/:ebook_id">
                  <EbookDetails />
                </RouterProvider>
              }
            />
          </Route>
          <Route
            element={
              <PrivateRoute
                type="video"
                path="/course-details/:id/video/:video_id"
              />
            }
          >
            <Route
              path="/course-details/:id/video/:video_id"
              element={
                <RouterProvider path="/course-details/:id/video/:video_id">
                  <VideoDetails />
                </RouterProvider>
              }
            />
          </Route>
          <Route
            element={
              <PrivateRoute
                type="mocktest"
                path="/course-details/:id/mocktest/:mock_id"
              />
            }
          >
            <Route
              path="/course-details/:id/mocktest/:mock_id"
              element={
                <RouterProvider path="/course-details/:id/mocktest/:mock_id">
                  <MocktestView />
                </RouterProvider>
              }
            />
          </Route>
          <Route
            element={
              <PrivateRoute
                type="mocktest"
                path="/course-details/:id/mocktest/:mock_id/result"
              />
            }
          >
            <Route
              path="/course-details/:id/mocktest/:mock_id/result"
              element={
                <RouterProvider path="/course-details/:id/mocktest/:mock_id/result">
                  <MocktestView />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute path="/my-notes" />}>
            <Route
              path="/my-notes"
              element={
                <RouterProvider path="/my-notes">
                  <MyNotes />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute path="/my-questions" />}>
            <Route
              path="/my-questions"
              element={
                <RouterProvider path="/my-questions">
                  <MyQuestions />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute path="/my-questions/details" />}>
            <Route
              path="/my-questions/details"
              element={
                <RouterProvider path="/my-questions/details">
                  <MyQuestionDetails />
                </RouterProvider>
              }
            />
          </Route>

          <Route
            path="/my-questions/details/mocktest"
            element={
              <RouterProvider path="/my-questions/details/mocktest">
                <MockQuestionDetails />
              </RouterProvider>
            }
          />

          <Route element={<PrivateRoute path="/doubts" />}>
            <Route
              path="/doubts"
              element={
                <RouterProvider path="/doubts">
                  <MyDoubts />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute type="post" path="/doubts/:id" />}>
            <Route
              path="/doubts/:id"
              element={
                <RouterProvider path="/doubts/:id">
                  <MyDoubts />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute path="/settings" />}>
            <Route
              path="/settings"
              element={
                <RouterProvider path="/settings">
                  <Settings />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute path="/help-center" />}>
            <Route
              path="/help-center"
              element={
                <RouterProvider path="/help-center">
                  <HelpCenter />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute path="/refund-policies" />}>
            <Route
              path="/refund-policies"
              element={
                <RouterProvider path="/refund-policies">
                  <RefundPolicies />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route
              path="/my-ebooks"
              element={
                <RouterProvider path="/my-ebooks">
                  <Ebooks />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route
              path="/my-coins"
              element={
                <RouterProvider path="/my-coins">
                  <Coins />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route
              path="/my-points"
              element={
                <RouterProvider path="/my-points">
                  <MyPoints />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route
              path="/about-us"
              element={
                <RouterProvider path="/about-us">
                  <AboutUs />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route
              path="/profile"
              element={
                <RouterProvider path="/profile">
                  <Profile />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route
              path="/preference"
              element={
                <RouterProvider path="/preference">
                  <Preference />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route
              path="/authors"
              element={
                <RouterProvider path="/authors">
                  <Authors />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route
              path="/faq"
              element={
                <RouterProvider path="/faq">
                  <FAQ />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route
              path="/terms"
              element={
                <RouterProvider path="/terms">
                  <TermsConditions />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route
              path="/privacy"
              element={
                <RouterProvider path="/privacy">
                  <PrivacyPolicy />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route
              path="/careers"
              element={
                <RouterProvider path="/careers">
                  <Careers />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route
              path="/my-order"
              element={
                <RouterProvider path="/my-order">
                  <MyPurchase />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route
              path="/invite"
              element={
                <RouterProvider path="/invite">
                  <InviteFriends />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route
              path="/not-found"
              element={
                <RouterProvider path="/not-found">
                  <PageNotFound />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route
              path="/no-internet"
              element={
                <RouterProvider path="/no-internet">
                  <NoInternet />
                </RouterProvider>
              }
            />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route path="*" element={<Navigate to="/not-found" />} />
          </Route>
        </Routes>
      </Router>
      {/* </ErrorBoundary> */}
    </div>
  );
}

export default AppRoute;
