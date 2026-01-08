import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth, signIn } from '../firebase';

const LOCAL_STORAGE_KEY = 'decibel_pro_history';

export function useHistory() {
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState(() => {
        // Initial load from LocalStorage for zero-latency
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });
    const [loading, setLoading] = useState(true);

    const isConfigured = auth.app.options.apiKey !== 'YOUR_API_KEY';

    // 1. Auth Sync
    useEffect(() => {
        if (!isConfigured) {
            setLoading(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) {
                setUser(u);
            } else {
                signIn().catch(err => console.error("Auth Error:", err));
            }
        });
        return () => unsubscribe();
    }, [isConfigured]);

    // 2. Firebase Listener & Local Sync
    useEffect(() => {
        if (!user || !isConfigured) return;

        const q = query(
            collection(db, 'measurements'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fbData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert Firestore Timestamp to ISO string if it exists
                timestamp: doc.data().createdAt?.toMillis()
                    ? new Date(doc.data().createdAt.toMillis()).toISOString()
                    : doc.data().timestamp
            }));

            // Sort and Merge with Local (Local is authority for unpublished but Firebase is authority for cloud)
            const sorted = fbData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const trimmed = sorted.slice(0, 10);

            setHistory(trimmed);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmed));
            setLoading(false);
        }, (err) => {
            console.warn("Firestore listener failed, falling back to local only:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, isConfigured]);

    const saveMeasurement = useCallback(async (data) => {
        // Always save to LocalStorage first for instant feedback
        const newRecord = {
            id: 'local-' + Date.now(),
            ...data,
            createdAt: serverTimestamp ? null : data.timestamp // placeholder
        };

        setHistory(prev => {
            const updated = [newRecord, ...prev].slice(0, 10);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });

        // If Firebase is configured, push to cloud
        if (isConfigured && user) {
            try {
                // 1. Add to Firestore
                await addDoc(collection(db, 'measurements'), {
                    ...data,
                    userId: user.uid,
                    createdAt: serverTimestamp()
                });

                // 2. Trim Firestore (latest 10)
                const q = query(
                    collection(db, 'measurements'),
                    where('userId', '==', user.uid)
                );
                const snapshot = await getDocs(q);

                if (snapshot.size > 10) {
                    const sortedDocs = [...snapshot.docs].sort((a, b) => {
                        const tA = a.data().createdAt?.toMillis() || new Date(a.data().timestamp).getTime();
                        const tB = b.data().createdAt?.toMillis() || new Date(b.data().timestamp).getTime();
                        return tB - tA;
                    });
                    const toDelete = sortedDocs.slice(10);
                    await Promise.all(toDelete.map(d => deleteDoc(doc(db, 'measurements', d.id))));
                }
                return { success: true };
            } catch (err) {
                console.error('Cloud save failed, logic remains local:', err);
                return { success: true, warning: 'Saved locally, cloud sync pending' };
            }
        }

        return { success: true, warning: 'Saved locally' };
    }, [user, isConfigured]);

    return { user, history, loading, saveMeasurement, isConfigured };
}
