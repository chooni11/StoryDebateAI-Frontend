import { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from './api/chatApi';
import './App.css';

const WELCOME_MESSAGE =
  '안녕하세요! StoryDebate AI입니다. 작품에 관해 궁금한 점을 질문하거나 자유롭게 토론해 보세요.';

function App() {
  const [workTitle, setWorkTitle] = useState('어린 왕자');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: WELCOME_MESSAGE,
      type: 'normal',
      sources: [],
    },
  ]);

  // 자동 스크롤을 위한 참조
  const messagesEndRef = useRef(null);

  // 메시지가 추가되거나 로딩 상태가 변경되면 아래로 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, loading]);

  // 새 대화 시작
  const handleNewChat = () => {
    if (loading) return;

    setMessages([
      {
        role: 'assistant',
        content: WELCOME_MESSAGE,
        type: 'normal',
        sources: [],
      },
    ]);

    setQuestion('');
  };

  // 질문 전송
  const handleSend = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) return;

    // 현재까지의 대화 기록 추출
    const history = messages
      .filter(
        (message) =>
          (message.role === 'user' ||
            message.role === 'assistant') &&
          message.type !== 'warning' &&
          message.content !== WELCOME_MESSAGE
      )
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    // 사용자 질문 화면에 추가
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: trimmedQuestion,
        type: 'normal',
        sources: [],
      },
    ]);

    setQuestion('');
    setLoading(true);

    try {
      // 질문과 이전 대화 기록을 백엔드에 전달
      const data = await sendChatMessage(
        trimmedQuestion,
        workTitle,
        history
      );

      // 작품 불일치 여부 확인
      const isWorkMismatch = data?.workMismatch === true;

      // AI 답변과 해당 답변의 참고 자료를 함께 저장
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            data?.answer ||
            '죄송합니다. AI 답변을 가져오지 못했습니다.',
          type: isWorkMismatch ? 'warning' : 'normal',

          // 답변별 참고 자료 저장
          sources: isWorkMismatch
            ? []
            : Array.isArray(data?.sources)
              ? data.sources
              : [],
        },
      ]);
    } catch (error) {
      console.error('Chat API Error:', error);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '죄송합니다. AI 서버와 통신하는 중 오류가 발생했습니다. 백엔드 서버와 Ollama 실행 상태를 확인해 주세요.',
          type: 'normal',
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Enter 키로 질문 전송
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  // 작품 변경
  const handleWorkChange = (event) => {
    if (loading) return;

    const selectedWork = event.target.value;

    setWorkTitle(selectedWork);
    setQuestion('');

    // 이전 작품의 대화 기록 초기화
    setMessages([
      {
        role: 'assistant',
        content: `${selectedWork}에 대한 새로운 토론을 시작해 보세요.`,
        type: 'normal',
        sources: [],
      },
    ]);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">S</div>
          <span>
            StoryDebate <strong>AI</strong>
          </span>
        </div>

        <nav className="header-menu">
          <span className="active">AI 토론</span>
          <span>프로젝트 소개</span>
        </nav>
      </header>

      <main className="main-container">
        <section className="intro">
          <span className="intro-label">
            AI LITERATURE DEBATE
          </span>

          <h1>
            작품 속 이야기를
            <br />
            새로운 시선으로 토론하다.
          </h1>

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

            <div className="chat-header-actions">
              <button
                className="new-chat-button"
                onClick={handleNewChat}
                disabled={loading}
              >
                + 새 대화
              </button>

              <span className="status">
                <span className="status-dot"></span>
                {loading
                  ? 'AI 답변 생성 중...'
                  : 'AI 준비 완료'}
              </span>
            </div>
          </div>

          <div className="work-selector">
            <label htmlFor="work">토론할 작품</label>

            <select
              id="work"
              value={workTitle}
              onChange={handleWorkChange}
              disabled={loading}
            >
              <option value="어린 왕자">어린 왕자</option>
              <option value="흥부와 놀부">흥부와 놀부</option>
              <option value="테스트 작품">테스트 작품</option>
            </select>
          </div>

          <div className="messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message-row ${message.role} ${
                  message.type === 'warning'
                    ? 'warning-message-row'
                    : ''
                }`}
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

                  <div
                    className={`message-bubble ${
                      message.type === 'warning'
                        ? 'warning-bubble'
                        : ''
                    }`}
                  >
                    {message.content}
                  </div>

                  {/* 해당 AI 답변의 참고 자료 */}
                  {message.role === 'assistant' &&
                    message.sources?.length > 0 && (
                      <div className="source-area">
                        <span className="source-title">
                          참고 자료
                        </span>

                        <div className="source-list">
                          {message.sources.map(
                            (source, sourceIndex) => (
                              <div
                                className="source-item"
                                key={
                                  source.id ??
                                  `${source.sourceTitle}-${sourceIndex}`
                                }
                              >
                                <strong>
                                  {source.sourceTitle ||
                                    '작품 자료'}
                                </strong>

                                {source.section && (
                                  <span>{source.section}</span>
                                )}

                                {source.content && (
                                  <p>{source.content}</p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="loading-message">
                AI가 답변을 생성하고 있습니다...
              </div>
            )}

            {/* 자동 스크롤 기준점 */}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
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