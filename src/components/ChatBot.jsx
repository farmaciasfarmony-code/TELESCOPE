import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import './ChatBot.css';
import { generateAIResponse } from '../services/aiService';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "¡Hola! Soy Farmy 🤖. Pregúntame sobre salud, medicamentos o nuestros productos.", sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const { products } = useProducts();
    const { cartItems } = useCart();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userText = inputText;
        setInputText('');

        // Add user message
        const userMsg = { id: Date.now(), text: userText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        // Get Bot Response
        const botText = await generateAIResponse(userText, products, cartItems);

        setIsTyping(false);
        setMessages(prev => [...prev, { id: Date.now() + 1, text: botText, sender: 'bot' }]);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
            {!isOpen && (
                <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
                    <MessageCircle size={24} />
                    <span className="chatbot-label">Asistente Farmy</span>
                </button>
            )}

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-title">
                            <Bot size={24} />
                            <span>Farmy AI</span>
                        </div>
                        <button className="chatbot-close" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map(msg => (
                            <div key={msg.id} className={`message ${msg.sender}`}>
                                <div className="message-bubble">
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message bot">
                                <div className="message-bubble typing-bubble" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                    <span>Escribiendo...</span>
                                </div>
                            </div>
                        )}
                        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input-area">
                        <input
                            type="text"
                            placeholder="Pregunta algo..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isTyping}
                        />
                        <button onClick={handleSend} disabled={isTyping || !inputText.trim()}>
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
