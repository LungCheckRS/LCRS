// Show/hide smoking details for current/former smokers
const smokingStatus = document.getElementById('smokingStatus');
const smokingDetails = document.getElementById('smokingDetails');

smokingStatus.addEventListener('change', function () {
  if (this.value === 'current' || this.value === 'former') {
    smokingDetails.style.display = 'block';
  } else {
    smokingDetails.style.display = 'none';
  }
});

function calculateRisk() {
  // Get all input values
  const age = parseInt(document.getElementById('age').value) || 0;
  const status = document.getElementById('smokingStatus').value;
  const yearsSmoked = parseFloat(document.getElementById('yearsSmoked').value) || 0;
  const cigPerDay = parseInt(document.getElementById('cigPerDay').value) || 0;
  const quitYears = parseFloat(document.getElementById('quitYears').value) || 0;
  const secondhand = document.getElementById('secondhand').value;
  const familyHistory = document.getElementById('familyHistory').value;

  // Calculate pack-years
  const packYears = (cigPerDay / 20) * yearsSmoked;

  // USPSTF eligibility
  let uspstfEligible = false;
  if (age >= 50 && age <= 80 && packYears >= 20 &&
      (status === 'current' || (status === 'former' && quitYears <= 15))) {
    uspstfEligible = true;
  }

  // Research-based risk score
  let researchScore = 0;
  if (age >= 60 && age < 70) researchScore += 2;
  if (age >= 70) researchScore += 3;

  if (packYears >= 20 && packYears < 30) researchScore += 2;
  if (packYears >= 30 && packYears < 40) researchScore += 3;
  if (packYears >= 40) researchScore += 4;

  if (status === 'current') researchScore += 3;
  if (status === 'former') {
    if (quitYears <= 5) researchScore += 2;
    else if (quitYears <= 15) researchScore += 1;
  }

  if (secondhand === 'yes') researchScore += 1;
  if (familyHistory === 'yes') researchScore += 2;

  let riskCategory = '';
  if (researchScore <= 3) riskCategory = 'Low Risk';
  else if (researchScore <= 6) riskCategory = 'Moderate Risk';
  else riskCategory = 'High Risk';

  // Display results
  let resultHTML = `
    <div class="result-card">
      <h2>Screening Assessment Results</h2>
      <div class="section">
        <h3>USPSTF Recommendation (Grade B)</h3>
        <p><strong>Your Pack-Years:</strong> ${packYears.toFixed(1)}</p>
        <p class="${uspstfEligible ? 'eligible' : 'not-eligible'}">
          ${uspstfEligible 
            ? "You meet official USPSTF screening criteria. Annual LDCT screening is recommended."
            : "You do NOT meet full USPSTF screening criteria based on provided inputs."}
        </p>
      </div>
      <div class="section">
        <h3>Research-Based Risk Model</h3>
        <p><strong>Risk Score:</strong> ${researchScore}</p>
        <p><strong>Risk Category:</strong> ${riskCategory}</p>
  `;

  if (!uspstfEligible && riskCategory === 'High Risk') {
    resultHTML += `<p class="advisory">
      Consider discussing screening with a healthcare provider.
    </p>`;
  }

  resultHTML += `<p class="disclaimer">
    This tool is for educational purposes only and does not replace medical advice.
  </p></div></div>`;

  document.getElementById('result').innerHTML = resultHTML;

  // Send data to Google Sheet via Apps Script Web App
  fetch("https://script.google.com/macros/s/AKfycbw4_VCa_NNGZWl5PRf3LQweOEDRYkeZIyabYP4vO3LhjZUMCwm-qbb6BP8E5cDy1lQ/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      age, smokingStatus: status, yearsSmoked, cigPerDay, quitYears,
      packYears: packYears.toFixed(1),
      uspstfEligible, researchScore, riskCategory,
      secondhand, familyHistory
    })
  })
  .then(response => response.json())
  .then(data => console.log("Sheet response:", data))
  .catch(err => console.error("Error sending to sheet:", err));
}
