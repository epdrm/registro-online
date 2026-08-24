import { useNavigate } from 'react-router-dom'
import { USUARIOS_DEMO, useAuth } from '../context/AuthContext'
import { Avatar } from '../components/Avatar'
import { IconDocCheck } from '../components/icons'

const ROTULO_PAPEL: Record<string, string> = {
  professor: 'Professor(a)',
  professor_tecnico: 'Professor(a) técnico(a)',
  professor_diretor: 'Professor(a)-diretor(a)',
  professor_coordenador: 'Professor(a) coordenador(a)',
  coordenacao_pedagogica: 'Coordenação pedagógica',
  diretor: 'Direção escolar',
}

// Para esses papéis a disciplina cadastrada é só o nome do próprio papel — evita repetir.
const OCULTAR_DISCIPLINA = new Set(['coordenacao_pedagogica', 'diretor'])

export function LoginPage() {
  const { entrarComo } = useAuth()
  const navigate = useNavigate()

  function entrar(usuarioId: string) {
    entrarComo(usuarioId)
    navigate('/app')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{ backgroundImage: 'radial-gradient(#E2E8E4 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      <div className="relative flex w-full max-w-[480px] flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3.5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green text-white shadow-[0_2px_10px_rgba(15,81,56,0.18)]">
            <IconDocCheck size={28} />
          </div>
          <div className="flex flex-col items-center gap-0.5 text-center">
            <div className="text-2xl font-bold tracking-tight">
              Registro <span className="text-green">Online</span>
            </div>
            <div className="text-sm text-text-secondary">Escola Técnica Estadual Vale Verde</div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-5 rounded-xl border border-border bg-bg p-7 shadow-[0_2px_10px_rgba(15,81,56,0.08)] sm:p-8">
          <div className="flex flex-col gap-1">
            <div className="text-lg font-bold">Entrar</div>
            <div className="text-[13.5px] text-text-secondary">
              Protótipo de demonstração — escolha um usuário para explorar o que cada perfil enxerga.
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {USUARIOS_DEMO.map((usuario) => (
              <button
                key={usuario.id}
                onClick={() => entrar(usuario.id)}
                className="tap-target flex items-center gap-3 rounded-lg border border-border px-3.5 py-2.5 text-left transition-colors hover:border-green hover:bg-green-soft"
              >
                <Avatar iniciais={usuario.iniciais} cor={usuario.avatarColor} tamanho={36} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-semibold">{usuario.nome}</div>
                  <div className="truncate text-xs text-text-secondary">
                    {ROTULO_PAPEL[usuario.papel]}{!OCULTAR_DISCIPLINA.has(usuario.papel) && ` · ${usuario.disciplina}`}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="h-px bg-border" />

          <div className="text-center text-xs leading-relaxed text-text-secondary">
            Em produção o acesso é vinculado ao cadastro na secretaria — o perfil já vem definido,
            sem seleção manual.
          </div>
        </div>

        <div className="text-center text-xs leading-relaxed text-text-secondary">
          Uso restrito a servidores autorizados. Dados de ocorrências são tratados
          <br className="hidden sm:block" /> conforme a LGPD e a política de privacidade da escola.
        </div>
      </div>
    </div>
  )
}
