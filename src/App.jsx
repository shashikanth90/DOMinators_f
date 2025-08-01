import { Button } from "@/components/ui/button"
import LineChart from "@/components/charts/LineChart"
import PieChart from "@/components/charts/PieChart";
import SparkLine from "@/components/charts/SparkLine";
import ColumnChart from "./components/charts/ColumnChart";
import CandleStickChart from "./components/charts/CandleStickChart";
import SimplePie from "./components/charts/SimplePie";

function App() {

  return (
    <>
      <LineChart />
      <PieChart />
      {/* <SparkLine /> */}
      <ColumnChart />
      <CandleStickChart />
      <SimplePie />
    </>
  )
}

export default App;