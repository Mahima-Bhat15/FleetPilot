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
  const [contactBill, setContactBill] = useState(null);
  const [reviewBillData, setReviewBillData] = useState(null);
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
    const bill = bills.find((item) => item.id === id);
    setBills(prev => prev.map(b => b.id === id ? { ...b, status: 'approved' } : b));
    if (onBillUpdate) onBillUpdate(id, { status: 'approved' });
    if (bill?.type === 'DVIR') {
      alert('✅ Approved\n\nDVIR archived and marked compliant.\n\n🤖 AI Actions:\n• Inspection record filed\n• Driver document linked\n• Maintenance note retained\n• Audit trail updated');
      return;
    }
    alert('✅ Approved\n\nInvoice generated and sent to broker.\n\n🤖 AI Actions:\n• Invoice created\n• Customer notified\n• Accounting updated\n• Receipt archived');
  };

  const reviewBill = (bill) => {
    setReviewBillData(bill);
  };

  const contactDriver = (bill) => {
    setContactBill(bill);
  };

  const pendingBills  = bills.filter(b => b.status === 'pending');
  const approvedBills = bills.filter(b => b.status === 'approved');

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)', padding: 12 }}>
      <Card>
        <CardHeader
          left={<CardTitle icon="💰" title="Billing & Document Automation" chip={<Chip label="AI Powered" variant="green" />} />}
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
          {pendingBills.map(bill => (
            <BillItem
              key={bill.id}
              bill={bill}
              onApprove={() => approveBill(bill.id)}
              onReview={() => reviewBill(bill)}
              onContactDriver={() => contactDriver(bill)}
            />
          ))}

          {approvedBills.length > 0 && (
            <>
              <Divider style={{ margin: '8px 0' }} />
              <SectionLabel label={`Approved / Invoiced (${approvedBills.length})`} />
              {approvedBills.map(bill => <BillItem key={bill.id} bill={bill} approved />)}
            </>
          )}
        </div>
      </Card>

      {contactBill && (
        <ContactDriverModal
          bill={contactBill}
          onClose={() => setContactBill(null)}
        />
      )}

      {reviewBillData && (
        <DocumentFolderModal
          bill={reviewBillData}
          onClose={() => setReviewBillData(null)}
        />
      )}
    </div>
  );
};

const BillItem = ({ bill, onApprove, onReview, onContactDriver, approved }) => (
  <div style={{
    background: approved ? 'var(--green-bg)' : 'var(--surface)',
    border: `1px solid ${approved ? 'var(--green-border)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 8,
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 3 }}>
      <div>
        <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{bill.id} · {bill.truck}</span>
      </div>
      <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>
        {typeof bill.amount === 'number' ? `$${bill.amount.toFixed(2)}` : bill.type}
      </span>
    </div>
    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{bill.driver}</div>
    <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 7 }}>{bill.type} · {bill.location} · {bill.date}</div>

    <div style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue-border)', borderRadius: 'var(--radius-sm)', padding: 7, marginBottom: 8 }}>
      <span style={{ fontSize: 10, color: 'var(--primary)', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>🤖 {bill.ocr}</span>
    </div>

    {!approved ? (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button onClick={onApprove} style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-md)', padding: '5px 11px', fontSize: 11, fontWeight: 600, color: 'var(--green-text)', cursor: 'pointer' }}>
          {bill.type === 'DVIR' ? '✓ Approve & Archive' : '✓ Approve & Invoice'}
        </button>
        <button onClick={onReview} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '5px 11px', fontSize: 11, fontWeight: 500, color: 'var(--text2)', cursor: 'pointer' }}>Review</button>
        <button onClick={onContactDriver} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '5px 11px', fontSize: 11, fontWeight: 500, color: 'var(--text2)', cursor: 'pointer' }}>Contact Driver</button>
      </div>
    ) : (
      <div style={{ alignSelf: 'flex-start', display: 'inline-block', background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-full)', padding: '3px 10px', fontSize: 11, color: 'var(--green-text)', fontWeight: 600 }}>
        {bill.type === 'DVIR' ? '✓ Archived' : '✓ Invoiced'}
      </div>
    )}
  </div>
);

const ContactDriverModal = ({ bill, onClose }) => {
  const phone = bill.contact?.phone || 'No phone on file';
  const email = bill.contact?.email || 'No email on file';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.48)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(560px, 100%)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, var(--blue-bg), var(--surface))' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>📞</span>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Driver Contact</div>
                <Chip label={bill.type} variant="blue" />
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                Reach out to confirm document details before archive or billing action.
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text2)',
                fontSize: 18,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Driver</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{bill.driver}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>{bill.truck} · {bill.location}</div>
            </div>
            <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-lg)', padding: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--green-text)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Document Status</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-text)', marginBottom: 4 }}>
                {bill.status === 'approved' ? 'Archived' : 'Pending Review'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>{bill.date}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
            <div style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue-border)', borderRadius: 'var(--radius-md)', padding: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--blue-text)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 4 }}>Phone</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{phone}</div>
            </div>
            <div style={{ background: 'var(--purple-bg)', border: '1px solid #ddd6fe', borderRadius: 'var(--radius-md)', padding: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 4 }}>Email</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{email}</div>
            </div>
          </div>

          <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', borderRadius: 'var(--radius-lg)', padding: 14, marginBottom: 18 }}>
            <div style={{ fontSize: 10, color: 'var(--amber-text)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Suggested Message</div>
            <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>
              Please review your {bill.type} from {bill.date}. Dispatch needs confirmation on the document details before final processing.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={onClose}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '9px 14px',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text2)',
              }}
            >
              Close
            </button>
            <a
              href={phone !== 'No phone on file' ? `tel:${phone.replace(/[^\d+]/g, '')}` : undefined}
              onClick={(e) => {
                if (phone === 'No phone on file') e.preventDefault();
              }}
              style={{
                textDecoration: 'none',
                background: 'var(--green-bg)',
                border: '1px solid var(--green-border)',
                borderRadius: 'var(--radius-md)',
                padding: '9px 14px',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--green-text)',
              }}
            >
              Call Driver
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const DocumentFolderModal = ({ bill, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.48)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: 'min(620px, 100%)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, var(--surface2), var(--blue-bg))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>📁</span>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Document Folder</div>
              <Chip label="documents" variant="purple" />
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>
              Review the stored file for this driver before final processing.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text2)',
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Folder Path</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>/documents</div>
        </div>

        <div style={{ border: '1px solid var(--blue-border)', background: 'var(--blue-bg)', borderRadius: 'var(--radius-lg)', padding: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{bill.fileName || 'Attached document'}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{bill.driver} · {bill.truck} · {bill.date}</div>
            </div>
            <Chip label={bill.type} variant="blue" />
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
            {bill.ocr}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginBottom: 18 }}>
          <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-md)', padding: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--green-text)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>Status</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-text)' }}>{bill.status === 'approved' ? 'Archived' : 'Pending Review'}</div>
          </div>
          <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', borderRadius: 'var(--radius-md)', padding: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--amber-text)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>Location</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{bill.location}</div>
          </div>
          <div style={{ background: 'var(--purple-bg)', border: '1px solid #ddd6fe', borderRadius: 'var(--radius-md)', padding: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>Driver</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{bill.driver}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '9px 14px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text2)',
            }}
          >
            Close
          </button>
          <a
            href={bill.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: 'none',
              background: 'var(--primary)',
              border: '1px solid var(--primary)',
              borderRadius: 'var(--radius-md)',
              padding: '9px 14px',
              fontSize: 12,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            Open PDF
          </a>
        </div>
      </div>
    </div>
  </div>
);
