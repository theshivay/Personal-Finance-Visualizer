import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { chatbotService } from '../../services/chatbotService';

const ChatbotAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [aiMode, setAiMode] = useState(true); // Track AI mode status
  const [messages, setMessages] = useState(() => {
    // Try to load saved messages from localStorage
    const savedMessages = localStorage.getItem('chatbotMessages');
    return savedMessages ? JSON.parse(savedMessages) : [
      { 
        id: 1, 
        type: 'bot', 
        text: 'Hi there! I\'m your Finance Assistant. Ask me about your transactions, budgets, or financial summaries.'
      }
    ];
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showedSetupGuide, setShowedSetupGuide] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Check if API key is set and update aiMode
  useEffect(() => {
    const checkApiKey = async () => {
      // Make a test query to see if AI is working
      try {
        const testResponse = await chatbotService.processMessage("test_ai_mode");
        const isAiDisabled = testResponse.includes("[AI DISABLED");
        setAiMode(!isAiDisabled);
        
        // Show setup guide if AI is disabled and guide hasn't been shown yet
        if (isAiDisabled && isOpen && !showedSetupGuide && messages.length < 3) {
          setIsTyping(true);
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: prev.length + 1,
              type: 'bot',
              text: `⚠️ **AI MODE DISABLED** ⚠️

I'm currently running in Basic Mode because the Gemini API key is not configured. This is why you're getting the message "I'm currently experiencing some issues with my advanced AI capabilities."

**Quick Fix:**
1. Get a free API key from [Google AI Studio](https://ai.google.dev/)
2. Open this file:
   \`/Users/shivammishra/Desktop/Personalised_Finance_Tracker/client/.env\`
3. Replace YOUR_API_KEY_HERE with your actual key
4. Restart the app

For detailed instructions, I've created a guide at:
\`/Users/shivammishra/Desktop/Personalised_Finance_Tracker/client/CHATBOT_FIX.md\`

I'll still answer basic questions until then!`
            }]);
            setIsTyping(false);
            setShowedSetupGuide(true);
          }, 1000);
        }
      } catch (error) {
        console.error("Error checking AI mode:", error);
      }
    };
    
    if (isOpen) {
      checkApiKey();
    }
  }, [isOpen, showedSetupGuide, messages.length]);

  // Scroll to bottom of messages when new ones arrive
  useEffect(() => {
    scrollToBottom();
    
    // Save messages to localStorage
    localStorage.setItem('chatbotMessages', JSON.stringify(messages));
    
    // Set notification for new messages when chat is closed
    if (messages.length > 1 && !isOpen) {
      setHasNewMessages(true);
    }
  }, [messages, isOpen]);

  // Focus on input when chat opens
  useEffect(() => {
    if (isOpen) {
      if (inputRef.current) {
        inputRef.current.focus();
      }
      setHasNewMessages(false);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Check for AI mode toggle command
    if (inputValue.trim().toLowerCase() === 'debug mode') {
      setAiMode(!aiMode);
    }

    // Add user message
    const userMessage = { 
      id: messages.length + 1, 
      type: 'user', 
      text: inputValue.trim() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Call our chatbot service to process the message
      const botResponse = await chatbotService.processMessage(userMessage.text);
      
      // Update AI mode state if it was toggled
      if (userMessage.text.toLowerCase() === 'debug mode') {
        setAiMode(!aiMode);
      }
      
      setMessages(prev => [...prev, { 
        id: prev.length + 1, 
        type: 'bot', 
        text: botResponse 
      }]);
      setIsTyping(false);
    } catch (error) {
      console.error('Error getting response:', error);
      setMessages(prev => [...prev, { 
        id: prev.length + 1, 
        type: 'bot', 
        text: 'Sorry, I encountered an error while processing your request.'
      }]);
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed right-4 bottom-4 z-50">
      {/* Chat toggle button */}
      <button 
        onClick={toggleChat}
        className={`
          h-14 w-14 rounded-full shadow-lg flex items-center justify-center
          bg-gradient-to-br from-primary-500 to-accent 
          text-white hover:shadow-xl transition-all duration-300
          ${isOpen ? 'scale-90' : 'scale-100 animate-pulse-slow'}
          hover:scale-105 active:scale-95
        `}
        aria-label="Chat with Finance Assistant"
      >
        <div className="relative">
          {!isOpen && hasNewMessages && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              1
            </span>
          )}
          
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="10" r="1"></circle>
              <circle cx="8" cy="10" r="1"></circle>
              <circle cx="16" cy="10" r="1"></circle>
            </svg>
          )}
        </div>
      </button>

      {/* Chat dialog */}
      {isOpen && (
        <div 
          className={`
            absolute bottom-16 right-0 w-80 sm:w-96 h-[450px] 
            bg-card-light dark:bg-card-dark rounded-xl shadow-2xl
            flex flex-col overflow-hidden border border-border-light dark:border-border-dark
            animate-slide-up
          `}
        >
          {/* Chat header */}
          <div className="p-4 border-b border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center text-white shadow-md mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" />
                    <path d="M12 11a2 2 0 0 0-2 2c0 .28.12.52.32.7a1.98 1.98 0 0 0 .68.3h2a2 2 0 0 0 0-4h-2a2 2 0 0 0 0 4" fill="white" stroke="white" strokeWidth="0.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-lg text-foreground-light dark:text-foreground-dark flex items-center">
                    Finance Assistant
                    {!aiMode && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-200 dark:bg-amber-800 rounded text-amber-800 dark:text-amber-200">
                        Basic Mode
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-muted-light dark:text-muted-dark">
                    {!aiMode ? (
                      <span>
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 mr-1">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                          API key needed - 
                          <button 
                            className="underline bg-transparent border-none p-0 ml-1 cursor-pointer text-inherit" 
                            onClick={() => {
                              setInputValue("How do I set up the API key?");
                              setTimeout(() => handleSubmit({ preventDefault: () => {} }), 100);
                            }}>Fix Now</button>
                        </span>
                      </span>
                    ) : (
                      <span>Ask me anything about your finances</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* AI Mode Toggle Button */}
                <button
                  onClick={() => {
                    handleSubmit({ preventDefault: () => {} });
                    setInputValue('debug mode');
                    setTimeout(() => handleSubmit({ preventDefault: () => {} }), 100);
                  }}
                  className="p-1 hover:bg-background-light dark:hover:bg-background-dark rounded-md text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark transition-colors"
                  aria-label={aiMode ? "Disable AI mode" : "Enable AI mode"}
                  title={aiMode ? "Disable AI mode" : "Enable AI mode"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L13 10h3.8L19 12l-2.2 2H13l-.25.07A4.02 4.02 0 0 1 16 18a4 4 0 0 1-4 4c-1.95 0-3.58-1.4-3.93-3.25L8 18H4.2L3 16l1.2-2H8l.07-.25A4.02 4.02 0 0 1 4 10a4 4 0 0 1 4-4c1.95 0 3.58 1.4 3.93 3.25L12 10l.25-.07A4.02 4.02 0 0 1 8 6a4 4 0 0 1 4-4z" />
                  </svg>
                </button>
                
                {/* Clear History Button */}
                <button 
                  onClick={() => {
                    if (window.confirm('Clear chat history?')) {
                      setMessages([
                        { 
                          id: 1, 
                          type: 'bot', 
                          text: 'Hi there! I\'m your Finance Assistant. Ask me about your transactions, budgets, or financial summaries.'
                        }
                      ]);
                    }
                  }}
                  className="p-1 hover:bg-background-light dark:hover:bg-background-dark rounded-md text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark transition-colors"
                  aria-label="Clear chat history"
                  title="Clear chat history"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background-light/50 to-background-light dark:from-background-dark/50 dark:to-background-dark">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={cn(
                  'max-w-[85%] rounded-xl p-3 animate-fade-in',
                  message.type === 'user' 
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-foreground-light dark:text-foreground-dark ml-auto rounded-tr-none' 
                    : 'bg-card-light dark:bg-card-dark text-foreground-light dark:text-foreground-dark mr-auto rounded-tl-none shadow-sm'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
            ))}
            {isTyping && (
              <div className="bg-card-light dark:bg-card-dark max-w-[85%] rounded-xl p-3 mr-auto rounded-tl-none animate-pulse">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-muted-light dark:bg-muted-dark animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 rounded-full bg-muted-light dark:bg-muted-dark animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 rounded-full bg-muted-light dark:bg-muted-dark animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Suggested questions */}
          {messages.length < 3 && (
            <div className="p-3 border-t border-border-light dark:border-border-dark">
              <p className="text-xs text-muted-light dark:text-muted-dark mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "How much have I spent this month?",
                  "What's my budget status?",
                  "Show me recent transactions",
                  "Top spending categories"
                ].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputValue(question);
                      setTimeout(() => handleSubmit({ preventDefault: () => {} }), 100);
                    }}
                    className="text-xs py-1 px-2 rounded-full bg-background-light dark:bg-background-dark 
                      border border-border-light dark:border-border-dark hover:border-primary-500 
                      dark:hover:border-primary-400 transition-colors duration-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Chat input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-border-light dark:border-border-dark">
            <div className="flex items-center bg-background-light dark:bg-background-dark rounded-lg">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Ask a question..."
                className="flex-1 p-2 bg-transparent border-none focus:ring-0 text-sm text-foreground-light dark:text-foreground-dark"
              />
              <button 
                type="submit"
                className="p-2 text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 disabled:opacity-50"
                disabled={!inputValue.trim() || isTyping}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotAssistant;
