import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Typography } from "antd";
import { Line } from "react-chartjs-2";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
export const options = {
  maintainAspectRatio: false,
  responsive: true,
  animations: {
    tension: {
      duration: 1000,
      from: 1,
      to: 0,
      loop: true,
    },
  },
  plugins: {
    legend: {
      labels: {
        usePointStyle: true,
      },
      fullWidth: true,
      position: "top",
      display: false,
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      ticks: {
        beginAtZero: true,
      },
      bezierCurve: true,
      grid: {
        drawBorder: false,
        display: false,
      },
    },
    y: {
      ticks: {
        beginAtZero: true,
      },
    },
  },
};

function LineChart(props) {
  const data = {
    labels: props.dataSet?.data,
    datasets: [
      {
        axis: "x",
        data: props.dataSet?.labels,
        cubicInterpolationMode: "monotone",
        fill: true,
        borderWidth: 3,
        backgroundColor: "#02853f",
        borderColor: ["rgba(75,192,192,1)"],
        pointStyle: "circle",
        pointRadius: 5,
        pointBorderColor: "#02853f",
      },
    ],
  };

  return (
    <div>
      <Typography.Title
        level={5}
        style={{
          position: "absolute",
          top: "50%",
          transform: "rotate(270deg)",
          left: "0px",
        }}
      >
        Percentile
      </Typography.Title>
      <div
        style={{ padding: "35px 35px 15px 35px" }}
        className="chart-line-width"
      >
        <Line options={options} data={data} />
      </div>
      <Typography.Title
        level={5}
        style={{
          textAlign: "center",
        }}
      >
        Score
      </Typography.Title>
    </div>
  );
}

export default LineChart;
