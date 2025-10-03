"use client";
import "../style/landingPage.css";
import "../globals.css";
import LandingCards from "./LandingCards";
import handleNext from "./Configuration";
interface LandingPageProps {
  onStartAnalysis: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartAnalysis }) => {

  const handleViewChallenge = () => {
    window.open("https://www.spaceappschallenge.org/", "_blank");
  };

  const cards = [
    {
      icon: "🛰️",
      header: "Historical Data",
      info: "Decades of NASA satellite observations",
    },
    {
      icon: "🌦️",
      header: "Weather Variables",
      info: "Temperature, precipitation, wind & more",
    },
    {
      icon: "📊",
      header: "Probability Analysis",
      info: "Statistical likelihood of conditions",
    },
  ];

  return (
    <>
      <header className="landing-header">
        <div className="landing-layer"></div>
        <div className="container">
          <div className="landing-content">
            <p className="animate-float">🛰️2025 NASA Space Apps Challenge</p>
            <h1>
              Will It Rain On My{" "}
              <span className="animate-shimmer">Parade?</span>
            </h1>
            <p className="info">
              Predict weather conditions for your outdoor events using NASA
              Earth observation data. Plan ahead with confidence using decades
              of atmospheric research.
            </p>
            <div className="button-container">
              <button className="btn-primary" onClick={onStartAnalysis}>
                Start Analysis{" "}
                <i className="fa-solid fa-up-right-from-square"></i>
              </button>
              <button className="btn-secondary" onClick={handleViewChallenge}>
                <i className="fa-brands fa-github"></i> View Challenge
              </button>
            </div>
          </div>
          <div className="landing-cards">
            {cards.map((c, i) => (
              <LandingCards
                key={i}
                icon={c.icon}
                header={c.header}
                info={c.info}
              />
            ))}
          </div>
        </div>
      </header>
    </>
  );
};

export default LandingPage;