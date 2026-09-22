import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import EscalationBanner from '@/Components/EscalationBanner';

// ─── Palette dari desain ───────────────────────────────────────
const C = {
    brown:    '#6B3A10',   // coklat tua (sidebar header, dot)
    olive:    '#7A9A5A',   // hijau olive medium
    darkOlive:'#4A6128',   // hijau tua (sidebar bg, tombol aktif)
    cream:    '#F5ECD7',   // krem hangat (background chat)
    text:     '#2C1A0E',   // coklat sangat tua untuk teks
    muted:    '#8B7355',   // abu coklat untuk subtext
    inputBg:  '#E8DCC8',   // input background
    userBubble: '#4A6128',
    aiBubble:   '#E8DCC8',
};

const MODES = [
    {
        id: 'resilience',
        label: 'Resilience',
        sub: 'Imposter syndrome & kesehatan mental',
        icon: '🌱',
    },
    {
        id: 'productivity',
        label: 'Produktivitas',
        sub: 'Manajemen waktu & strategi belajar',
        icon: '📅',
    },
    {
        id: 'safety',
        label: 'Safety Mode',
        sub: 'Ruang aman & pelaporan bullying',
        icon: '🛡️',
    },
];

// ─── Komponen bubble chat ──────────────────────────────────────
function Bubble({ msg }) {
    const isUser = msg.role === 'user';
    return (
        <div style={{
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            marginBottom: '10px',
        }}>
            {!isUser && (
                <div style={{
                    width: 32, height: 32,
                    borderRadius: '50%',
                    background: C.darkOlive,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', flexShrink: 0, marginRight: '8px',
                    alignSelf: 'flex-end',
                }}>🤖</div>
            )}
            <div style={{
                maxWidth: '68%',
                background: isUser ? C.userBubble : C.aiBubble,
                color: isUser ? '#F5ECD7' : C.text,
                borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                padding: '10px 14px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
                {msg.content}
            </div>
            {isUser && (
                <div style={{
                    width: 32, height: 32,
                    borderRadius: '50%',
                    background: C.olive,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', flexShrink: 0, marginLeft: '8px',
                    alignSelf: 'flex-end',
                }}>👤</div>
            )}
        </div>
    );
}

// ─── Komponen utama ────────────────────────────────────────────
export default function Chat({ mode: initialMode }) {
    const [activeMode, setActiveMode] = useState(initialMode || 'resilience');
    const [messages, setMessages]     = useState([]);
    const [input, setInput]           = useState('');
    const [loading, setLoading]       = useState(false);
    const [escalate, setEscalate]     = useState(false);
    const bottomRef = useRef(null);

    const currentMode = MODES.find(m => m.id === activeMode);

    // Scroll ke bawah setiap pesan baru
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Reset chat saat mode berubah
    const handleModeChange = (modeId) => {
        setActiveMode(modeId);
        setMessages([]);
        setEscalate(false);
        setInput('');
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: activeMode, message: userMsg.content }),
            });

            const data = await res.json();

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.message,
            }]);

            if (data.escalate) setEscalate(true);

        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Maaf, terjadi gangguan. Silakan coba lagi.',
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@600&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: ${C.brown}; }
                textarea:focus { outline: none; }
                textarea { resize: none; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: ${C.olive}; border-radius: 4px; }
            `}</style>

            <div style={{
                display: 'flex',
                height: '100vh',
                background: C.brown,
                padding: '16px',
                gap: '12px',
                fontFamily: "'DM Sans', sans-serif",
            }}>

                {/* ── Panel kiri: Mode selector ── */}
                <div style={{
                    width: '260px',
                    flexShrink: 0,
                    background: C.darkOlive,
                    borderRadius: '16px',
                    padding: '24px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                }}>
                    {/* Header */}
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{
                            fontFamily: "'Playfair Display', serif",
                            color: C.cream,
                            fontSize: '18px',
                            fontWeight: 600,
                            lineHeight: 1.3,
                            marginBottom: '4px',
                        }}>
                            Campus<br />Resilience Bot
                        </p>
                        <p style={{
                            color: C.olive,
                            fontSize: '11px',
                            letterSpacing: '0.02em',
                        }}>
                            Pilih mode bantuan
                        </p>
                    </div>

                    {/* Mode buttons */}
                    {MODES.map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => handleModeChange(mode.id)}
                            style={{
                                background: activeMode === mode.id ? C.cream : 'rgba(245,236,215,0.08)',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '12px 14px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                            }}
                        >
                            <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>
                                {mode.icon}
                            </span>
                            <div>
                                <p style={{
                                    color: activeMode === mode.id ? C.text : C.cream,
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    marginBottom: '2px',
                                }}>
                                    {mode.label}
                                </p>
                                <p style={{
                                    color: activeMode === mode.id ? C.muted : 'rgba(245,236,215,0.55)',
                                    fontSize: '11px',
                                    lineHeight: 1.4,
                                }}>
                                    {mode.sub}
                                </p>
                            </div>
                        </button>
                    ))}

                    {/* Spacer + footer */}
                    <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                        <div style={{
                            width: '8px', height: '8px',
                            borderRadius: '50%',
                            background: C.brown,
                            marginLeft: 'auto',
                        }} />
                    </div>
                </div>

                {/* ── Panel kanan: Area chat ── */}
                <div style={{
                    flex: 1,
                    background: C.cream,
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}>
                    {/* Chat header */}
                    <div style={{
                        padding: '18px 24px 14px',
                        borderBottom: `1px solid ${C.inputBg}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                    }}>
                        <span style={{ fontSize: '20px' }}>{currentMode?.icon}</span>
                        <div>
                            <p style={{
                                fontFamily: "'Playfair Display', serif",
                                color: C.text,
                                fontSize: '15px',
                                fontWeight: 600,
                            }}>
                                {currentMode?.label}
                            </p>
                            <p style={{ color: C.muted, fontSize: '11px' }}>
                                {currentMode?.sub}
                            </p>
                        </div>
                        <div style={{
                            marginLeft: 'auto',
                            width: '8px', height: '8px',
                            borderRadius: '50%',
                            background: C.brown,
                        }} />
                    </div>

                    {/* Area messages */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '20px 24px',
                    }}>
                        {/* Escalation banner */}
                        {escalate && <EscalationBanner mode={activeMode} />}

                        {/* Empty state */}
                        {messages.length === 0 && !loading && (
                            <div style={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                opacity: 0.45,
                            }}>
                                <span style={{ fontSize: '36px' }}>{currentMode?.icon}</span>
                                <p style={{
                                    color: C.muted,
                                    fontSize: '13px',
                                    textAlign: 'center',
                                    maxWidth: '200px',
                                    lineHeight: 1.5,
                                }}>
                                    Ceritakan apa yang sedang kamu rasakan atau butuhkan
                                </p>
                            </div>
                        )}

                        {/* Pesan */}
                        {messages.map((msg, i) => (
                            <Bubble key={i} msg={msg} />
                        ))}

                        {/* Loading indicator */}
                        {loading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <div style={{
                                    width: 32, height: 32,
                                    borderRadius: '50%',
                                    background: C.darkOlive,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '14px',
                                }}>🤖</div>
                                <div style={{
                                    background: C.aiBubble,
                                    borderRadius: '16px 16px 16px 4px',
                                    padding: '12px 16px',
                                    display: 'flex', gap: '4px', alignItems: 'center',
                                }}>
                                    {[0, 1, 2].map(i => (
                                        <div key={i} style={{
                                            width: 6, height: 6,
                                            borderRadius: '50%',
                                            background: C.muted,
                                            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                                        }} />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* Input area */}
                    <div style={{
                        padding: '14px 20px',
                        borderTop: `1px solid ${C.inputBg}`,
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'flex-end',
                    }}>
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Masukkan teks..."
                            rows={1}
                            style={{
                                flex: 1,
                                background: C.inputBg,
                                border: 'none',
                                borderRadius: '20px',
                                padding: '10px 16px',
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: '13px',
                                color: C.text,
                                lineHeight: '1.5',
                                maxHeight: '100px',
                                overflowY: 'auto',
                            }}
                            onInput={e => {
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                            }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            style={{
                                width: 38, height: 38,
                                borderRadius: '50%',
                                background: loading || !input.trim() ? C.olive + '80' : C.darkOlive,
                                border: 'none',
                                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'background 0.15s ease',
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M22 2L11 13" stroke="#F5ECD7" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#F5ECD7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Animasi loading dots */}
            <style>{`
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-5px); }
                }
            `}</style>
        </>
    );
}