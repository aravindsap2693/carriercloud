import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Typography } from "antd";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const { Paragraph } = Typography;

export const options = {
  maintainAspectRatio: false,
  responsive: true,
  indexAxis: "y",
  animations: {
    tension: {
      duration: 2000,
      from: 1,
      to: 0,
      loop: true,
    },
  },
  plugins: {
    legend: {
      position: "right",
      display: false,
    },
    title: {
      display: false,
    },
  },
  elements: {
    bar: {
      borderWidth: 2,
    },
  },
  scales: {
    y: {
      ticks: {
        beginAtZero: true,
      },
      grid: {
        drawBorder: false,
        display: false,
      },
    },
  },
};

function BarChart(props) {
  const data = {
    labels: props.dataSet.labels,
    datasets: [
      {
        axis: "y",
        cubicInterpolationMode: "monotone",
        data: props.dataSet.data,
        fill: true,
        backgroundColor: ["green"],
        borderColor: ["green"],
        borderWidth: 3,
        barThickness: 7,
      },
    ],
  };

  return (
    <div>
      <Paragraph
        style={{
          position: "absolute",
          top: "50%",
          transform: "rotate(270deg)",
          left: "0px",
          fontSize: "12px",
        }}
      >
        <h5>Score Range</h5>
      </Paragraph>
      <div style={{ padding: "35px" }} className="chart-line-width">
        <Bar options={options} data={data} />
      </div>
      <Paragraph
        style={{
          textAlign: "center",
          position: "absolute",
          bottom: "1%",
          left: "46%",
          fontSize: "12px",
        }}
      >
        <h5>Users Percentage</h5>
      </Paragraph>
    </div>
  );
}

export default BarChart;
