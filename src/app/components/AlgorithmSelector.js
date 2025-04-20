export default function AlgorithmSelector({ selected, onChange }) {
    return (
      <div className="mb-4">
        <label className="font-semibold block mb-2">Pilih Algoritma Penjadwalan:</label>
        <select
          className="w-full p-2 border rounded"
          value={selected}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="FIFO">FIFO</option>
          <option value="SJF-NP">SJF Non-Preemptive</option>
          <option value="SJF-P">SJF Preemptive</option>
          <option value="RR">Round Robin</option>
        </select>
      </div>
    );
  }
  