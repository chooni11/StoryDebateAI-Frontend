
import { useState } from 'react';
import './App.css';

function App() {
  const [workTitle, setWorkTitle] = useState('어린 왕자');
  const [question, setQuestion] = useState('');

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '안녕하세요! StoryDebate AI입니다. 작품에 관해 궁금한 점을 질문하거나 자유롭게 토론해 보세요.',
    },
  ]);

  const handleSend = () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: trimmedQuestion },
      {
        role: 'assistant',
        content:
          '질문을 확인했습니다. 현재는 화면 구현 단계입니다. 다음 단계에서 AI 서버와 연결하여 작품 자료를 바탕으로 답변하도록 만들겠습니다.',
      },
    ]);

    setQuestion('');
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
              AI 준비 완료
            </span>
          </div>

          <div className="work-selector">
            <label htmlFor="work">토론할 작품</label>
            <select
              id="work"
              value={workTitle}
              onChange={(event) => setWorkTitle(event.target.value)}
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
          </div>

          <div className="source-area">
            <span className="source-title">참고 자료</span>
            <div className="source-placeholder">
              AI 서버 연결 후 답변에 사용된 작품 자료가 표시됩니다.
            </div>
          </div>

          <div className="input-area">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`${workTitle}에 관해 궁금한 점을 질문해 보세요.`}
              rows="2"
            />

            <button
              className="send-button"
              onClick={handleSend}
              disabled={!question.trim()}
            >
              전송 ↑
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
