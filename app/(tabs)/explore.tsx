import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    setMessages([{
      id: Math.random().toString(36).substring(7),
      text: "👋 Hi, I'm Gemini AI. Ask me anything!",
      user: { id: 2, name: "Gemini" },
    }]);
  }, []);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const onSend = useCallback(async () => {
    if (!inputMessage.trim()) return;

    const newUserMessage = {
      id: Math.random().toString(36).substring(7),
      text: inputMessage,
      user: { id: 1 },
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    const apiKey = "AIzaSyCA6DjyXomC-P_cRNvgaxYVeAFqBaZg5Hk";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    try {
      const response = await axios.post(apiUrl, {
        contents: [{ parts: [{ text: inputMessage }] }],
      });

      const aiReply = response.data.candidates?.[0]?.content?.parts?.[0]?.text 
        || "Sorry, I didn’t understand.";

      const botMessage = {
        id: Math.random().toString(36).substring(7),
        text: aiReply,
        user: { id: 2, name: "Gemini" },
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        text: "⚠️ Network error, please try again.",
        user: { id: 2, name: "Gemini" },
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      onSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>

      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md flex items-center space-x-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-indigo-600">G</div>
        <h1 className="text-white font-semibold text-lg">Gemini Chat</h1>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatMessagesRef}>
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.user.id === 1 ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-xs sm:max-w-md md:max-w-lg transition-all
              p-4 rounded-2xl shadow-md text-sm leading-relaxed
              ${msg.user.id === 1 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'}
            `}>
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="p-4 rounded-2xl shadow-sm bg-white text-gray-800 rounded-bl-none border border-gray-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex items-center p-4 bg-white rounded-t-2xl shadow-lg">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          onClick={onSend}
          disabled={isLoading || !inputMessage.trim()}
          className={`
            ml-3 p-3 rounded-full transition-all duration-200
            ${isLoading || !inputMessage.trim() 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'}
          `}
        >
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.285 1.39l6.609-2.204 3.385 4.643a1 1 0 001.63-1.166l-3.385-4.643 6.609-2.204a1 1 0 00-.745-1.816l-14-4z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default App;
