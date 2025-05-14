import { Toaster } from 'sonner';
import { SalesDashboard } from './components/SalesDashboard';
import './App.css';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <SalesDashboard />
    </>
  );
}

export default App
