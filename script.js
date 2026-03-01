document.addEventListener('DOMContentLoaded', () => {
  // ------------------------
  // Show/Hide Section 2
  // ------------------------
  const smokingStatus = document.getElementById('smokingStatus');
  const smokingDetails = document.getElementById('smokingDetails');

  smokingStatus.addEventListener('change', function () {
    if (this.value === 'current' || this.value === 'former') {
      smokingDetails.style.display = 'block';
    } else {
      smokingDetails.style.display = 'none';
      // Clear Section 2 values if hidden
      document.getElementById('smokeType').value = '';
      document.getElementById('yearsSmoked').value = '';
      document.getElementById('cigPerDay').value = '';
      document.getElementById('quitYears').value = '';
    }
  });

  // ------------------------
  // Calculate Risk
  // ------------------------
  window.calculateRisk = function () {
    // ---------- Section 1 ----------
    const age = parseInt(document.getElementById('age').value) || 0;
    const familyHistory = document.getElementById('familyHistory').value;
    const preExisting = document.getElementById('preExisting').value;
    const secondhand = document.getElementById('secondhand').value;
    const status = smokingStatus.value;

    // ---------- Section 2 (smokers/former) ----------
    const smokeType = document.getElementById('smokeType').value;
    const yearsSmoked = parseFloat(document.getElementById('yearsSmoked').value) || 0;
    const cigPerDay = parseInt(document.getElementById('cigPerDay').value) || 0;
    const quitYears = parseFloat(document.getElementById('quitYears').value) || 0;

    // ---------- Calculations ----------
    const packYears = (cigPerDay / 20) * yearsSmoked;

    // USPSTF eligibility
    let uspstfEligible = false;
    if (
      age >= 50 && age <= 80 &&
      packYears >= 20 &&
      (status === "current" || (status === "former" && quitYears <= 15))
    ) {
      uspstfEligible = true;
    }

    // Research Weighted Model
    let researchScore = 0;
    // Age weighting
    if (age >= 60 && age < 70) researchScore += 2;
    if (age >= 70) researchScore += 3;
    // Pack-year weighting
    if (packYears >= 20 && packYears < 30) researchScore += 2;
    if (packYears >= 30 && packYears < 40) researchScore += 3;
    if (packYears >= 40) researchScore += 4;
    // Smoking weighting
    if (status === "current") researchScore += 3;
    if (status === "former") {
      if (quitYears <= 5) researchScore += 2;
      else if (quitYears <= 15) researchScore += 1;
    }
    // Additional factors
    if (secondhand === "yes") researchScore += 1;
    if (familyHistory === "yes") researchScore += 2;

    let riskCategory = "";
    if (researchScore <= 3) riskCategory = "Low Risk";
    else if (researchScore <= 6) riskCategory = "Moderate Risk";
    else riskCategory = "High Risk";

    // ---------- Display results ----------
    let resultHTML = `
      <div class="result-card">
        <h2>Screening Assessment Results</h2>

        <div class="section">
          <h3>USPSTF Recommendation (Grade B)</h3>
          <p><strong>Population:</strong> Adults aged 50–80 with ≥20 pack-years who currently smoke or quit within 15 years.</p>
          <p><strong>Your Pack-Years:</strong> ${packYears.toFixed(1)}</p>
          <p class="${uspstfEligible ? 'eligible' : 'not-eligible'}">
            ${uspstfEligible 
              ? "You meet official USPSTF screening criteria. Annual LDCT screening is recommended."
              : "You do NOT meet full USPSTF screening criteria based on provided inputs."}
          </p>
        </div>

        <div class="section">
          <h3>Research-Based Risk Model (Exploratory)</h3>
          <p><strong>Risk Score:</strong> ${researchScore}</p>
          <p><strong>Risk Category:</strong> ${riskCategory}</p>
    `;

    if (!uspstfEligible && riskCategory === "High Risk") {
      resultHTML += `
        <p class="advisory">
          Although you do not meet official USPSTF criteria, your overall risk profile suggests discussing screening with a healthcare provider.
        </p>
      `;
    }

    resultHTML += `
          <p class="disclaimer">
            This tool is for educational and research purposes only and does not replace professional medical advice.
          </p>
        </div>
      </div>
    `;

    document.getElementById('result').innerHTML = resultHTML;

    // ---------- Send to Google Sheets ----------
    fetch("https://script.google.com/macros/s/AKfycbwbllJsfLjnIRQJwLp-rVhNGWGMXrJDKEs_kbSlM6tZC3TkwYBznSckhTHyF3wFXWHhwQ/exec", {  
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age: age,
        familyHistory: familyHistory,
        preExisting: preExisting,
        secondhand: secondhand,
        smokingStatus: smokingStatus,
        smokeType: smokeType,
        yearsSmoked: yearsSmoked,
        cigPerDay: cigPerDay,
        quitYears: quitYears,
        packYears: packYears.toFixed(1),
        uspstfEligible: uspstfEligible,
        researchScore: researchScore,
        riskCategory: riskCategory
      })
    })
    .then(response => response.json())
    .then(data => console.log("Google Sheet response:", data))
    .catch(error => console.error("Error saving to sheet:", error));
  };
});
