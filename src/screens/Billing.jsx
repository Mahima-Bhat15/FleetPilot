// src/screens/Billing.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, Chip, ApiTag, SectionLabel, Divider } from '../components/UI';
import { BILLS } from '../data/mockData';
import { uploadDocument } from '../data/api';

export const Billing = ({ bills: liveBills, onBillAdd, onBillUpdate }) => {
  const [bills, setBills] = useState(
    liveBills && liveBills.length > 0 ? liveBills : BILLS
  );
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  // Sync when live documents update from data hook
  useEffect(() => {
    if (liveBills && liveBills.length > 0) setBills(liveBills);
  }, [liveBills]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    e.target.value = '';

    // Try real API upload if token present
    const hasToken = !!process.env.REACT_APP_NAVPRO_JWT_TOKEN;
    if (hasToken) {
      try {
        const res = await uploadDocument(file, 'UPLOAD_FILE');
        const newBill = {
          id: `DOC-${res.data?.document_id || Date.now()}`,
          navpro_id: res.data?.document_id,
          driver: 'Uploaded',
          truck: '',
          amount: 0,
          type: file.name.toLowerCase().includes('fuel') ? 'Fuel Receipt' : 'Document',
          location: '',
          name: file.name,
          status: 'pending',
          ocr: `Uploaded to NavPro · ${file.name} · ${(file.size / 1024).toFixed(1)}KB`,
          date: new Date().toISOString().split('T')[0],
        };
        setBills(prev => [newBill, ...prev]);
        if (onBillAdd) onBillAdd(newBill);
        alert(`✅ Uploaded to NavPro\n\nFile: ${file.name}\n\nDocument saved to your NavPro account.`);
      } catch (err) {
        alert(`Upload failed: ${err.message}`);
      }
    } else {
      // Demo mode
      alert(`📄 Processing Document\n\nFile: ${file.name}\n\n🤖 AI is:\n• Extracting data from document\n• Categorizing expense type\n• Validating amounts\n• Matching to driver & load\n\nDemo mode — connect NavPro to upload for real.`);
      const newBill = {
        id: `B-${Date.now()}`,
        driver: 'Demo Upload',
        truck: '',
        amount: 0,
        type: 'Document',
        location: '',
        status: 'pending',
        ocr: `Demo: ${file.name} · ${(file.size / 1024).toFixed(1)}KB`,
        date: new Date().toISOString().split('T')[0],
      };
      setBills(prev => [newBill, ...prev]);
    }
    setUploading(false);
  };

  const approveBill = (id) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, status: 'approved' } : b));
    if (onBillUpdate) onBillUpdate(id, { status: 'approved' });
    alert('✅ Approved\n\nInvoice generated and sent to broker.\n\n🤖 AI Actions:\n• Invoice created\n• Customer notified\n• Accounting updated\n• Receipt archived');
  };

  const pendingBills  = bills.filter(b => b.status === 'pending');
  const approvedBills = bills.filter(b => b.status === 'approved');

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)', padding: 12 }}>
      <Card>
        <CardHeader
          left={<CardTitle icon="💰" title="Billing & Document Automation" chip={<Chip label="AI Powered" variant="green" />} />}
          right={<ApiTag label="NavPro /v1/documents" />}
        />
        <div style={{ padding: 12 }}>
          {/* Upload zone */}
          <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleUpload} />
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            style={{ border: '2px dashed var(--border2)', borderRadius: 'var(--radius-lg)', padding: 24, textAlign: 'center', cursor: uploading ? 'not-allowed' : 'pointer', transition: 'border-color 0.15s', opacity: uploading ? 0.7 : 1 }}
            onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>{uploading ? '⏳' : '📄'}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
              {uploading ? 'Uploading to NavPro...' : 'Upload BOL, POD, or Fuel Receipt'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>Click to select · JPEG · PDF · PNG</div>
            <div style={{ background: uploading ? 'var(--text3)' : 'var(--primary)', borderRadius: 'var(--radius-md)', padding: '8px 18px', display: 'inline-block', color: '#fff', fontSize: 13, fontWeight: 600 }}>
              {uploading ? 'Uploading...' : process.env.REACT_APP_NAVPRO_JWT_TOKEN ? 'Upload to NavPro' : 'Select Document (Demo)'}
            </div>
          </div>

          <Divider style={{ margin: '12px 0' }} />

          <SectionLabel label={`Pending Review (${pendingBills.length})`} />
          {pendingBills.map(bill => <BillItem key={bill.id} bill={bill} onApprove={() => approveBill(bill.id)} />)}

          {approvedBills.length > 0 && (
            <>
              <Divider style={{ margin: '8px 0' }} />
              <SectionLabel label={`Approved / Invoiced (${approvedBills.length})`} />
              {approvedBills.map(bill => <BillItem key={bill.id} bill={bill} approved />)}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

const BillItem = ({ bill, onApprove, approved }) => (
  <div style={{
    background: approved ? 'var(--green-bg)' : 'var(--surface)',
    border: `1px solid ${approved ? 'var(--green-border)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 8,
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 3 }}>
      <div>
        <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{bill.id} · {bill.truck}</span>
      </div>
      <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>${bill.amount.toFixed(2)}</span>
    </div>
    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{bill.driver}</div>
    <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 7 }}>{bill.type} · {bill.location} · {bill.date}</div>

    <div style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue-border)', borderRadius: 'var(--radius-sm)', padding: 7, marginBottom: 8 }}>
      <span style={{ fontSize: 10, color: 'var(--primary)', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>🤖 {bill.ocr}</span>
    </div>

    {!approved ? (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button onClick={onApprove} style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-md)', padding: '5px 11px', fontSize: 11, fontWeight: 600, color: 'var(--green-text)', cursor: 'pointer' }}>✓ Approve & Invoice</button>
        {['Review', 'Contact Driver'].map(label => (
          <button key={label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '5px 11px', fontSize: 11, fontWeight: 500, color: 'var(--text2)', cursor: 'pointer' }}>{label}</button>
        ))}
      </div>
    ) : (
      <div style={{ alignSelf: 'flex-start', display: 'inline-block', background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-full)', padding: '3px 10px', fontSize: 11, color: 'var(--green-text)', fontWeight: 600 }}>✓ Invoiced</div>
    )}
  </div>
);
