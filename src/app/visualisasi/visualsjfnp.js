import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function VisualFifo({ data }) {
    const [proses, setProses] = useState([]);
    const [time, setTime] = useState(0);
    const [playing, setPlaying] = useState(false);
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (!playing) return;

        intervalRef.current = setInterval(() => {
            setTime((t) => t + 1);
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [playing]);

    useEffect(() => {
        if (!playing || proses.length === 0) return;

        const sedangDiproses = proses.find((p) => p.status === 'proses');
        if (sedangDiproses) return;

        const antrianSiap = proses.filter(
            (p) => p.status === 'antri' && p.arrivalTime <= time
        );
        if (antrianSiap.length === 0) {
            const allDone = proses.every((p) => p.status === 'selesai');
            if (allDone) {
                setPlaying(false);
                clearInterval(intervalRef.current);
            }
            return;
        }

        const next = antrianSiap.reduce((prev, curr) =>
            prev.burstTime <= curr.burstTime ? prev : curr
        );

        setProses((ps) =>
            ps.map((p) =>
                p.nama === next.nama ? { ...p, status: 'proses' } : p
            )
        );

        timeoutRef.current = setTimeout(() => {
            setProses((ps) => {
                const updated = ps.map((p) =>
                    p.nama === next.nama ? { ...p, status: 'selesai' } : p
                );

                const allDone = updated.every((p) => p.status === 'selesai');
                if (allDone) {
                    setPlaying(false);
                    clearInterval(intervalRef.current);
                }

                return updated;
            });
        }, next.burstTime * 1000);
    }, [time, proses, playing]);

    const handlePlay = () => {
        const initialProses = data.map((p) => ({ ...p, status: 'antri' }));
        setProses(initialProses);
        setTime(0);
        setPlaying(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    return (
        <>
            <p className="text-center mb-8">Pemilik toko ternyata suka menolong yang cepat-beres. Jadi, dari semua pelanggan yang sudah datang, yang paling cepat yang dilayani terlebih dahdulu. Tapi jika sudah mulai melayani, tidak bisa diganggu.</p>
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={handlePlay}
                        className="px-4 py-2 bg-blue-500 text-white rounded shadow"
                    >
                        Mulai
                    </button>
                    <div className="text-lg font-bold">{time} detik</div>
                </div>

                <div className="flex gap-4">
                    <div className="w-1/3 p-4 bg-blue-500 rounded">
                        <h2 className="font-bold mb-2">Antrean</h2>
                        {proses
                            .filter((p) => p.status === 'antri' && p.arrivalTime <= time)
                            .map((c) => (
                                <div key={c.nama} className="bg-white p-1 rounded shadow text-gray-700 text-sm mb-2">
                                    🧓 {c.nama} masuk antrean
                                </div>
                            ))}
                    </div>

                    <div className="w-1/3 p-4 bg-red-500 rounded">
                        <h2 className="font-bold mb-2">Meja Kasir</h2>
                        {proses.find((p) => p.status === 'proses') ? (
                            <div className="bg-white p-1 rounded shadow text-gray-700 mb-2 text-sm">
                                🍩 {proses.find((p) => p.status === 'proses').nama} sedang dilayani
                            </div>
                        ) : (
                            <div className="text-white-500">Kosong</div>
                        )}
                    </div>

                    <div className="w-1/3 p-4 bg-green-500 rounded">
                        <h2 className="font-bold mb-2">Meja Makan</h2>
                        {proses
                            .filter((p) => p.status === 'selesai')
                            .map((c) => (
                                <motion.div
                                    key={c.nama}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-white p-1 rounded shadow text-gray-700 mb-2 text-sm"
                                >
                                    😋 {c.nama} selesai makan
                                </motion.div>
                            ))}
                    </div>
                </div>
            </div>
        </>
    );
}