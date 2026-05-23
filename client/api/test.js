import { chatWithMandai } from './chat.js'; // Adjust path as needed

async function runTest() {
  // Test Scenario 1: User with mobility needs
  const profile1 = { isWheelchairUser: true, hasToddlers: false };
  console.log("--- TEST 1: Wheelchair User ---");
  const response1 = await chatWithMandai(
    "Suggest a 2-hour route for the Zoo.", 
    [], // empty history
    1, 
    profile1 // Pass this as an argument
  );
  console.log("Bot Response:", response1);

  // Test Scenario 2: User with toddlers
  const profile2 = { isWheelchairUser: false, hasToddlers: true };
  console.log("\n--- TEST 2: Toddler Parent ---");
  const response2 = await chatWithMandai(
    "Suggest a 2-hour route for the Zoo.", 
    [], 
    1, 
    profile2
  );
  console.log("Bot Response:", response2);
}

runTest();