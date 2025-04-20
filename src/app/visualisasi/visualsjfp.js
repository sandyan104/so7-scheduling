import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function VisualSJFPreemptive({ data }) {
    const [proses, setProses] = useState([]);
    const [time, setTime] = useState(0);
    const [playing, setPlaying] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!playing) return;

        intervalRef.current = setInterval(() => {
            setTime((t) => t + 1);
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [playing]);

    useEffect(() => {
        if (!playing || proses.length === 0) return;

        setProses((prevProses) => {
            const updated = [...prevProses];

            const prosesSedangBerjalan = updated.find((p) => p.status === 'proses');
            const readyQueue = updated.filter(
                (p) => p.status !== 'selesai' && p.arrivalTime <= time
            );

            if (readyQueue.length === 0) {
                return updated;
            }

            // Pilih proses dengan sisa waktu terkecil
            const prosesTerpendek = readyQueue.reduce((a, b) =>
                a.remainingTime <= b.remainingTime ? a : b
            );

            const hasil = updated.map((p) => {
                if (p.nama === prosesTerpendek.nama) {
                    // Proses ini dijalankan
                    return {
                        ...p,
                        status: 'proses',
                        remainingTime: p.remainingTime - 1,
                    };
                } else if (p.status === 'proses') {
                    // Proses disela
                    return { ...p, status: 'antri' };
                }
                return p;
            });

            // Tandai proses selesai jika sisa waktu habis
            // Tandai proses selesai jika sisa waktu habis
            const final = hasil.map((p) => {
                if (p.remainingTime === 0 && p.status !== 'selesai') {
                    return { ...p, status: 'selesai', finishTime: time };
                }
                return p;
            });


            // Hentikan jika semua selesai
            const allDone = final.every((p) => p.status === 'selesai');
            if (allDone) {
                setPlaying(false);
                clearInterval(intervalRef.current);
            }

            return final;
        });
    }, [time]);


    const handlePlay = () => {
        const initialProses = data.map((p) => ({
            ...p,
            status: 'antri',
            remainingTime: p.burstTime,
        }));
        setProses(initialProses);
        setTime(0);
        setPlaying(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };


    return (

        <>
            <p className="text-center mb-8">Kalau pelanggan datang di akhir dan hanya sebentar, mereka akan diprioritaskan meskipun sedang melayani pelanggan lain, Jadi akan disela</p>
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
                                    🧓 {c.nama} ({c.remainingTime} dtk)
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
                            .sort((a, b) => a.finishTime - b.finishTime) // urutkan berdasarkan waktu selesai
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
