import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useAuth } from './features/auth/AuthContext'
import { PinLoginPage } from './features/auth/PinLoginPage'
import { SetPasswordPage } from './features/auth/SetPasswordPage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { CompetitorFeedPage } from './features/competitors/CompetitorFeedPage'
import { CompetitorSettingsPage } from './features/competitors/CompetitorSettingsPage'
import { MarketingPage } from './features/marketing/MarketingPage'
import { OwnerDashboardPage } from './features/dashboard/OwnerDashboardPage'
import { ProductionLabelPage } from './features/production/ProductionLabelPage'
import { ProductionLogDetailPage } from './features/production/ProductionLogDetailPage'
import { ProductionLogFormPage } from './features/production/ProductionLogFormPage'
import { ProductionLogListPage } from './features/production/ProductionLogListPage'
import { RecipeDetailPage } from './features/recipes/RecipeDetailPage'
import { RecipeFormPage } from './features/recipes/RecipeFormPage'
import { RecipesListPage } from './features/recipes/RecipesListPage'
import { ParLevelsPage } from './features/stock/ParLevelsPage'
import { StockLevelsPage } from './features/stock/StockLevelsPage'
import { StockTransferPage } from './features/stock/StockTransferPage'

function Home() {
  const { profile } = useAuth()
  if (profile?.role === 'owner') return <OwnerDashboardPage />
  return <Navigate to="/production" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<PinLoginPage />} />
      <Route path="/setare-parola" element={<SetPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/production/:id/etichete" element={<ProductionLabelPage />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<RecipesListPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/production" element={<ProductionLogListPage />} />
          <Route path="/production/:id" element={<ProductionLogDetailPage />} />
          <Route path="/stock" element={<StockLevelsPage />} />

          <Route element={<ProtectedRoute allowedRoles={['kitchen_manager', 'owner']} />}>
            <Route path="/recipes/new" element={<RecipeFormPage />} />
            <Route path="/recipes/:id/edit" element={<RecipeFormPage />} />
            <Route path="/stock/par-levels" element={<ParLevelsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
            <Route path="/marketing" element={<MarketingPage />} />
            <Route path="/concurenta" element={<CompetitorFeedPage />} />
            <Route path="/concurenta/setari" element={<CompetitorSettingsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['production_staff', 'kitchen_manager']} />}>
            <Route path="/production/new" element={<ProductionLogFormPage />} />
            <Route path="/stock/transfer" element={<StockTransferPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
