import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function VisualRoundRobin({ data, quantum }) {
    const [proses, setProses] = useState([]);
    const [time, setTime] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [queue, setQueue] = useState([]);
    const intervalRef = useRef(null);
    const quantumRef = useRef(0);
    const currentProcessRef = useRef(null);

    const handlePlay = () => {
        const initialProses = data.map((p) => ({
            ...p,
            status: 'antri',
            remainingTime: p.burstTime,
        }));

        // Atur proses pertama hanya jika arrivalTime-nya sesuai dengan waktu sekarang
        const firstProcess = initialProses.find((p) => p.arrivalTime === 0);
        if (firstProcess) {
            firstProcess.status = 'proses'; // Mulai proses pertama
            currentProcessRef.current = firstProcess.nama;
        }

        setProses(initialProses);
        setQueue([]); // Clear the queue
        quantumRef.current = 0;
        setTime(1); // Start time at 1 to avoid processing the first tick
        setPlaying(true);

        if (intervalRef.current) clearInterval(intervalRef.current);

        // Start the timer after initializing the first process
        intervalRef.current = setInterval(() => {
            setTime((t) => t + 1);
        }, 1000);
    };

    useEffect(() => {
        if (!playing || time === 0) return; // Skip processing during the first tick

        setProses((prev) => {
            let updated = [...prev];

            // Tambahkan proses yang baru datang ke antrean
            const newlyArrived = updated
                .filter((p) => p.arrivalTime === time && p.status === 'antri')
                .map((p) => p.nama);

            if (newlyArrived.length > 0) {
                setQueue((q) => [...q, ...newlyArrived]);
            }

            let prosesAktif = updated.find((p) => p.status === 'proses');

            // Proses aktif sedang berjalan
            if (prosesAktif) {
                quantumRef.current += 1;

                // Check if this is the last process
                const isLastProcess = updated.filter((p) => p.status !== 'selesai').length === 1;

                updated = updated.map((p) =>
                    p.nama === prosesAktif.nama
                        ? {
                              ...p,
                              remainingTime: isLastProcess ? 0 : p.remainingTime - 1, // Complete immediately if last process
                          }
                        : p
                );

                prosesAktif = updated.find((p) => p.nama === prosesAktif.nama);

                if (prosesAktif.remainingTime <= 0) {
                    updated = updated.map((p) =>
                        p.nama === prosesAktif.nama
                            ? { ...p, status: 'selesai', finishTime: time }
                            : p
                    );
                    currentProcessRef.current = null;
                    quantumRef.current = 0;
                } else if (quantumRef.current >= quantum) {
                    updated = updated.map((p) =>
                        p.nama === prosesAktif.nama
                            ? { ...p, status: 'antri' }
                            : p
                    );
                    setQueue((q) => [...q, prosesAktif.nama]);
                    currentProcessRef.current = null;
                    quantumRef.current = 0;
                }
            }

            // Jika tidak ada yang sedang diproses, ambil dari antrean
            if (!updated.find((p) => p.status === 'proses') && queue.length > 0) {
                const nextNama = queue[0];
                updated = updated.map((p) =>
                    p.nama === nextNama ? { ...p, status: 'proses' } : p
                );
                setQueue((q) => q.slice(1));
                currentProcessRef.current = nextNama;
            }

            // Periksa apakah semua proses selesai
            const allDone = updated.every((p) => p.status === 'selesai');
            if (allDone) {
                setPlaying(false);
                clearInterval(intervalRef.current);
                setQueue([]); // Clear the queue to prevent re-processing
                currentProcessRef.current = null; // Reset the current process reference
                quantumRef.current = 0; // Reset the quantum reference
            }

            return updated;
        });
    }, [time]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={handlePlay}
                    className="px-4 py-2 bg-purple-500 text-white rounded shadow"
                >
                    ▶️ Play
                </button>
                <div className="text-lg font-bold">Waktu: {time}s</div>
            </div>

            <div className="flex gap-4">
                <div className="w-1/3 p-4 bg-blue-100 rounded">
                    <h2 className="font-bold mb-2">Antrean</h2>
                    {queue.map((nama) => (
                        <div key={nama} className="bg-white p-2 rounded shadow">
                            🧑 {nama}
                        </div>
                    ))}
                </div>

                <div className="w-1/3 p-4 bg-yellow-100 rounded">
                    <h2 className="font-bold mb-2">Meja Donat</h2>
                    {proses.find((p) => p.status === 'proses') ? (
                        <div className="bg-white p-4 rounded shadow text-center">
                            🍩 {proses.find((p) => p.status === 'proses').nama} dilayani
                        </div>
                    ) : (
                        <div className="text-gray-500">Kosong</div>
                    )}
                </div>

                <div className="w-1/3 p-4 bg-green-100 rounded">
                    <h2 className="font-bold mb-2">Meja Makan</h2>
                    {proses
                        .filter((p) => p.status === 'selesai')
                        .sort((a, b) => a.finishTime - b.finishTime)
                        .map((c) => (
                            <motion.div
                                key={c.nama}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="bg-white p-2 rounded shadow"
                            >
                                😋 {c.nama} selesai
                            </motion.div>
                        ))}
                </div>
            </div>
        </div>
    );
}
