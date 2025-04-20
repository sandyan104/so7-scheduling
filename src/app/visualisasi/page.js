'use client';
import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import VisualFifo from './visualfifo';
import VisualSjfNp from './visualsjfnp';
import VisualSjfP from './visualsjfp';
import VisualRoundRobin from './visualisasirr';

export default function VisualisasiPage() {
  const [data, setData] = useState([]);
  const [algorithm, setAlgorithm] = useState('');
  const [quantum, setQuantum] = useState();
  const [result, setResult] = useState([]);

  useEffect(() => {
    const algo = localStorage.getItem('algorithm');
    const chars = JSON.parse(localStorage.getItem('characters') || '[]');
    const q = parseInt(localStorage.getItem('quantum') || '0');

    setAlgorithm(algo);
    setData(chars);
    setQuantum(q);
  }, []);

  useEffect(() => {
    if (data.length === 0) return;
    let res = [];

    if (algorithm === 'FIFO') {
      res = fifoSchedule(data);
    } else if (algorithm === 'SJF-NP') {
      res = sjfNonPreemptiveSchedule(data);
    } else if (algorithm === 'SJF-P') {
      res = sjfPreemptiveSchedule(data);
    } else if (algorithm === 'RR') {
      res = roundRobinSchedule(data, quantum);
    }

    setResult(res);
  }, [data, algorithm, quantum]);



  const avgWaiting = result.reduce((sum, p) => sum + p.waitingTime, 0) / result.length || 0;
  const avgTurnaround = result.reduce((sum, p) => sum + p.turnaroundTime, 0) / result.length || 0;

  return (
    <main className="p-4 max-w-3xl mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-2 text-center">Hasil Simulasi {algorithm}</h1>

      {result.length > 0 ? (
        <>
          {algorithm === 'FIFO' && <VisualFifo data={result} />}
          {algorithm === 'SJF-NP' && <VisualSjfNp data={result} />}
          {algorithm === 'SJF-P' && <VisualSjfP data={result} />}
          {algorithm === 'RR' && <VisualRoundRobin data={result} quantum={quantum} />}
          <br /><br /><br />
          <table className="w-full border mb-4">
            <thead>
              <tr className="bg-red-500">
                <th className="border p-2">Nama</th>
                <th className="border p-2">Arrival</th>
                <th className="border p-2">Burst</th>
                {/* <th className="border p-2">Finish</th> */}
                <th className="border p-2">Waiting</th>
                <th className="border p-2">Turnaround</th>
              </tr>
            </thead>
            <tbody>
              {result.map((p, i) => (
                <tr key={i} className="text-center">
                  <td className="border p-1">Pelanggan {i + 1}</td>
                  <td className="border p-1">{p.arrivalTime}</td>
                  <td className="border p-1">{p.burstTime}</td>
                  {/* <td className="border p-1">{p.finishTime}</td> */}
                  <td className="border p-1">{p.waitingTime}</td>
                  <td className="border p-1">{p.turnaroundTime}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mb-4">
            <p>Rata-rata Waktu Tunggu: <strong>{avgWaiting.toFixed(2)}</strong></p>
            <p>Rata-rata Turnaround Time: <strong>{avgTurnaround.toFixed(2)}</strong></p>
          </div>

          {/* <div className="space-y-2 mt-6">
            {result.map((p, i) => (
              <div key={i} className="bg-yellow-100 px-4 py-2 rounded">
                🗨️ {p.nama}: "Aku nunggu {p.waitingTime} detik dapet donat!"
              </div>
            ))}
          </div> */}

          <div className="flex justify-center mt-10 mb-12">
            <button
              onClick={() => {
                localStorage.removeItem('algorithm');
                localStorage.removeItem('characters');
                localStorage.removeItem('quantum');
                setAlgorithm('');
                setData([]);
                setResult([]);
                setQuantum(0);
                window.location.href = '/'; // redirect ke home
              }}
              className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-800"
            >
              Kembali ke Home
            </button>
          </div>

        </>
      ) : (
        <p>Loading data simulasi...</p>
      )
      }
    </main >
  );
}

// Fungsi penjadwalan FIFO
function fifoSchedule(procs) {
  const sorted = [...procs].sort((a, b) => a.arrivalTime - b.arrivalTime);
  let time = 0;
  return sorted.map((p) => {
    const start = Math.max(time, p.arrivalTime);
    const finish = start + p.burstTime;
    const turnaroundTime = finish - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    time = finish;

    return {
      ...p,
      finishTime: finish,
      waitingTime,
      turnaroundTime,
    };
  });
}

// SJF non preemptive
function sjfNonPreemptiveSchedule(procs) {
  console.log(procs);
  const sorted = [...procs].sort((a, b) => a.arrivalTime - b.arrivalTime);
  let time = 0;
  const result = [];
  const done = new Set();

  while (result.length < sorted.length) {
    // Filter proses yang sudah datang dan belum selesai
    const available = sorted.filter(
      (p, i) => p.arrivalTime <= time && !done.has(i)
    );

    // Kalau tidak ada proses yang sudah datang, majukan waktu
    if (available.length === 0) {
      time++;
      continue;
    }

    // Ambil proses dengan burst time terpendek
    const nextIdx = sorted.findIndex(
      (p) =>
        p.arrivalTime <= time &&
        !done.has(sorted.indexOf(p)) &&
        p.burstTime === Math.min(...available.map((a) => a.burstTime))
    );

    const p = sorted[nextIdx];
    const start = Math.max(time, p.arrivalTime);
    const finish = start + p.burstTime;
    const turnaroundTime = finish - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    time = finish;

    result.push({
      ...p,
      finishTime: finish,
      turnaroundTime,
      waitingTime,
    });

    done.add(nextIdx);
  }

  return result;
}

function sjfPreemptiveSchedule(procs) {
  const sorted = [...procs].map(p => ({ ...p })); // salin agar data aslinya tidak berubah
  const n = sorted.length;
  let time = 0;
  let completed = 0;
  const result = [];
  const remainingTimes = sorted.map(p => p.burstTime);
  const isDone = Array(n).fill(false);

  const finishTimes = Array(n).fill(0);

  while (completed < n) {
    // proses yang datang dan belum selesai
    let idx = -1;
    let minRemain = Infinity;

    for (let i = 0; i < n; i++) {
      if (
        sorted[i].arrivalTime <= time &&
        !isDone[i] &&
        remainingTimes[i] < minRemain &&
        remainingTimes[i] > 0
      ) {
        minRemain = remainingTimes[i];
        idx = i;
      }
    }

    if (idx === -1) {
      time++;
      continue;
    }

    remainingTimes[idx]--;
    time++;

    if (remainingTimes[idx] === 0) {
      isDone[idx] = true;
      completed++;
      finishTimes[idx] = time;

      const turnaroundTime = time - sorted[idx].arrivalTime;
      const waitingTime = turnaroundTime - sorted[idx].burstTime;

      result.push({
        ...sorted[idx],
        finishTime: time,
        turnaroundTime,
        waitingTime,
      });
    }
  }

  // urutkan hasil sesuai urutan proses awal
  return sorted.map((p) => {
    return result.find(r => r.nama === p.nama);
  });
}

// RR
function roundRobinSchedule(procs, quantum) {
  const sorted = [...procs].map(p => ({ ...p }));
  const n = sorted.length;
  const remainingTimes = sorted.map(p => p.burstTime);
  const finishTimes = Array(n).fill(0);
  const isDone = Array(n).fill(false);

  let time = 0;
  const queue = [];
  const result = [];
  let visited = Array(n).fill(false);

  while (true) {
    // masukkan proses yang datang di waktu sekarang
    for (let i = 0; i < n; i++) {
      if (sorted[i].arrivalTime <= time && !visited[i]) {
        queue.push(i);
        visited[i] = true;
      }
    }

    if (queue.length === 0) {
      // cek kalau masih ada proses tersisa tapi belum bisa dijalankan
      if (isDone.every(done => done)) break;
      time++;
      continue;
    }

    const idx = queue.shift();

    const execTime = Math.min(quantum, remainingTimes[idx]);
    time += execTime;
    remainingTimes[idx] -= execTime;

    // masukkan proses baru yang mungkin datang selama quantum berjalan
    for (let i = 0; i < n; i++) {
      if (
        sorted[i].arrivalTime > time - execTime &&
        sorted[i].arrivalTime <= time &&
        !visited[i]
      ) {
        queue.push(i);
        visited[i] = true;
      }
    }

    if (remainingTimes[idx] === 0) {
      isDone[idx] = true;
      finishTimes[idx] = time;

      const turnaroundTime = time - sorted[idx].arrivalTime;
      const waitingTime = turnaroundTime - sorted[idx].burstTime;

      result.push({
        ...sorted[idx],
        finishTime: time,
        turnaroundTime,
        waitingTime,
      });
    } else {
      queue.push(idx); // belum selesai, antre lagi
    }
  }

  // urutkan hasil sesuai proses awal
  return sorted.map(p => result.find(r => r.nama === p.nama));
}



