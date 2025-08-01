import React from 'react';
import ReactApexChart from 'react-apexcharts';

const SimplePie = () => {
  const options = {
    chart: {
      width: 380,
      type: 'pie'
    },
    labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const series = [44, 55, 13, 43, 22];

  return (
    <div className="pie-chart">
      <ReactApexChart 
        options={options}
        series={series}
        type="pie"
        width={380}
      />
    </div>
  );
};

export default SimplePie;