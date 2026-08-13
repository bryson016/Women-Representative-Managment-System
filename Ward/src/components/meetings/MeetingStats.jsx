import { motion } from "framer-motion";
import { CalendarDays, CalendarCheck2, ClipboardList, Users } from "lucide-react";

function MeetingStats({ totalMeetings, upcomingCount, completedCount, attendanceRate }) {
  const stats = [
    {
      title: "Total Meetings",
      value: totalMeetings.toLocaleString(),
      description: "All scheduled meetings",
      trend: `${upcomingCount} upcoming`,
      icon: ClipboardList,
    },
    {
      title: "Upcoming Meetings",
      value: upcomingCount.toLocaleString(),
      description: "Scheduled in next 30 days",
      trend: `${((upcomingCount / totalMeetings) * 100).toFixed(0)}% of total`,
      icon: CalendarDays,
    },
    {
      title: "Completed",
      value: completedCount.toLocaleString(),
      description: "Successfully held",
      trend: `${((completedCount / totalMeetings) * 100).toFixed(0)}% completion rate`,
      icon: CalendarCheck2,
    },
    {
      title: "Avg. Attendance",
      value: `${attendanceRate.toFixed(1)}%`,
      description: "Average attendance rate",
      trend: attendanceRate >= 70 ? "Healthy participation" : "Below 70% target",
      icon: Users,
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.article
            key={stat.title}
            className="stat-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.28 }}
            whileHover={{ y: -4 }}
          >
            <div className="stat-head">
              <div className="stat-icon">
                <Icon size={18} />
              </div>
              <p className="trend">{stat.trend}</p>
            </div>
            <h3>{stat.value}</h3>
            <h4>{stat.title}</h4>
            <p>{stat.description}</p>
          </motion.article>
        );
      })}
    </div>
  );
}

export default MeetingStats;
