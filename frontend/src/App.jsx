import { useChat } from "./hooks/useChat";
import { MainLayout } from "./components/layout/MainLayout";

function App() {
  const {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    isTyping,
    sendMessage,
    uploadPDF,
    messagesEndRef,
  } = useChat();

  return (
    <MainLayout
      messages={messages}
      inputValue={inputValue}
      setInputValue={setInputValue}
      onSend={sendMessage}
      uploadPDF={uploadPDF}  // if you updated InputDock
      isLoading={isLoading}
      isTyping={isTyping}
      messagesEndRef={messagesEndRef}
    />
  );
}

export default App;