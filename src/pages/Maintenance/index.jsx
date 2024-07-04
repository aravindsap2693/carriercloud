import React, { useEffect } from "react";
import logoT from "../../assets/images/logo-text.svg";
import logo from "../../assets/images/logo.svg";
import { Row, Col, Typography, Space } from "antd";
import "../../assets/css/login.css";
import StorageConfiguration from "../../utilities/services/StorageConfiguration";
import { envEndpoint, envRemoteConfig } from "../../reducers/action";
import { useDispatch, useSelector } from "react-redux";
import { fetchAndActivate, getAll } from "@firebase/remote-config";
import { remoteConfig } from "../../firebase-config";
import { Navigate } from "react-router-dom";

const { Title, Text } = Typography;

const Maintenances = () => {
  const dispatch = useDispatch();

  const envremoteConfig = useSelector((state) => state.envremoteConfig);

  useEffect(() => {
    StorageConfiguration.sessionRemoveAllItem();
    sessionStorage.clear();
    getFirebaseData();
  }, []);

  const getFirebaseData = () => {
    let firebaseData = [];
    let link = [];
    fetchAndActivate(remoteConfig).then(
      (_res) => {
        const base_url = getAll(remoteConfig);
        Object.entries(base_url).forEach(([key, value]) => {
          firebaseData.push({ key: key, value: value._value });
          if (key === "assets_url" || key === "base_url") {
            link[key] = value._value.concat("/");
          } else {
            link[key] = value._value;
          }
        });
        !link.isMaintenance ||
          (link.isMaintenance === 0 && <Navigate to="/login" />);
        dispatch(envEndpoint(link.base_url.concat("/")));
        dispatch(envRemoteConfig(link));
        return firebaseData;
      },
      (err) => {
        console.error(err);
      }
    );
  };

  return (
    <Row>
      <Col
        xs={24}
        sm={24}
        style={{
          height: "calc(100vh - 15vh)",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Space size={[15, 16]} wrap>
          <img src={logo} alt="logo" height="175px" />
        </Space>
        <Space size={[15, 16]} wrap>
          <img src={logoT} alt="logo" height="65px" />
        </Space>
        <Space
          size={[8, 16]}
          wrap={true}
          style={{ padding: "15px" }}
          direction="vertical"
          align="center"
        >
          <Title level={2}>{envremoteConfig.maintenance_header}</Title>
        </Space>
        <Space
          size={[8, 16]}
          wrap={true}
          style={{ padding: "15px" }}
          direction="vertical"
          align="center"
        >
          <Text align="center" style={{ width: "450px" }}>
            We're imporving CareersCloud is undergoing maintenance for a better
            experience. We'll be back soon. Thank you for your patience!
          </Text>
        </Space>
      </Col>
    </Row>
  );
};

export default Maintenances;
