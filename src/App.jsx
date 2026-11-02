import { useState } from 'react';
import { sendChatMessage } from './api/chatApi';
import './App.css';

function App() {
  const [workTitle, setWorkTitle] = useState('어린 왕자');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState([]);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '안녕하세요! StoryDebate AI입니다. 작품에 관해 궁금한 점을 질문하거나 자유롭게 토론해 보세요.',
    },
  ]);

  const handleSend = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) return;

    const previousMessages = messages;

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: trimmedQuestion },
    ]);

    setQuestion('');
    setLoading(true);
    setSources([]);

    try {
      const history = previousMessages
        .filter((message) => message.role === 'user' ||
          message.role === 'assistant')
        .map((message) => ({
          role: message.role,
          content: message.content,
        }));

      const data = await sendChatMessage(
        trimmedQuestion,
        workTitle,
        history
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
        },
      ]);

      setSources(data.sources || []);
    } catch (error) {
      console.error('Chat API Error:', error);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '죄송합니다. AI 서버와 통신하는 중 오류가 발생했습니다. 백엔드 서버와 Ollama 실행 상태를 확인해 주세요.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">S</div>
          <span>StoryDebate <strong>AI</strong></span>
        </div>

        <nav className="header-menu">
          <span className="active">AI 토론</span>
          <span>프로젝트 소개</span>
        </nav>
      </header>

      <main className="main-container">
        <section className="intro">
          <span className="intro-label">AI LITERATURE DEBATE</span>
          <h1>작품 속 이야기를<br />새로운 시선으로 토론하다.</h1>
          <p>
            AI와 함께 문학 작품을 탐구하고
            다양한 관점에서 생각을 나눠보세요.
          </p>
        </section>

        <section className="chat-card">
          <div className="chat-header">
            <div>
              <h2>AI 토론 공간</h2>
              <p>작품을 선택하고 질문을 시작해 보세요.</p>
            </div>

            <span className="status">
              <span className="status-dot"></span>
              {loading ? 'AI 답변 생성 중...' : 'AI 준비 완료'}
            </span>
          </div>

          <div className="work-selector">
            <label htmlFor="work">토론할 작품</label>
            <select
              id="work"
              value={workTitle}
              onChange={(event) => setWorkTitle(event.target.value)}
              disabled={loading}
            >
              <option value="어린 왕자">어린 왕자</option>
              <option value="테스트 작품">테스트 작품</option>
            </select>
          </div>

          <div className="messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message-row ${message.role}`}
              >
                {message.role === 'assistant' && (
                  <div className="avatar">AI</div>
                )}

                <div className="message-content">
                  <span className="message-name">
                    {message.role === 'assistant'
                      ? 'StoryDebate AI'
                      : '나'}
                  </span>
                  <div className="message-bubble">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="loading-message">
                AI가 답변을 생성하고 있습니다...
              </div>
            )}
          </div>

          <div className="source-area">
            <span className="source-title">참고 자료</span>

            {sources.length === 0 ? (
              <div className="source-placeholder">
                AI 답변에 사용된 작품 자료가 여기에 표시됩니다.
              </div>
            ) : (
              <div className="source-list">
                {sources.map((source) => (
                  <div className="source-item" key={source.id}>
                    <strong>{source.sourceTitle || '작품 자료'}</strong>
                    <span>{source.section}</span>
                    <p>{source.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="input-area">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`${workTitle}에 관해 궁금한 점을 질문해 보세요.`}
              rows="2"
              disabled={loading}
            />

            <button
              className="send-button"
              onClick={handleSend}
              disabled={!question.trim() || loading}
            >
              {loading ? '생성 중...' : '전송 ↑'}
            </button>
          </div>

          <p className="input-guide">
            Enter를 누르면 전송됩니다. Shift + Enter로 줄을 바꿀 수 있습니다.
          </p>
        </section>

        <footer>
          StoryDebate AI © 2026. Literature meets AI.
        </footer>
      </main>
    </div>
  );
}

export default App;
