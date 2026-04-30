import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Shield,
  AlertTriangle,
  FileText,
  Lightbulb,
  RefreshCw,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Mic,
  Paperclip,
  MoreVertical,
  Trash2,
  Download,
  Settings,
  Zap,
  Brain,
  Lock,
  Search,
  ChevronDown
} from 'lucide-react';
import './AIAssistant.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:8000';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hello! I read directly from alerts.xlsx in the backend. Ask me about critical alerts, active incidents, sources, targets, or status trends.",
      timestamp: new Date(Date.now() - 60000),
      suggestions: [
        "Summarize critical alerts",
        "Show top sources",
        "List recent alerts",
        "Explain alert status distribution"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedModel, setSelectedModel] = useState('threat-intel');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const models = [
    { id: 'threat-intel', name: 'Threat Intel AI', description: 'Real-time threat intelligence', icon: Brain },
    { id: 'incident-response', name: 'IR Assistant', description: 'Incident response guidance', icon: Zap }
  ];

  const quickActions = [
    { icon: AlertTriangle, label: 'Threat Analysis', prompt: 'Analyze the current threat landscape and identify any emerging risks' },
    { icon: Shield, label: 'Security Audit', prompt: 'Perform a security audit and provide recommendations' },
    { icon: FileText, label: 'Generate Report', prompt: 'Generate a comprehensive security status report' },
    { icon: Lightbulb, label: 'Best Practices', prompt: 'What are the best security practices I should implement?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageOverride = inputValue) => {
    const userText = String(messageOverride ?? '').trim();
    if (!userText) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: userText,
      timestamp: new Date()
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.type === 'user' ? 'user' : 'assistant',
            content: message.content
          }))
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load assistant response');
      }

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: data.reply || data.message || 'No response was returned by the backend.',
        timestamp: new Date(),
        suggestions: data.suggestions || []
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'assistant',
        content: `I could not reach the backend assistant: ${error.message}`,
        timestamp: new Date(),
        suggestions: ['Try again', 'Summarize critical alerts', 'Show top sources', 'List recent alerts']
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleQuickAction = (prompt) => {
    handleSend(prompt);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      type: 'assistant',
      content: "Chat cleared. How can I assist you with your security needs?",
      timestamp: new Date(),
      suggestions: [
        "Analyze recent threats",
        "Check vulnerabilities",
        "Generate report",
        "Security recommendations"
      ]
    }]);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message) => {
    // Simple markdown-like rendering
    let content = message.content;
    
    // Bold
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Code blocks
    content = content.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    // Inline code
    content = content.replace(/`(.*?)`/g, '<code>$1</code>');
    // Line breaks
    content = content.replace(/\n/g, '<br/>');
    
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };

  return (
    <div className="ai-assistant-page">
      <div className="ai-header">
        <div className="ai-header-left">
          <div className="ai-logo">
            <Bot size={24} />
            <Sparkles size={14} className="sparkle-icon" />
          </div>
          <div className="ai-header-info">
            <h1 className="ai-title">AI Security Assistant</h1>
            <p className="ai-subtitle">Powered by Advanced Threat Intelligence</p>
          </div>
        </div>
        <div className="ai-header-right">
          <div className="model-selector" onClick={() => setShowModelDropdown(!showModelDropdown)}>
            <Brain size={16} />
            <span>{models.find(m => m.id === selectedModel)?.name}</span>
            <ChevronDown size={14} className={showModelDropdown ? 'rotated' : ''} />
            {showModelDropdown && (
              <div className="model-dropdown">
                {models.map(model => (
                  <div 
                    key={model.id}
                    className={`model-option ${selectedModel === model.id ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedModel(model.id);
                      setShowModelDropdown(false);
                    }}
                  >
                    <model.icon size={18} />
                    <div className="model-info">
                      <span className="model-name">{model.name}</span>
                      <span className="model-desc">{model.description}</span>
                    </div>
                    {selectedModel === model.id && <Check size={16} />}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="header-btn" title="Clear Chat" onClick={clearChat}>
            <Trash2 size={18} />
          </button>
          <button className="header-btn" title="Settings">
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="ai-main-container">
        <div className="chat-container">
          <div className="messages-container">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                {message.type === 'assistant' && (
                  <div className="message-avatar">
                    <Bot size={20} />
                  </div>
                )}
                <div className="message-content">
                  <div className="message-bubble">
                    {renderMessage(message)}
                  </div>
                  {message.suggestions && (
                    <div className="message-suggestions">
                      {message.suggestions.map((suggestion, idx) => (
                        <button 
                          key={idx}
                          className="suggestion-chip"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="message-meta">
                    <span className="message-time">{formatTime(message.timestamp)}</span>
                    {message.type === 'assistant' && (
                      <div className="message-actions">
                        <button 
                          className="action-btn"
                          onClick={() => copyToClipboard(message.content, message.id)}
                          title="Copy"
                        >
                          {copiedId === message.id ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                        <button className="action-btn" title="Good response">
                          <ThumbsUp size={14} />
                        </button>
                        <button className="action-btn" title="Poor response">
                          <ThumbsDown size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {message.type === 'user' && (
                  <div className="message-avatar user">
                    <span>You</span>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="message assistant">
                <div className="message-avatar">
                  <Bot size={20} />
                </div>
                <div className="message-content">
                  <div className="message-bubble typing">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            <div className="input-wrapper">
              <button className="input-btn attach" title="Attach file">
                <Paperclip size={18} />
              </button>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about threats, vulnerabilities, or security recommendations..."
                rows={1}
              />
              <button className="input-btn mic" title="Voice input">
                <Mic size={18} />
              </button>
              <button 
                className={`send-btn ${inputValue.trim() ? 'active' : ''}`}
                onClick={handleSend}
                disabled={!inputValue.trim()}
              >
                <Send size={18} />
              </button>
            </div>
            <div className="input-hint">
              <Lock size={12} />
              <span>Your conversations are encrypted and secure</span>
            </div>
          </div>
        </div>

        <div className="ai-sidebar">
          <div className="quick-actions-card">
            <h3 className="sidebar-title">
              <Zap size={16} />
              Quick Actions
            </h3>
            <div className="quick-actions-grid">
              {quickActions.map((action, idx) => (
                <button 
                  key={idx}
                  className="quick-action-btn"
                  onClick={() => handleQuickAction(action.prompt)}
                >
                  <action.icon size={20} />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="capabilities-card">
            <h3 className="sidebar-title">
              <Sparkles size={16} />
              AI Capabilities
            </h3>
            <div className="capabilities-list">
              <div className="capability-item">
                <div className="capability-icon threat">
                  <AlertTriangle size={16} />
                </div>
                <div className="capability-info">
                  <span className="capability-name">Threat Detection</span>
                  <span className="capability-desc">Real-time threat analysis</span>
                </div>
              </div>
              <div className="capability-item">
                <div className="capability-icon vuln">
                  <Shield size={16} />
                </div>
                <div className="capability-info">
                  <span className="capability-name">Vuln Assessment</span>
                  <span className="capability-desc">CVE prioritization</span>
                </div>
              </div>
              <div className="capability-item">
                <div className="capability-icon report">
                  <FileText size={16} />
                </div>
                <div className="capability-info">
                  <span className="capability-name">Report Generation</span>
                  <span className="capability-desc">Automated reporting</span>
                </div>
              </div>
              <div className="capability-item">
                <div className="capability-icon insight">
                  <Brain size={16} />
                </div>
                <div className="capability-info">
                  <span className="capability-name">Smart Insights</span>
                  <span className="capability-desc">Predictive analysis</span>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <h3 className="sidebar-title">Session Stats</h3>
            <div className="ai-stats-grid">
              <div className="stat-item">
                <span className="stat-value">{messages.filter(m => m.type === 'user').length}</span>
                <span className="stat-label">Questions</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{messages.filter(m => m.type === 'assistant').length}</span>
                <span className="stat-label">Responses</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
