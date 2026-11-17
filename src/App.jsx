import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, BranchProvider, ToastProvider } from './context/AppContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <BranchProvider>
            <AppRoutes />
          </BranchProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
