import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute, RedirecionarInicio } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { NovoRegistroPage } from './pages/NovoRegistroPage'
import { MeusRegistrosPage } from './pages/MeusRegistrosPage'
import { PainelDiretorPage } from './pages/PainelDiretorPage'
import { PainelCoordenadorPage } from './pages/PainelCoordenadorPage'
import { PainelDirecaoPage } from './pages/PainelDirecaoPage'
import { PerfilAlunoPage } from './pages/PerfilAlunoPage'
import { NotificacoesPage } from './pages/NotificacoesPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<RedirecionarInicio />} />
        <Route path="/app/novo-registro" element={<NovoRegistroPage />} />
        <Route path="/app/meus-registros" element={<MeusRegistrosPage />} />
        <Route path="/app/minha-turma" element={<PainelDiretorPage />} />
        <Route path="/app/meu-eixo" element={<PainelCoordenadorPage />} />
        <Route path="/app/visao-geral" element={<PainelDirecaoPage />} />
        <Route path="/app/notificacoes" element={<NotificacoesPage />} />
        <Route path="/app/aluno/:alunoId" element={<PerfilAlunoPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
