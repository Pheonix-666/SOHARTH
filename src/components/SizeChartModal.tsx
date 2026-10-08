'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSize?: string;
  onSelectSize?: (size: string) => void;
  productName?: string;
}

interface MeasurementRow {
  size: string;
  chest: { in: number; cm: number };
  shoulder: { in: number; cm: number };
  sleeve: { in: number; cm: number };
  length: { in: number; cm: number };
}

const MEASUREMENTS: MeasurementRow[] = [
  { size: 'S', chest: { in: 38, cm: 96.5 }, shoulder: { in: 17.0, cm: 43.2 }, sleeve: { in: 8.0, cm: 20.3 }, length: { in: 26.0, cm: 66.0 } },
  { size: 'M', chest: { in: 40, cm: 101.6 }, shoulder: { in: 18.0, cm: 45.7 }, sleeve: { in: 8.5, cm: 21.6 }, length: { in: 27.0, cm: 68.6 } },
  { size: 'L', chest: { in: 42, cm: 106.7 }, shoulder: { in: 19.0, cm: 48.3 }, sleeve: { in: 9.0, cm: 22.9 }, length: { in: 28.0, cm: 71.1 } },
  { size: 'XL', chest: { in: 44, cm: 111.8 }, shoulder: { in: 20.0, cm: 50.8 }, sleeve: { in: 9.5, cm: 24.1 }, length: { in: 29.0, cm: 73.7 } },
  { size: 'XXL', chest: { in: 46, cm: 116.8 }, shoulder: { in: 21.0, cm: 53.3 }, sleeve: { in: 10.0, cm: 25.4 }, length: { in: 30.0, cm: 76.2 } },
];

export default function SizeChartModal({
  isOpen,
  onClose,
  selectedSize,
  onSelectSize,
  productName,
}: SizeChartModalProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'table'>('image');
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  // Prevent background scrolling when modal is open and handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-chart-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          backgroundColor: '#0d0d0e',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '18px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: '#ffffff',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 100%)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#fde047' }}>
                straighten
              </span>
              <h2
                id="size-chart-title"
                className="font-label-caps"
                style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.15em', margin: 0 }}
              >
                SIZE & FIT GUIDE
              </h2>
            </div>
            {productName && (
              <p style={{ margin: '2px 0 0 28px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                {productName}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close size chart"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Navigation Tabs & Unit Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          {/* Tab Switcher */}
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '10px' }}>
            <button
              onClick={() => setActiveTab('image')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                backgroundColor: activeTab === 'image' ? '#ffffff' : 'transparent',
                color: activeTab === 'image' ? '#000000' : 'rgba(255, 255, 255, 0.7)',
                transition: 'all 0.2s',
              }}
            >
              SIZE CHART IMAGE
            </button>
            <button
              onClick={() => setActiveTab('table')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                backgroundColor: activeTab === 'table' ? '#ffffff' : 'transparent',
                color: activeTab === 'table' ? '#000000' : 'rgba(255, 255, 255, 0.7)',
                transition: 'all 0.2s',
              }}
            >
              MEASUREMENT TABLE
            </button>
          </div>

          {/* Unit Switcher (only for table) */}
          {activeTab === 'table' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Unit:</span>
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '2px' }}>
                <button
                  onClick={() => setUnit('in')}
                  style={{
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: unit === 'in' ? 'var(--primary, #ffffff)' : 'transparent',
                    color: unit === 'in' ? '#000000' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  IN
                </button>
                <button
                  onClick={() => setUnit('cm')}
                  style={{
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: unit === 'cm' ? 'var(--primary, #ffffff)' : 'transparent',
                    color: unit === 'cm' ? '#000000' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  CM
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 170px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
          className="hide-scrollbar"
        >
          {activeTab === 'image' ? (
            /* Visual Image View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/10',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <Image
                  src="/sizr chart.jpeg"
                  alt="Soharth Official Size Chart"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  textAlign: 'center',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#fde047' }}>
                  info
                </span>
                <span>All measurements are in inches. Measurements may vary by ±0.5 inches.</span>
              </div>
            </div>
          ) : (
            /* Structured Interactive Table */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}>
                      <th style={{ padding: '12px 10px', fontWeight: 800, letterSpacing: '0.05em' }}>SIZE</th>
                      <th style={{ padding: '12px 10px', fontWeight: 800, letterSpacing: '0.05em' }}>CHEST ({unit.toUpperCase()})</th>
                      <th style={{ padding: '12px 10px', fontWeight: 800, letterSpacing: '0.05em' }}>SHOULDER ({unit.toUpperCase()})</th>
                      <th style={{ padding: '12px 10px', fontWeight: 800, letterSpacing: '0.05em' }}>SLEEVE ({unit.toUpperCase()})</th>
                      <th style={{ padding: '12px 10px', fontWeight: 800, letterSpacing: '0.05em' }}>LENGTH ({unit.toUpperCase()})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MEASUREMENTS.map((row, idx) => {
                      const isSelected = selectedSize === row.size;
                      return (
                        <tr
                          key={row.size}
                          onClick={() => onSelectSize?.(row.size)}
                          style={{
                            backgroundColor: isSelected
                              ? 'rgba(253, 224, 71, 0.12)'
                              : idx % 2 === 0
                              ? 'rgba(255, 255, 255, 0.02)'
                              : 'transparent',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                            cursor: onSelectSize ? 'pointer' : 'default',
                            transition: 'background 0.2s',
                          }}
                        >
                          <td style={{ padding: '12px 10px', fontWeight: 800, color: isSelected ? '#fde047' : '#ffffff' }}>
                            {row.size}
                            {isSelected && <span style={{ marginLeft: '4px', fontSize: '10px' }}>✓</span>}
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            {unit === 'in' ? `${row.chest.in}"` : `${row.chest.cm} cm`}
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            {unit === 'in' ? `${row.shoulder.in}"` : `${row.shoulder.cm} cm`}
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            {unit === 'in' ? `${row.sleeve.in}"` : `${row.sleeve.cm} cm`}
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            {unit === 'in' ? `${row.length.in}"` : `${row.length.cm} cm`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* How to Measure Card */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <span className="font-label-caps" style={{ fontSize: '11px', fontWeight: 800, color: '#fde047', letterSpacing: '0.1em' }}>
                  HOW TO MEASURE
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem', fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                  <div>• <strong>Chest:</strong> Measure around the fullest part of the chest, keeping tape horizontal.</div>
                  <div>• <strong>Length:</strong> Measure from high point of shoulder to bottom hem.</div>
                  <div>• <strong>Shoulder:</strong> Measure straight across the back from shoulder point to shoulder point.</div>
                  <div>• <strong>Sleeve:</strong> Measure from shoulder seam down to sleeve hem.</div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Size Selection buttons if interactive */}
          {onSelectSize && (
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>
                SELECT YOUR SIZE:
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      onSelectSize(s);
                      onClose();
                    }}
                    style={{
                      minWidth: '40px',
                      height: '36px',
                      borderRadius: '8px',
                      border: selectedSize === s ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                      backgroundColor: selectedSize === s ? '#ffffff' : 'rgba(255,255,255,0.06)',
                      color: selectedSize === s ? '#000000' : '#ffffff',
                      fontWeight: 800,
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
