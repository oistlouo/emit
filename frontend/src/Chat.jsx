import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: `💁‍♀️ 안녕하세요! 저는 에미뜨의원 온라인 상담사입니다.

궁금하신 피부 고민이나 시술에 대해 편하게 말씀해 주세요. 😊

💡 예시 질문:
- "지금 받을 수 있는 할인 시술이 뭐가 있나요?"
- "첫방문 이벤트 중 제 피부에 맞는 시술이 궁금해요."
- "예약하려면 어떻게 하면 되나요?"
- "가격대랑 시술 부위가 어떻게 되나요?"`
    }
  ]);

  const chatEndRef = useRef(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (customMessage) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim()) return;

    const newMessages = [...messages, { role: 'user', text: messageToSend }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const gptMessages = newMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const res = await axios.post('https://emit-3drt.onrender.com/chat', {
        messages: gptMessages
      });

      const reply = res.data.reply;
      setMessages([...newMessages, { role: 'bot', text: reply }]);
    } catch {
      setMessages([
        ...newMessages,
        { role: 'bot', text: '⚠️ 죄송합니다. 오류가 발생했습니다. 다시 시도해 주세요.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 relative bg-cover bg-center" style={{ backgroundImage: 'url("/chat-bg.jpg")' }}>
      <div className="absolute inset-0 bg-white/80 z-0" />

      <div className="relative max-w-2xl w-full mx-auto rounded-2xl shadow-xl border border-gray-200 overflow-hidden" style={{ backgroundImage: 'url("/chat-bg.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="relative z-10 p-6 bg-white/80 pb-24">
          <h2 className="text-2xl font-bold mb-4 text-center text-pink-600">
            💬 에미뜨의원 온라인 상담실
          </h2>

          <div className="space-y-3 mb-4 max-h-[450px] overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-3 rounded-xl text-sm whitespace-pre-wrap shadow ${
                  msg.role === 'user'
                    ? 'bg-pink-600 text-white rounded-br-none'
                    : 'bg-white text-black border border-gray-300 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-sm text-gray-500 italic">입력 중입니다...</div>}
            <div ref={chatEndRef} />
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isComposing) sendMessage();
              }}
              placeholder="궁금한 점을 입력하세요..."
              className="flex-1 px-4 py-2 rounded-md border border-gray-300 text-black shadow-sm"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition font-semibold"
            >
              {loading ? '...' : '전송'}
            </button>
          </div>
        </div>
      </div>

      {/* 하단 예약 버튼 고정 */}
      <div className="fixed bottom-4 left-0 w-full flex justify-center z-50">
        <a
          href="https://m.booking.naver.com/booking/13/bizes/825198"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-sm rounded-full font-semibold shadow-xl"
        >
          📅 에미뜨의원 예약하기
        </a>
      </div>
    </div>
  );
}
