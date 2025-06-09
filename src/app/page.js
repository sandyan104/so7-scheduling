'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [step, setStep] = useState(1);
  const [algorithm, setAlgorithm] = useState('');
  const [processCount, setProcessCount] = useState(0);
  const [processes, setProcesses] = useState([]);
  const [quantumTime, setQuantumTime] = useState(0);
  const router = useRouter();

  const handleGenerateForm = () => {
    const newProcesses = Array.from({ length: processCount }, (_, i) => ({
      nama: `P${i + 1}`,
      arrivalTime: 0,
      burstTime: 1,
    }));
    setProcesses(newProcesses);
    setStep(3);
  };

  const updateProcess = (index, field, value) => {
    const updated = [...processes];
    updated[index][field] = parseInt(value);
    setProcesses(updated);
  };

  const handleStart = () => {
    localStorage.setItem('algorithm', algorithm);
    localStorage.setItem('characters', JSON.stringify(processes));
    if (algorithm === 'RR') localStorage.setItem('quantum', quantumTime);
    router.push('/visualisasi');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <main className="p-4 max-w-xl mx-auto">
        <p className="text-xs font-bold text-center mb-6">SO7 4B</p>
        <h1 className="text-3xl font-bold text-center mb-6">Penjadwalan Sistem Operasi {algorithm}</h1>

        {step === 1 && (
          <div className="mb-4">
            <div className="flex justify-center gap-4 mb-4 mt-12">
              <button onClick={() => {
                setAlgorithm("FIFO");
                setStep(2);
              }} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                FIFO
              </button>
              <button onClick={() => {
                setAlgorithm("SJF-NP");
                setStep(2);
              }} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                SJF NP
              </button>
              <button onClick={() => {
                setAlgorithm("SJF-P");
                setStep(2);
              }} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                SJF P
              </button>
              <button onClick={() => {
                setAlgorithm("RR");
                setStep(2);
              }} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Round Robin
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <>
            <p className="text-center mb-6">Di sebuah toko donat, para pelanggan datang untuk membeli donat. Tapi karena pemilik toko sibuk, mereka harus ngantre untuk dilayani satu per satu. Pelayanan donat = proses CPU berjalan.</p>
            <div className="mb-4 flex items-center gap-4">
              <label className="block">Jumlah Pelanggan (Proses)</label>
              <input
                type="number"
                className="p-2 border rounded flex-1"
                value={processCount}
                onChange={(e) => setProcessCount(parseInt(e.target.value))}
              />
              <button
                onClick={handleGenerateForm}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Lanjut
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-lg font-semibold mb-6 text-center">Isi Data Pelanggan<br />(Waktu datang | Waktu pelayanan/burst)</h2>
            {processes.map((proc, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <span className="w-1/4">Pelanggan {i + 1}</span>
                <input
                  type="number"
                  className="w-1/3 p-1 border rounded"
                  placeholder="Arrival"
                  value={proc.arrivalTime}
                  onChange={(e) => updateProcess(i, 'arrivalTime', e.target.value)}
                />
                <input
                  type="number"
                  className="w-1/3 p-1 border rounded"
                  placeholder="Burst"
                  value={proc.burstTime}
                  onChange={(e) => updateProcess(i, 'burstTime', e.target.value)}
                />
              </div>
            ))}

            {algorithm === 'RR' && (
              // <p className="text-center my-6">Quantum Time 2 detik</p>
              <div className="mb-4">
                <label className="block mt-4">Quantum Time:</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={quantumTime}
                  onChange={(e) => setQuantumTime(parseInt(e.target.value))}
                />
              </div>
            )}

            <div className="flex justify-center mt-4">
              <button
                onClick={handleStart}
                className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-800"
              >
                Mulai Simulasi
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
