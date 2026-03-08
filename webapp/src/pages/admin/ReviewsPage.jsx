import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const ReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Sorting and Filtering
    const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest, highest, lowest
    const [filterSentiment, setFilterSentiment] = useState('all');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/reviews`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch reviews');
                }

                const data = await response.json();
                setReviews(data.data || []);
            } catch (err) {
                console.error('Error fetching reviews:', err);
                setError('Failed to load reviews.');
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [API_URL]);

    const getSentimentBadgeColors = (sentiment) => {
        switch (sentiment) {
            case 'very positive': return 'bg-green-100 text-green-800 border-green-200';
            case 'positive': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'neutral': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'negative': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'very negative': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getSentimentEmoji = (sentiment) => {
        switch (sentiment) {
            case 'very positive': return '🤩';
            case 'positive': return '😊';
            case 'neutral': return '😐';
            case 'negative': return '🙁';
            case 'very negative': return '😠';
            default: return '💭';
        }
    };

    // Filter and Sort Logic
    const filteredAndSortedReviews = reviews
        .filter(review => filterSentiment === 'all' || review.sentiment === filterSentiment)
        .sort((a, b) => {
            if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortOrder === 'highest') return b.rating - a.rating;
            if (sortOrder === 'lowest') return a.rating - b.rating;
            return 0;
        });

    return (
        <motion.div variants={itemVariants} className="space-y-6">
            <div className="rounded-[2.5rem] shadow-sm p-8" style={{ background: 'var(--theme-card, #ffffff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--theme-text, #111827)' }}>User Feedback & Reviews</h2>
                        <p className="font-medium mt-1" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>
                            AI-Augmented Review System using Taglish Sentiment Analysis
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <select
                            value={filterSentiment}
                            onChange={(e) => setFilterSentiment(e.target.value)}
                            className="px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm outline-none"
                            style={{ background: 'var(--theme-input-bg, #f9fafb)', border: '1px solid var(--theme-border, #e5e7eb)', color: 'var(--theme-text, #111827)' }}
                        >
                            <option value="all">All Sentiments</option>
                            <option value="very positive">Very Positive</option>
                            <option value="positive">Positive</option>
                            <option value="neutral">Neutral</option>
                            <option value="negative">Negative</option>
                            <option value="very negative">Very Negative</option>
                        </select>

                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm outline-none"
                            style={{ background: 'var(--theme-input-bg, #f9fafb)', border: '1px solid var(--theme-border, #e5e7eb)', color: 'var(--theme-text, #111827)' }}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest">Highest Rated (By Stars)</option>
                            <option value="lowest">Lowest Rated (By Stars)</option>
                        </select>
                    </div>
                </div>

                {error ? (
                    <div className="p-6 rounded-2xl bg-red-50 text-red-600 border border-red-200 font-bold text-center">
                        {error}
                    </div>
                ) : loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex p-6 rounded-2xl border" style={{ borderColor: 'var(--theme-border, #f0f0f0)' }}>
                                <div className="skeleton-shimmer h-12 w-12 rounded-full mr-4" />
                                <div className="space-y-3 flex-1">
                                    <div className="skeleton-shimmer h-4 w-1/4" />
                                    <div className="skeleton-shimmer h-3 w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredAndSortedReviews.length > 0 ? (
                    <div className="grid gap-4">
                        {filteredAndSortedReviews.map((review) => (
                            <div
                                key={review._id}
                                className="p-6 rounded-2xl transition-shadow hover:shadow-md"
                                style={{
                                    background: 'var(--theme-bg-alt, #f9fafb)',
                                    border: '1px solid var(--theme-border, #e5e7eb)'
                                }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm" style={{ background: 'var(--theme-accent-surface, #f0fdf4)', color: 'var(--theme-accent, #15803d)' }}>
                                            {review.user?.displayName?.charAt(0) || review.user?.firstName?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold" style={{ color: 'var(--theme-text, #111827)' }}>
                                                {review.user?.displayName || `${review.user?.firstName} ${review.user?.lastName}` || 'Anonymous User'}
                                            </p>
                                            <p className="text-xs font-semibold" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>
                                                {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-2 ${getSentimentBadgeColors(review.sentiment)}`}>
                                        <span className="text-sm">{getSentimentEmoji(review.sentiment)}</span>
                                        {review.sentiment}
                                    </div>
                                </div>

                                <div className="mb-3 flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>

                                <p className="text-base leading-relaxed" style={{ color: 'var(--theme-text-secondary, #4b5563)' }}>
                                    "{review.comment}"
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 rounded-3xl border-dashed" style={{ background: 'var(--theme-bg-alt, #f9fafb)', border: '2px dashed var(--theme-border, #f0f0f0)' }}>
                        <span className="text-5xl block mb-4">💬</span>
                        <p className="text-xl font-bold mb-1" style={{ color: 'var(--theme-text, #111827)' }}>No Reviews Found</p>
                        <p className="font-medium" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>
                            Try adjusting your filters or wait for users to submit feedback.
                        </p>
                    </div>
                )}

            </div>
        </motion.div>
    );
};

export default ReviewsPage;
