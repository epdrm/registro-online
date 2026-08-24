import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute() {
  const { usuario } = useAuth()
  if (!usuario) return <Navigate to="/login" replace />
  return <Outlet />
}

const PAGINA_INICIAL: Record<string, string> = {
  professor: '/app/meus-registros',
  professor_tecnico: '/app/meus-registros',
  professor_diretor: '/app/minha-turma',
  professor_coordenador: '/app/meu-eixo',
  coordenacao_pedagogica: '/app/visao-geral',
  diretor: '/app/visao-geral',
}

export function RedirecionarInicio() {
  const { usuario } = useAuth()
  if (!usuario) return <Navigate to="/login" replace />
  return <Navigate to={PAGINA_INICIAL[usuario.papel] ?? '/app/meus-registros'} replace />
}
