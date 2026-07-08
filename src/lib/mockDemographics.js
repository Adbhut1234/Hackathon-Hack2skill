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
            [80.935, 26.845],
            [80.955, 26.845],
            [80.955, 26.835],
            [80.935, 26.835],
            [80.935, 26.845]
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
            [80.955, 26.865],
            [80.975, 26.865],
            [80.975, 26.830],
            [80.955, 26.830],
            [80.955, 26.865]
          ]
        ]
      }
    }
  ]
};

// Helper function to map a complaint's lat/lng to the demographic gap score
export function getInfraGapForLocation(lat, lng) {
  for (const feature of constituencyWards.features) {
    const poly = feature.geometry.coordinates[0];
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const px = poly[i][0], py = poly[i][1];
      const pjx = poly[j][0], pjy = poly[j][1];
      
      const intersect = ((py > lat) !== (pjy > lat))
          && (lng < (pjx - px) * (lat - py) / (pjy - py) + px);
      if (intersect) inside = !inside;
    }
    if (inside) {
      return { 
        score: feature.properties.gapScore, 
        zone: feature.properties.name,
        notes: feature.properties.notes
      };
    }
  }
  return { score: 50, zone: "Unmapped Zone", notes: "Average baseline data." }; // Default fallback
}
