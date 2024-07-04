import { connect } from "react-redux";
import React from "react";

const HomeSvg = (props) => {
  const path = props.current_page_routing
    ? props.current_page_routing.selectedKeys.toString()
    : props.current_page_routing;
   return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100%" height="100%" />
      <path
        d="M10.1991 1.9025C10.3547 1.78151 10.5461 1.71582 10.7432 1.71582C10.9402 1.71582 11.1317 1.78151 11.2872 1.9025L18.5775 7.57313C18.8972 7.82184 19.1559 8.14033 19.3337 8.50427C19.5115 8.86821 19.6038 9.26798 19.6035 9.67304V17.3381C19.6035 17.808 19.4168 18.2588 19.0845 18.5911C18.7522 18.9234 18.3014 19.1101 17.8315 19.1101H14.6235C14.1535 19.1101 13.7028 18.9234 13.3704 18.5911C13.0381 18.2588 12.8514 17.808 12.8514 17.3381V11.968H8.64323V17.3381C8.64323 17.808 8.45653 18.2588 8.1242 18.5911C7.79187 18.9234 7.34114 19.1101 6.87116 19.1101H3.65489C3.1849 19.1101 2.73417 18.9234 2.40184 18.5911C2.06951 18.2588 1.88281 17.808 1.88281 17.3381V9.67304C1.88281 8.8508 2.26204 8.07818 2.91061 7.57313L10.1991 1.9025ZM10.7432 3.27871L3.63728 8.9713C3.53047 9.05439 3.44411 9.16083 3.38482 9.28247C3.32554 9.40412 3.2949 9.53772 3.29527 9.67304V17.6651H7.19903V12.3489C7.19903 11.8789 7.38573 11.4282 7.71806 11.0958C8.05039 10.7635 8.50112 10.5768 8.9711 10.5768H12.5152C12.9852 10.5768 13.436 10.7635 13.7683 11.0958C14.1006 11.4282 14.2873 11.8789 14.2873 12.3489V17.6651H18.2629V9.67304C18.2633 9.53772 18.2326 9.40412 18.1734 9.28247C18.1141 9.16083 18.0277 9.05439 17.9209 8.9713L10.7432 3.28049V3.27871Z"
        fill={path !== "1" ? "#0B649D" : "#fff"}
      />
    </svg>
  );
};

export default connect((state) => {
  return {
    current_page_routing: state.current_page_routing,
  };
})(HomeSvg);
