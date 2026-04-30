import React, { useEffect, useState } from 'react';
import points from '../../image/points.png';
import './Focus.scss';
import FocusPoint from '../FocusPoint/focuspoint';
import EditFocusModal from '../modal/edit-modal';
import axios from 'axios';

const API = 'http://localhost:5000/focus';

const Focus = () => {
  const [isOpenModal, setOpenModal] = useState(false);
  const [focusList, setFocusList] = useState([]);
  const [editingFocus, setEditingFocus] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    user: '',
    fizz: '',
  });

  const token = localStorage.getItem('accesstoken');

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ✅ Normalize ID helper
  const normalizeFocus = (item) => {
    if (!item) return item;
    return {
      ...item,
      id: item.id || item._id || item.focusId || item.FocusId || null,
    };
  };

  // 🔹 Load focus points
  const fetchFocusPoints = async () => {
    try {
      const res = await axios.get(`${API}/load`, axiosConfig);

      const normalized = Array.isArray(res.data)
        ? res.data.map(normalizeFocus)
        : [];

      setFocusList(normalized);
    } catch (err) {
      console.error('Error loading focus points:', err);
    }
  };

  useEffect(() => {
    fetchFocusPoints();
  }, []);

  // 🔹 Open modal (create)
  const handleCreate = () => {
    setEditingFocus(null);
    setFormData({
      title: '',
      description: '',
      user: '',
      fizz: '',
    });
    setOpenModal(true);
  };

  // 🔹 Open modal (edit)
  const handleEdit = (focus) => {
    const normalizedFocus = normalizeFocus(focus);
    setEditingFocus(normalizedFocus);
    setFormData({
      title: normalizedFocus?.title || '',
      description: normalizedFocus?.description || '',
      user: normalizedFocus?.user || '',
      fizz: normalizedFocus?.fizz || '',
    });
    setOpenModal(true);
  };

  // 🔹 Input handler
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // 🔹 Create or Update
  const handleSubmit = async () => {
    try {
      if (editingFocus) {
        const editingId = editingFocus?.id;
        if (!editingId) {
          console.error('Cannot update focus: missing id', editingFocus);
          return;
        }
        // ✅ UPDATE
        const res = await axios.put(
          `${API}/edit/${editingId}`,
          formData,
          axiosConfig
        );

        const updatedItem = normalizeFocus(res.data);

        setFocusList((prev) =>
          prev.map((item) =>
            item.id === editingId ? updatedItem : item
          )
        );
      } else {
        // ✅ CREATE
        const newFocus = {
          ...formData,
          user: 0,
        };

        const res = await axios.post(
          `${API}/create`,
          newFocus,
          axiosConfig
        );

        const createdItem = normalizeFocus(res.data?.data || newFocus);

        setFocusList((prev) => [...prev, createdItem]);
      }

      closeModal();
    } catch (err) {
      console.error('Error saving focus:', err);
    }
  };

  // 🔹 Delete
  const handleDelete = async (focus) => {
    try {
      await axios.delete(
        `${API}/delete/${focus.id}`,
        axiosConfig
      );

      setFocusList((prev) =>
        prev.filter((item) => item.id !== focus.id)
      );
    } catch (err) {
      console.error('Error deleting focus:', err);
    }
  };

  const closeModal = () => {
    setFormData({
      title: '',
      description: '',
      user: '',
      fizz: '',
    });
    setEditingFocus(null);
    setOpenModal(false);
  };

  return (
    <>
      <div className="focus-menu">
        <div className="focus-title">
          <button>In progress</button>
          <button>Completed</button>
        </div>

        <div className="focus-main">
          <div className="focus-head">
            <div className="tex-g">
              <h6>Focus Points</h6>
              <div className="tex-1">
                <p>{focusList.length}</p>
                <img src={points} alt="" />
              </div>
            </div>

            <button className="btn-add" onClick={handleCreate}>
              + Add new focus point
            </button>
          </div>

          <div className="hr"></div>

          <div className="focus-field">
            {focusList.length === 0 && (
              <p className="empty">
                No Focus Points added <br />
                <span>
                  Add a focus point to start your journey 🚀
                </span>
              </p>
            )}

            {focusList.map((focus) => (
              <FocusPoint
                key={focus.id} // ✅ always real DB id
                title={focus.title}
                description={focus.description}
                user={focus.user}
                fizz={focus.fizz}
                onEdit={() => handleEdit(focus)}
                onDelete={() => handleDelete(focus)}
              />
            ))}

            <button className="morebutton">Load More</button>
          </div>
        </div>
      </div>

      {isOpenModal && (
        <EditFocusModal
          title={formData.title}
          description={formData.description}
          user={formData.user}
          fizz={formData.fizz}
          onCreate={handleSubmit}
          onClose={closeModal}
          TitleChange={handleChange}
          DescChange={handleChange}
        />
      )}
    </>
  );
};

export default Focus;