import { type ReactNode, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { Avatar } from './Avatar'
import {
  IconBarChart, IconBell, IconClipboard, IconDocCheck, IconGrid,
  IconLayers, IconLogout, IconMenu, IconPlus, IconUsers, IconX,
} from './icons'

const ROTULO_PAPEL: Record<string, string> = {
  admin: 'Administrador(a)',
  professor: 'Professor(a)',
  professor_tecnico: 'Professor(a) técnico(a)',
  professor_diretor: 'Professor(a)-diretor(a)',
  professor_coordenador: 'Professor(a) coordenador(a)',
  coordenacao_pedagogica: 'Coordenação pedagógica',
  diretor: 'Direção escolar',
}

// Para esses papéis a disciplina cadastrada é só o nome do próprio papel — evita repetir.
const OCULTAR_DISCIPLINA = new Set(['admin', 'coordenacao_pedagogica', 'diretor'])

interface NavItem {
  to: string
  label: string
  icon: (props: { size?: number }) => ReactNode
  contador?: number
}

function navPorPapel(papel: string, naoLidas: number): NavItem[] {
  if (papel === 'admin') {
    return [{ to: '/app/administracao', label: 'Professores', icon: IconUsers }]
  }

  const base: NavItem[] = [
    { to: '/app/novo-registro', label: 'Novo registro', icon: IconPlus },
    { to: '/app/meus-registros', label: 'Meus registros', icon: IconClipboard },
  ]

  if (papel === 'professor_diretor') {
    base.push({ to: '/app/minha-turma', label: 'Minha turma', icon: IconLayers })
    base.push({ to: '/app/administracao', label: 'Alunos', icon: IconUsers })
  }
  if (papel === 'professor_coordenador') {
    base.push({ to: '/app/meu-eixo', label: 'Meu eixo', icon: IconGrid })
  }
  if (papel === 'coordenacao_pedagogica' || papel === 'diretor') {
    base.push({ to: '/app/visao-geral', label: 'Visão geral', icon: IconBarChart })
  }
  if (papel !== 'professor' && papel !== 'professor_tecnico') {
    base.push({ to: '/app/notificacoes', label: 'Notificações', icon: IconBell, contador: naoLidas })
  }
  return base
}

function NavRow({ item, aoClicar }: { item: NavItem; aoClicar?: () => void }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      onClick={aoClicar}
      className={({ isActive }) =>
        `flex items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
          isActive ? 'bg-green-soft text-green-dark' : 'text-text hover:bg-bg-section'
        }`
      }
    >
      <span className="flex items-center gap-2.5">
        <Icon size={18} />
        {item.label}
      </span>
      {!!item.contador && (
        <span className="rounded-full bg-grave px-1.5 py-0.5 text-[11px] font-bold text-white">{item.contador}</span>
      )}
    </NavLink>
  )
}

function Marca() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-green text-white">
        <IconDocCheck size={18} />
      </div>
      <div className="text-[15px] font-bold">Registro Online</div>
    </div>
  )
}

export function AppShell({ children, titulo }: { children: ReactNode; titulo: string }) {
  const { usuario, sair } = useAuth()
  const { notificacoes } = useData()
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)

  if (!usuario) return null
  const naoLidas = notificacoes.filter((n) => !n.lida).length
  const itens = navPorPapel(usuario.papel, naoLidas)

  return (
    <div className="flex min-h-screen w-full bg-bg-section">
      {/* Sidebar — desktop */}
      <aside className="hidden w-60 shrink-0 flex-col gap-7 border-r border-border bg-bg px-4 py-6 lg:flex">
        <Marca />
        <nav className="flex flex-col gap-1">
          {itens.map((item) => <NavRow key={item.to} item={item} />)}
        </nav>
        <div className="mt-auto flex items-center gap-2.5 border-t border-border px-2 pt-4">
          <Avatar iniciais={usuario.iniciais} cor={usuario.avatarColor} tamanho={34} />
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-semibold">{usuario.nome}</div>
            <div className="truncate text-xs text-text-secondary">
              {ROTULO_PAPEL[usuario.papel]}{!OCULTAR_DISCIPLINA.has(usuario.papel) && ` · ${usuario.disciplina}`}
            </div>
          </div>
          <button
            className="tap-target ml-auto flex items-center justify-center rounded-lg text-text-secondary hover:bg-bg-section"
            onClick={() => { sair(); navigate('/login') }}
            aria-label="Sair"
          >
            <IconLogout size={18} />
          </button>
        </div>
      </aside>

      {/* Drawer — mobile */}
      {menuAberto && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMenuAberto(false)} />
          <aside className="relative flex w-72 max-w-[85vw] flex-col gap-7 bg-bg px-4 py-6 shadow-xl">
            <div className="flex items-center justify-between">
              <Marca />
              <button className="tap-target flex items-center justify-center rounded-lg text-text-secondary" onClick={() => setMenuAberto(false)} aria-label="Fechar menu">
                <IconX size={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {itens.map((item) => <NavRow key={item.to} item={item} aoClicar={() => setMenuAberto(false)} />)}
            </nav>
            <div className="mt-auto flex items-center gap-2.5 border-t border-border px-2 pt-4">
              <Avatar iniciais={usuario.iniciais} cor={usuario.avatarColor} tamanho={34} />
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-semibold">{usuario.nome}</div>
                <div className="truncate text-xs text-text-secondary">{ROTULO_PAPEL[usuario.papel]}</div>
              </div>
              <button
                className="tap-target ml-auto flex items-center justify-center rounded-lg text-text-secondary"
                onClick={() => { sair(); navigate('/login') }}
                aria-label="Sair"
              >
                <IconLogout size={18} />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-bg px-4 sm:px-7">
          <div className="flex items-center gap-2">
            <button
              className="tap-target -ml-1.5 flex items-center justify-center rounded-lg text-text-secondary lg:hidden"
              onClick={() => setMenuAberto(true)}
              aria-label="Abrir menu"
            >
              <IconMenu size={20} />
            </button>
            <div className="text-[17px] font-bold sm:text-[18px]">{titulo}</div>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-4">
            <NavLink
              to="/app/notificacoes"
              className="tap-target relative hidden items-center justify-center rounded-lg text-text-secondary hover:bg-bg-section sm:flex"
              aria-label="Notificações"
            >
              <IconBell size={19} />
              {naoLidas > 0 && (
                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full border border-bg bg-grave" />
              )}
            </NavLink>
            {usuario.papel !== 'admin' && (
              <button
                onClick={() => navigate('/app/novo-registro')}
                className="tap-target flex items-center gap-2 rounded-lg bg-green px-3.5 text-sm font-semibold text-white hover:bg-green-dark sm:px-4"
              >
                <IconPlus size={16} />
                <span className="hidden sm:inline">Novo registro</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 pb-24 lg:pb-8">{children}</main>
      </div>

      {/* Bottom bar — mobile, alcance com o polegar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-bg lg:hidden">
        {itens.slice(0, 4).map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `tap-target relative flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold ${
                  isActive ? 'text-green-dark' : 'text-text-secondary'
                }`
              }
            >
              <Icon size={19} />
              {item.label}
              {!!item.contador && (
                <span className="absolute top-1.5 right-[28%] h-2 w-2 rounded-full bg-grave" />
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
