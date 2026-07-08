// mockDemographics.js
// Mock GeoJSON data representing constituency wards or zones with infrastructure gap scores.
// The "gapScore" (0-100) represents how underserved the area is based on demographics 
// vs available infrastructure (e.g. schools per capita, hospital distance).
// 100 = huge gap (high need), 0 = well-served.

export const constituencyWards = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "North Zone (Sector 4)",
        population: 45000,
        gapScore: 85,
        notes: "High population density, low water pressure, missing primary healthcare."
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [80.935, 26.865],
            [80.960, 26.865],
            [80.960, 26.845],
            [80.935, 26.845],
            [80.935, 26.865]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Central Business District",
        population: 20000,
        gapScore: 30,
        notes: "Well developed. Main issues are traffic and minor road maintenance."
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [80.940, 26.845],
            [80.955, 26.845],
            [80.955, 26.835],
            [80.940, 26.835],
            [80.940, 26.845]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "South-East Outskirts",
        population: 32000,
        gapScore: 92,
        notes: "Rapidly expanding, severe lack of paved roads and erratic electricity."
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [80.955, 26.845],
            [80.970, 26.845],
            [80.970, 26.830],
            [80.950, 26.830],
            [80.955, 26.845]
          ]
        ]
      }
    }
  ]
};
