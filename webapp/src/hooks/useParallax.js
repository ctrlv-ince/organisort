import { useRef } from 'react';
import { useScroll, useTransform, useSpring } from 'framer-motion';

/**
 * useParallax — Lightweight parallax hook using framer-motion.
 *
 * @param {Object}  opts
 * @param {number}  opts.speed   – Multiplier for the parallax offset (default 0.15).
 *                                 Positive = element lags behind scroll, negative = leads.
 * @param {Object}  opts.ref     – Optional external ref to track. If not provided, creates one.
 * @param {Array}   opts.offset  – IntersectionObserver-style scroll offsets
 *                                 (default: ["start end", "end start"]).
 * @returns {{ ref, y }} — Attach `ref` to the container, use `y` as a
 *          motion style transform value.
 */
export const useParallax = ({ speed = 0.15, ref: externalRef, offset } = {}) => {
    const internalRef = useRef(null);
    const ref = externalRef || internalRef;

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: offset || ['start end', 'end start'],
    });

    // Map scroll progress [0,1] → pixel offset
    const range = 100 * speed;
    const rawValue = useTransform(scrollYProgress, [0, 1], [range, -range]);
    const y = useSpring(rawValue, { stiffness: 100, damping: 30, mass: 0.5 });

    return { ref, y };
};

/**
 * scrollRevealProps — Scroll-triggered reveal animation config for framer-motion.
 * Returns props you can spread onto a <motion.div>.
 *
 * @param {Object}  opts
 * @param {number}  opts.y       – Initial Y offset in pixels (default 30).
 * @param {number}  opts.delay   – Animation delay in seconds (default 0).
 * @param {number}  opts.duration – Animation duration in seconds (default 0.6).
 * @param {string}  opts.margin  – Viewport margin for triggering (default "-80px").
 * @returns {Object} — Spread onto a <motion.div>
 */
export const scrollRevealProps = ({ y = 30, delay = 0, duration = 0.6, margin = '-80px' } = {}) => ({
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin },
    transition: { duration, delay, ease: 'easeOut' },
});
