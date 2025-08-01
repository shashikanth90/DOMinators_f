import React from 'react';
import ReactApexChart from 'react-apexcharts';

const LineChart = () => {
  const series = {
    monthDataSeries1: {
      prices: [8107.85, 8128.0, 8122.9, 8165.5, 8340.7, 8423.7, 8423.5],
      dates: ['13 Nov 2017', '14 Nov 2017', '15 Nov 2017', '16 Nov 2017', 
              '17 Nov 2017', '20 Nov 2017', '21 Nov 2017']
    }
  };

  const options = {
    chart: {
      type: 'area',
      height: 350,
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'straight'
    },
    title: {
      text: 'Fundamental Analysis of Stocks',
      align: 'left'
    },
    subtitle: {
      text: 'Price Movements',
      align: 'left'
    },
    xaxis: {
      type: 'datetime',
      categories: series.monthDataSeries1.dates
    },
    yaxis: {
      opposite: true
    },
    legend: {
      horizontalAlign: 'left'
    }
  };

  const seriesData = [{
    name: "STOCK ABC",
    data: series.monthDataSeries1.prices
  }];

  return (
    <div className="line-chart">
      <ReactApexChart 
        options={options}
        series={seriesData}
        type="area"
        height={350}
      />
    </div>
  );
};

export default LineChart;