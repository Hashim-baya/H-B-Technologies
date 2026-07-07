'use client';
import Image from 'next/image';
import { useState, useCallback, type KeyboardEvent } from 'react';
import styles from './teamCard.module.css';

interface Props {
  member: {
    name: string;
    role: string;
    bio: string;
    photo?: string;
  };
}

export default function TeamCard({ member }: Props) {
  const [flipped, setFlipped] = useState(false);

  const flip   = useCallback(() => setFlipped(true),  []);
  const unflip = useCallback(() => setFlipped(false), []);
  const toggle = useCallback((e: React.MouseEvent) => {
    // Only toggle on click for touch devices (hover handles desktop)
    if (window.matchMedia('(hover: none)').matches) {
      e.preventDefault();
      setFlipped(f => !f);
    }
  }, []);

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setFlipped((value) => !value);
    }
  }, []);

  return (
    <div
      className={`${styles.outer} ${flipped ? styles.flipped : ''}`}
      onMouseEnter={flip}
      onMouseLeave={unflip}
      onClick={toggle}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={`${member.name} — ${member.role}`}
      onKeyDown={onKeyDown}
    >
      <div className={styles.inner}>

        {/* ── Front: full-cover photo + name bar ── */}
        <div className={styles.front}>
          <div className={styles.imgWrap}>
            {member.photo
              ? <Image src={member.photo} alt={member.name} className={styles.img} width={1200} height={900} sizes="(max-width: 768px) 100vw, 33vw" unoptimized />
              : <div className={styles.initial}>{member.name.charAt(0)}</div>}
          </div>
          <div className={styles.nameBar}>
            <span className={styles.name}>{member.name}</span>
            <span className={styles.role}>{member.role}</span>
          </div>
        </div>

        {/* ── Back: bio reveal ── */}
        <div className={styles.back}>
          <div className={styles.backInner}>
            <span className={styles.backName}>{member.name}</span>
            <span className={styles.backRole}>{member.role}</span>
            <p className={styles.bio}>{member.bio}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
