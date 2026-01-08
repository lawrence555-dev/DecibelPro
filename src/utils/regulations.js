/**
 * Taiwan Noise Regulation Reference (Category 2 Area)
 * Units: dB(A)
 */
export const TAIWAN_REGULATIONS = {
    DAY: {
        label: '日間 (07:00-20:00)',
        limit: 60,
    },
    EVENING: {
        label: '晚間 (20:00-23:00)',
        limit: 50,
    },
    NIGHT: {
        label: '夜間 (23:00-07:00)',
        limit: 50,
    }
};

/**
 * Gets the current noise regulation based on system time.
 */
export function getCurrentRegulation() {
    const hour = new Date().getHours();

    if (hour >= 7 && hour < 20) {
        return { ...TAIWAN_REGULATIONS.DAY, type: 'DAY' };
    } else if (hour >= 20 && hour < 23) {
        return { ...TAIWAN_REGULATIONS.EVENING, type: 'EVENING' };
    } else {
        return { ...TAIWAN_REGULATIONS.NIGHT, type: 'NIGHT' };
    }
}

/**
 * Checks if the current dB level exceeds the regulation limit.
 */
export function checkViolation(db, regulation) {
    return db > regulation.limit;
}
