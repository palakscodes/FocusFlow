import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const [input, setInput] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('College');

  const [hInput, setHInput] = useState(0);
  const [mInput, setMInput] = useState(25);
  const [sInput, setSInput] = useState(0);
  const [seconds, setSeconds] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);

  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    if (seconds <= 0) { setIsRunning(false); playBeep(); setTimeout(playBeep, 400); return; }
    const timer = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [isRunning, seconds]);

  useEffect(() => {
    if (tasks.length > 0 && tasks.filter(t => t.completed).length === tasks.length) {
      setShowCelebration(true);
      const timeout = setTimeout(() => setShowCelebration(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [tasks]);

  function handleDateChange(e) {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) val = val.slice(0, 2) + '.' + val.slice(2);
    if (val.length > 5) val = val.slice(0, 5) + '.' + val.slice(5, 9);
    setDueDate(val);
  }

  function addTask() {
    if (input.trim() === '') return;
    const newTask = { id: Date.now(), text: input, completed: false, priority, dueDate, category };
    setTasks([...tasks, newTask]);
    setInput('');
    setDueDate('');
  }

  function toggleTask(id) {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  }

  function deleteTask(id) {
    setTasks(tasks.filter(task => task.id !== id));
  }

  function getRecommendation() {
    const pending = tasks.filter(t => !t.completed);
    if (pending.length === 0) return null;
    const scores = { High: 3, Medium: 2, Low: 1 };
    return pending.reduce((best, task) =>
      scores[task.priority] > scores[best.priority] ? task : best
    );
  }

  function setCustomTime() {
    const h = Math.min(Math.max(hInput, 0), 24);
    const m = Math.min(Math.max(mInput, 0), 59);
    const s = Math.min(Math.max(sInput, 0), 59);
    setSeconds(h * 3600 + m * 60 + s);
    setIsRunning(false);
  }

  function formatTime(total) {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 && h > 0 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function playBeep() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 800;
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  return (
    <div className="app">
      <h1>FocusFlow</h1>

      <div className="input-row">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Add a task..." />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <input type="text" value={dueDate} onChange={handleDateChange} placeholder="DD.MM.YYYY" maxLength="10" style={{ width: '100px' }} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="College">College</option>
          <option value="Personal">Personal</option>
          <option value="Projects">Projects</option>
          <option value="Other">Other</option>
        </select>
        <button onClick={addTask}>Add</button>
      </div>

      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <span
              onClick={() => toggleTask(task.id)}
              style={{ textDecoration: task.completed ? 'line-through' : 'none', cursor: 'pointer' }}
            >
              {task.text} — {task.category} — {task.priority}{task.dueDate ? ` — Due: ${task.dueDate}` : ''}
            </span>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <p className="stats">Total: {tasks.length} | Completed: {tasks.filter(t => t.completed).length} | Pending: {tasks.filter(t => !t.completed).length}</p>

      <div className="progress-outer">
        <div className="progress-inner" style={{ width: `${tasks.length ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%` }}></div>
      </div>

      {getRecommendation() && (
        <div className="card">
          ⭐ Recommended: <strong>{getRecommendation().text}</strong> ({getRecommendation().priority} priority)
        </div>
      )}

      <div className="card timer-card">
        <h2>{formatTime(seconds)}</h2>
        <div className="timer-inputs">
          <div><div className="label">Hours</div><input type="number" value={hInput} onChange={(e) => setHInput(Number(e.target.value))} /></div>
          <div><div className="label">Minutes</div><input type="number" value={mInput} onChange={(e) => setMInput(Number(e.target.value))} /></div>
          <div><div className="label">Seconds</div><input type="number" value={sInput} onChange={(e) => setSInput(Number(e.target.value))} /></div>
        </div>
        <div>
          <button onClick={setCustomTime}>Set</button>
          <button onClick={() => setIsRunning(true)}>Start</button>
          <button onClick={() => setIsRunning(false)}>Pause</button>
          <button onClick={() => { setIsRunning(false); setSeconds(hInput * 3600 + mInput * 60 + sInput); }}>Reset</button>
        </div>
      </div>

      {showCelebration && (
        <div className="celebration-popup">
          🎉 Well done! You completed all your tasks! 🎉
        </div>
      )}
    </div>
  );
}

export default App;
