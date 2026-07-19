import type { FollowUpRecord } from '@/types';

interface FollowUpRecordItemProps {
  record: FollowUpRecord;
}

export function FollowUpRecordItem({ record }: FollowUpRecordItemProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow border border-slate-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="text-sm font-medium text-slate-700">{record.followUpTime}</span>
        <span className="ml-auto text-xs text-slate-400">#{record.recordNumber}</span>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed">{record.followUpContent}</p>
    </div>
  );
}
