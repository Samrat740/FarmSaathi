import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Landing from "./pages/Landing"
import GovtSchemes from "./pages/Govtschemes"
import MandiPrices from "./pages/MandiPrices"
import FarmPage from "./pages/FarmPage"
import MarketPage from "./pages/Marketpage"
import LabPage from "./pages/LabPage"
import SimulatorPage from "./pages/SimulatorPage"
import SoilAnalyzer from "./pages/SoilAnalyzer"
import FertilizerCalculator from "./pages/FertilizerCalculator"
import SellPage from "./pages/SellPage"
import KisanPage from "./pages/Kisanpage"
import CropAnalysisPage from "./pages/Cropanalysispage"
import BuySupplies from "./pages/BuySupplies"
import Overview from "./pages/Overview"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/farm" element={<FarmPage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/lab" element={<LabPage />} />
        <Route path="/simulator" element={<SimulatorPage />} />
        <Route path="/soil-analyzer" element={<SoilAnalyzer />} />
        <Route path="/fertilizer-calc" element={<FertilizerCalculator />} />
        <Route path="/buy" element={<BuySupplies />} />
        <Route path="/sell" element={<SellPage />} />
        <Route path="/kisan" element={<KisanPage />} />
        <Route path="/crop-analysis" element={<CropAnalysisPage />} />
        <Route path="/schemes" element={<GovtSchemes />} />
        <Route path="/mandi" element={<MandiPrices />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}