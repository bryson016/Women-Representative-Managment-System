import { motion } from "framer-motion";
import { CalendarDays, Clock3, MapPin, Users } from "lucide-react";

function MeetingCard({ meeting, index = 0 }) {
  return (
    <motion.article
      className="meeting-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.24 }}
      whileHover={{ y: -2 }}
    >
      <h4>{meeting.title}</h4>
      <p className="meeting-line">
        <MapPin size={14} />
        <span>{meeting.venue}</span>
      </p>
      <p className="meeting-line">
        <CalendarDays size={14} />
        <span>{meeting.date}</span>
      </p>
      <p className="meeting-line">
        <Clock3 size={14} />
        <span>{meeting.time}</span>
      </p>
      <p className="meeting-line">
        <Users size={14} />
        <span>Expected Attendance: {meeting.attendance}</span>
      </p>
    </motion.article>
  );
}

export default MeetingCard;
