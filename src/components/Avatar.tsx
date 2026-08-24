interface AvatarProps {
  iniciais: string
  cor: string
  tamanho?: number
}

export function Avatar({ iniciais, cor, tamanho = 36 }: AvatarProps) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: tamanho, height: tamanho, background: cor, fontSize: tamanho * 0.36 }}
    >
      {iniciais}
    </div>
  )
}
