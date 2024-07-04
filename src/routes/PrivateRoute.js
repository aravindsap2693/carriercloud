import React, { useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import Auth from "./Auth";
import AppFooter from "../components/layouts/AppFooter";
import AppHeader from "../components/layouts/AppHeader";
import { Layout, Spin } from "antd";
import { useSelector } from "react-redux";
import Env from "../utilities/services/Env";
//import { toast, ToastContainer } from 'react-toastify';

const { Content } = Layout;
function PrivateRoute(props) {
  const { component: Component, ...path } = props;
  const navigate = useNavigate();
  const location = useLocation();
  let params = useParams();

  const [IsSubscribed, setIsSubscribed] = useState();
  const [Freecontent, setFreecontent] = useState(true);

  const envremoteConfig = useSelector((state) => state.envremoteConfig);
  const envendpoint = useSelector((state) => state.envendpoint);

  useEffect(() => {
    props.type
      ? getIssubscriptions({ ...props, ...params }, envendpoint)
      : setIsSubscribed(true);
  }, [props]);

  const getIssubscriptions = async (props, envendpoint) => {
    let id = "";
    switch (props.type) {
      case "article":
        id = props.article_id;
        break;
      case "ebook":
        id = props.ebook_id;
        break;
      case "video":
        id = props.video_id;
        break;
      case "quiz":
        id = props.quiz_id;
        break;
      case "mocktest":
        id = props.mock_id;
        break;
      default:
        id = props.id;
    }

    const payload = {
      type: props.type,
      type_id: id,
    };
    await Env.post(envendpoint + `check/subscriptions`, payload)
      .then((res) => {
 
        const response = res.data.response.data;
      
        if(response.is_subscribed===1){
          setFreecontent(true)
        }else if (response.deepLink.free_content===1){
          setFreecontent(true)
        }else{
          setFreecontent(false)
        }
       setIsSubscribed(response.is_subscribed === 1);
       // setFreecontent(false);
        let temp = location.pathname.split("/");
        if (temp[temp.length - 1] === "result") {
          if (
            response.deepLink.is_attempted === 2 ||
            response.deepLink.is_attempted === 0
          ) {
            // Render the MocktestInstruction component otherwise
            navigate(`/course-details/${params.id}/mocktest/${params.mock_id}`);
          }
        }
      })
      .catch((error) => {
        console.error("Naivagtion", error);
        if (error.response) {
          if (error.response.status && error.response.status === 500) {
            window.location.href = "/not-found";
          } else if (error.response.status && error.response.status === 400) {
            window.location.href = "/login";
          }
        } else {
          window.location.href = "/no-internet";
        }
      });
  };

  return (
    <>
      {IsSubscribed === undefined ? (
        <Spin className="app-spinner" size="large" />
      ) : envremoteConfig.isMaintenance === 1 ? (
        <Navigate to="/maintenance" />
      ) : !Auth.isAuthenticated() ? (
        <Navigate to="/login" />
      ) :!IsSubscribed && !Freecontent  ? (
        <Navigate
          to={`/course-details/${params.id}`}
          state={{ message: "Please Subscribe the Course" }}
        />
      ) : (
        <>
          {path.path === "/course-details/:id/quiz/:quiz_id" ||
          path.path === "/course-details/:id/mocktest/:mock_id" ||
          path.path === "/course-details/:id/mocktest/:mock_id/result" ||
          path.path === "/my-questions/details" ? (
            <Outlet />
          ) : (
            <Layout className="main-layout">
              <AppHeader {...props} navigate={navigate} location={location} />
              <Layout style={{ background: "transparent" }}>
                <Content>
                  <Outlet />
                </Content>
              </Layout>
              <AppFooter />
            </Layout>
          )}
        </>
      )}
    </>
  );
}
export default PrivateRoute;
