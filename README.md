.detail-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 48px;
  align-items: start;
}

.detail-media {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--line);
}
.detail-media img { width: 100%; display: block; aspect-ratio: 4/3; object-fit: cover; }
.detail-stamp {
  position: absolute;
  top: 16px; right: 16px;
  background: rgba(255,254,251,0.92);
}

.detail-title { margin-bottom: 10px; }
.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 0.8rem;
  color: var(--muted);
  margin-bottom: 20px;
}
.detail-meta span {
  border: 1px solid var(--line);
  border-radius: 2px;
  padding: 4px 8px;
  text-transform: capitalize;
}
.detail-desc { color: var(--muted); max-width: 52ch; }

.booking-panel { padding: 22px; margin-top: 24px; }
.booking-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 18px;
}
.booking-price .mono { font-size: 1.6rem; font-weight: 600; color: var(--accent); }
.booking-price-unit { color: var(--muted); font-size: 0.85rem; }
.booking-calc { margin: -4px 0 16px; }
.booking-success strong {
  display: block;
  font-family: var(--font-display);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.booking-success p { color: var(--muted); margin-bottom: 16px; }

@media (max-width: 860px) {
  .detail-grid { grid-template-columns: 1fr; }
}

.rate-card {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f7f5ef;
  border: 1px dashed rgba(0,0,0,0.15);
  border-radius: 6px;
}
.rate-cell { display: flex; flex-direction: column; align-items: center; padding: 8px 4px; }
.rate-cell-primary { background: #111; color: #fff; border-radius: 4px; }
.rate-cell-primary .rate-label { color: #ccc; }
.rate-value { font-size: 1.05rem; font-weight: 700; }
.rate-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: #666; margin-top: 2px; }