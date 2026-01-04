const { format } = require("date-fns");

function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function generateSampleHeatmapData() {
  const days = [];
  const demoYear = new Date().getFullYear();

  // Stats
  let completedCount = 0;
  let totalDays = 0;

  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(demoYear, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      totalDays++;
      const date = new Date(demoYear, month, day);
      const dateStr = format(date, "yyyy-MM-dd");

      const startOfYear = new Date(demoYear, 0, 1);
      const dayOfYear = Math.floor(
        (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Matches current implementation in page.tsx
      const seed = dayOfYear * 1337;
      const rand = seededRandom(seed);
      const isCompleted = rand > 0.25;

      if (isCompleted) {
        completedCount++;
      }

      days.push({
        date: dateStr,
        completed: isCompleted,
        rand: rand,
      });
    }
  }

  console.log(`Total Days: ${totalDays}`);
  console.log(`Completed Days: ${completedCount}`);
  console.log(
    `Percentage: ${((completedCount / totalDays) * 100).toFixed(2)}%`
  );

  // Show first few days
  console.log("First 10 days:");
  days
    .slice(0, 10)
    .forEach((d) => console.log(`${d.date}: ${d.completed} (rand=${d.rand})`));
}

generateSampleHeatmapData();
