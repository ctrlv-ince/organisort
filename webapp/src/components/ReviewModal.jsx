import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PrimaryButton from './PrimaryButton';

const ReviewModal = ({ isOpen, onClose }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) {
            setError('Please provide a comment for your review.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rating, comment })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setRating(5);
                    setComment('');
                }, 3000);
            } else {
                setError(data.message || 'Failed to submit review');
            }
        } catch (err) {
            console.error('Error submitting review:', err);
            setError('A network error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <React.Fragment>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!submitting ? onClose : undefined}
                        className="fixed inset-0 z-40"
                        style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="w-full max-w-md rounded-3xl shadow-2xl p-8 pointer-events-auto overflow-hidden relative"
                            style={{ background: 'var(--theme-card, #ffffff)' }}
                        >
                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-8"
                                >
                                    <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'var(--theme-accent-surface, #f0fdf4)' }}>
                                        <svg className="w-10 h-10" fill="none" stroke="var(--theme-accent, #15803d)" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--theme-text, #111827)' }}>Thank You!</h3>
                                    <p style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>Your review helps us improve the system.</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--theme-text, #111827)' }}>Leave a Review</h2>
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="p-2 rounded-full hover:bg-black/5 transition-colors"
                                            disabled={submitting}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="var(--theme-text-secondary, #6b7280)" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {error && (
                                        <div className="mb-4 p-4 rounded-xl text-sm font-medium" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        {/* Star Rating */}
                                        <div>
                                            <label className="block text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>
                                                Overall Experience
                                            </label>
                                            <div className="flex gap-2 justify-center">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setRating(star)}
                                                        className="p-2 transition-transform hover:scale-110 focus:outline-none"
                                                        disabled={submitting}
                                                    >
                                                        <svg
                                                            className={`w-10 h-10 transition-colors ${rating >= star ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200'}`}
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Comment Area */}
                                        <div>
                                            <label className="block text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>
                                                Tell us more (Taglish accepted!)
                                            </label>
                                            <textarea
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="Ang ganda ng app, very helpful..."
                                                className="w-full w-full px-5 py-4 rounded-2xl outline-none focus:ring-2 transition-all resize-none h-32"
                                                style={{
                                                    background: 'var(--theme-input-bg, #f9fafb)',
                                                    color: 'var(--theme-text, #111827)',
                                                    border: '1px solid var(--theme-border, #e5e7eb)',
                                                    '--tw-ring-color': 'var(--theme-accent, #15803d)'
                                                }}
                                                disabled={submitting}
                                            />
                                        </div>

                                        <PrimaryButton
                                            onClick={handleSubmit}
                                            className="w-full py-4 text-center justify-center mt-2 group"
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Analyzing Sentiment...
                                                </span>
                                            ) : (
                                                <span className="flex items-center">
                                                    Submit Review
                                                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                    </svg>
                                                </span>
                                            )}
                                        </PrimaryButton>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </React.Fragment>
            )}
        </AnimatePresence>
    );
};

export default ReviewModal;
