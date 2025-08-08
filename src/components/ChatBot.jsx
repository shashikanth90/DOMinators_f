import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey! How can I help you with your investments today? I'm here to assist you with market insights and financial guidance.",
      type: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Conversation history for context
  const [conversationHistory, setConversationHistory] = useState([
    {
      role: 'user',
      parts: [{ text: 'You are InvestoBot, a professional financial assistant chatbot. Provide helpful, accurate, and supportive responses about investments, market trends, financial planning, and trading strategies. Be professional yet friendly. Focus on educational content and general guidance, and always remind users to do their own research and consult financial advisors for personalized advice.' }]
    }
  ]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const addMessage = (text, type) => {
    const newMessage = {
      id: Date.now(),
      text,
      type,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async () => {
    const userMessage = inputValue.trim();
    if (!userMessage) return;

    // Add user message
    addMessage(userMessage, 'user');
    setInputValue('');
    setIsTyping(true);

    // Update conversation history
    const newHistory = [
      ...conversationHistory,
      {
        role: 'user',
        parts: [{ text: userMessage }]
      }
    ];
    setConversationHistory(newHistory);

    try {
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!API_KEY) {
        throw new Error('API key not configured');
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: newHistory,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.candidates[0].content.parts[0].text;

      // Add bot reply
      addMessage(botReply, 'bot');
      
      // Update conversation history with bot response
      setConversationHistory([
        ...newHistory,
        {
          role: 'model',
          parts: [{ text: botReply }]
        }
      ]);

    } catch (error) {
      console.error('Error:', error);
      addMessage('I am experiencing some technical difficulties. Please try again later. Make sure the API key is properly configured.', 'bot');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full bg-background dark:bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-indigo-600 text-white p-6 flex items-center space-x-4">
        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
          <Bot className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">InvestoBot</h1>
          <p className="text-sm opacity-90">Your Investment Assistant</p>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm">Online</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 p-6 space-y-4 overflow-y-auto bg-accent/5 dark:bg-accent/5"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start mb-4 animate-fade-in",
              message.type === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div className={cn(
              "p-4 rounded-2xl max-w-[80%] shadow-sm",
              message.type === 'bot' 
                ? 'bg-card dark:bg-card text-foreground border' 
                : 'bg-primary text-primary-foreground'
            )}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.text}
              </p>
              <span className={cn(
                "text-xs mt-2 block opacity-70",
                message.type === 'bot' ? 'text-muted-foreground' : 'text-primary-foreground/70'
              )}>
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start justify-start mb-4">
            <div className="bg-card dark:bg-card p-4 rounded-2xl shadow-sm border">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-card dark:bg-card p-6 border-t">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about investments, market trends, or financial planning..."
              className="w-full p-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-background text-foreground placeholder:text-muted-foreground"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
              disabled={isTyping}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-primary text-primary-foreground p-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;