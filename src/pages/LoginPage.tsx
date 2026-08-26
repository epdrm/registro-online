import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { IconDocCheck } from '../components/icons'

export function LoginPage() {
  const { entrar } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    const resultado = await entrar(email.trim(), senha)
    setEnviando(false)
    if (resultado.erro) {
      setErro(resultado.erro)
      return
    }
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
            <div className="text-sm text-text-secondary">Sistema escolar de registro interno</div>
          </div>
        </div>

        <form
          onSubmit={aoEnviar}
          className="flex w-full flex-col gap-5 rounded-xl border border-border bg-bg p-7 shadow-[0_2px_10px_rgba(15,81,56,0.08)] sm:p-8"
        >
          <div className="flex flex-col gap-1">
            <div className="text-lg font-bold">Entrar</div>
            <div className="text-[13.5px] text-text-secondary">
              Acesse com o e-mail e a senha cadastrados pela secretaria.
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold">E-mail</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="tap-target rounded-lg border border-border bg-bg px-3.5 text-[14px] outline-none focus:border-green"
                placeholder="voce@email.com"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold">Senha</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="tap-target rounded-lg border border-border bg-bg px-3.5 text-[14px] outline-none focus:border-green"
                placeholder="••••••••"
              />
            </label>
          </div>

          {erro && (
            <div className="rounded-lg border border-grave/30 bg-grave/10 px-3.5 py-2.5 text-[13.5px] text-grave">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="tap-target flex items-center justify-center rounded-lg bg-green text-sm font-semibold text-white transition-colors hover:bg-green-dark disabled:opacity-60"
          >
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div className="text-center text-xs leading-relaxed text-text-secondary">
          Uso restrito a servidores autorizados. Dados de ocorrências são tratados
          <br className="hidden sm:block" /> conforme a LGPD e a política de privacidade da escola.
        </div>
      </div>
    </div>
  )
}
