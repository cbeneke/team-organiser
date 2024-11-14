import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { UserData } from "../types/UserData";
const API_URL = import.meta.env.API_URL || 'http://localhost:8000';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('Nicht authentifiziert');
        }
        const response = await fetch(`${API_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUserData(data);
        setEditForm(prev => ({ ...prev, display_name: data.display_name }));
    } catch (err) {
        setError("Failed to load user data");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (editForm.new_password && editForm.new_password !== editForm.confirm_password) {
      setError("Passwörter stimmen nicht überein");
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Nicht authentifiziert');
      }

      if (!userData) {
        throw new Error('User data not found');
      }

      const updateData: Record<string, string> = {};
      
      if (editForm.display_name !== userData.display_name) {
        updateData.display_name = editForm.display_name;
      }
      
      if (editForm.new_password) {
        updateData.password = editForm.new_password;
      }

      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        return;
      }

      const response = await fetch(`${API_URL}/users/${userData.id}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error("Failed to update profile");
      
      await fetchUserData();
      setIsEditing(false);
      setEditForm(prev => ({
        ...prev,
        current_password: "",
        new_password: "",
        confirm_password: "",
      }));
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  if (!userData) {
    return <div className="profile-container">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <h1>Mein Profil</h1>
      
      {error && <div className="error-message">{error}</div>}

      {!isEditing ? (
        <>
          <div className="profile-info">
            <div className="info-group">
              <label>Benutzername</label>
              <span>{userData.username}</span>
            </div>
            <div className="info-group">
              <label>Anzeigename</label>
              <span>{userData.display_name}</span>
            </div>
            
            <button 
              className="primary-button"
              onClick={() => setIsEditing(true)}
            >
              Profil bearbeiten
            </button>
          </div>

          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            Abmelden
          </button>
        </>
      ) : (
        <form onSubmit={handleEdit} className="edit-form">
          <div className="form-group">
            <label>Anzeigename</label>
            <input
              type="text"
              value={editForm.display_name}
              onChange={e => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Neues Passwort</label>
            <input
              type="password"
              value={editForm.new_password}
              onChange={e => setEditForm(prev => ({ ...prev, new_password: e.target.value }))}
              placeholder="Leer lassen, wenn keine Änderung gewünscht"
            />
          </div>
          
          {editForm.new_password && (
            <>
              <div className="form-group">
                <label>Neues Passwort bestätigen</label>
                <input
                  type="password"
                  value={editForm.confirm_password}
                  onChange={e => setEditForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                  required
                />
              </div>

              {/*
              TODO: Send current password to backend when required on change
              <div className="form-group">
                <label>Aktuelles Passwort</label>
                <input
                  type="password"
                  value={editForm.current_password}
                  onChange={e => setEditForm(prev => ({ ...prev, current_password: e.target.value }))}
                  required
                />
              </div> */}
            </>
          )}

          <div className="button-group">
            <button type="submit" className="primary-button">Änderungen speichern</button>
            <button 
              type="button" 
              className="secondary-button"
              onClick={() => setIsEditing(false)}
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}
    </div>
  );
};