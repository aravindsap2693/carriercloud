import { connect } from "react-redux";
import React from "react";

const DoubtSvg = (props) => {
  const path = props.current_page_routing
    ? props.current_page_routing.selectedKeys
    : props.current_page_routing;

  return (
    <svg
      width="18"
      height="20"
      viewBox="0 0 18 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100%" height="100%" />
      <g clipPath="url(#clip0_4367_2807)">
        <path
          d="M16.0056 4.92572C15.4227 4.06512 14.7015 3.31375 13.8734 2.70408C12.0432 1.3516 9.82411 0.742271 7.78499 1.03555C5.74586 1.32882 3.75706 2.42718 2.19497 4.12633C0.827973 5.6105 0.0765754 7.32531 0.0696818 8.95541C0.0620988 12.0569 0.0627919 15.1761 0.06486 17.8192C0.06486 18.7239 0.45779 19.1275 1.33534 19.1296H3.19661H4.4216L6.74819 19.1261C7.79326 19.1261 8.83855 19.1261 9.88408 19.1261H9.8889C10.9678 19.1261 12.1404 18.4918 12.9166 18.0711C13.4151 17.8006 13.8864 17.4797 14.3236 17.113C17.8724 14.1404 18.6134 8.78599 16.0056 4.92572ZM13.5432 16.12C13.1705 16.4335 12.7685 16.7077 12.343 16.9386C11.6743 17.3009 10.6644 17.8469 9.89097 17.8469C8.84453 17.8469 7.79831 17.8469 6.75232 17.8469L4.42574 17.8505C3.39859 17.8505 2.37122 17.8505 1.34362 17.8505H1.31053V17.8177C1.31053 15.1761 1.31052 12.0583 1.31535 8.95825C1.31949 7.20287 2.4335 5.73009 3.09666 5.009C4.46641 3.51913 6.19325 2.55887 7.9587 2.30403C9.6821 2.0556 11.5785 2.58094 13.153 3.74478C13.8662 4.26975 14.4872 4.91662 14.9895 5.65748C17.223 8.97106 16.5888 13.5667 13.5432 16.12Z"
          fill={path !== "4" ? "#0B649D" : "#fff"}
        />
        <path
          d="M10.5315 6.22446C10.0227 5.76065 9.3709 5.49854 8.69232 5.48486H8.68612C7.55695 5.50622 6.74833 5.95894 6.21477 6.86867C6.00314 7.22886 6.05966 7.59688 6.35884 7.80544C6.65803 8.01401 7.00477 7.95991 7.20882 7.66308C7.54316 7.17405 8.13325 6.67505 8.69921 6.66651H8.71645C9.03769 6.66651 9.31895 6.82809 9.55402 7.14771C9.93386 7.66521 9.91387 8.43826 9.50646 8.98566C9.31482 9.24334 9.09767 9.49178 8.88604 9.73166C8.59152 10.052 8.3175 10.3918 8.0657 10.7489C7.95259 10.9061 7.87175 11.0854 7.82812 11.276C7.7845 11.4666 7.77902 11.6644 7.81201 11.8572C7.86164 12.1704 8.05398 12.3647 8.33937 12.3918C8.36281 12.3918 8.38556 12.3918 8.40831 12.3918C8.67922 12.3918 8.88673 12.2352 8.98324 11.9533C9.2177 11.2579 9.63261 10.6423 10.1827 10.1737C10.7769 9.65621 11.1795 8.72442 11.185 7.85456C11.1906 7.18686 10.961 6.606 10.5315 6.22446Z"
          fill={path !== "4" ? "#0B649D" : "#fff"}
        />
        <path
          d="M8.44171 13.6125C8.22318 13.6047 8.05016 13.6609 7.92952 13.7791C7.86903 13.8431 7.82186 13.9191 7.79092 14.0026C7.75997 14.0861 7.74591 14.1753 7.7496 14.2646C7.74339 14.7059 8.00811 15.0191 8.39277 15.0277H8.40449C8.59209 15.023 8.77029 14.9419 8.90013 14.802C8.96555 14.7367 9.01757 14.6586 9.0531 14.5721C9.08863 14.4856 9.10695 14.3927 9.10694 14.2987C9.09867 13.8837 8.84843 13.6275 8.44171 13.6125Z"
          fill={path !== "4" ? "#0B649D" : "#fff"}
        />
      </g>
      <defs>
        <clipPath id="clip0_4367_2807">
          <rect
            width="17.4945"
            height="18.1674"
            fill="white"
            transform="translate(0.0644531 0.963867)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default connect((state) => {
  return {
    current_page_routing: state.current_page_routing,
  };
})(DoubtSvg);
