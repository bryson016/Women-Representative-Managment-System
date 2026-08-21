import { motion } from "framer-motion";
import {
  GraduationCap,
  Droplets,
  Users,
  Building2,
  ArrowRight,
  Mic,
  Sparkles,
} from "lucide-react";
import SafeImage from "../common/SafeImage";

/* ---- Import existing project images (reused, no external URLs) ---- */
import heroImg from "../../assets/emm.PNG.jpeg";
import educationImg from "../../assets/EM.PNG.png";
import waterImg from "../../assets/community.PNG.jpg";
import womenImg from "../../assets/women.PNG.png";
import infrastructureImg from "../../assets/const.PNG.png";

const STORIES = [
  {
    icon: GraduationCap,
    title: "Education Champion",
    description:
      "Secured bursaries for students and improved school infrastructure across the ward.",
    image: educationImg,
    alt: "Community leader interacting with students at a local school",
  },
  {
    icon: Droplets,
    title: "Access to Clean Water",
    description:
      "Delivered clean water projects to communities, improving health and sanitation.",
    image: waterImg,
    alt: "Community members accessing clean water from a new water point",
  },
  {
    icon: Users,
    title: "Women Empowerment",
    description:
      "Empowered women through skills training, support groups and business opportunities.",
    image: womenImg,
    alt: "Women participating in a community empowerment training session",
  },
  {
    icon: Building2,
    title: "Better Infrastructure",
    description:
      "Improved roads, street lighting and public facilities for safer, stronger communities.",
    image: infrastructureImg,
    alt: "Newly constructed road and street lighting in the ward",
  },
];

function StoryCard({ story, index }) {
  const { icon: Icon, title, description, image, alt } = story;

  return (
    <motion.article
      className="story-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -6 }}
    >
      <div className="story-image-wrap">
        <SafeImage
          src={image}
          alt={alt}
          className="story-image"
          fallbackClassName="story-image-fallback"
          icon={Icon}
        />
        <div className="story-icon" aria-hidden="true">
          <Icon size={20} />
        </div>
      </div>
      <div className="story-body">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </motion.article>
  );
}

function WelcomeSection() {
  const scrollToStories = () => {
    const storiesEl = document.getElementById("inspirational-stories");
    if (storiesEl) {
      storiesEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* ===== Hero / Welcome Banner ===== */}
      <motion.section
        className="welcome-banner citizen-hero welcome-section-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Real <img> so the hero photo is a real asset with alt text */}
        <SafeImage
          src={heroImg}
          alt="Female community leader addressing residents in the ward"
          className="welcome-section-hero-image"
          fallbackClassName="welcome-section-hero-fallback"
          icon={Mic}
        />
        <div className="welcome-section-overlay" aria-hidden="true" />

        <div className="welcome-section-content">
          <motion.span
            className="welcome-section-eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            <Sparkles size={14} />
            Women Representative · Ward Leadership
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            Welcome to Your Ward
          </motion.h1>

          <motion.p
            className="citizen-hero-subtitle welcome-section-subtitle"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            Your voice matters. Your community matters.
            <br className="welcome-br" />
            Together, we build a better ward for all.
          </motion.p>

          <motion.div
            className="citizen-hero-actions welcome-section-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          >
            <button
              type="button"
              className="gov-btn welcome-section-cta"
              onClick={scrollToStories}
            >
              See What We've Achieved
              <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* ===== Inspiring Stories Section ===== */}
      <motion.section
        id="inspirational-stories"
        className="stories-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="stories-header">
          <div>
            <span className="stories-eyebrow">Our Impact</span>
            <h2>Inspiring Stories from Our Leader</h2>
          </div>
          <button
            type="button"
            className="gov-btn gov-btn-ghost stories-view-all"
            onClick={scrollToStories}
          >
            View all stories
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="stories-grid">
          {STORIES.map((story, index) => (
            <StoryCard key={story.title} story={story} index={index} />
          ))}
        </div>
      </motion.section>
    </>
  );
}

export default WelcomeSection;