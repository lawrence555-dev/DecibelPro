import { useState, useEffect } from 'react';

export function useLocation() {
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState('定位中...');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported');
            setAddress('不支援定位');
            return;
        }

        const success = async (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });

            try {
                // OpenStreetMap Nominatim API (Free, but use with caution regarding rate limits)
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
                    headers: {
                        'Accept-Language': 'zh-TW'
                    }
                });
                const data = await res.json();

                // Construct a readable address (e.g., 雲林縣西螺鎮)
                const addr = data.address;
                const city = addr.city || addr.town || addr.village || addr.county || '';
                const suburb = addr.suburb || addr.neighbourhood || '';
                const road = addr.road || '';

                setAddress(`${city}${suburb}${road}` || '未知地點');
            } catch (err) {
                console.error('Reverse geocoding error:', err);
                setAddress('無法取得詳細地址');
            }
        };

        const handleError = (err) => {
            setError(err.message);
            setAddress('定位失敗');
        };

        navigator.geolocation.getCurrentPosition(success, handleError);
    }, []);

    return { location, address, error };
}
