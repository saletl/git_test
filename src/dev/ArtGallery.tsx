import { useState } from 'react';
import type { CreatureArtist } from '../art/creature';
import { type Expression } from '../art/face';
import { pipArt } from '../art/pip';
import { waddlesArt } from '../art/waddles';
import { prickleArt } from '../art/prickle';
import { mochiArt } from '../art/mochi';
import { hamsterArt } from '../art/hamster';
import { Creature } from '../characters/Creature';

/** Development-only page for checking character art: open /?gallery */
const ARTISTS: Record<string, CreatureArtist> = { pip: pipArt, waddles: waddlesArt, prickle: prickleArt, mochi: mochiArt, hamster: hamsterArt };

export default function ArtGallery() {
  const [hug, setHug] = useState(false);
  return (
    <div style={{ padding: 12, background: '#fbf4e6', minHeight: '100vh', overflow: 'auto', position: 'fixed', inset: 0 }}>
      <label>
        <input type="checkbox" checked={hug} onChange={(e) => setHug(e.target.checked)} /> hug
      </label>
      {Object.entries(ARTISTS).map(([name, artist]) => (
        <div key={name}>
          <h2>{name}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(['happy','giggle','worried','surprised','crossEyed','squeeze','silly','calm'] as Expression[]).map((e: Expression) => (
              <figure key={e} style={{ margin: 0, width: 110, textAlign: 'center' }}>
                <div style={{ width: 110, height: 110 }}>
                  <Creature artist={artist} expression={e} props={{ hug, curl: hug && name === 'prickle', sock: hug ? 'eye' : 'head', scarves: hug ? 7 : 5 }} idle={false} />
                </div>
                <figcaption>{e}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
