import React, { useState } from "react";
import { useEffect } from "react";
import { Dropdown } from "../components/ui/Dropdown"; // Make sure this is correctly imported

// LinkedIn Profile Display Component
const LinkedInProfile = ({ profile }: { profile: any }) => {
  return (
    <div className="linkedin-profile">
      <h3>{profile.name}</h3>
      <p>{profile.position}</p>
      <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
        Go to LinkedIn
      </a>
    </div>
  );
};

// Main Networking Page
const NetworkingPage: React.FC = () => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [targetJob, setTargetJob] = useState<string>("");
  const [linkedinProfile, setLinkedinProfile] = useState<any>(null);

  // Handler for goal selection from Dropdown
  const handleGoalChange = (value: string) => {
    setSelectedGoal(value);
  };

  const handleSearchLinkedIn = async () => {
    const searchQuery = `${targetJob} i'm hiring`;  // Modify this based on user input
    try {
      const response = await fetch(`https://api.linkedin.com/v2/search?q=${searchQuery}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer YOUR_ACCESS_TOKEN`, // Use an actual LinkedIn API token
        },
      });
      const data = await response.json();
      setLinkedinProfile(data);
    } catch (error) {
      console.error("Error fetching LinkedIn data", error);
    }
  };

  return (
    <div className="networking-page">
      <div className="goal-selection">
        <h2>Select your networking goal</h2>
        <Dropdown
          options={["I want an interview", "I want industry connections", "I’m just expanding my network", "I want to send a follow up message"]}
          onSelect={handleGoalChange}
          selected={selectedGoal}  // Pass the selected goal here

        />
      </div>

      {selectedGoal && (
        <div className="networking-form">
          <h3>Fill in your information</h3>
          <div>
            <label>Target Job Function</label>
            <input
              type="text"
              value={targetJob}
              onChange={(e) => setTargetJob(e.target.value)}
            />
          </div>
          <button onClick={handleSearchLinkedIn}>Generate</button>
        </div>
      )}

      <div className="linkedin-results">
        {linkedinProfile ? (
          <LinkedInProfile profile={linkedinProfile} />
        ) : (
          <p>No results yet. Fill in the required fields and hit 'Generate.'</p>
        )}
      </div>
    </div>
  );
};

export default NetworkingPage;
