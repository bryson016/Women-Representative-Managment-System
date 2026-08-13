import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";

const INITIAL_STATE = {
  title: "",
  type: "",
  priority: "Medium",
  status: "Scheduled",
  date: "",
  time: "9:00 AM",
  endTime: "11:00 AM",
  venue: "",
  village: "",
  chairperson: "",
  secretary: "",
  organizer: "",
  expectedAttendance: 20,
  description: "",
};

function MeetingModal({
  isOpen,
  onClose,
  onSave,
  meeting,
  meetingTypes,
  meetingStatuses,
  priorities,
  venues,
  villages,
  chairpersons,
  secretaries,
}) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [agendaItems, setAgendaItems] = useState([{ item: "" }]);
  const isEditing = Boolean(meeting);

  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title || "",
        type: meeting.type || "",
        priority: meeting.priority || "Medium",
        status: meeting.status || "Scheduled",
        date: meeting.date || "",
        time: meeting.time || "9:00 AM",
        endTime: meeting.endTime || "11:00 AM",
        venue: meeting.venue || "",
        village: meeting.village || "",
        chairperson: meeting.chairperson || "",
        secretary: meeting.secretary || "",
        organizer: meeting.organizer || "",
        expectedAttendance: meeting.expectedAttendance || 20,
        description: meeting.description || "",
      });
      setAgendaItems(
        meeting.agenda && meeting.agenda.length > 0
          ? meeting.agenda.map((a) => ({ item: a.item }))
          : [{ item: "" }]
      );
    } else {
      setFormData(INITIAL_STATE);
      setAgendaItems([{ item: "" }]);
    }
    setErrors({});
  }, [meeting, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAgendaChange = (index, value) => {
    setAgendaItems((prev) => prev.map((item, i) => (i === index ? { item: value } : item)));
  };

  const addAgendaItem = () => {
    setAgendaItems((prev) => [...prev, { item: "" }]);
  };

  const removeAgendaItem = (index) => {
    setAgendaItems((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Meeting title is required";
    if (!formData.type) newErrors.type = "Meeting type is required";
    if (!formData.date) newErrors.date = "Meeting date is required";
    if (!formData.time) newErrors.time = "Start time is required";
    if (!formData.venue) newErrors.venue = "Venue is required";
    if (!formData.village) newErrors.village = "Village is required";
    if (!formData.chairperson) newErrors.chairperson = "Chairperson is required";
    if (!formData.secretary) newErrors.secretary = "Secretary is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateMeetingId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(100 + Math.random() * 900);
    return `MTG-${year}-${random}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const cleanAgenda = agendaItems.filter((a) => a.item.trim() !== "");

    const meetingData = {
      ...formData,
      id: meeting ? meeting.id : generateMeetingId(),
      agenda: cleanAgenda.length > 0 ? cleanAgenda : [{ item: "General business" }],
      minutes: meeting?.minutes || [],
      actionItems: meeting?.actionItems || [],
      attendance: meeting?.attendance || [],
      actualAttendance: meeting?.actualAttendance || 0,
      activityTimeline: meeting?.activityTimeline || [
        { date: new Date().toISOString().split("T")[0], action: isEditing ? "Meeting updated" : "Meeting scheduled", by: "Ward Administrator's Office" },
      ],
    };

    onSave(meetingData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="modal-container"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="modal-header">
              <h2>{isEditing ? "Edit Meeting" : "Schedule Meeting"}</h2>
              <button className="modal-close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-section">
                  <h3>Meeting Information</h3>
                  <div className="form-grid">
                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <label>Meeting Title</label>
                      <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Ward Development Committee Meeting"
                      />
                      {errors.title && <p className="error-text">{errors.title}</p>}
                    </div>
                    <div className="form-group">
                      <label>Meeting Type</label>
                      <select name="type" value={formData.type} onChange={handleChange}>
                        <option value="">Select Type</option>
                        {meetingTypes.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      {errors.type && <p className="error-text">{errors.type}</p>}
                    </div>
                    <div className="form-group">
                      <label>Priority</label>
                      <select name="priority" value={formData.priority} onChange={handleChange}>
                        {priorities.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select name="status" value={formData.status} onChange={handleChange}>
                        {meetingStatuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the purpose of the meeting..."
                        rows={3}
                        style={{
                          width: "100%",
                          border: "1px solid var(--gov-border)",
                          borderRadius: "0.6rem",
                          padding: "0.5rem 0.6rem",
                          fontSize: "0.85rem",
                          fontFamily: "inherit",
                          resize: "vertical",
                        }}
                      />
                      {errors.description && <p className="error-text">{errors.description}</p>}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Schedule Details</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Date</label>
                      <input type="date" name="date" value={formData.date} onChange={handleChange} />
                      {errors.date && <p className="error-text">{errors.date}</p>}
                    </div>
                    <div className="form-group">
                      <label>Village</label>
                      <select name="village" value={formData.village} onChange={handleChange}>
                        <option value="">Select Village</option>
                        {villages.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                      {errors.village && <p className="error-text">{errors.village}</p>}
                    </div>
                    <div className="form-group">
                      <label>Start Time</label>
                      <input name="time" value={formData.time} onChange={handleChange} placeholder="e.g. 9:00 AM" />
                      {errors.time && <p className="error-text">{errors.time}</p>}
                    </div>
                    <div className="form-group">
                      <label>End Time</label>
                      <input name="endTime" value={formData.endTime} onChange={handleChange} placeholder="e.g. 11:00 AM" />
                    </div>
                    <div className="form-group">
                      <label>Venue</label>
                      <select name="venue" value={formData.venue} onChange={handleChange}>
                        <option value="">Select Venue</option>
                        {venues.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                      {errors.venue && <p className="error-text">{errors.venue}</p>}
                    </div>
                    <div className="form-group">
                      <label>Expected Attendance</label>
                      <input
                        type="number"
                        name="expectedAttendance"
                        min="1"
                        value={formData.expectedAttendance}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Leadership</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Chairperson</label>
                      <select name="chairperson" value={formData.chairperson} onChange={handleChange}>
                        <option value="">Select Chairperson</option>
                        {chairpersons.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {errors.chairperson && <p className="error-text">{errors.chairperson}</p>}
                    </div>
                    <div className="form-group">
                      <label>Secretary</label>
                      <select name="secretary" value={formData.secretary} onChange={handleChange}>
                        <option value="">Select Secretary</option>
                        {secretaries.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {errors.secretary && <p className="error-text">{errors.secretary}</p>}
                    </div>
                    <div className="form-group">
                      <label>Organizer</label>
                      <input
                        name="organizer"
                        value={formData.organizer}
                        onChange={handleChange}
                        placeholder="e.g. Ward Administrator's Office"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Agenda Items</h3>
                  <div style={{ display: "grid", gap: "0.5rem" }}>
                    {agendaItems.map((item, index) => (
                      <div key={index} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input
                          value={item.item}
                          onChange={(e) => handleAgendaChange(index, e.target.value)}
                          placeholder={`Agenda item ${index + 1}`}
                          style={{
                            flex: 1,
                            border: "1px solid var(--gov-border)",
                            borderRadius: "0.6rem",
                            padding: "0.5rem 0.6rem",
                            fontSize: "0.85rem",
                            background: "#fff",
                            color: "#0f172a",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeAgendaItem(index)}
                          style={{
                            border: 0,
                            background: "#fef2f2",
                            color: "#b91c1c",
                            borderRadius: "0.45rem",
                            padding: "0.4rem",
                            cursor: "pointer",
                            display: "grid",
                            placeItems: "center",
                          }}
                          aria-label="Remove agenda item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button type="button" className="gov-btn gov-btn-secondary" onClick={addAgendaItem}>
                      <Plus size={16} />
                      <span>Add Agenda Item</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="gov-btn gov-btn-ghost" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="gov-btn gov-btn-primary">
                  {isEditing ? "Update Meeting" : "Save Meeting"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default MeetingModal;
