import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth, signIn } from '../firebase';

export function useHistory() {
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Ensure session-persistent anonymous login
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) {
                setUser(u);
            } else {
                signIn();
            }
        });
        return () => unsubscribe();
    }, []);

    // Fetch history for current user
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'measurements'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(20) // Get more than 10 to assist with trimming if needed
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setHistory(data.slice(0, 10)); // UI only shows top 10
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const saveMeasurement = useCallback(async (data) => {
        if (!user) {
            console.error('Firebase Auth not ready. Check if API keys are set in src/firebase.js');
            return { success: false, error: 'Auth Not Ready' };
        }

        try {
            // 1. Add new record
            await addDoc(collection(db, 'measurements'), {
                ...data,
                userId: user.uid,
                createdAt: serverTimestamp()
            });

            // 2. Cleanup: Ensure only latest 10 exist
            const q = query(
                collection(db, 'measurements'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);

            if (snapshot.size > 10) {
                const docsToDelete = snapshot.docs.slice(10);
                const deletePromises = docsToDelete.map(d => deleteDoc(doc(db, 'measurements', d.id)));
                await Promise.all(deletePromises);
            }
            return { success: true };
        } catch (err) {
            console.error('Error saving measurement:', err);
            return { success: false, error: err.message };
        }
    }, [user]);

    const isConfigured = auth.app.options.apiKey !== 'YOUR_API_KEY';

    return { user, history, loading, saveMeasurement, isConfigured };
}
