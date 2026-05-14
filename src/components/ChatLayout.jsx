import Header from './Header';
import MessageFeed from './MessageFeed';
import InputBar from './InputBar';
import { useChat } from '../hooks/useChat';

export default function ChatLayout() {
  const {
    messages,
    balance,
    isThinking,
    thinkingSteps,
    isRecording,
    expenses,
    income,
    scrollRef,
    handleAudioInput,
    handleImageInput,
    handleTextInput,
    resetChat,
    canRecordAudio,
    canUploadImage,
    isComplete,
  } = useChat();

  return (
    <div className="h-full w-full flex flex-col max-w-2xl mx-auto bg-chat-bg shadow-2xl">
      <Header balance={balance} onReset={resetChat} />
      <MessageFeed
        messages={messages}
        isThinking={isThinking}
        thinkingSteps={thinkingSteps}
        income={income}
        expenses={expenses}
        scrollRef={scrollRef}
      />
      <InputBar
        onAudioInput={handleAudioInput}
        onImageInput={handleImageInput}
        onTextInput={handleTextInput}
        canRecordAudio={canRecordAudio}
        canUploadImage={canUploadImage}
        isRecording={isRecording}
        isThinking={isThinking}
        isComplete={isComplete}
      />
    </div>
  );
}
