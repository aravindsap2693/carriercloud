import React from "react";

const MyPurchaseSvg = (props) => {
  return (
    <svg
      width="22"
      height="23"
      viewBox="0 0 22 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_22348_1273)">
        <path
          d="M8.25065 20.2811C8.75691 20.2811 9.16732 19.8707 9.16732 19.3644C9.16732 18.8582 8.75691 18.4478 8.25065 18.4478C7.74439 18.4478 7.33398 18.8582 7.33398 19.3644C7.33398 19.8707 7.74439 20.2811 8.25065 20.2811Z"
          stroke={props.selectedKeys === "8" ? "#fff" : "#0B649D"}
          strokeWidth="1.55556"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.3327 20.2811C18.8389 20.2811 19.2493 19.8707 19.2493 19.3644C19.2493 18.8582 18.8389 18.4478 18.3327 18.4478C17.8264 18.4478 17.416 18.8582 17.416 19.3644C17.416 19.8707 17.8264 20.2811 18.3327 20.2811Z"
          stroke={props.selectedKeys === "8" ? "#fff" : "#0B649D"}
          strokeWidth="1.55556"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M0.916016 1.03076H4.58268L7.03935 13.3049C7.12317 13.727 7.35276 14.1061 7.68793 14.3759C8.0231 14.6457 8.44249 14.789 8.87268 14.7808H17.7827C18.2129 14.789 18.6323 14.6457 18.9674 14.3759C19.3026 14.1061 19.5322 13.727 19.616 13.3049L21.0827 5.6141H5.49935"
          stroke={props.selectedKeys === "8" ? "#fff" : "#0B649D"}
          strokeWidth="1.55556"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_22348_1273">
          <rect
            width="22"
            height="22"
            fill="white"
            transform="translate(0 0.114258)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default MyPurchaseSvg;
