import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageHeaderCard from '../../components/PageHeaderCard';
import { useTheme } from '../../context/ThemeContext';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const EcoImpact = () => {
    const { colors } = useTheme();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchEcoImpact = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/detections/eco-impact`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                }
            } catch (err) {
                console.error('Failed to fetch eco impact:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEcoImpact();
    }, [API_URL]);

    const impactCards = data?.impact ? [
        {
            icon: '🌱',
            label: 'CO₂ Emissions Avoided',
            value: `${data.impact.co2_kg} kg`,
            color: '#10b981',
            bg: '#ecfdf5',
        },
        {
            icon: '🗑️',
            label: 'Landfill Waste Diverted',
            value: `${data.impact.landfill_kg} kg`,
            color: '#3b82f6',
            bg: '#eff6ff',
        },
        {
            icon: '💧',
            label: 'Water Conserved',
            value: `${data.impact.water_liters} L`,
            color: '#0ea5e9',
            bg: '#f0f9ff',
        },
        {
            icon: '🌳',
            label: 'Trees Equivalent Impact',
            value: data.impact.trees_equivalent,
            color: '#16a34a',
            bg: '#f0fdf4',
        },
    ] : [];

    // Top waste types
    const topWaste = data?.wasteSummary
        ? Object.entries(data.wasteSummary)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8)
            .map(([type, count]) => ({ type, count }))
        : [];

    const maxCount = topWaste.length > 0 ? topWaste[0].count : 1;

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
            <PageHeaderCard
                icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                }
                title="Eco Impact"
                description={data ? `Based on ${data.totalItems} items across ${data.totalScans} scans` : 'Calculating your environmental footprint...'}
            />

            {loading ? (
                <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 rounded-3xl skeleton-shimmer" style={{ background: 'var(--theme-card)' }} />
                    ))}
                </div>
            ) : !data || data.totalItems === 0 ? (
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    className="text-center py-16 rounded-3xl"
                    style={{ background: 'var(--theme-card)', border: '1px solid var(--theme-card-border)' }}
                >
                    <span className="text-5xl mb-4 block">🌍</span>
                    <p className="font-semibold text-lg" style={{ color: 'var(--theme-text)' }}>No impact data yet</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                        Start scanning waste to see your environmental impact!
                    </p>
                </motion.div>
            ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show">
                    {/* Impact Metrics Grid */}
                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                        {impactCards.map((card, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                className="rounded-3xl p-6 flex items-center gap-5"
                                style={{
                                    background: 'var(--theme-card)',
                                    border: '1px solid var(--theme-card-border)',
                                }}
                            >
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                                    style={{ background: card.bg }}
                                >
                                    {card.icon}
                                </div>
                                <div>
                                    <div className="text-2xl font-black tracking-tight" style={{ color: card.color }}>
                                        {card.value}
                                    </div>
                                    <div className="text-sm font-medium mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>
                                        {card.label}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* AI Insight */}
                    {data.aiInsight && (
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl p-6 mb-8 flex items-start gap-4"
                            style={{
                                background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(99,102,241,0.08) 100%)',
                                border: '1px solid rgba(124,58,237,0.15)',
                            }}
                        >
                            <span className="text-2xl mt-0.5">✨</span>
                            <div>
                                <h3 className="text-sm font-bold mb-1" style={{ color: '#7c3aed' }}>AI Environmental Insight</h3>
                                <p className="text-sm leading-relaxed" style={{ color: '#5b21b6' }}>
                                    {data.aiInsight}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Waste Breakdown */}
                    {topWaste.length > 0 && (
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl p-6"
                            style={{
                                background: 'var(--theme-card)',
                                border: '1px solid var(--theme-card-border)',
                            }}
                        >
                            <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--theme-text)' }}>
                                Waste Breakdown
                            </h3>
                            <div className="space-y-4">
                                {topWaste.map((item, i) => (
                                    <div key={item.type}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-semibold capitalize" style={{ color: 'var(--theme-text)' }}>
                                                {item.type.replace(/-/g, ' ')}
                                            </span>
                                            <span className="text-sm font-bold" style={{ color: 'var(--theme-accent)' }}>
                                                {item.count}
                                            </span>
                                        </div>
                                        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--theme-bg-alt)' }}>
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{ background: 'var(--theme-accent)' }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(item.count / maxCount) * 100}%` }}
                                                transition={{ duration: 0.6, delay: i * 0.05 }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Footer */}
                    <p className="text-center text-xs mt-6 font-medium" style={{ color: 'var(--theme-text-muted)' }}>
                        Impact calculated by AI based on proper waste sorting & disposal practices
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default EcoImpact;
