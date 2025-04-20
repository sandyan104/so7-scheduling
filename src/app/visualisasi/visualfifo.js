import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function VisualFifo({ data }) {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [served, setServed] = useState([]);
  const [time, setTime] = useState(0);  // Simulasi waktu

  useEffect(() => {
    if (data.length === 0) return;

    const sorted = [...data].sort((a, b) => a.arrivalTime - b.arrivalTime);

    sorted.forEach((p, i) => {
      setTimeout(() => {
        setQueue((q) => [...q, p]);
      }, p.arrivalTime * 1000);  // Proses masuk antrean sesuai arrivalTime
    });
  }, [data]);

  useEffect(() => {
    if (queue.length === 0 || current !== null) return;

    // Ambil proses pertama dalam antrean
    const next = queue[0];
    setCurrent(next);
    setQueue((q) => q.slice(1));  // Hapus karakter yang sedang diproses dari antrean

    // Proses karakter di meja donat sesuai dengan burst time-nya
    setTimeout(() => {
      setServed((s) => [...s, next]);  // Pindahkan karakter ke meja makan setelah selesai
      setCurrent(null);  // Karakter selesai dilayani
    }, next.burstTime * 1000);  // Durasi burst time karakter di meja donat

    // Set waktu berjalan
    const timer = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [queue, current]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="w-1/3 p-4 bg-blue-100 rounded">
          <h2 className="font-bold mb-2">Antrean</h2>
          {queue.map((c, i) => (
            <div key={i} className="bg-white p-2 rounded shadow">
              🧍 {c.nama} masuk antrean
            </div>
          ))}
        </div>

        <div className="w-1/3 p-4 bg-pink-100 rounded">
          <h2 className="font-bold mb-2">Meja Donat</h2>
          {current ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-4 rounded shadow text-center"
            >
              🍩 {current.nama} sedang dilayani ({current.burstTime}s)
            </motion.div>
          ) : (
            <div className="text-gray-500">Kosong</div>
          )}
        </div>

        <div className="w-1/3 p-4 bg-green-100 rounded">
          <h2 className="font-bold mb-2">Meja Makan</h2>
          {served.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-2 rounded shadow"
            >
              😋 {served.length} karakter selesai mendapatkan donat
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
