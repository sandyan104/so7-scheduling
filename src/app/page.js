'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [step, setStep] = useState(1);
  const [algorithm, setAlgorithm] = useState('');
  const [processCount, setProcessCount] = useState(0);
  const [processes, setProcesses] = useState([]);
  const [quantumTime, setQuantumTime] = useState(1);
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
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Toko Donat Penjadwalan CPU 🍩</h1>

      {step === 1 && (
        <div className="mb-4">
          <label className="block mb-2">Pilih Algoritma:</label>
          <select
            className="w-full p-2 border rounded"
            value={algorithm}
            onChange={(e) => {
              setAlgorithm(e.target.value);
              setStep(2);
            }}
          >
            <option value="">-- Pilih --</option>
            <option value="FIFO">FIFO</option>
            <option value="SJF-NP">SJF Non-Preemptive</option>
            <option value="SJF-P">SJF Preemptive</option>
            <option value="RR">Round Robin</option>
          </select>
        </div>
      )}

      {step === 2 && (
        <div className="mb-4">
          <label className="block mb-2">Jumlah Proses:</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={processCount}
            onChange={(e) => setProcessCount(parseInt(e.target.value))}
          />
          <button
            onClick={handleGenerateForm}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Lanjut Isi Proses
          </button>
        </div>
      )}

      {step === 3 && (
        <>
          <h2 className="text-lg font-semibold mb-2">Isi Data Proses:</h2>
          {processes.map((proc, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <span className="w-1/6">{proc.nama}</span>
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

          <button
            onClick={handleStart}
            className="mt-4 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
          >
            Mulai Simulasi 🎬
          </button>
        </>
      )}
    </main>
  );
}
