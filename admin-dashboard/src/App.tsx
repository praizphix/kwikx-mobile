import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../admin/Login'
import Dashboard from '../admin/Dashboard'
import Users from '../admin/Users'
import Transactions from '../admin/Transactions'
import KYC from '../admin/KYC'
import ExchangeRates from '../admin/ExchangeRates'
import UserLogs from '../admin/UserLogs'
import CreateAdmin from '../admin/CreateAdmin'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/create-admin" element={<CreateAdmin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/users" element={<Users />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/kyc" element={<KYC />} />
      <Route path="/exchange-rates" element={<ExchangeRates />} />
      <Route path="/user-logs" element={<UserLogs />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
