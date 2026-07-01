import { CheckCheck } from 'lucide-react';

export default function ImageBubble({ timestamp }) {
  return (
    <div className="flex justify-end w-full animate-slide-up">
      <div className="relative max-w-[85%] md:max-w-[65%] rounded-lg overflow-hidden shadow-md bg-user-bubble bubble-tail-right rounded-tr-none">
        {/* Mock Bank Statement Image */}
        <div className="m-1 rounded-lg overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">B</span>
                </div>
                <span className="text-white text-xs font-semibold">Digital Bank</span>
              </div>
              <span className="text-white/60 text-[10px]">Bank Statement</span>
            </div>
          </div>

          <div className="px-4 py-3 space-y-0">
            {/* Account info */}
            <div className="border-b border-gray-100 pb-2 mb-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Checking Account</p>
              <p className="text-xs text-gray-700 font-medium">Ag: 0001 · CC: ****4523</p>
            </div>

            {/* Statement header */}
            <div className="flex items-center justify-between text-[9px] text-gray-400 uppercase tracking-wider mb-2">
              <span>Date</span>
              <span>Description</span>
              <span>Value</span>
            </div>

            {/* Entries */}
            {[
              { date: '12/05', desc: 'PIX Received', value: '+R$ 200,00', positive: true },
              { date: '12/05', desc: 'Haircut', value: '-R$ 50,00', positive: false },
              { date: '13/05', desc: 'Bom Preço Market', value: '-R$ 80,00', positive: false, highlight: true },
              { date: '13/05', desc: 'PIX - Gas', value: '-R$ 25,00', positive: false },
            ].map((entry, i) => (
              <div
                key={i}
                className={`flex items-center justify-between py-1.5 text-xs border-b border-gray-50 ${
                  entry.highlight ? 'bg-yellow-50 -mx-2 px-2 rounded' : ''
                }`}
              >
                <span className="text-gray-400 w-12">{entry.date}</span>
                <span className="text-gray-700 flex-1 text-center">{entry.desc}</span>
                <span
                  className={`font-medium ${
                    entry.positive ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {entry.value}
                </span>
              </div>
            ))}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-200">
              <span className="text-[10px] text-gray-500">Previous balance</span>
              <span className="text-xs font-semibold text-gray-700">R$ 150,00</span>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center justify-end gap-1 px-3 py-1.5">
          <span className="text-[10px] text-text-muted">{timestamp}</span>
          <CheckCheck className="w-4 h-4 text-accent" />
        </div>
      </div>
    </div>
  );
}
