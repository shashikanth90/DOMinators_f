import Chart from 'react-apexcharts'

function Donut() {
  const options = {
    labels: ['A', 'B', 'C', 'D', 'E']
  };

  const series = [44, 55, 41, 17, 15];

  return (
    <div className="donut">
      <Chart 
        options={options} 
        series={series} 
        type="donut" 
        width="380" 
      />
    </div>
  );
}

export default Donut;