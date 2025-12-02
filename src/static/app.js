document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Title and description
        const title = document.createElement("h4");
        title.textContent = name;

        const desc = document.createElement("p");
        desc.textContent = details.description;

        // Schedule
        const scheduleP = document.createElement("p");
        const scheduleStrong = document.createElement("strong");
        scheduleStrong.textContent = "Schedule:";
        scheduleP.appendChild(scheduleStrong);
        scheduleP.append(" " + details.schedule);

        // Availability
        const availP = document.createElement("p");
        const availStrong = document.createElement("strong");
        availStrong.textContent = "Availability:";
        availP.appendChild(availStrong);
        availP.append(" " + spotsLeft + " spots left");

        // Participants section
        const participantsDiv = document.createElement("div");
        participantsDiv.className = "participants";
        const participantsLabel = document.createElement("strong");
        participantsLabel.textContent = "Participants:";
        participantsDiv.appendChild(participantsLabel);

        const ul = document.createElement("ul");
        ul.className = "participants-list";
        if (details.participants && details.participants.length) {
          details.participants.forEach((p) => {
            const li = document.createElement("li");
            li.className = "participant-item";
            // Hide bullet points via CSS, but keep li for structure
            const span = document.createElement("span");
            span.textContent = p;
            li.appendChild(span);

            // Add delete icon
            const delBtn = document.createElement("button");
            delBtn.className = "delete-participant";
            delBtn.title = `Remove ${p}`;
            delBtn.innerHTML = "&#128465;"; // Trash can icon
            delBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              if (!confirm(`Remove ${p} from ${name}?`)) return;
              try {
                const response = await fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(p)}`, { method: "POST" });
                if (response.ok) {
                  messageDiv.textContent = result.message;
                  messageDiv.className = "success";
                  signupForm.reset();
                  fetchActivities();
                } else {
                  const result = await response.json();
                  alert(result.detail || "Failed to remove participant.");
                }
              } catch (err) {
                alert("Error removing participant.");
              }
            });
            li.appendChild(delBtn);
            ul.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.className = "no-participants";
          li.textContent = "No participants yet";
          ul.appendChild(li);
        }
        participantsDiv.appendChild(ul);

        // Append elements to card
        activityCard.appendChild(title);
        activityCard.appendChild(desc);
        activityCard.appendChild(scheduleP);
        activityCard.appendChild(availP);
        activityCard.appendChild(participantsDiv);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
