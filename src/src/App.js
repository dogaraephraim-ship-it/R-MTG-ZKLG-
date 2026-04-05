import React, { useState } from 'react';
import { db } from "./firebase-config";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

export default function App() {
  const [user, setUser] = useState(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phoneInput) return alert("Please enter your phone number");
    setLoading(true);
    try {
      const docRef = doc(db, "members", phoneInput);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUser(docSnap.data());
      } else {
        alert("Number not found. Contact Admin.");
      }
    } catch (error) {
      alert("Check your Firebase Config or Internet Connection.");
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div style={s.container}>
        <div style={s.card}>
          <h2 style={{color: '#007bff'}}>MTG Portal</h2>
          <input type="text" placeholder="Phone Number" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} style={s.input} />
          <button onClick={handleLogin} disabled={loading} style={s.btnPrimary}>{loading ? "Loading..." : "Login"}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.dashboard}>
      <div style={s.nav}>
        <span>User: <strong>{user.name}</strong></span>
        <button onClick={() => setUser(null)} style={s.btnLogout}>Logout</button>
      </div>
      {user.role === "Admin" ? <AdminView /> : <MemberView user={user} setUser={setUser} />}
    </div>
  );
}

function AdminView() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const handleAdd = async () => {
    if (!name || !phone) return alert("Fill all fields");
    await setDoc(doc(db, "members", phone), { name, phone, role: "Unassigned", balance: 0 });
    alert("Member Added!");
    setName(""); setPhone("");
  };
  return (
    <div style={s.card}>
      <h3>Admin: Add Member</h3>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={s.input} />
      <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} style={s.input} />
      <button onClick={handleAdd} style={s.btnAdmin}>Upload Member</button>
    </div>
  );
}

function MemberView({ user, setUser }) {
  const [role, setRole] = useState(user.role);
  const roles = ["Field Agent", "Field Agent Support", "Value Chain Manager", "State Official"];
  const updateRole = async () => {
    await updateDoc(doc(db, "members", user.phone), { role });
    setUser({ ...user, role });
    alert("Role Updated!");
  };
  return (
    <div style={s.card}>
      <h3>Member Dashboard</h3>
      <p>Current Role: <strong>{user.role}</strong></p>
      <select value={role} onChange={e => setRole(e.target.value)} style={s.input}>
        <option value="Unassigned">-- Select Role --</option>
        {roles.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <button onClick={updateRole} style={s.btnPrimary}>Save Profile</button>
    </div>
  );
}

const s = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f4f4', fontFamily: 'sans-serif' },
  card: { padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '320px', textAlign: 'center' },
  dashboard: { maxWidth: '500px', margin: '20px auto', fontFamily: 'sans-serif' },
  nav: { display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#fff', borderRadius: '8px', marginBottom: '20px' },
  input: { width: '100%', padding: '10px', margin: '10px 0', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' },
  btnPrimary: { width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  btnAdmin: { width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  btnLogout: { background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }
};
