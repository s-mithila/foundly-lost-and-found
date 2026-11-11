// client/src/components/StatusBadge.jsx
import React from 'react';
import { AlertCircle, CheckCircle2, Clock, Search, ShieldCheck } from 'lucide-react';

export function TypeBadge({ type }) {
  if (type === 'LOST') {
    return (
      <span className="badge badge-lost">
        <AlertCircle size={12} />
        Lost
      </span>
    );
  }
  return (
    <span className="badge badge-found">
      <CheckCircle2 size={12} />
      Found
    </span>
  );
}

export function StatusBadge({ status }) {
  switch (status) {
    case 'RETURNED':
      return (
        <span className="badge badge-returned">
          <ShieldCheck size={12} />
          Returned
        </span>
      );
    case 'HANDOVER_COMPLETED':
      return (
        <span className="badge badge-returned">
          <ShieldCheck size={12} />
          Handed Over
        </span>
      );
    case 'CLAIM_APPROVED':
      return (
        <span className="badge badge-found">
          <CheckCircle2 size={12} />
          Claim Approved
        </span>
      );
    case 'APPROVED':
      return (
        <span className="badge badge-found">
          <CheckCircle2 size={12} />
          Claim Approved
        </span>
      );
    case 'CLAIM_PENDING':
      return (
        <span className="badge badge-lost">
          <Clock size={12} />
          Claim Pending
        </span>
      );
    case 'PENDING':
      return (
        <span className="badge badge-lost">
          <Clock size={12} />
          Pending Review
        </span>
      );
    case 'REJECTED':
      return (
        <span className="badge" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>
          <AlertCircle size={12} />
          Rejected
        </span>
      );
    case 'MATCH_SUGGESTED':
      return (
        <span className="badge" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
          <Search size={12} />
          Match Found
        </span>
      );
    case 'REPORTED':
    default:
      return (
        <span className="badge" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
          <Clock size={12} />
          Open
        </span>
      );
  }
}

export function CustodyBadge({ custody }) {
  if (custody === 'CAMPUS_SECURITY_DESK') {
    return (
      <span className="badge badge-custody" title="Stored safely at Campus Security Desk">
        <ShieldCheck size={12} />
        Security Safe
      </span>
    );
  }
  if (custody === 'STUDENT_UNION_OFFICE') {
    return (
      <span className="badge badge-custody">
        Student Union
      </span>
    );
  }
  if (custody === 'RETURNED') {
    return (
      <span className="badge badge-returned">
        <ShieldCheck size={12} />
        Handed Over
      </span>
    );
  }
  return (
    <span className="badge badge-custody">
      With Finder
    </span>
  );
}
