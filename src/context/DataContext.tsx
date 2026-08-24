import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { REGISTROS_SEED, TRATATIVAS_SEED } from '../data/mockData'
import { derivarNotificacoes } from '../data/selectors'
import type { Notificacao, Registro, Tratativa } from '../types'

interface DataContextValue {
  registros: Registro[]
  adicionarRegistro: (registro: Omit<Registro, 'id' | 'dataHora' | 'status'>) => void
  tratativas: Tratativa[]
  adicionarTratativa: (alunoId: string, autor: string, texto: string) => void
  notificacoes: Notificacao[]
  marcarComoLida: (id: string) => void
  marcarTodasComoLidas: () => void
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [registros, setRegistros] = useState<Registro[]>(REGISTROS_SEED)
  const [tratativas, setTratativas] = useState<Tratativa[]>(TRATATIVAS_SEED)
  const [lidas, setLidas] = useState<Set<string>>(new Set())

  const notificacoesBase = useMemo(() => derivarNotificacoes(registros), [registros])
  const notificacoes = useMemo(
    () => notificacoesBase.map((n) => ({ ...n, lida: lidas.has(n.id) })),
    [notificacoesBase, lidas],
  )

  const value = useMemo<DataContextValue>(() => ({
    registros,
    adicionarRegistro: (registro) => {
      setRegistros((atual) => [
        {
          ...registro,
          id: `reg-novo-${atual.length + 1}`,
          dataHora: new Date().toISOString(),
          status: 'sem_tratativa',
        },
        ...atual,
      ])
    },
    tratativas,
    adicionarTratativa: (alunoId, autor, texto) => {
      setTratativas((atual) => [
        { id: `trat-novo-${atual.length + 1}`, alunoId, autor, dataHora: new Date().toISOString(), texto },
        ...atual,
      ])
    },
    notificacoes,
    marcarComoLida: (id) => setLidas((atual) => new Set(atual).add(id)),
    marcarTodasComoLidas: () => setLidas(new Set(notificacoesBase.map((n) => n.id))),
  }), [registros, tratativas, notificacoes, notificacoesBase])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData precisa estar dentro de <DataProvider>')
  return ctx
}
