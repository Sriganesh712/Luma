import { useChat } from './hooks/useChat';
import { MainLayout } from './components/layout/MainLayout';

function App() {
  const { messages, inputValue, setInputValue, isLoading, isTyping, sendMessage, messagesEndRef } = useChat();

  const handleNavClick = (itemId) => {
    console.log('Navigation clicked:', itemId);
  };

  return (
    <MainLayout
      messages={messages}
      inputValue={inputValue}
      setInputValue={setInputValue}
      onSend={sendMessage}
      isLoading={isLoading}
      isTyping={isTyping}
      messagesEndRef={messagesEndRef}
      onNavClick={handleNavClick}
    />
  );
}

export default App;
