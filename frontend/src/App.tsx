// React hooks and icons
import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaMinus, FaTimes, FaPaperPlane, FaInstagram, FaTiktok, FaWhatsapp, FaYoutube } from 'react-icons/fa';

export default function Chatbot() {
  // State for chatbot window open/closed
  const [isOpen, setIsOpen] = useState(false);

  // Chat messages array. Each message has a type (bot or user) and text content.
  const [messages, setMessages] = useState<{ type: 'bot' | 'user'; text: string }[]>([]);

  // Input text state
  const [input, setInput] = useState('');

  // Is the bot currently generating a response?
  const [isTyping, setIsTyping] = useState(false);

  // Ref to scroll to the bottom when new message arrives
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  // Ref to hold current EventSource (for server-sent events)
  const eventSourceRef = useRef<EventSource | null>(null);

  // Ref to track the index of the current bot message being streamed
  const botMessageIndexRef = useRef<number | null>(null);

  // Has the bot started streaming text yet?
  const [botStartedTyping, setBotStartedTyping] = useState(false);

  // Default questions to help users get started
  const defaultQuestions = [
    'What services do you offer?',
    'How can I contact support?',
    'Where are you located?',
    'Tell me a fun fact!',
  ];

  // Toggle chatbot window visibility
  const toggleChat = () => setIsOpen(!isOpen);

  // Minimize (close) chat
  const minimizeChat = () => setIsOpen(false);

  // Send message to backend and stream bot reply
  const sendMessage = (customMessage?: string) => {
    const messageToSend = customMessage ?? input.trim();
    if (!messageToSend) return;

    // Add user message to chat
    setMessages(prev => [...prev, { type: 'user', text: messageToSend }]);
    setInput('');
    setIsTyping(true);

    // Close any existing connection to the Flask server
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Reset bot message tracking
    botMessageIndexRef.current = null;

    // Create new EventSource connection to Flask backend
    const url = `http://localhost:5000/chat?message=${encodeURIComponent(messageToSend)}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    let fullResponse = '';

    // Handle incoming chunks from the bot (SSE)
    eventSource.onmessage = (e) => {
      try {
        if (!botStartedTyping) setBotStartedTyping(true);

        const data = JSON.parse(e.data);
        if (data.response) {
          fullResponse += data.response;

          setMessages(prev => {
            // If first chunk, add new bot message
            if (botMessageIndexRef.current === null) {
              botMessageIndexRef.current = prev.length;
              return [...prev, { type: 'bot', text: fullResponse }];
            }

            // Update the existing bot message with streamed content
            const newMessages = [...prev];
            newMessages[botMessageIndexRef.current] = { type: 'bot', text: fullResponse };
            return newMessages;
          });
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    // Clean up on error
    eventSource.onerror = () => {
      eventSource.close();
      setBotStartedTyping(false);
      setIsTyping(false);
    };
  };

  // Scroll to bottom when messages update or typing starts
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Clean up event source when component unmounts
  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden">
      {/* Welcome Section - full screen center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-0 transition-opacity duration-500">
        <h1 className="text-4xl font-bold text-indigo-700 mb-2">Welcome to AI Assistant</h1>
        <p className="text-lg text-gray-600 mb-2">Your personal chatbot powered by AI — ask anything!</p>
        <p className="text-md font-bold text-gray-500 mb-6">Created by Abdelkarim Alili</p>

        {/* Social icons */}
        <div className="flex space-x-4">
          <a href="https://www.instagram.com/abdelkarim_codes/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 transition-colors">
            <FaInstagram className="text-2xl" />
          </a>
          <a href="https://tiktok.com/@abdelkarim_codes" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 transition-colors">
            <FaTiktok className="text-2xl" />
          </a>
          <a href="https://youtube.com/@abdelkarim_codes" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 transition-colors">
            <FaYoutube className="text-2xl" />
          </a>
          <a href="https://wa.me/212776594338" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 transition-colors">
            <FaWhatsapp className="text-2xl" />
          </a>
        </div>
      </div>

      {/* Chatbot widget in bottom right corner */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-4">
        <div
          className={`bg-white rounded-2xl shadow-xl overflow-hidden origin-bottom-right transform transition-all duration-300 ease-out 
            ${isOpen ? 'scale-100 max-h-[500px] opacity-100 mb-2 mr-4 sm:mr-16' : 'scale-75 max-h-0 opacity-0 translate-y-5'} 
            w-full max-w-[90%] sm:max-w-[300px] md:max-w-[350px] chatbot-window`}
        >

          {/* Chatbot Header */}
          <div className="bg-indigo-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center mr-3">
                <FaRobot />
              </div>
              <h3 className="font-semibold">AI Assistant</h3>
            </div>
            <button onClick={minimizeChat} className="hover:text-indigo-200 focus:outline-none cursor-pointer">
              <FaMinus />
            </button>
          </div>

          {/* Message list */}
          <div className="chat-messages h-[300px] overflow-y-auto px-4 py-2 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-200">
            
            {/* Default quick question buttons */}
            {!isTyping && (
              <div className="grid grid-cols-1 gap-2 mb-4">
                {defaultQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-sm text-indigo-700 border border-indigo-300 rounded-full cursor-pointer py-1 px-3 text-left hover:bg-indigo-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Chat messages (user and bot) */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`text-sm px-4 py-2 break-words rounded-[18px] w-fit whitespace-pre-wrap max-w-[80%]
                  ${msg.type === 'bot'
                    ? 'bg-indigo-100 text-indigo-900 rounded-bl-sm self-start'
                    : 'bg-indigo-600 text-white rounded-br-sm self-end'}
                `}
                dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }}
              />
            ))}

            {/* Typing indicator animation */}
            {isTyping && !botStartedTyping && (
              <div className="typing-indicator flex space-x-1 p-2">
                <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-400"></div>
              </div>
            )}

            {/* Scroll target */}
            <div ref={messageEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-gray-300 p-4 bg-gray-50 rounded-b-2xl">
            <div className="flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => sendMessage()}
                className="ml-2 cursor-pointer bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <FaPaperPlane />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Your AI Assistant is here.</p>
          </div>
        </div>

        {/* Chatbot toggle button */}
        <button
          onClick={toggleChat}
          className="chatbot-button bg-indigo-600 text-white w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
        >
          {isOpen ? <FaTimes className="text-2xl" /> : <FaRobot className="text-2xl" />}
        </button>
      </div>
    </div>
  );
}