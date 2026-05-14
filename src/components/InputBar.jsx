import { useState, useRef } from 'react';
import { Mic, Paperclip, Send, Smile } from 'lucide-react';

export default function InputBar({
  onAudioInput, onImageInput, onTextInput,
  canRecordAudio, canUploadImage, isRecording, isThinking, isTyping, isInteractive,
}) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  const hasText = text.trim().length > 0;

  const handleSend = () => {
    if (hasText) {
      onTextInput(text);
      setText('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  let hintText = '';
  if (canRecordAudio) hintText = '💡 Clique no microfone para simular entrada de áudio';
  else if (canUploadImage) hintText = '💡 Clique no clipe para simular envio de imagem';
  else if (isInteractive) hintText = '💬 Pergunte qualquer coisa sobre suas finanças!';

  const busy = isThinking || isTyping;

  return (
    <div className="shrink-0 bg-panel-header border-t border-border">
      {hintText && !busy && !isRecording && (
        <div className="px-4 py-2 bg-accent/5 border-b border-accent/10 animate-fade-in">
          <p className="text-xs text-accent text-center">{hintText}</p>
        </div>
      )}
      {isRecording && (
        <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/20 flex items-center justify-center gap-2 animate-fade-in">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-recording" />
          <span className="text-sm text-red-400 font-medium">Gravando áudio...</span>
        </div>
      )}
      <div className="flex items-end gap-2 px-3 py-2">
        <button className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors shrink-0" title="Emojis" disabled>
          <Smile className="w-5 h-5" />
        </button>
        <button onClick={onImageInput} disabled={!canUploadImage || busy}
          className={`p-2 rounded-full transition-all shrink-0 ${canUploadImage && !busy ? 'text-accent hover:bg-accent/10 hover:scale-110 active:scale-95' : 'text-text-muted/40 cursor-not-allowed'}`}
          title="Enviar imagem" id="image-button">
          <Paperclip className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="bg-input-bg rounded-xl px-4 py-2.5 input-focus-ring transition-all">
            <input ref={inputRef} type="text" placeholder="Mensagem" value={text}
              onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown}
              disabled={busy}
              className="w-full bg-transparent text-sm text-text-primary placeholder-text-muted outline-none disabled:opacity-50" id="message-input" />
          </div>
        </div>
        {hasText ? (
          <button onClick={handleSend} disabled={busy}
            className="p-2.5 rounded-full bg-accent hover:bg-accent-light text-white shadow-lg hover:shadow-accent/30 transition-all hover:scale-105 active:scale-95 shrink-0 disabled:opacity-50" title="Enviar" id="send-button">
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={onAudioInput} disabled={!canRecordAudio || busy || isRecording}
            className={`p-2.5 rounded-full transition-all shrink-0 ${canRecordAudio && !busy && !isRecording ? 'bg-accent hover:bg-accent-light text-white shadow-lg hover:shadow-accent/30 hover:scale-105 active:scale-95' : isRecording ? 'bg-red-500 text-white animate-recording' : 'bg-input-bg text-text-muted/40 cursor-not-allowed'}`}
            title="Gravar áudio" id="audio-button">
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
