'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const articles = {
  'KB-001': {
    id: 'KB-001',
    title: 'How to Connect to INSA VPN (Cisco AnyConnect)',
    category: 'Network & VPN',
    icon: '🌐',
    views: 214,
    helpful: 98,
    updatedAt: 'August 4, 2026',
    author: 'IT Network Team',
    problem: 'You cannot access internal INSA systems (ERP, file shares, intranet) while working remotely or off-premises.',
    cause: 'INSA internal systems are only accessible through the corporate VPN. Without an active VPN connection, remote devices cannot reach the private network.',
    steps: [
      { step: 1, title: 'Download Cisco AnyConnect', detail: 'Go to the IT portal at intranet.insa.gov.et/vpn or request the installer from IT helpdesk. Download the latest Cisco AnyConnect Secure Mobility Client.' },
      { step: 2, title: 'Install the client', detail: 'Run the installer as Administrator. Accept the default settings and complete the installation. Restart your computer if prompted.' },
      { step: 3, title: 'Launch AnyConnect', detail: 'Open Cisco AnyConnect from the Start menu or taskbar. Enter the VPN server address: vpn.insa.gov.et' },
      { step: 4, title: 'Enter your credentials', detail: 'Use your INSA Active Directory credentials (the same username and password you use to log in to your work computer). Click Connect.' },
      { step: 5, title: 'Verify connection', detail: 'The AnyConnect icon in your taskbar will show a padlock when connected. You should now be able to access internal systems.' },
    ],
    notes: [
      'Your AD password must not be expired. If it is, reset it first (see KB-002).',
      'VPN sessions automatically disconnect after 8 hours of idle time. Reconnect if needed.',
      'If you see "Authentication Failed", verify your username is in the format: firstname.lastname (not your email).',
    ],
    relatedArticles: ['KB-002', 'KB-003'],
  },
  'KB-002': {
    id: 'KB-002',
    title: 'Resetting Your Active Directory (AD) Password',
    category: 'Accounts & SSO',
    icon: '🔑',
    views: 189,
    helpful: 95,
    updatedAt: 'July 30, 2026',
    author: 'IT Security Team',
    problem: 'Your Windows login password has expired, you have forgotten it, or your account is locked after too many failed attempts.',
    cause: 'INSA AD passwords expire every 90 days per security policy. Accounts lock after 5 consecutive failed login attempts.',
    steps: [
      { step: 1, title: 'Check if account is locked', detail: 'If you see "Your account has been locked" on the Windows login screen, wait 15 minutes for automatic unlock, or contact IT helpdesk for immediate unlock.' },
      { step: 2, title: 'Use the self-service portal (if on-network)', detail: 'Navigate to password.insa.gov.et on any browser connected to the INSA network or VPN. Click "Forgot Password" and verify your identity with your registered mobile number.' },
      { step: 3, title: 'Change via Ctrl+Alt+Delete (if logged in)', detail: 'If you are currently logged in but your password is about to expire (Windows will warn you), press Ctrl+Alt+Delete → Change a password. Enter your current password, then your new password twice.' },
      { step: 4, title: 'Contact helpdesk for manual reset', detail: 'If you cannot access the self-service portal, submit a ticket here or call ext. 1500. IT will verify your identity and reset your password.' },
      { step: 5, title: 'Update saved passwords', detail: 'After resetting, update your password in Cisco AnyConnect, Outlook, and any other saved credential locations to avoid repeated lockouts.' },
    ],
    notes: [
      'New passwords must be at least 10 characters, include uppercase, lowercase, a number, and a symbol.',
      'You cannot reuse your last 5 passwords.',
      'Passwords expire every 90 days. You will receive a warning email 14 days before expiry.',
    ],
    relatedArticles: ['KB-001', 'KB-003'],
  },
  'KB-003': {
    id: 'KB-003',
    title: 'Setting Up Outlook Email on a New Device',
    category: 'Software & Email',
    icon: '📧',
    views: 143,
    helpful: 91,
    updatedAt: 'August 3, 2026',
    author: 'IT Helpdesk Team',
    problem: 'You have a new computer or phone and need to configure your INSA Microsoft 365 email account in Outlook.',
    cause: 'Microsoft 365 accounts require proper configuration with the correct server settings and MFA enrollment before email can be accessed on a new device.',
    steps: [
      { step: 1, title: 'Install Outlook', detail: 'On Windows: Outlook is included with Microsoft 365. Open Start → Microsoft Outlook. On mobile: download "Microsoft Outlook" from the App Store or Google Play.' },
      { step: 2, title: 'Add your account', detail: 'Open Outlook → File → Add Account (desktop) or tap the envelope icon → Add Account (mobile). Enter your full INSA email: firstname.lastname@insa.gov.et' },
      { step: 3, title: 'Authenticate', detail: 'Outlook will redirect to the Microsoft sign-in page. Enter your AD password. You will be prompted for Multi-Factor Authentication (MFA).' },
      { step: 4, title: 'Complete MFA setup', detail: 'If this is your first time, download the Microsoft Authenticator app on your phone. Scan the QR code shown on screen, then approve the sign-in request.' },
      { step: 5, title: 'Wait for sync', detail: 'Outlook will begin syncing your mailbox. This may take 5–15 minutes for the first sync depending on mailbox size.' },
    ],
    notes: [
      'SMTP Server: smtp.office365.com, Port: 587, TLS: Yes',
      'IMAP Server: outlook.office365.com, Port: 993, SSL: Yes',
      'MFA is mandatory. If you have not set it up, contact IT helpdesk first.',
    ],
    relatedArticles: ['KB-002', 'KB-008'],
  },
  'KB-004': {
    id: 'KB-004',
    title: 'Connecting to Office Printers on the Internal Network',
    category: 'Hardware & Devices',
    icon: '🖨️',
    views: 102,
    helpful: 87,
    updatedAt: 'August 1, 2026',
    author: 'IT Helpdesk Team',
    problem: 'You cannot print documents because your computer does not see the office printers, or the printer is showing as offline.',
    cause: 'Office printers are shared on the internal network. Your computer must be on the INSA network (or VPN) and have the correct printer drivers installed.',
    steps: [
      { step: 1, title: 'Make sure you are on the INSA network', detail: 'You must be connected to the office Wi-Fi (INSA-CORP) or wired LAN — or connected via VPN if remote. Printers are not accessible on the guest Wi-Fi.' },
      { step: 2, title: 'Open Printers & Scanners', detail: 'Go to Settings → Bluetooth & devices → Printers & scanners → Add device. Windows will search for available printers.' },
      { step: 3, title: 'Add the printer manually if not found', detail: 'Click "Add manually" → "Select a shared printer by name" → Enter the printer path, e.g. \\\\printserver.insa.gov.et\\Floor3-Canon. Click Next and install the driver.' },
      { step: 4, title: 'Install the driver if prompted', detail: 'Windows will attempt to download the driver automatically. If it fails, download the driver from the printer manufacturer\'s website (Canon: canon.com/support, HP: hp.com/support).' },
      { step: 5, title: 'Test print', detail: 'Right-click the printer → Printer properties → Print Test Page. If it prints successfully, your setup is complete.' },
    ],
    notes: [
      'Common printer IPs: Floor 1 (192.168.10.51), Floor 2 (192.168.10.52), Floor 3 (192.168.10.53).',
      'If the printer shows "Offline", right-click it → See what\'s printing → Printer → Uncheck "Use Printer Offline".',
      'For toner replacement or paper jams, contact the facilities team at ext. 1200.',
    ],
    relatedArticles: ['KB-005', 'KB-007'],
  },
  'KB-005': {
    id: 'KB-005',
    title: 'Request for New Hardware – Procedure Guide',
    category: 'Hardware & Devices',
    icon: '💻',
    views: 88,
    helpful: 82,
    updatedAt: 'July 28, 2026',
    author: 'IT Asset Management',
    problem: 'You need new IT equipment (laptop, monitor, keyboard, etc.) for yourself or your team and are not sure how to request it.',
    cause: 'Hardware procurement at INSA follows a formal approval process requiring department manager sign-off and IT asset team review before any equipment is issued.',
    steps: [
      { step: 1, title: 'Check if existing equipment can be repaired/repurposed', detail: 'Before requesting new hardware, check with IT if your current equipment can be repaired or upgraded. This is faster and more cost-effective.' },
      { step: 2, title: 'Get verbal approval from your department manager', detail: 'Discuss your hardware need with your direct manager. They will need to formally approve the request in the next step.' },
      { step: 3, title: 'Submit a helpdesk ticket', detail: 'Create a new ticket on this portal. Select Category: "Hardware & Devices" → Sub-category: "Hardware Request". Include: device type, justification, and urgency.' },
      { step: 4, title: 'Manager approval email', detail: 'Your department manager will receive an email to approve the request. The ticket will stay in "Pending Approval" status until they respond.' },
      { step: 5, title: 'IT procurement and delivery', detail: 'Once approved, IT Asset Management will check inventory. If in stock, delivery takes 1–3 business days. Procurement from supplier takes 5–10 business days.' },
    ],
    notes: [
      'Standard issue items (keyboard, mouse, monitor cable) are approved automatically for existing staff.',
      'Laptop requests require Director-level approval in addition to department manager.',
      'Include your asset tag (INSA-LT-XXX) if replacing existing equipment.',
    ],
    relatedArticles: ['KB-004', 'KB-007'],
  },
  'KB-006': {
    id: 'KB-006',
    title: 'ERP System Login Troubleshooting',
    category: 'Software & Email',
    icon: '⚙️',
    views: 76,
    helpful: 79,
    updatedAt: 'August 2, 2026',
    author: 'IT Applications Team',
    problem: 'You cannot log in to the INSA ERP system, see a "Session Expired" error, or the page loads blank after login.',
    cause: 'ERP login issues are most commonly caused by expired AD passwords, browser cache conflicts, or session token expiry.',
    steps: [
      { step: 1, title: 'Verify your AD password is not expired', detail: 'The ERP uses your Active Directory credentials. If your Windows password has expired, reset it first (see KB-002), then try logging in again.' },
      { step: 2, title: 'Clear browser cache and cookies', detail: 'In Chrome: press Ctrl+Shift+Delete → Select "Cookies and other site data" + "Cached images and files" → Time range: All time → Click "Clear data". Then close and reopen the browser.' },
      { step: 3, title: 'Try a different browser', detail: 'The ERP is certified for Chrome 110+ and Edge 110+. If you are using Firefox or an older browser, switch to Chrome or Edge.' },
      { step: 4, title: 'Disable browser extensions', detail: 'Some ad-blockers and security extensions interfere with the ERP session. Open Chrome in Incognito mode (Ctrl+Shift+N) and try logging in. If it works, disable your extensions one by one.' },
      { step: 5, title: 'Check if ERP is under maintenance', detail: 'The ERP is scheduled for maintenance every Sunday 11 PM – 1 AM. Check the IT notice board or your email for maintenance announcements. If outside maintenance, submit a helpdesk ticket.' },
    ],
    notes: [
      'ERP URL: erp.insa.gov.et — only accessible on the INSA network or via VPN.',
      'If you see "Access Denied", your account may not have the required ERP role. Contact your department admin.',
      'ERP session timeout is 30 minutes of inactivity.',
    ],
    relatedArticles: ['KB-001', 'KB-002'],
  },
  'KB-007': {
    id: 'KB-007',
    title: 'Computer Running Slow – Quick Fixes',
    category: 'Hardware & Devices',
    icon: '🐢',
    views: 165,
    helpful: 88,
    updatedAt: 'August 3, 2026',
    author: 'IT Helpdesk Team',
    problem: 'Your computer is noticeably slower than usual — applications take long to open, the system freezes, or even typing feels sluggish.',
    cause: 'Slowness is commonly caused by too many startup programs, low disk space, malware, insufficient RAM, or Windows update processes running in the background.',
    steps: [
      { step: 1, title: 'Restart your computer first', detail: 'A simple restart clears temporary files and memory. Hold Shift while clicking Restart to do a full restart (not a fast-boot resume). Wait a few minutes after it starts before testing speed.' },
      { step: 2, title: 'Check what is using CPU and RAM', detail: 'Press Ctrl+Shift+Esc to open Task Manager. Click "CPU" to sort by highest usage. If a process is consistently using 90%+ CPU, note its name and report it to IT helpdesk.' },
      { step: 3, title: 'Disable startup programs', detail: 'In Task Manager → Startup tab. Right-click any program you don\'t need at startup and select "Disable". Focus on disabling things like OneDrive, Teams (if not needed at boot), and browser updaters.' },
      { step: 4, title: 'Free up disk space', detail: 'Open File Explorer → right-click C: drive → Properties → Disk Cleanup → check all boxes → Clean up system files. Also empty the Recycle Bin and delete downloads you no longer need.' },
      { step: 5, title: 'Run Windows Update', detail: 'Go to Settings → Windows Update → Check for updates. Pending updates sometimes cause slowness as they process in the background. Install all updates and restart.' },
    ],
    notes: [
      'INSA computers should have at least 15% free disk space. If below 10%, IT can help move data to network storage.',
      'Do not install personal software on INSA computers — this can introduce malware and degrade performance.',
      'If slowness persists after these steps, submit a ticket for IT to run diagnostics.',
    ],
    relatedArticles: ['KB-004', 'KB-005'],
  },
  'KB-008': {
    id: 'KB-008',
    title: 'Microsoft Teams: Audio & Video Not Working',
    category: 'Software & Email',
    icon: '🎙️',
    views: 130,
    helpful: 85,
    updatedAt: 'July 31, 2026',
    author: 'IT Helpdesk Team',
    problem: 'In Microsoft Teams meetings, other participants cannot hear you, your camera is not showing, or you cannot hear anyone else.',
    cause: 'Teams audio/video issues are most often caused by Windows privacy settings blocking microphone/camera access, wrong device selected in Teams, or outdated drivers.',
    steps: [
      { step: 1, title: 'Check Windows microphone/camera permissions', detail: 'Go to Settings → Privacy & security → Microphone. Make sure "Microphone access" is ON and "Microsoft Teams" is enabled in the app list. Do the same under "Camera".' },
      { step: 2, title: 'Select the correct device in Teams', detail: 'In a Teams meeting, click the three dots (...) → Device settings. Under "Audio devices", select your headset or microphone from the dropdown. Under "Camera", select your webcam. Test each with the "Test" button.' },
      { step: 3, title: 'Check physical connections', detail: 'If using a USB headset or external webcam: unplug and re-plug the device. Try a different USB port. Check that the headset mute button is not activated (look for a physical mute switch on the headset).' },
      { step: 4, title: 'Update or reinstall audio drivers', detail: 'Right-click Start → Device Manager → expand "Audio inputs and outputs". Right-click your microphone → "Update driver" → Search automatically. If that fails, right-click → "Uninstall device" → restart your PC (driver reinstalls on boot).' },
      { step: 5, title: 'Repair or reinstall Microsoft Teams', detail: 'Go to Settings → Apps → Microsoft Teams → Advanced options → Repair. If the issue persists, click "Reset". As a last resort, uninstall Teams completely and reinstall from teams.microsoft.com.' },
    ],
    notes: [
      'In Teams meetings, check the microphone icon in the meeting toolbar — make sure it is not crossed out (muted).',
      'Some conference room systems have a central mute button on the room controller panel.',
      'For best audio quality, use a wired USB headset rather than Bluetooth in important meetings.',
    ],
    relatedArticles: ['KB-003', 'KB-006'],
  },
};

const allArticles = Object.values(articles);

function RelatedCard({ id }) {
  const a = articles[id];
  if (!a) return null;
  return (
    <Link href={`/portal/knowledge-base/${id}`}>
      <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/30 transition cursor-pointer">
        <span className="text-xl">{a.icon}</span>
        <div>
          <p className="text-xs font-bold text-slate-800 leading-snug">{a.title}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{a.category}</p>
        </div>
      </div>
    </Link>
  );
}

export default function KnowledgeBaseArticlePage({ params }) {
  const { id } = params;
  const article = articles[id];
  const router = useRouter();
  const [feedback, setFeedback] = useState(null);

  if (!article) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">📭</div>
        <h2 className="text-lg font-bold text-slate-700">Article not found</h2>
        <p className="text-xs text-slate-400 mt-1">This article may have been moved or deleted.</p>
        <Link href="/portal/knowledge-base">
          <Button variant="outline" size="sm" className="mt-4">← Back to Knowledge Base</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/portal/knowledge-base"
          className="text-xs text-brand-600 hover:underline font-semibold inline-flex items-center gap-1"
        >
          ← Knowledge Base
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Card */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center text-2xl flex-shrink-0">
              {article.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold text-slate-400">{article.id}</span>
                <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                  {article.category}
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 leading-snug">{article.title}</h1>
              <p className="text-xs text-slate-400 mt-1">
                By {article.author} · Updated {article.updatedAt} · {article.views} views
              </p>
            </div>
          </div>

          {/* Problem */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
            <h2 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">🔴 Problem</h2>
            <p className="text-sm text-rose-900 leading-relaxed">{article.problem}</p>
          </div>

          {/* Cause */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
            <h2 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">🟡 Cause</h2>
            <p className="text-sm text-amber-900 leading-relaxed">{article.cause}</p>
          </div>

          {/* Solution Steps */}
          <div className="rounded-2xl border border-emerald-200 bg-white p-5">
            <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-4">✅ Solution — Step by Step</h2>
            <div className="space-y-4">
              {article.steps.map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {s.step}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{s.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {article.notes?.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">📌 Notes & Tips</h2>
              <ul className="space-y-2">
                {article.notes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span className="leading-relaxed">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Feedback */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
            <p className="text-sm font-semibold text-slate-700 mb-3">Was this article helpful?</p>
            {feedback ? (
              <p className="text-sm text-emerald-600 font-semibold">
                {feedback === 'yes' ? '👍 Thanks for your feedback!' : '👎 We\'ll work on improving this article.'}
              </p>
            ) : (
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setFeedback('yes')}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                >
                  👍 Yes, it helped
                </button>
                <button
                  onClick={() => setFeedback('no')}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 transition"
                >
                  👎 Not really
                </button>
              </div>
            )}
          </div>

          {/* Still stuck */}
          <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="text-sm font-semibold text-slate-700">Still not resolved?</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">Submit a ticket and an IT agent will help you directly.</p>
            <Button variant="primary" size="sm" onClick={() => router.push('/portal/new-ticket')}>
              Submit a Support Ticket →
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Quick Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Article Info</h3>
            {[
              { label: 'Article ID', value: article.id },
              { label: 'Category', value: article.category },
              { label: 'Author', value: article.author },
              { label: 'Last Updated', value: article.updatedAt },
              { label: 'Views', value: `${article.views} views` },
              { label: 'Helpfulness', value: `${article.helpful}% found helpful` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-xs font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Related Articles */}
          {article.relatedArticles?.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Related Articles</h3>
              <div className="space-y-2">
                {article.relatedArticles.map((rid) => (
                  <RelatedCard key={rid} id={rid} />
                ))}
              </div>
            </div>
          )}

          {/* Browse all */}
          <Link href="/portal/knowledge-base">
            <Button variant="outline" size="sm" className="w-full">
              ← Browse All Articles
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
