import type { Mensagem } from '../../types/entrevista'

interface Props {
  mensagem: Mensagem
}

export function ChatBubble({ mensagem }: Props) {
  const isUser = mensagem.role === 'USER'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0 mt-1">
          IA
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
        }`}
      >
        {mensagem.conteudo}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold ml-2 shrink-0 mt-1">
          EU
        </div>
      )}
    </div>
  )
}
