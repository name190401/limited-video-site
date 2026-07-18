import SecurityGuard from '@/components/security/SecurityGuard';
import CaptureNotice from '@/components/security/CaptureNotice';

export const metadata = {
  title: 'QUALIA',
  description: 'QUALIA メンバー限定ページ',
};

/**
 * メンバーエリアのレイアウト。Layer1 通過は middleware が保証するため、
 * ここでは認証チェックを行わない（右クリック等の抑止のみ）。
 * 13 セクションのヘッダ／ハンバーガーは Phase 3 で実装。
 */
export default function MemberLayout({ children }) {
  return (
    <SecurityGuard>
      {children}
      <CaptureNotice />
    </SecurityGuard>
  );
}
