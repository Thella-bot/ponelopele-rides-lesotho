import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRide } from '../../App';

const LANDMARKS = [
  { name: 'Pioneer Mall', w3w: '///filled.counts.roofs' },
  { name: 'Maseru Mall', w3w: '///palace.rainy.curve' },
  { name: 'Sefika Mall', w3w: '///cattle.shade.welcome' },
  { name: 'LNDC Centre', w3w: '///dusty.lamps.vague' },
  { name: 'Setsoto Stadium', w3w: '///bats.rainy.pens' },
  { name: 'Ha Thetsane Pick n Pay', w3w: '///rocks.silver.bread' },
  { name: 'Pitso Ground', w3w: '///chiefs.meat.drum' },
  { name: 'Maseru Border Post', w3w: '///border.flags.cross' },
];

export default function Destination() {
  const navigate = useNavigate();
  const { setDestinationData, pickupData } = useRide();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<{ name: string; w3w: string } | null>(null);

  useEffect(() => {
    // If pickupData is not set, redirect to pickup page
    if (!pickupData) {
      navigate('/pickup');
    }
  }, [pickupData, navigate]);

  const filtered = LANDMARKS.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  const choose = (landmark: { name: string; w3w: string }) => {
    setSelected(landmark);
    setSearch(landmark.name);
  };

  const next = () => {
    if (!selected && !search) return;
    setDestinationData(selected || { name: search, w3w: search });
    navigate('/confirm');
  };

  if (!pickupData) {
    return (
      <section className="redirect-section">
        <p>Pickup not set. Redirecting…</p>
        <button type="button" onClick={() => navigate('/pickup')} className="redirect-button">Go to Pickup</button>
      </section>
    );
  }

  return (
    <div className="destination-container">
      <h1 className="destination-title">Where are you going?</h1>

      <input
        type="text"
        placeholder="Search landmarks or type anything..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="destination-search-input"
        autoFocus
      />

      <div className="destination-landmarks-list">
        {filtered.map((l, i) => (
          <div
            key={i}
            onClick={() => choose(l)}
            className={`destination-landmark-item ${selected?.name === l.name ? 'selected' : ''}`}
          >
            <div className="destination-landmark-name">{l.name}</div>
            <div className="destination-landmark-w3w">{l.w3w}</div>
          </div>
        ))}
      </div>

      <button
        onClick={next}
        className="destination-continue-button"
      >
        Continue →
      </button>
    </div>
  );
}