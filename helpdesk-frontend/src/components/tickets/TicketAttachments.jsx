'use client';

import React from 'react';
import { resolveAttachmentUrl } from '@/lib/api/tickets';

function isImageAttachment(attachment) {
  const type = attachment.fileType || '';
  const name = attachment.fileName || '';
  return type.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(name);
}

function displayFileType(attachment) {
  if (isImageAttachment(attachment)) return 'Image';
  if (attachment.fileType?.includes('pdf')) return 'PDF';
  if (attachment.fileType?.includes('word')) return 'Document';
  if (attachment.fileType?.startsWith('text/')) return 'Text file';
  return 'Attachment';
}

export function TicketAttachments({ attachments = [] }) {
  if (!attachments.length) return null;

  return (
    <div className="space-y-3">
      {attachments.map((attachment) => {
        const url = resolveAttachmentUrl(attachment.fileUrl);
        const image = isImageAttachment(attachment);

        return (
          <div key={attachment.id || attachment.fileUrl} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            {image && url ? (
              <a href={url} target="_blank" rel="noreferrer" className="block bg-slate-50">
                <img
                  src={url}
                  alt={attachment.fileName || 'Ticket attachment'}
                  className="h-56 w-full object-contain"
                />
              </a>
            ) : null}
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-800">{attachment.fileName || 'Attachment'}</p>
                <p className="text-[10px] font-semibold text-slate-400">{displayFileType(attachment)}</p>
              </div>
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                >
                  Open
                </a>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
