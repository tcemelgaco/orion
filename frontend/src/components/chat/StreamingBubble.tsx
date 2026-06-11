interface Props {
  conteudo: string
}

export function StreamingBubble({ conteudo }: Props) {
  return (
    <div className="flex justify-start mb-4">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0 mt-1">
        IA
      </div>
      <div className="max-w-[75%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap bg-white text-gray-800 border border-gray-200 shadow-sm">
        {conteudo}
        <span className="inline-block w-1.5 h-4 bg-blue-500 ml-0.5 animate-pulse align-middle" />
      </div>
    </div>
  )
}
