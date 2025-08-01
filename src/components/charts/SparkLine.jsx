import React from 'react';
import ReactApexChart from 'react-apexcharts';

const SparkLine = () => {
  const sparklineData = [47, 45, 54, 38, 56, 24, 65, 31, 37, 39, 62, 51, 35, 41, 35, 27, 93, 53, 61, 27, 54, 43, 19, 46];

  // Example of one sparkline chart configuration
  const sparkOptions1 = {
    chart: {
      type: 'area',
      height: 160,
      sparkline: {
        enabled: true
      },
    },
    stroke: {
      curve: 'straight'
    },
    fill: {
      opacity: 0.3,
    },
    yaxis: {
      min: 0
    },
    colors: ['#DCE6EC'],
    title: {
      text: '$424,652',
      offsetX: 0,
      style: {
        fontSize: '24px',
      }
    },
    subtitle: {
      text: 'Sales',
      offsetX: 0,
      style: {
        fontSize: '14px',
      }
    }
  };

  const series1 = [{
    data: sparklineData
  }];

  const miniChartOptions = {
    chart: {
      type: 'line',
      width: 100,
      height: 35,
      sparkline: {
        enabled: true
      }
    },
    tooltip: {
      fixed: {
        enabled: false
      },
      x: {
        show: false
      },
      y: {
        title: {
          formatter: () => ''
        }
      },
      marker: {
        show: false
      }
    }
  };

  const miniSeries = [{
    data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54]
  }];

  return (
    <div className="sparkline-charts">
      {/* Main Sparkline */}
      <div className="chart-container">
        <ReactApexChart 
          options={sparkOptions1}
          series={series1}
          type="area"
          height={160}
        />
      </div>

      {/* Mini Chart */}
      <div className="mini-chart">
        <ReactApexChart 
          options={miniChartOptions}
          series={miniSeries}
          type="line"
          height={35}
          width={100}
        />
      </div>

      {/* You can add more charts following the same pattern */}
    </div>
  );
};

export default SparkLine;