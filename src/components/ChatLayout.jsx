import Header from './Header';
import MessageFeed from './MessageFeed';
import InputBar from './InputBar';
import { useChat } from '../hooks/useChat';

export default function ChatLayout() {
  const {
    messages, balance, isThinking, thinkingSteps, isRecording, isTyping,
    expenses, income, scrollRef, historicalData,
    handleAudioInput, handleImageInput, handleTextInput, handleQuickReply, resetChat,
    canRecordAudio, canUploadImage, isInteractive,
  } = useChat();

  return (
    <div className="h-full w-full flex flex-col max-w-2xl mx-auto bg-chat-bg shadow-2xl">
      <Header balance={balance} onReset={resetChat} />
      <MessageFeed
        messages={messages}
        isThinking={isThinking}
        thinkingSteps={thinkingSteps}
        isTyping={isTyping}
        income={income}
        expenses={expenses}
        historicalData={historicalData}
        scrollRef={scrollRef}
        onQuickReply={handleQuickReply}
      />
      <InputBar
        onAudioInput={handleAudioInput}
        onImageInput={handleImageInput}
        onTextInput={handleTextInput}
        canRecordAudio={canRecordAudio}
        canUploadImage={canUploadImage}
        isRecording={isRecording}
        isThinking={isThinking}
        isTyping={isTyping}
        isInteractive={isInteractive}
      />
    </div>
  );
}
