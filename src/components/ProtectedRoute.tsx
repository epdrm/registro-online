import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute() {
  const { usuario, carregando } = useAuth()
  if (carregando) return null
  if (!usuario) return <Navigate to="/login" replace />
  return <Outlet />
}

const PAGINA_INICIAL: Record<string, string> = {
  admin: '/app/administracao',
  professor: '/app/painel',
  professor_tecnico: '/app/painel',
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
